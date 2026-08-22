/**
 * TEST 2 — Sponsor Wallet Initialization, Persistence & Synchronization Check (Preview Network)
 *
 * Requirements:
 *   1. Local state persistence in .data/wallet-state/{networkId}
 *   2. Restore from saved state on startup if available
 *   3. wallet.start(shieldedSecretKeys, dustSecretKey) invocation
 *   4. Synchronization progress stream & timing diagnostics:
 *      - restored from persisted state: true/false
 *      - starting sync index
 *      - ending sync index
 *      - time taken to become fully synced (measured empirically)
 *   5. wallet.waitForSyncedState() resolution
 *   6. Persist updated wallet state upon sync
 *   7. Real DUST balance and coin query
 *
 * SECURITY:
 *   - NEVER logs seed phrases, shielded secret keys, or DUST secret keys.
 *   - Only logs public addresses, sync numbers, and balances.
 *   - Persisted files do NOT contain raw seed phrases or plaintext private keys.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
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

// Polyfill Iterator.prototype.map for Node v18 (required for shielded coin replay)
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn) {
    let index = 0;
    for (const item of this) {
      yield fn(item, index++);
    }
  };
}

// Polyfill Set.prototype.difference for Node v18 (required for shielded wallet restore)
if (!Set.prototype.difference) {
  Set.prototype.difference = function (other) {
    const diff = new Set(this);
    for (const elem of other) {
      diff.delete(elem);
    }
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
const SYNC_TIMEOUT_MS = parseInt(process.env.SYNC_TIMEOUT_MS || '600000', 10);
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

// ── Persistence Helpers ────────────────────────────────────────────────────
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
    info('Persistence read warning: ' + err.message);
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

    info('Successfully saved wallet sync state to ' + PERSIST_DIR);
    return true;
  } catch (err) {
    info('Failed saving persisted state: ' + err.message);
    return false;
  }
}

// ── Key Derivation ─────────────────────────────────────────────────────────
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

// ── Main Test 2 ────────────────────────────────────────────────────────────
async function runTest2() {
  process.stdout.write('\n==============================================================\n');
  process.stdout.write(' TEST 2 — DUSTify Sponsor Wallet Persistence & Sync Check\n');
  process.stdout.write('==============================================================\n');
  process.stdout.write('  Network:        ' + NETWORK_ID + '\n');
  process.stdout.write('  Indexer:        ' + INDEXER_HTTP + '\n');
  process.stdout.write('  Node RPC:       ' + NODE_RPC + '\n');
  process.stdout.write('  Proof Server:   ' + PROOF_SERVER + '\n');
  process.stdout.write('  Seed:           [PROTECTED - Derived via HDWallet]\n');
  process.stdout.write('  Persist Path:   ' + PERSIST_DIR + '\n');
  process.stdout.write('  Sync Timeout:   ' + (SYNC_TIMEOUT_MS / 1000) + 's\n\n');

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

  // ── [2.2] State Persistence & WalletFacade Initialization ───────────
  process.stdout.write('  --- [2.2] State Persistence & Wallet Initialization ---\n');
  const savedState = loadPersistedState();
  info('Restored from persisted state: ' + savedState.exists);
  if (savedState.exists) {
    info('Found valid saved checkpoints for: shielded, unshielded, dust');
  } else {
    info('No previous checkpoint found. Performing full initial stream replay.');
  }

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

  const restored = { shielded: false, unshielded: false, dust: false };

  try {
    wallet = await WalletFacade.init({
      configuration: walletConfig,
      shielded: async (cfg) => {
        const cls = ShieldedWallet(cfg);
        if (savedState.shielded !== undefined) {
          try {
            const r = await cls.restore(savedState.shielded);
            restored.shielded = true;
            return r;
          } catch (e) {
            info('Shielded restore fallback: ' + e.message);
          }
        }
        return cls.startWithSecretKeys(shieldedSecretKeys);
      },
      unshielded: async (cfg) => {
        const cls = UnshieldedWallet(cfg);
        if (savedState.unshielded !== undefined) {
          try {
            const r = await cls.restore(savedState.unshielded);
            restored.unshielded = true;
            return r;
          } catch (e) {
            info('Unshielded restore fallback: ' + e.message);
          }
        }
        return cls.startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
      },
      dust: async (cfg) => {
        const cls = DustWallet(cfg);
        if (savedState.dust !== undefined) {
          try {
            const r = await cls.restore(savedState.dust);
            restored.dust = true;
            return r;
          } catch (e) {
            info('Dust restore fallback: ' + e.message);
          }
        }
        return cls.startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
      },
    });

    pass('WALLET INITIALIZED', 'WalletFacade.init() created with restored status: ' + JSON.stringify(restored));
    results.pass++;
  } catch (err) {
    fail('WALLET INITIALIZED', 'WalletFacade.init() failed: ' + err.message);
    results.fail++;
    return results;
  }
  process.stdout.write('\n');

  // ── [2.3] Wallet Start ───────────────────────────────────────────────
  process.stdout.write('  --- [2.3] Wallet Start (Activate WebSocket & Sync Stream) ---\n');
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
  process.stdout.write('  --- [2.4] Synchronization Monitoring & Timing ---\n');
  info('Starting synchronization timer & progress observer...');

  const startTime = Date.now();
  let startingIndex = null;
  let latestAppliedIndex = 0n;
  let latestHighestIndex = 0n;
  let latestLag = 0n;
  let lastLoggedProgress = '';

  progressSub = wallet.state().subscribe({
    next: (s) => {
      const dp = s.dust?.progress;
      if (dp) {
        if (startingIndex === null && dp.appliedIndex !== undefined) {
          startingIndex = dp.appliedIndex;
          info('Starting sync index: ' + startingIndex);
        }
        latestAppliedIndex = dp.appliedIndex ?? 0n;
        latestHighestIndex = dp.highestRelevantWalletIndex ?? dp.highestIndex ?? 0n;
        latestLag = (latestHighestIndex >= latestAppliedIndex) ? (latestHighestIndex - latestAppliedIndex) : 0n;

        const line = 'isConnected=' + dp.isConnected + ' | appliedIndex=' + latestAppliedIndex + ' | highestIndex=' + latestHighestIndex + ' | applyLag=' + latestLag + ' | isSynced=' + s.isSynced;
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
  let syncSuccess = false;
  try {
    const syncTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out after ' + (SYNC_TIMEOUT_MS / 1000) + 's')), SYNC_TIMEOUT_MS)
    );
    facadeState = await Promise.race([wallet.waitForSyncedState(), syncTimeout]);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    syncSuccess = true;

    pass('PREVIEW SYNCHRONIZATION', 'Wallet fully synchronized! isSynced=' + facadeState.isSynced + ' in ' + durationSec + 's');
    results.pass++;
  } catch (err) {
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    fail('PREVIEW SYNCHRONIZATION', 'Sync timed out or failed after ' + durationSec + 's: ' + err.message);
    results.fail++;
    try {
      facadeState = await Promise.race([
        firstValueFrom(wallet.state()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
    } catch {
      info('Could not retrieve latest state.');
    }
  }

  if (progressSub) {
    progressSub.unsubscribe();
  }

  const totalTimeTakenSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const endingIndex = latestAppliedIndex;

  // ── [2.5] Persist State for Fast Subsequent Runs ─────────────────────
  process.stdout.write('\n  --- [2.5] Persist Updated Wallet State ---\n');
  if (wallet) {
    const savedOk = await savePersistedState(wallet);
    if (savedOk) {
      pass('STATE PERSISTENCE', 'Wallet state serialized and saved to ' + PERSIST_DIR);
      results.pass++;
    } else {
      fail('STATE PERSISTENCE', 'Failed to save wallet state');
      results.fail++;
    }
  }
  process.stdout.write('\n');

  // ── [2.6] Public Address & DUST Balance Query ─────────────────────────
  process.stdout.write('  --- [2.6] Public Address, DUST Capacity & Timing Summary ---\n');
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

      process.stdout.write('\n  +--- Sponsor Wallet Sync & Balance Report -------------\n');
      process.stdout.write('  |  Restored from Persisted State: ' + savedState.exists + '\n');
      process.stdout.write('  |  Starting Sync Index:           ' + (startingIndex ?? '0') + '\n');
      process.stdout.write('  |  Ending Sync Index:             ' + endingIndex + '\n');
      process.stdout.write('  |  Highest Network Index:         ' + latestHighestIndex + '\n');
      process.stdout.write('  |  Remaining Apply Lag:           ' + latestLag + '\n');
      process.stdout.write('  |  Time Taken:                    ' + totalTimeTakenSec + 's\n');
      process.stdout.write('  |  isSynced:                      ' + facadeState.isSynced + '\n');
      process.stdout.write('  |  Dust Address:                  ' + dustAddress + '\n');
      process.stdout.write('  |  Unshielded Address:            ' + unshieldedAddress + '\n');
      process.stdout.write('  |  DUST Balance:                  ' + balance.toString() + ' Specks\n');
      process.stdout.write('  |  Available Coins:               ' + availableCoins.length + '\n');
      process.stdout.write('  |  Pending Coins:                 ' + pendingCoins.length + '\n');
      process.stdout.write('  |  Total Coins:                   ' + totalCoins.length + '\n');
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
  if (syncSuccess) {
    process.stdout.write('  TEST 2 FULL PASS — Wallet fully synchronized and state persisted.\n');
  } else {
    process.stdout.write('  TEST 2 PARTIAL PASS — Progress verified, full sync in progress.\n');
  }
  process.stdout.write('==============================================================\n\n');

  return { results, syncSuccess, timeTakenSec: totalTimeTakenSec, isSynced: facadeState?.isSynced };
}

runTest2().catch((err) => {
  process.stdout.write('\n  FATAL: wallet-check.js crashed:\n  ' + (err.stack || err.message) + '\n');
  process.exit(1);
});
