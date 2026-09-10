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

### `POST /api/v1/relay`
Authenticated transaction sponsorship submission endpoint.

**Headers:**
- `x-api-key`: `<YOUR_API_KEY>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "payloadHex": "00112233445566778899aabbccddeeff...",
  "circuitId": "storeMessage",
  "contractAddress": "optional_contract_address"
}
```

**Success Response (200 OK):**
```json
{
  "status": "CONFIRMED",
  "txId": "0a1b2c3d4e5f6789...",
  "circuitId": "storeMessage",
  "sponsoredDustFee": "0.0042 DUST",
  "timestamp": 1724698000000
}
```
