# 🎬 DUSTify Demonstration & Walkthrough Guide

This document guides judges and reviewers through evaluating the **DUSTify Level 4 MVP**.

---

## 🧭 Live Demo Walkthrough

### 1. Open the Frontend Application
Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Verify Real-Time Telemetry
- Inspect the top-right navbar indicator: confirms network **`preview`** and Relayer connectivity.
- Navigate to the **"Relayer & Telemetry"** tab:
  - View the Sponsor Master Wallet address: `mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd`.
  - Click **"Ping GET /api/v1/status"** to verify roundtrip latency in real-time.

### 3. Execute Gasless Transactions
Navigate to the **"Gasless Demo / Playground"** tab:

#### Demo A: Sponsored Transaction Relay (`Dustify.compact`)
1. View `Dustify.compact` (Deployed on Midnight Preview at `47d3df8c1670fd8aae7a110d0f489c25710a0055f827fce50eca91bf59972cfc`).
2. Select Circuit: `sponsorTransaction` (or `sponsorMessage`).
3. Enter Payload / Message parameters.
4. Notice **User Gas Fee:** `0 DUST (Free)`.
5. Click **"Execute Gasless Transaction"**.
6. Observe the 7-stage live terminal log stream and confirmed on-chain TxID.

#### Demo B: Paymaster Quota & Relayer Authorization
1. Select Circuit: `topUpQuota` or `registerDApp`.
2. Inspect the live Compact code viewer showing the ZK state transition logic.
3. Click **"Execute Gasless Transaction"**.

---

## 🧪 Terminal SDK Verification Test

To verify the TypeScript `@dustify/sdk` against the running Relayer:

```powershell
npm run test:sdk
```
