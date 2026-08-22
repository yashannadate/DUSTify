/**
 * TEST 2 — Sponsor Wallet Initialization & DUST Balance Check
 *
 * Verifies:
 *   1. Sponsor identity (HD key derivation) initializes correctly
 *   2. ShieldedWallet initializes with derived ZswapSecretKeys
 *   3. DustWallet initializes with derived DustSecretKey
 *   4. WalletFacade connects to Midnight Preview
 *   5. Wallet synchronization completes (waitForSyncedState resolves)
 *   6. Real DUST balance can be queried (DustWalletState.balance(now))
 *   7. Wallet progress/sync state is reported
 *
 * RULES:
 *   - NO transactions
 *   - NO mocks
 *   - NO fake DUST
 *   - READ ONLY
 *
 * Uses ONLY official @midnight-ntwrk SDK APIs verified against installed type definitions.
 *
 * Key API facts confirmed from DustWallet.d.ts v4.2.0:
 *   - DustWalletState.balance(time: Date): bigint  → real DUST balance
 *   - DustWalletState.availableCoins → readonly DustFullInfo[]
 *   - DustWalletState.progress → SyncProgress
 *   - DustWalletState.address → DustAddress
 *
 * Key API facts confirmed from wallet-sdk-facade v4.1.0:
 *   - WalletFacade.waitForSyncedState(): Promise<FacadeState>
 *   - FacadeState.dust: DustWalletState
 *   - FacadeState.isSynced: boolean
 *
 * IMPORTANT: balanceTx() does NOT exist on WalletFacade.
 * Correct balancing API: WalletFacade.balanceUnboundTransaction(tx, {shieldedSecretKeys, dustSecretKey}, {ttl})
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

// Polyfill WebSocket
globalThis.WebSocket = WebSocket;

// Polyfill Array.prototype.toSpliced for Node v18 (required by wallet-sdk-runtime)
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

// ── Configuration (never hardcoded) ───────────────────────────────────────
const NETWORK_ID    = process.env.MIDNIGHT_NETWORK    || 'preview';
const INDEXER_HTTP  = process.env.INDEXER_HTTP_URL    || 'https://indexer.preview.midnight.network/api/v4/graphql';
const INDEXER_WS    = process.env.INDEXER_WS_URL      || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
const NODE_RPC      = process.env.NODE_RPC_URL        || 'wss://rpc.preview.midnight.network';
const PROOF_SERVER  = process.env.PROOF_SERVER_URL    || 'http://127.0.0.1:6300';
// Sponsor seed — NEVER commit real seeds. This is a test-only seed for Preview.
const SPONSOR_SEED  = process.env.MASTER_WALLET_SEED  || '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';

// ── Sync timeout — Preview network sync can take time ─────────────────────
const SYNC_TIMEOUT_MS = parseInt(process.env.SYNC_TIMEOUT_MS || '180000', 10);

function pass(label, detail) {
  process.stdout.write(`  ✅ PASS  ${label}${detail ? `\n         → ${detail}` : ''}\n`);
}
function fail(label, detail) {
  process.stdout.write(`  ❌ FAIL  ${label}${detail ? `\n         → ${detail}` : ''}\n`);
}
function info(msg) {
  process.stdout.write(`  ℹ️       ${msg}\n`);
}

// ── Key Derivation (verified against wallet-sdk-hd v3.0.3) ───────────────
function deriveKeys(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') {
    throw new Error(`HDWallet.fromSeed failed: type=${hdWallet.type}`);
  }
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') {
    throw new Error(`Key derivation failed: type=${result.type}`);
  }
  hdWallet.hdWallet.clear();
  return result.keys;
}

// ── Main Test 2 ────────────────────────────────────────────────────────────
async function runTest2() {
  process.stdout.write('\n');
  process.stdout.write('══════════════════════════════════════════════════════════════\n');
  process.stdout.write(' TEST 2 — DUSTify Sponsor Wallet Initialization & DUST Query\n');
  process.stdout.write('══════════════════════════════════════════════════════════════\n');
  process.stdout.write('\n');
  process.stdout.write(`  Network:     ${NETWORK_ID}\n`);
  process.stdout.write(`  Indexer:     ${INDEXER_HTTP}\n`);
  process.stdout.write(`  Node RPC:    ${NODE_RPC}\n`);
  process.stdout.write(`  Proof:       ${PROOF_SERVER}\n`);
  process.stdout.write(`  Seed:        ${SPONSOR_SEED.slice(0, 8)}...${SPONSOR_SEED.slice(-4)} (truncated)\n`);
  process.stdout.write(`  Sync Limit:  ${SYNC_TIMEOUT_MS / 1000}s\n`);
  process.stdout.write('\n');

  const results = { pass: 0, fail: 0 };
  let wallet = null;

  // ── [2.1] HD Key Derivation ──────────────────────────────────────────
  process.stdout.write('  ─── [2.1] Sponsor Identity (HD Key Derivation) ───────────\n');
  let keys, shieldedSecretKeys, dustSecretKey, unshieldedKeystore;
  try {
    keys = deriveKeys(SPONSOR_SEED);
    shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    unshieldedKeystore = createKeystore(keys[Roles.NightExternal], NETWORK_ID);
    pass('SPONSOR IDENTITY', `Keys derived for roles: Zswap, NightExternal, Dust`);
    results.pass++;
  } catch (err) {
    fail('SPONSOR IDENTITY', `${err.message}`);
    results.fail++;
    process.stdout.write('\n  ❌ Cannot continue without valid identity. Stopping Test 2.\n');
    return results;
  }
  process.stdout.write('\n');

  // ── [2.2] WalletFacade Initialization ───────────────────────────────
  process.stdout.write('  ─── [2.2] WalletFacade Initialization ────────────────────\n');
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
      shielded: async (cfg) =>
        ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
      unshielded: async (cfg) =>
        UnshieldedWallet(cfg).startWithPublicKey(
          PublicKey.fromKeyStore(unshieldedKeystore)
        ),
      dust: async (cfg) =>
        DustWallet(cfg).startWithSecretKey(
          dustSecretKey,
          ledger.LedgerParameters.initialParameters().dust
        ),
    });
    pass('WALLET FACADE', 'WalletFacade.init() succeeded — ShieldedWallet + DustWallet + UnshieldedWallet ready');
    results.pass++;
  } catch (err) {
    fail('WALLET FACADE', `WalletFacade.init() failed: ${err.message}\n${err.stack}`);
    results.fail++;
    process.stdout.write('\n  ❌ Cannot continue without WalletFacade. Stopping Test 2.\n');
    return results;
  }
  process.stdout.write('\n');

  // ── [2.3] Preview Sync (waitForSyncedState) ──────────────────────────
  process.stdout.write('  ─── [2.3] Midnight Preview Synchronization ────────────────\n');
  info(`Waiting for wallet sync with Midnight Preview (timeout: ${SYNC_TIMEOUT_MS / 1000}s)...`);
  info('Connecting to indexer WebSocket for block subscription...');

  let facadeState;
  try {
    const syncTimeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Sync timed out after ${SYNC_TIMEOUT_MS / 1000}s`)),
        SYNC_TIMEOUT_MS
      )
    );
    facadeState = await Promise.race([wallet.waitForSyncedState(), syncTimeout]);
    pass('PREVIEW SYNC', `Wallet synchronized successfully. isSynced = ${facadeState.isSynced}`);
    results.pass++;
  } catch (err) {
    fail('PREVIEW SYNC', `Sync failed or timed out: ${err.message}`);
    results.fail++;
    // Do NOT stop — try to read any partial state for diagnostics
    try {
      // Use firstValueFrom on the state() Observable for a one-shot read
      const partialState = await Promise.race([
        firstValueFrom(wallet.state()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('No state in 5s')), 5000)),
      ]);
      info(`Partial state available. isSynced = ${partialState?.isSynced}`);
      facadeState = partialState;
    } catch {
      info('No partial state available.');
    }
  }
  process.stdout.write('\n');

  // ── [2.4] DUST Balance Query ──────────────────────────────────────────
  process.stdout.write('  ─── [2.4] DUST Balance & Wallet State ────────────────────\n');
  if (facadeState) {
    try {
      const dustState = facadeState.dust;
      const now = new Date();
      const balance = dustState.balance(now);
      const availableCoins = dustState.availableCoins;
      const pendingCoins = dustState.pendingCoins;
      const totalCoins = dustState.totalCoins;
      const progress = dustState.progress;
      const dustAddress = dustState.address;

      pass('DUST QUERY', `Real DUST balance successfully queried from Midnight Preview`);
      results.pass++;

      process.stdout.write('\n');
      process.stdout.write('  ┌─── Sponsor Wallet State ─────────────────────────────┐\n');
      process.stdout.write(`  │  DUST Balance:     ${balance} (bigint)\n`);
      process.stdout.write(`  │  Available Coins:  ${availableCoins.length}\n`);
      process.stdout.write(`  │  Pending Coins:    ${pendingCoins.length}\n`);
      process.stdout.write(`  │  Total Coins:      ${totalCoins.length}\n`);
      process.stdout.write(`  │  Dust Address:     ${String(dustAddress).slice(0, 40)}...\n`);
      process.stdout.write(`  │  Sync Progress:    ${JSON.stringify(progress, (_, v) => typeof v === 'bigint' ? v.toString() : v)}\n`);
      process.stdout.write(`  │  isSynced:         ${facadeState.isSynced}\n`);
      process.stdout.write('  └──────────────────────────────────────────────────────┘\n');

      if (balance === 0n && availableCoins.length === 0) {
        process.stdout.write('\n');
        info('⚠️  DUST balance is 0. This is expected for a fresh test seed.');
        info('   The Sponsor wallet requires NIGHT tokens registered for DUST generation.');
        info('   For MVP testing, fund this address via the Midnight Preview faucet.');
        info(`   Dust Address: ${dustAddress}`);
      }
    } catch (err) {
      fail('DUST QUERY', `Failed to read DustWalletState: ${err.message}`);
      results.fail++;
    }
  } else {
    fail('DUST QUERY', 'No wallet state available — sync must succeed first');
    results.fail++;
  }
  process.stdout.write('\n');

  // ── Stop wallet ──────────────────────────────────────────────────────
  if (wallet) {
    try {
      await wallet.stop();
      info('WalletFacade stopped cleanly.');
    } catch (err) {
      info(`WalletFacade stop warning: ${err.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────
  process.stdout.write('══════════════════════════════════════════════════════════════\n');
  process.stdout.write(' TEST 2 SUMMARY\n');
  process.stdout.write('══════════════════════════════════════════════════════════════\n');
  process.stdout.write(`  PASS: ${results.pass}   FAIL: ${results.fail}\n`);
  process.stdout.write('\n');

  if (results.fail === 0) {
    process.stdout.write('  ✅ ALL CHECKS PASSED — Sponsor DUST Wallet operates on Midnight Preview.\n');
    process.stdout.write('     DUSTify can initialize, sync, and query real DUST state.\n');
    process.stdout.write('     Proceed to Test 3 (Real Single-Identity Transaction).\n');
  } else {
    process.stdout.write('  ❌ SOME CHECKS FAILED — Diagnose above before proceeding to Test 3.\n');
  }
  process.stdout.write('══════════════════════════════════════════════════════════════\n\n');

  return results;
}

runTest2().catch((err) => {
  process.stdout.write(`\n  FATAL: wallet-check.js crashed:\n  ${err.stack || err.message}\n`);
  process.exit(1);
});
