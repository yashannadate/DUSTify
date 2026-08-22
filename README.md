# DUSTify — Zero-Friction DUST Relayer & Meta-Transaction Engine

**DUSTify** is a transaction sponsorship and fee-abstraction infrastructure layer for the **Midnight Network**. It abstracts network gas fees (DUST) and wallet setup friction from end-users by intercepting client-generated Zero-Knowledge (ZK) proofs and sponsoring their on-chain settlement via a backend Master Wallet.

---

## 🌙 Target Network & Configuration

DUSTify is configured for the **Midnight Preview** network by default. Endpoint URLs are fully configurable through environment variables:

| Environment Variable | Midnight Preview Default Value | Description |
| :--- | :--- | :--- |
| `MIDNIGHT_NETWORK` | `preview` | Midnight Network ID (`preview` / `preprod` / `undeployed`) |
| `INDEXER_HTTP_URL` | `https://api-preview.1am.xyz/api/v4/graphql` | Preview Indexer GraphQL HTTP Endpoint |
| `INDEXER_WS_URL` | `wss://api-preview.1am.xyz/api/v4/graphql/ws` | Preview Indexer WebSocket Endpoint |
| `NODE_RPC_URL` | `wss://rpc.preview.midnight.network` | Midnight Preview Node RPC Endpoint |
| `PROOF_SERVER_URL` | `http://127.0.0.1:6300` | Local/Remote Proof Server Endpoint |
| `MASTER_WALLET_SEED` | `[SECURE_SEED_PHRASE]` | Relayer Sponsor Master Wallet Seed Phrase |
| `DUSTIFY_API_KEY` | `dustify_dev_key_preview_2026` | API Key for Relayer Authentication |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | CORS Allowed Origins |

---

## 🔒 Architectural & Scope Boundary

> [!IMPORTANT]
> **What DUSTify Abstract (Scope)**:
> DUSTify eliminates **all DUST-related wallet setup, NIGHT token requirements, faucet navigation, and gas fee payment friction** for dApp users. The user needs **0 DUST**, 0 DUST capacity, and 0 gas tokens to execute application actions.
>
> **What DUSTify Does NOT Eliminate**:
> In accordance with Midnight's **Kachina Protocol**, local private witness execution and client-side application identity state remain on the user's client machine. DUSTify only abstracts DUST fee synchronization and transaction submission.

---

## 🏗️ Monorepo Structure

- `/contracts`: Compact smart contracts (`Voting.compact`) & compilation scripts.
- `/relayer-api`: Node.js + Express backend owning the Master DUST Wallet, handling API key authentication, rate-limiting, and sponsoring `UnboundTransaction` payloads.
- `/client-sdk`: Lightweight `@dustify/sdk` library allowing dApp developers to route local ZK proofs directly to the Relayer.
- `/demo-dapp`: React + Vite + Tailwind CSS showcase dApp demonstrating 1-click gasless voting.

---

## 🚀 Quick Start

### 1. Start Relayer API (Sponsor Backend)
```bash
cd relayer-api
npm install
npm run dev
```

### 2. Integrate Client SDK in dApp
```typescript
import { DustifyClient } from '@dustify/sdk';

const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',
  apiKey: 'dustify_dev_key_preview_2026',
});

// User executes circuit locally (Costs 0 DUST to user)
const unboundTx = await proofProvider.proveTx(unprovenTx);

// DUSTify sponsors fee and submits to Midnight Preview Network
const result = await dustify.sponsorAndSubmit(unboundTx, 'storeMessage');
console.log('Sponsored Tx Confirmed:', result.txId);
```
