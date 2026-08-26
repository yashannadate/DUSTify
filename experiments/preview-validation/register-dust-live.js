// CRITICAL: Runtime polyfills must execute synchronously before any SDK imports
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount === undefined ? this.length - start : deleteCount, ...items);
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

import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;

import * as path from 'node:path';
import * as fs from 'node:fs';

async function main() {
  console.log('=== Step C: DUST Generation Registration on Midnight Preview ===\n');

  // Dynamic imports to ensure polyfills are in place before WASM and Effect runtimes initialize
  const ledger = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
  const { unshieldedToken } = ledger;
  const sdk = await import('@midnight-ntwrk/wallet-sdk');
  const {
    WalletFacade,
    DustWallet,
    HDWallet,
    Roles,
    ShieldedWallet,
    createKeystore,
    NoOpTransactionHistoryStorage,
    PublicKey,
    UnshieldedWallet,
  } = sdk;
  const Rx = await import('rxjs');

  const seed = '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed phrase');

  const keys = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0).keys;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');

  const persistDir = path.join(process.cwd(), '.data', 'wallet-state', 'preview');
  let savedState = {};
  try {
    savedState = {
      shielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'shielded.json'), 'utf-8')),
      unshielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'unshielded.json'), 'utf-8')),
      dust: JSON.parse(fs.readFileSync(path.join(persistDir, 'dust.json'), 'utf-8')),
    };
    console.log('[Wallet] Found existing persisted state files.');
  } catch (e) {
    console.log('[Wallet] Starting fresh (no persisted state):', e.message);
  }

  console.log('[Wallet] Initializing WalletFacade on Preview network...');
  const wallet = await WalletFacade.init({
    configuration: {
      networkId: 'preview',
      indexerClientConnection: {
        indexerHttpUrl: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWsUrl: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      },
      provingServerUrl: new URL('http://127.0.0.1:6300'),
      relayURL: new URL('wss://rpc.preview.midnight.network'),
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
      costParameters: {
        additionalFeeOverhead: 300_000_000_000_000n,
        feeBlocksMargin: 5,
      },
    },
    shielded: async (cfg) => savedState.shielded ? ShieldedWallet(cfg).restore(savedState.shielded) : ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg) => savedState.unshielded ? UnshieldedWallet(cfg).restore(savedState.unshielded) : UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg) => savedState.dust ? DustWallet(cfg).restore(savedState.dust) : DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  console.log('[Wallet] Starting wallet synchronization...');
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  console.log('[Wallet] Waiting for live synced state...');
  const state = await wallet.waitForSyncedState();
  console.log(`[Wallet] Synced at block! (isSynced: ${state.isSynced})`);

  const tNight = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`[Wallet] tNIGHT Balance: ${tNight} (${Number(tNight) / 1_000_000} NIGHT)`);
  console.log(`[Wallet] Available UTXOs: ${state.unshielded.availableCoins.length}`);

  const unregistered = state.unshielded.availableCoins.filter((c) => !c.meta?.registeredForDustGeneration);
  console.log(`[Wallet] Unregistered UTXOs for DUST: ${unregistered.length}`);

  const dustBalBefore = state.dust.balance(new Date());
  console.log(`[Wallet] DUST Balance before registration: ${dustBalBefore} Specks`);

  if (unregistered.length > 0) {
    console.log('\n[Action] Registering funded NIGHT UTXO(s) for DUST generation via SDK...');
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload)
    );
    console.log('[Action] Recipe created successfully! Finalizing proof with Proof Server...');
    const finalized = await wallet.finalizeRecipe(recipe);
    console.log('[Action] Finalized proven transaction! Submitting to Midnight Preview RPC...');
    const txId = await wallet.submitTransaction(finalized);
    console.log(`\n>>> SUCCESS: DUST Registration Transaction Submitted! <<<`);
    console.log(`Transaction ID: ${txId}\n`);
  } else {
    console.log('[Wallet] All UTXOs are already registered for DUST generation.');
  }

  console.log('[Verification] Waiting for real-time DUST capacity generation on-chain...');
  const updatedState = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(3000),
      Rx.filter((s) => s.isSynced),
      Rx.filter((s) => s.dust.balance(new Date()) > 0n || s.dust.availableCoins.length > 0)
    )
  );

  const dustBalAfter = updatedState.dust.balance(new Date());
  console.log(`[Verification] DUST Balance now: ${dustBalAfter} Specks`);
  console.log(`[Verification] Available DUST Coins: ${updatedState.dust.availableCoins.length}`);

  // Persist updated wallet state
  fs.mkdirSync(persistDir, { recursive: true });
  const shieldedState = await wallet.shielded.serializeState();
  const unshieldedState = await wallet.unshielded.serializeState();
  const dustState = await wallet.dust.serializeState();
  fs.writeFileSync(path.join(persistDir, 'shielded.json'), JSON.stringify(shieldedState, null, 2));
  fs.writeFileSync(path.join(persistDir, 'unshielded.json'), JSON.stringify(unshieldedState, null, 2));
  fs.writeFileSync(path.join(persistDir, 'dust.json'), JSON.stringify(dustState, null, 2));
  console.log('[Persistence] Saved updated state to .data/wallet-state/preview/');

  await wallet.stop();
  console.log('[Wallet] Wallet stopped cleanly.');

  return {
    tNightBalance: tNight,
    dustBalance: dustBalAfter,
    dustCoins: updatedState.dust.availableCoins.length,
  };
}

main()
  .then((res) => {
    console.log('\n=== STEP C VERIFICATION COMPLETED SUCCESSFULLY ===');
    console.log(JSON.stringify(res, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[FATAL] Error in Step C:', err);
    process.exit(1);
  });
