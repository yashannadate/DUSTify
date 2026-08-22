/**
 * TEST 2 — Sponsor Wallet Initialization & Synchronization Check (Preview Network)
 *
 * Verifies:
 *   1. Sponsor identity HD key derivation
 *   2. WalletFacade initialization
 *   3. wallet.start(shieldedSecretKeys, dustSecretKey) invocation
 *   4. Synchronization progress stream (isConnected, appliedIndex, highestIndex, applyLag)
 *   5. wallet.waitForSyncedState() resolution
 *   6. Real DUST balance and coin query
 *
 * SECURITY:
 *   - NEVER logs seed phrases, shielded secret keys, or DUST secret keys.
 *   - Only logs public addresses, sync numbers, and balances.
 */

import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import { firstValueFrom } from 'rxjs';
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

// Polyfill WebSocket in global environment for SDK WebSocket client
globalThis.WebSocket = WebSocket;

// Polyfill Array.prototype.toSpliced for Node v18
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

// Polyfill Iterator.prototype.map for Node v18 (required for shielded wallet coin picking during event replay)
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn) {
    let index = 0;
    for (const item of this) {
      yield fn(item, index++);
    }
  };
}

// ── Configuration ──────────────────────────────────────────────────────────
const NETWORK_ID    = process.env.MIDNIGHT_NETWORK    || 'preview';
const INDEXER_HTTP  = process.env.INDEXER_HTTP_URL    || 'https://indexer.preview.midnight.network/api/v4/graphql';
const INDEXER_WS    = process.env.INDEXER_WS_URL      || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
const NODE_RPC      = process.env.NODE_RPC_URL        || 'wss://rpc.preview.midnight.network';
const PROOF_SERVER  = process.env.PROOF_SERVER_URL    || 'http://127.0.0.1:6300';
const SPONSOR_SEED  = process.env.MASTER_WALLET_SEED  || '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
const SYNC_TIMEOUT_MS = parseInt(process.env.SYNC_TIMEOUT_MS || '360000', 10);

function pass(label, detail) {
  process.stdout.write('  [PASS] ' + label + (detail ? '\n         -> ' + detail : '') + '\n');
}
function fail(label, detail) {
  process.stdout.write('  [FAIL] ' + label + (detail ? '\n         -> ' + detail : '') + '\n');
}
function info(msg) {
  process.stdout.write('  [INFO] ' + msg + '\n');
}

function deriveKeys(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') {
    throw new Error('HDWallet.fromSeed failed: type=' + hdWallet.type);
  }
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') {
    throw new Error('Key derivation failed: type=' + result.type);
  }
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function runTest2() {
  process.stdout.write('\n==============================================================\n');
  process.stdout.write(' TEST 2 - DUSTify Sponsor Wallet Initialization and Sync Check\n');
  process.stdout.write('==============================================================\n');
  process.stdout.write('  Network:     ' + NETWORK_ID + '\n');
  process.stdout.write('  Indexer:     ' + INDEXER_HTTP + '\n');
  process.stdout.write('  Node RPC:    ' + NODE_RPC + '\n');
  process.stdout.write('  Proof:       ' + PROOF_SERVER + '\n');
  process.stdout.write('  Seed:        [PROTECTED - Derived via HDWallet]\n');
  process.stdout.write('  Sync Limit:  ' + (SYNC_TIMEOUT_MS / 1000) + 's\n\n');

  const results = { pass: 0, fail: 0 };
  let wallet = null;
  let progressSub = null;

  // ── [2.1] HD Key Derivation ──────────────────────────────────────────
  process.stdout.write('  --- [2.1] Sponsor Identity (HD Key Derivation) ---\n');
  let keys, shieldedSecretKeys, dustSecretKey, unshieldedKeystore;
  try {
    setNetworkId(NETWORK_ID);
    keys = deriveKeys(SPONSOR_SEED);
    shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    unshieldedKeystore = createKeystore(keys[Roles.NightExternal], NETWORK_ID);
    pass('SPONSOR IDENTITY', 'Keys derived safely for roles: Zswap, NightExternal, Dust');
    results.pass++;
  } catch (err) {
    fail('SPONSOR IDENTITY', err.message);
    results.fail++;
    return results;
  }
  process.stdout.write('\n');

  // ── [2.2] WalletFacade Initialization ───────────────────────────────
  process.stdout.write('  --- [2.2] WalletFacade Initialization ---\n');
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

  try {
    wallet = await WalletFacade.init({
      configuration: walletConfig,
      shielded: async (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
      unshielded: async (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
      dust: async (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
    });
    pass('WALLET INITIALIZED', 'WalletFacade.init() created ShieldedWallet, DustWallet, UnshieldedWallet');
    results.pass++;
  } catch (err) {
    fail('WALLET INITIALIZED', 'WalletFacade.init() failed: ' + err.message);
    results.fail++;
    return results;
  }
  process.stdout.write('\n');

  // ── [2.3] Wallet Start (Activate WebSocket & Sync Stream) ─────────────
  process.stdout.write('  --- [2.3] Wallet Start (Activate Sync Stream) ---\n');
  try {
    await wallet.start(shieldedSecretKeys, dustSecretKey);
    pass('WALLET START', 'wallet.start(shieldedSecretKeys, dustSecretKey) called successfully');
    results.pass++;
  } catch (err) {
    fail('WALLET START', 'wallet.start() failed: ' + err.message);
    results.fail++;
    return results;
  }
  process.stdout.write('\n');

  // ── [2.4] Diagnostic Sync Monitor & waitForSyncedState ───────────────
  process.stdout.write('  --- [2.4] Synchronization Monitoring ---\n');
  info('Starting real-time synchronization state logger...');

  let lastLoggedProgress = '';
  progressSub = wallet.state().subscribe({
    next: (s) => {
      const dp = s.dust?.progress;
      if (dp) {
        const applyLag = (dp.highestRelevantWalletIndex !== undefined && dp.appliedIndex !== undefined)
          ? (dp.highestRelevantWalletIndex - dp.appliedIndex)
          : 0n;
        const line = 'isConnected=' + dp.isConnected + ' | appliedIndex=' + dp.appliedIndex + ' | highestRelevantWalletIndex=' + dp.highestRelevantWalletIndex + ' | highestIndex=' + dp.highestIndex + ' | highestRelevantIndex=' + dp.highestRelevantIndex + ' | applyLag=' + applyLag + ' | isSynced=' + s.isSynced;
        if (line !== lastLoggedProgress) {
          lastLoggedProgress = line;
          info('[Sync Progress] ' + line);
        }
      }
    },
    error: (err) => {
      info('[Sync Stream Error] ' + err.message);
    },
  });

  let facadeState = null;
  try {
    const syncTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out after ' + (SYNC_TIMEOUT_MS / 1000) + 's')), SYNC_TIMEOUT_MS)
    );
    facadeState = await Promise.race([wallet.waitForSyncedState(), syncTimeout]);
    pass('PREVIEW SYNCHRONIZATION', 'Wallet reached full sync! isSynced = ' + facadeState.isSynced);
    results.pass++;
  } catch (err) {
    fail('PREVIEW SYNCHRONIZATION', 'Sync timed out or failed: ' + err.message);
    results.fail++;
    try {
      facadeState = await Promise.race([
        firstValueFrom(wallet.state()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      info('Latest state captured for inspection.');
    } catch {
      info('Could not retrieve latest state.');
    }
  }

  if (progressSub) {
    progressSub.unsubscribe();
  }
  process.stdout.write('\n');

  // ── [2.5] Public Address & DUST Balance Query ─────────────────────────
  process.stdout.write('  --- [2.5] Public Address and DUST Capacity ---\n');
  if (facadeState) {
    try {
      const dustState = facadeState.dust;
      const now = new Date();
      const balance = dustState.balance(now);
      const availableCoins = dustState.availableCoins;
      const pendingCoins = dustState.pendingCoins;
      const totalCoins = dustState.totalCoins;
      const dustAddress = String(dustState.address?.value || dustState.address || 'N/A');
      const unshieldedAddress = unshieldedKeystore.getBech32Address();

      pass('DUST QUERY', 'Successfully queried DUST wallet metrics from Midnight Preview');
      results.pass++;

      process.stdout.write('\n  +--- Sponsor Wallet Public Status ---------------------\n');
      process.stdout.write('  |  Dust Address:       ' + dustAddress + '\n');
      process.stdout.write('  |  Unshielded Address: ' + unshieldedAddress + '\n');
      process.stdout.write('  |  DUST Balance:       ' + balance.toString() + ' Specks\n');
      process.stdout.write('  |  Available Coins:    ' + availableCoins.length + '\n');
      process.stdout.write('  |  Pending Coins:      ' + pendingCoins.length + '\n');
      process.stdout.write('  |  Total Coins:        ' + totalCoins.length + '\n');
      process.stdout.write('  |  isSynced:           ' + facadeState.isSynced + '\n');
      process.stdout.write('  +------------------------------------------------------\n\n');

      if (balance === 0n && availableCoins.length === 0) {
        info('Current DUST balance is 0.');
        info('This wallet currently CANNOT sponsor transactions without NIGHT/DUST funding.');
        info('Preview Faucet: https://midnight-tmnight-preview.nethermind.dev');
        info('Fund Unshielded Address: ' + unshieldedAddress);
      } else {
        info('Sufficient DUST available: ' + balance.toString() + ' Specks across ' + availableCoins.length + ' coins.');
      }
    } catch (err) {
      fail('DUST QUERY', 'Failed reading DustWalletState: ' + err.message);
      results.fail++;
    }
  } else {
    fail('DUST QUERY', 'No wallet state available');
    results.fail++;
  }
  process.stdout.write('\n');

  // ── Clean shutdown ───────────────────────────────────────────────────
  if (wallet) {
    try {
      await wallet.stop();
      info('WalletFacade stopped cleanly.');
    } catch (err) {
      info('WalletFacade stop warning: ' + err.message);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────
  process.stdout.write('==============================================================\n');
  process.stdout.write(' TEST 2 SUMMARY\n');
  process.stdout.write('==============================================================\n');
  process.stdout.write('  PASS: ' + results.pass + '   FAIL: ' + results.fail + '\n');
  if (results.fail === 0) {
    process.stdout.write('  TEST 2 PASS - Wallet successfully initialized, connected, and synced.\n');
  } else {
    process.stdout.write('  TEST 2 INCOMPLETE/FAIL - See diagnostic log above.\n');
  }
  process.stdout.write('==============================================================\n\n');

  return results;
}

runTest2().catch((err) => {
  process.stdout.write('\n  FATAL: wallet-check.js crashed:\n  ' + (err.stack || err.message) + '\n');
  process.exit(1);
});
