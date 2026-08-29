# 📦 @dustify/sdk — DUSTify Client SDK

TypeScript client library for interacting with the **DUSTify Relayer Infrastructure** on the **Midnight Network**.

---

## 🚀 Installation

```bash
npm install @dustify/sdk
```

---

## 💡 Quick Start

```typescript
import { DustifyClient } from '@dustify/sdk';

// 1. Initialize client
const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',
  apiKey: process.env.DUSTIFY_API_KEY || '<YOUR_API_KEY>',
});

// 2. User proves transaction locally with private witness (0 DUST spent)
const unboundTx = await proofProvider.proveTx(unprovenTx);

// 3. One-line gas sponsorship & submission
const result = await dustify.sponsorAndSubmit(unboundTx, {
  circuitId: 'storeMessage',
});

if (result.status === 'CONFIRMED') {
  console.log('Confirmed on Midnight Preview! TxId:', result.txId);
}
```

---

## 🛠️ Build

```bash
npm run build
```
