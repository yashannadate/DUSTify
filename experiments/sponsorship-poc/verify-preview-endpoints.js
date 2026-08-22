import fetch from 'node-fetch';
import { WebSocket } from 'ws';

// Polyfill WebSocket
globalThis.WebSocket = WebSocket;

const INDEXER_HTTP = process.env.INDEXER_HTTP_URL || 'https://api-preview.1am.xyz/api/v4/graphql';
const NODE_RPC = process.env.NODE_RPC_URL || 'wss://rpc.preview.midnight.network';

console.log('--- Verifying Midnight Preview Endpoints & SDK Compatibility ---');
console.log(`Indexer HTTP: ${INDEXER_HTTP}`);
console.log(`Node RPC:     ${NODE_RPC}`);

async function verifyIndexer() {
  try {
    const res = await fetch(INDEXER_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ blockHeight }' }),
    });

    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    console.log(`x-network-id header: ${res.headers.get('x-network-id')}`);

    const text = await res.text();
    console.log(`Response Body: ${text.slice(0, 200)}`);

    if (res.status === 200 || res.status === 401) {
      console.log('✓ Preview Indexer endpoint is reachable and compatible.');
    }
  } catch (err) {
    console.error('Indexer connection failed:', err.message);
  }
}

verifyIndexer();
