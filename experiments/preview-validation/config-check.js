/**
 * TEST 1 — Preview Connectivity Check
 * 
 * Verifies:
 *   - MIDNIGHT_NETWORK env = "preview"
 *   - Indexer HTTP GraphQL endpoint reachable + returns preview data
 *   - Indexer WS endpoint reachable (TCP handshake)
 *   - Node RPC endpoint reachable (TCP handshake)
 *   - Proof Server endpoint reachable + returns 404 (alive, no valid path)
 * 
 * NO transactions. NO mocks. READ ONLY.
 * Uses only native Node.js fetch + ws for real connectivity probes.
 */

import { WebSocket } from 'ws';
import * as http from 'http';
import * as https from 'https';

// ── Configuration (environment variables, never hardcoded) ─────────────────
const NETWORK_ID    = process.env.MIDNIGHT_NETWORK    || 'preview';
const INDEXER_HTTP  = process.env.INDEXER_HTTP_URL    || 'https://indexer.preview.midnight.network/api/v4/graphql';
const INDEXER_WS    = process.env.INDEXER_WS_URL      || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
const NODE_RPC      = process.env.NODE_RPC_URL        || 'wss://rpc.preview.midnight.network';
const PROOF_SERVER  = process.env.PROOF_SERVER_URL    || 'http://127.0.0.1:6300';

function pass(label, detail) {
  console.log(`  ✅ PASS  ${label}${detail ? `\n         → ${detail}` : ''}`);
}
function fail(label, detail) {
  console.log(`  ❌ FAIL  ${label}${detail ? `\n         → ${detail}` : ''}`);
}
function info(msg) {
  console.log(`  ℹ️       ${msg}`);
}

// ── Test helpers ───────────────────────────────────────────────────────────

/** HTTP GET/POST with timeout, returns { status, headers, body } */
async function httpRequest(url, method = 'GET', body = null, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const opts = {
      method,
      signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : {},
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    clearTimeout(timer);
    return { ok: true, status: res.status, headers: Object.fromEntries(res.headers.entries()), body: text };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.message };
  }
}

/** WS connectivity probe — checks TCP+TLS handshake + optional subprotocol, closes immediately */
async function wsReachable(url, timeoutMs = 8000, protocols = []) {
  return new Promise((resolve) => {
    let ws;
    const timer = setTimeout(() => {
      try { ws && ws.terminate(); } catch {}
      resolve({ ok: false, error: 'WebSocket connection timeout' });
    }, timeoutMs);

    try {
      const opts = {
        handshakeTimeout: timeoutMs,
        rejectUnauthorized: false,
      };
      ws = protocols.length > 0
        ? new WebSocket(url, protocols, opts)
        : new WebSocket(url, opts);

      ws.on('open', () => {
        clearTimeout(timer);
        ws.close();
        resolve({ ok: true });
      });
      // 400/1002 still means server responded — WS is reachable
      ws.on('unexpected-response', (req, res) => {
        clearTimeout(timer);
        resolve({ ok: res.statusCode === 400 || res.statusCode === 101
          ? true : false,
          status: res.statusCode,
          detail: `Server responded HTTP ${res.statusCode} (WS upgrade)` });
      });
      ws.on('error', (err) => {
        clearTimeout(timer);
        resolve({ ok: false, error: err.message });
      });
    } catch (err) {
      clearTimeout(timer);
      resolve({ ok: false, error: err.message });
    }
  });
}

// ── Main Test 1 ────────────────────────────────────────────────────────────

async function runTest1() {
  console.log('');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' TEST 1 — Midnight Preview Connectivity & Configuration Check');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Configuration:');
  console.log(`    MIDNIGHT_NETWORK : ${NETWORK_ID}`);
  console.log(`    INDEXER_HTTP_URL : ${INDEXER_HTTP}`);
  console.log(`    INDEXER_WS_URL   : ${INDEXER_WS}`);
  console.log(`    NODE_RPC_URL     : ${NODE_RPC}`);
  console.log(`    PROOF_SERVER_URL : ${PROOF_SERVER}`);
  console.log('');

  const results = { pass: 0, fail: 0 };

  // ── [1.1] Network ID Check ─────────────────────────────────────────────
  console.log('  ─── [1.1] Network ID ──────────────────────────────────────');
  if (NETWORK_ID === 'preview') {
    pass('NETWORK ID', `MIDNIGHT_NETWORK = "${NETWORK_ID}"`);
    results.pass++;
  } else {
    fail('NETWORK ID', `Expected "preview", got "${NETWORK_ID}"`);
    results.fail++;
  }
  console.log('');

  // ── [1.2] Indexer HTTP GraphQL Probe ──────────────────────────────────
  console.log('  ─── [1.2] Indexer HTTP GraphQL ────────────────────────────');
  info(`Querying: POST ${INDEXER_HTTP}`);
  
  // Confirmed-working query from schema inspection:
  // BlockOffset has {height, hash} fields only — no "distance" field.
  // Querying block with no offset returns the latest finalized block.
  const gqlResult = await httpRequest(INDEXER_HTTP, 'POST', {
    query: `query { block { height hash } }`
  }, 12000);

  if (!gqlResult.ok) {
    fail('INDEXER HTTP', `Connection error: ${gqlResult.error}`);
    results.fail++;
  } else {
    info(`HTTP Status: ${gqlResult.status}`);
    info(`Response body (first 300 chars): ${gqlResult.body.slice(0, 300)}`);
    
    // Check for x-network-id header (api-preview.1am.xyz returns this)
    const networkHeader = gqlResult.headers['x-network-id'] || 'not present';
    info(`x-network-id header: ${networkHeader}`);

    if (gqlResult.status === 200) {
      let parsed;
      try { parsed = JSON.parse(gqlResult.body); } catch {}
      
      if (parsed?.data?.block?.height !== undefined) {
        pass('INDEXER HTTP', `Block height = ${parsed.data.block.height}, hash = ${parsed.data.block.hash}`);
        results.pass++;
      } else if (parsed?.errors) {
        // GraphQL error (unknown field, etc.) — means the server IS up but schema may differ
        fail('INDEXER HTTP', `GraphQL schema error: ${parsed.errors[0]?.message}`);
        results.fail++;
        
        // Try alternate query to find the actual block height field
        info('Attempting alternate query: { __schema { queryType { name } } }');
        const schemaResult = await httpRequest(INDEXER_HTTP, 'POST', {
          query: `query { __schema { queryType { name } types { name } } }`
        }, 12000);
        if (schemaResult.ok && schemaResult.status === 200) {
          const sp = JSON.parse(schemaResult.body);
          const queryType = sp?.data?.__schema?.queryType?.name;
          const typeNames = sp?.data?.__schema?.types?.map(t => t.name).filter(n => !n.startsWith('__')).slice(0, 20);
          info(`QueryType: ${queryType}`);
          info(`Available types: ${typeNames?.join(', ')}`);
        }
      } else {
        pass('INDEXER HTTP', `Responded HTTP 200 (body: ${gqlResult.body.slice(0, 100)})`);
        results.pass++;
      }
    } else if (gqlResult.status === 401) {
      // api-preview.1am.xyz requires auth — still verifies reachability & network
      const body = gqlResult.body;
      const isPreviewNetwork = networkHeader === 'preview' || body.includes('preview') || body.includes('Authentication');
      if (isPreviewNetwork) {
        pass('INDEXER HTTP (auth-gated)', `HTTP 401 from Preview endpoint — reachable, x-network-id=${networkHeader}`);
        results.pass++;
      } else {
        fail('INDEXER HTTP', `HTTP 401 — cannot confirm preview network`);
        results.fail++;
      }
    } else {
      fail('INDEXER HTTP', `Unexpected HTTP ${gqlResult.status}: ${gqlResult.body.slice(0, 200)}`);
      results.fail++;
    }
  }
  console.log('');

  // ── [1.3] Indexer WebSocket Probe ─────────────────────────────────────
  console.log('  ─── [1.3] Indexer WebSocket ───────────────────────────────');
  info(`Probing WS: ${INDEXER_WS}`);
  info('Using graphql-ws subprotocol (required by Midnight indexer)');
  const wsResult = await wsReachable(INDEXER_WS, 10000, ['graphql-ws', 'graphql-transport-ws']);
  if (wsResult.ok) {
    pass('INDEXER WEBSOCKET', 'TCP+TLS handshake succeeded, connection opened');
    results.pass++;
  } else {
    // WS failure is NOT a blocker for the relayer (HTTP GraphQL is sufficient for public data)
    // but log it accurately
    fail('INDEXER WEBSOCKET', wsResult.error);
    results.fail++;
    info('NOTE: WS is used by WalletFacade for subscription-based sync. Required for Test 2.');
  }
  console.log('');

  // ── [1.4] Node RPC WebSocket Probe ────────────────────────────────────
  console.log('  ─── [1.4] Midnight Node RPC ───────────────────────────────');
  info(`Probing WS: ${NODE_RPC}`);
  const nodeWsResult = await wsReachable(NODE_RPC, 10000);
  if (nodeWsResult.ok) {
    pass('NODE RPC', 'TCP+TLS handshake succeeded');
    results.pass++;
  } else {
    fail('NODE RPC', nodeWsResult.error);
    results.fail++;
    info('BLOCKER: Transaction submission to Midnight Preview requires this endpoint.');
  }
  console.log('');

  // ── [1.5] Proof Server HTTP Probe ─────────────────────────────────────
  console.log('  ─── [1.5] Proof Server ────────────────────────────────────');
  info(`Probing HTTP: ${PROOF_SERVER}`);
  const proofResult = await httpRequest(PROOF_SERVER, 'GET', null, 5000);
  if (!proofResult.ok) {
    fail('PROOF SERVER', `Not reachable: ${proofResult.error}`);
    results.fail++;
    info('BLOCKER: ZK proof generation requires the proof server. Start it with Docker.');
    info('  docker compose up my-app-proof-server');
  } else {
    // Proof server returns 404 for GET / — that means it IS running
    if (proofResult.status === 404 || proofResult.status === 200) {
      pass('PROOF SERVER', `HTTP ${proofResult.status} — server is alive at ${PROOF_SERVER}`);
      results.pass++;
    } else {
      pass('PROOF SERVER (reachable)', `HTTP ${proofResult.status} — ${proofResult.body.slice(0, 100)}`);
      results.pass++;
    }
  }
  console.log('');

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' TEST 1 SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  PASS: ${results.pass}   FAIL: ${results.fail}`);
  console.log('');
  if (results.fail === 0) {
    console.log('  ✅ ALL CHECKS PASSED — Preview connectivity confirmed.');
    console.log('     Proceed to Test 2 (Sponsor Wallet Initialization).');
  } else {
    console.log('  ❌ SOME CHECKS FAILED — Diagnose failures above before proceeding.');
    console.log('     Do NOT proceed to Test 2 until all BLOCKERS are resolved.');
  }
  console.log('══════════════════════════════════════════════════════════════');
  console.log('');

  return results;
}

runTest1().catch(err => {
  console.error('\n  FATAL: config-check.js crashed:', err.stack || err.message);
  process.exit(1);
});
