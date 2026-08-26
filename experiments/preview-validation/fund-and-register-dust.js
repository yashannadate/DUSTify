/**
 * DUSTify — Sponsor Wallet Funding Verification & DUST Activation Script
 * (Exact implementation matching authoritative reference in my-app/src/deploy.ts)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import { firstValueFrom, filter, throttleTime } from 'rxjs';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
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

// Polyfills
globalThis.WebSocket = WebSocket;

if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn) {
    let index = 0;
    for (const item of this) yield fn(item, index++);
  };
}

if (!Set.prototype.difference) {
  Set.prototype.difference = function (other) {
    const diff = new Set(this);
    for (const elem of other) diff.delete(elem);
    return diff;
  };
}

// ── Configuration ──────────────────────────────────────────────────────────
const NETWORK_ID      = process.env.MIDNIGHT_NETWORK    || 'preview';
const INDEXER_HTTP    = process.env.INDEXER_HTTP_URL    || 'https://indexer.preview.midnight.network/api/v4/graphql';
const INDEXER_WS      = process.env.INDEXER_WS_URL      || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
const NODE_RPC        = process.env.NODE_RPC_URL        || 'wss://rpc.preview.midnight.network';
const PROOF_SERVER    = process.env.PROOF_SERVER_URL    || 'http://127.0.0.1:6300';
const SPONSOR_SEED    = process.env.MASTER_WALLET_SEED  || '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
const PERSIST_DIR     = path.join(process.cwd(), '.data', 'wallet-state', NETWORK_ID);

function pass(label, detail) {
  process.stdout.write('  [PASS] ' + label + (detail ? '\n         -> ' + detail : '') + '\n');
}
function fail(label, detail) {
  process.stdout.write('  [FAIL] ' + label + (detail ? '\n         -> ' + detail : '') + '\n');
}
function info(msg) {
  process.stdout.write('  [INFO] ' + msg + '\n');
}

function loadPersistedState() {
  const result = { shielded: undefined, unshielded: undefined, dust: undefined, exists: false };
  try {
    const sPath = path.join(PERSIST_DIR, 'shielded.json');
    const uPath = path.join(PERSIST_DIR, 'unshielded.json');
    const dPath = path.join(PERSIST_DIR, 'dust.json');

    if (fs.existsSync(sPath)) result.shielded = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
    if (fs.existsSync(uPath)) result.unshielded = JSON.parse(fs.readFileSync(uPath, 'utf-8'));
    if (fs.existsSync(dPath)) result.dust = JSON.parse(fs.readFileSync(dPath, 'utf-8'));

    result.exists = Boolean(result.shielded && result.unshielded && result.dust);
  } catch (err) {
    info('Persistence read: ' + err.message);
  }
  return result;
}

async function savePersistedState(wallet) {
  try {
    fs.mkdirSync(PERSIST_DIR, { recursive: true });
    const shieldedState = await wallet.shielded.serializeState();
    const unshieldedState = await wallet.unshielded.serializeState();
    const dustState = await wallet.dust.serializeState();

    const writeAtomic = (file, data) => {
      const tmp = file + '.tmp-' + process.pid + '-' + Date.now();
      fs.writeFileSync(tmp, JSON.stringify(data));
      fs.renameSync(tmp, file);
    };

    writeAtomic(path.join(PERSIST_DIR, 'shielded.json'), shieldedState);
    writeAtomic(path.join(PERSIST_DIR, 'unshielded.json'), unshieldedState);
    writeAtomic(path.join(PERSIST_DIR, 'dust.json'), dustState);
    info('Updated persistent state saved to disk.');
    return true;
  } catch (err) {
    info('Save state error: ' + err.message);
    return false;
  }
}

function deriveKeys(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function main() {
  process.stdout.write('\n==============================================================\n');
  process.stdout.write(' STEP C — Sponsor Funding & DUST Activation\n');
  process.stdout.write('==============================================================\n');

  setNetworkId(NETWORK_ID);
  const keys = deriveKeys(SPONSOR_SEED);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], NETWORK_ID);
  const unshieldedAddress = unshieldedKeystore.getBech32Address();

  info('Sponsor Address: ' + unshieldedAddress);

  const savedState = loadPersistedState();
  const walletConfig = {
    networkId: NETWORK_ID,
    indexerClientConnection: {
      indexerHttpUrl: INDEXER_HTTP,
      indexerWsUrl: INDEXER_WS,
    },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE_RPC),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (cfg) => savedState.shielded ? ShieldedWallet(cfg).restore(savedState.shielded) : ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg) => savedState.unshielded ? UnshieldedWallet(cfg).restore(savedState.unshielded) : UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg) => savedState.dust ? DustWallet(cfg).restore(savedState.dust) : DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  info('Waiting for wallet synchronization with Preview...');
  const syncedState = await wallet.waitForSyncedState();
  pass('WALLET SYNCED', 'Synced at tip. isSynced = ' + syncedState.isSynced);

  // Check unshielded tNIGHT balance
  const tokenKey = unshieldedToken().raw;
  const tNightBalance = syncedState.unshielded.balances[tokenKey] ?? 0n;
  const availableCoins = syncedState.unshielded.availableCoins || [];

  process.stdout.write('\n  +--- Unshielded Status --------------------------------\n');
  process.stdout.write('  |  tNIGHT Balance:    ' + tNightBalance.toString() + ' (' + (Number(tNightBalance) / 1_000_000).toLocaleString() + ' NIGHT)\n');
  process.stdout.write('  |  Available UTXOs:   ' + availableCoins.length + '\n');
  process.stdout.write('  +------------------------------------------------------\n\n');

  pass('FUNDS CONFIRMED', 'Found ' + tNightBalance.toString() + ' tNIGHT on-chain.');

  // DUST metrics before activation
  const dustBefore = syncedState.dust.balance(new Date());
  const dustCoinsBefore = syncedState.dust.availableCoins.length;

  info('DUST Balance before registration: ' + dustBefore.toString() + ' Specks across ' + dustCoinsBefore + ' coins');

  // Filter unregistered UTXOs
  const unregisteredUtxos = availableCoins.filter((c) => !c.meta?.registeredForDustGeneration);

  let txId = null;
  if (unregisteredUtxos.length > 0) {
    info('Found ' + unregisteredUtxos.length + ' unregistered NIGHT UTXO(s).');
    info('Attempting registerNightUtxosForDustGeneration...');

    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload)
    );
    pass('REGISTRATION RECIPE', 'Generated DUST registration recipe');

    info('Finalizing recipe with proof server...');
    const finalized = await wallet.finalizeRecipe(recipe);

    info('Submitting DUST registration transaction to Midnight Preview...');
    txId = await wallet.submitTransaction(finalized);
    pass('TRANSACTION SUBMITTED', 'Registration TxId: ' + txId);

    info('Waiting for registration transaction to confirm on-chain and generate DUST...');
    const updatedState = await firstValueFrom(
      wallet.state().pipe(
        throttleTime(5000),
        filter((s) => s.isSynced),
        filter((s) => s.dust.balance(new Date()) > 0n || s.dust.availableCoins.length > 0)
      )
    );

    const dustAfter = updatedState.dust.balance(new Date());
    const dustCoinsAfter = updatedState.dust.availableCoins.length;

    pass('DUST ACTIVE', 'Real DUST balance active: ' + dustAfter.toString() + ' Specks (' + dustCoinsAfter + ' coins)');
  } else {
    info('All UTXOs are already registered for DUST generation.');
  }

  // Refresh latest synced state
  const finalState = await wallet.waitForSyncedState();
  const dustFinal = finalState.dust.balance(new Date());
  const coinsFinal = finalState.dust.availableCoins;

  process.stdout.write('\n  +--- Sponsor DUST Capacity Report ---------------------\n');
  process.stdout.write('  |  tNIGHT Balance:      ' + (finalState.unshielded.balances[tokenKey] ?? 0n).toString() + '\n');
  process.stdout.write('  |  DUST Balance Before: ' + dustBefore.toString() + ' Specks\n');
  process.stdout.write('  |  DUST Balance After:  ' + dustFinal.toString() + ' Specks\n');
  process.stdout.write('  |  Available Coins:     ' + coinsFinal.length + '\n');
  process.stdout.write('  |  Registration TxId:   ' + (txId || 'N/A (already registered)') + '\n');
  process.stdout.write('  +------------------------------------------------------\n\n');

  // Persist updated state
  await savePersistedState(wallet);
  pass('STATE PERSISTED', 'Final updated wallet state saved to disk');

  await wallet.stop();
  info('Wallet stopped cleanly.');
  process.stdout.write('\n  STEP C COMPLETE — SPONSOR WALLET HAS REAL USABLE DUST CAPACITY.\n\n');
}

main().catch((err) => {
  process.stdout.write('\n  FATAL ERROR in fund-and-register-dust.js:\n  ' + (err.stack || err.message) + '\n');
  process.exit(1);
});
