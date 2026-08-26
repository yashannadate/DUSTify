# 🎬 DUSTify Demonstration & Walkthrough Guide

This document guides judges and reviewers through evaluating the **DUSTify Level 4 MVP**.

---

## 🧭 Live Demo Walkthrough

### 1. Open the Frontend Application
Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Verify Real-Time Telemetry
- Inspect the top-right navbar indicator: confirms network **`preview`** and Relayer connectivity.
- Navigate to the **"Relayer & Telemetry"** tab:
  - View the Sponsor Master Wallet address: `mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3`.
  - Click **"Ping GET /api/v1/status"** to verify roundtrip latency in real-time.

### 3. Execute Gasless Transactions
Navigate to the **"Gasless Demo"** tab:

#### Demo A: Public Message Storage (`hello-world.compact`)
1. Select `hello-world.compact`.
2. Enter your custom message: `Hello Midnight Preview from DUSTify`.
3. Notice **User Gas Fee:** `0 DUST (Free)`.
4. Click **"Submit Gasless Transaction"**.
5. Observe the 5-stage live terminal log stream.

#### Demo B: Anonymous Governance Ballot (`Voting.compact`)
1. Select `Voting.compact`.
2. Choose **Vote YES** or **Vote NO**.
3. View the client-side voter nullifier secret (never transmitted to relayer).
4. Click **"Submit Gasless Transaction"**.

---

## 🧪 Terminal SDK Verification Test

To verify the TypeScript `@dustify/sdk` against the running Relayer:

```powershell
npm run test:sdk
```
