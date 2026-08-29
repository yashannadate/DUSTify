import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  WalletFacade,
  DustWallet,
  HDWallet,
  Roles,
  ShieldedWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';

// Global polyfills
// @ts-expect-error WebSocket polyfill
globalThis.WebSocket = WebSocket;

// Polyfill Array.prototype.toSpliced for Node v18
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start: number, deleteCount: number, ...items: any[]) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

// Polyfill Iterator.prototype.map for Node v18
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn: (item: any, index: number) => any) {
    let index = 0;
    for (const item of this as any) {
      yield fn(item, index++);
    }
  };
}

// Polyfill Set.prototype.difference for Node v18
if (!(Set.prototype as any).difference) {
  (Set.prototype as any).difference = function (other: Set<any>) {
    const diff = new Set(this);
    for (const elem of other) {
      diff.delete(elem);
    }
    return diff;
  };
}

async function createNewSponsorWallet() {
  const NETWORK_ID = 'preview';
  const INDEXER_HTTP = process.env.INDEXER_HTTP_URL || 'https://indexer.preview.midnight.network/api/v4/graphql';
  const INDEXER_WS = process.env.INDEXER_WS_URL || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
  const NODE_RPC = process.env.NODE_RPC_URL || 'wss://rpc.preview.midnight.network';
  const PROOF_SERVER = process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300';

  setNetworkId(NETWORK_ID);

  // 1. Generate fresh secure 32-byte seed (NEVER printed or committed)
  const freshSeedHex = crypto.randomBytes(32).toString('hex');

  // 2. Derive HD wallet keys using identical DUSTify scheme
  const hdWallet = HDWallet.fromSeed(Buffer.from(freshSeedHex, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Failed to create HDWallet from seed');
  const derived = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derived.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();

  const keys = derived.keys;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], NETWORK_ID);
  const rawAddr = unshieldedKeystore.getBech32Address();
  const newPublicAddress = typeof rawAddr === 'string' ? rawAddr : String(rawAddr?.value || rawAddr);

  // 3. Save new seed safely to gitignored location (mode 0600) without exposing it
  const dataDir = path.resolve(process.cwd(), '.data');
  fs.mkdirSync(dataDir, { recursive: true });
  const secureSeedPath = path.join(dataDir, 'new_sponsor_seed.json');
  fs.writeFileSync(
    secureSeedPath,
    JSON.stringify({
      createdAt: new Date().toISOString(),
      network: NETWORK_ID,
      publicAddress: newPublicAddress,
      seedHex: freshSeedHex,
    }, null, 2),
    { mode: 0o600 }
  );

  // Also save the public address to a reference file
  fs.writeFileSync(path.join(dataDir, 'new_sponsor_address.txt'), newPublicAddress);

  // 4. Initialize WalletFacade for new sponsor wallet
  const walletConfig = {
    networkId: NETWORK_ID,
    indexerClientConnection: {
      indexerHttpUrl: INDEXER_HTTP,
      indexerWsUrl: INDEXER_WS,
    },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE_RPC.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg: any) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg: any) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  // 5. Start wallet and verify synchronization
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  const syncedState = await wallet.waitForSyncedState();

  const now = new Date();
  const balanceSpecks = syncedState.dust ? syncedState.dust.balance(now) : 0n;
  const balanceDust = (Number(balanceSpecks) / 1_000_000).toFixed(6) + ' DUST';

  // 6. Save initial state checkpoint to isolated directory (keeps old state intact)
  const newPersistDir = path.join(dataDir, 'new-sponsor-state', NETWORK_ID);
  fs.mkdirSync(newPersistDir, { recursive: true });
  try {
    const sState = await wallet.shielded.serializeState();
    const uState = await wallet.unshielded.serializeState();
    const dState = await wallet.dust.serializeState();
    fs.writeFileSync(path.join(newPersistDir, 'shielded.json'), JSON.stringify(sState));
    fs.writeFileSync(path.join(newPersistDir, 'unshielded.json'), JSON.stringify(uState));
    fs.writeFileSync(path.join(newPersistDir, 'dust.json'), JSON.stringify(dState));
  } catch {
    // Non-fatal if initial serialize fails
  }

  // 7. OUTPUT ONLY THE PUBLIC ADDRESS AND DUST BALANCE (NEVER SEED/KEYS)
  console.log('PUBLIC_UNSHIELDED_ADDRESS=' + newPublicAddress);
  console.log('CURRENT_DUST_BALANCE=' + balanceSpecks.toString() + ' Specks (' + balanceDust + ')');
  console.log('SYNC_STATUS=SYNCED');

  process.exit(0);
}

createNewSponsorWallet().catch((err) => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});
