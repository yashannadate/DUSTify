# 🔗 DUSTify API & SDK Specification

---

## 1. Client SDK (`@dustify/sdk`)

### Installation
```bash
npm install @dustify/sdk
```

### Instantiation
```typescript
import { DustifyClient } from '@dustify/sdk';

const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',
  apiKey: process.env.DUSTIFY_API_KEY || '<YOUR_API_KEY>',
  timeoutMs: 30000,
});
```

### Methods

#### `dustify.sponsorAndSubmit(unboundTx, options)`
Relays a locally proven `UnboundTransaction` to the Relayer for DUST fee-sponsorship.

- **Parameters:**
  - `unboundTx`: `UnboundTransaction` object, `Uint8Array`, or hex string.
  - `options.circuitId`: Optional circuit identifier (e.g. `'storeMessage'`).
  - `options.contractAddress`: Optional target contract address.
- **Returns:**
  ```typescript
  interface SponsorResult {
    status: 'CONFIRMED' | 'RELAYER_NOT_FUNDED' | 'ERROR';
    txId?: string;
    sponsoredDustFee?: string;
    message?: string;
    timestamp: number;
  }
  ```

#### `dustify.getStatus()`
Fetches live health, network status, and DUST balance from the Relayer.

---

## 2. Relayer REST API Specification

### `GET /`
Welcome and service descriptor endpoint.

### `GET /health`
Liveness probe returning `{ status: 'HEALTHY', timestamp: number }`.

### `GET /api/v1/status`
Public network and relayer health telemetry endpoint.

**Response (200 OK):**
```json
{
  "service": "DUSTify Relayer API",
  "version": "0.1.0",
  "uptimeSeconds": 312,
  "network": "preview",
  "sponsorAddress": "mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd",
  "sponsorWalletSyncStatus": "SYNCED",
  "isSynced": true,
  "sponsorDustAvailability": {
    "balanceSpecks": "25000000000000000000",
    "balanceDust": "25000000000000.000000 DUST",
    "hasDust": true,
    "status": "READY"
  },
  "relayerReady": true,
  "endpoints": {
    "indexerHttpUrl": "https://indexer.preview.midnight.network/api/v4/graphql",
    "nodeRpcUrl": "wss://rpc.preview.midnight.network",
    "proofServerUrl": "http://127.0.0.1:6300"
  }
}
```

### `GET /api/v1/estimate`
Pre-execution gas & capacity estimation endpoint.

**Query Parameters:**
- `circuitId` (optional): Name of the circuit to estimate (e.g. `storeMessage`).

**Response (200 OK):**
```json
{
  "circuitId": "storeMessage",
  "estimatedDustFee": "0.0042 DUST",
  "userCost": "0 DUST (Gasless)",
  "network": "preview",
  "sponsorAddress": "mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd",
  "availableCapacity": "25,000,000,000,000.00 DUST",
  "availableSpecks": "25000000000000000000",
  "estimatedTransactionsRemaining": 5952380,
  "status": "READY",
  "relayerReady": true
}
```

### `GET /api/v1/tx/:txId`
On-chain transaction status and block confirmation lookup.

**Response (200 OK):**
```json
{
  "status": "CONFIRMED",
  "txId": "0026722c0d7df30f2815868ddcf930497da826f9db5fec2d2d315830230ef789d9",
  "network": "preview",
  "sponsorAddress": "mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd",
  "sponsoredDustFee": "0.0042 DUST",
  "indexerUrl": "https://indexer.preview.midnight.network/api/v4/graphql"
}
```

### `GET /api/v1/metrics`
Relayer operational metrics and cumulative sponsorship analytics.

**Response (200 OK):**
```json
{
  "service": "DUSTify Relayer API",
  "version": "0.1.0",
  "uptimeSeconds": 1420,
  "network": "preview",
  "sponsorAddress": "mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd",
  "totalRelayedCount": 42,
  "totalSponsoredDust": "0.176400 DUST",
  "currentDustBalance": "25000000000000.000000 DUST",
  "syncStatus": "SYNCED"
}
```

### `POST /api/v1/relay`
Authenticated transaction sponsorship submission endpoint.

**Headers:**
- `x-api-key`: `<YOUR_API_KEY>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "payloadHex": "00112233445566778899aabbccddeeff...",
  "circuitId": "sponsorTransaction",
  "contractAddress": "47d3df8c1670fd8aae7a110d0f489c25710a0055f827fce50eca91bf59972cfc"
}
```

**Success Response (200 OK):**
```json
{
  "status": "SUBMITTED",
  "txId": "0026722c0d7df30f2815868ddcf930497da826f9db5fec2d2d315830230ef789d9",
  "circuitId": "sponsorTransaction",
  "contractAddress": "47d3df8c1670fd8aae7a110d0f489c25710a0055f827fce50eca91bf59972cfc",
  "sponsoredDustFee": "0.0042 DUST",
  "timestamp": 1724698000000
}
```

