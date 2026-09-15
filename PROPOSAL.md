# 🌙 DUSTify — Project Proposal

**New Moon to Full: Monthly Moonshots on Midnight**  
**Track:** Developer Tooling & Frictionless Onboarding  
**Submission Level:** Level 4 (Waxing Gibbous)  
**Author:** Yash Annadate  
**GitHub Repository:** [https://github.com/yashannadate/DUSTify](https://github.com/yashannadate/DUSTify)  

---

## 1. Executive Summary

**DUSTify** is an open-source gas-abstraction and transaction relaying infrastructure engineered specifically for the **Midnight Network**. It decouples Zero-Knowledge (ZK) witness computation from transaction fee payment, allowing users to interact with privacy-preserving dApps at **0 DUST user cost** without navigating faucets, holding crypto gas tokens, or configuring specialized wallet extensions.

---

## 2. Problem Statement

While Midnight's **Kachina Protocol** provides groundbreaking dual-state zero-knowledge privacy, the onboarding journey for new users introduces significant friction:
1. **Wallet Onboarding:** Users must install specialized browser extensions.
2. **Token Faucet Acquisition:** Users must navigate external testnet faucets for `tNIGHT`.
3. **DUST Generation Lag:** Converting `tNIGHT` to registered DUST capacity takes multiple block epochs (10+ minutes).
4. **Adoption Drop-off:** Mainstream and consumer users abandon dApps when confronted with gas payment requirements before testing functionality.

---

## 3. The DUSTify Solution

DUSTify provides a **fee-sponsorship layer**:
- **100% Client Privacy:** The user generates their ZK proof and `UnboundTransaction` locally in-browser. Private witnesses never leave client memory.
- **Native WASM Binary Serialization:** The `@dustify/sdk` serializes the transaction into binary format.
- **Master Sponsor Wallet:** The DUSTify Relayer attaches sponsor-owned DUST inputs via `wallet.balanceUnboundTransaction()`, seals the recipe with `wallet.finalizeRecipe()`, and broadcasts the transaction to the Midnight Preview Node RPC.
- **Instant Onboarding:** The user completes actions in < 3 seconds with zero gas tokens.

---

## 4. Technical Architecture

```
User Action (dApp)
       ↓
Local Prover (Private Witness, 0 DUST)
       ↓
UnboundTransaction
       ↓
@dustify/sdk (.serialize() WASM binary)
       ↓
DUSTify Relayer (POST /api/v1/relay, x-api-key)
       ↓
Master Sponsor Wallet (balanceUnboundTransaction)
       ↓
Finalize Recipe (finalizeRecipe)
       ↓
Midnight Preview RPC (submitTransaction)
       ↓
Confirmed On-Chain Settlement (TxId)
```

---

## 5. Level 4 Completed Deliverables

- [x] **Relayer API Gateway:** Express + Node.js service with atomic disk state persistence (~1.40s warm sync) in `.data/wallet-state/preview/`.
- [x] **Client SDK Library:** `@dustify/sdk` with native binary serialization.
- [x] **Smart Contract:** Unified Compact smart contract (`Dustify.compact`) providing paymaster quota enforcement, relayer whitelist verification, anti-sybil nullifiers, and public message storage disclosures.
- [x] **CI/CD Pipeline:** Automated GitHub Actions build workflow (`.github/workflows/ci.yml`).
- [x] **Comprehensive Documentation:** Architecture, security model, API specs, setup guides, and Product X launch profile.

---

## 6. Future Roadmap

### Level 5: Full Moon
- Publish `@dustify/sdk` to npm registry.
- Self-service developer portal with dynamic API key issuance and sponsor pool replenishment.
- Support for multi-contract sponsorship quotas and rate budgets.

### Level 6: Supermoon
- Decentralized Relayer Network (DRN) with stake-based slashing.
- Mainnet deployment and smart contract audit.
- Multi-token fee abstraction (e.g. sponsor in DUST, settle in ADA/USDC).
