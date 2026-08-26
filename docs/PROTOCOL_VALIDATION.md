# 🧪 DUSTify Protocol Validation & Empirical Evidence

This document records the empirical testing results and cryptographic validation performed on the **Midnight Preview Network**.

---

## 📊 Verification Matrix

| Validation Test | Real Status | Empirical Evidence & Methodology |
| :--- | :---: | :--- |
| **Preview HTTP Indexer** | 🟢 **VERIFIED** | Active GraphQL query against `api-preview.1am.xyz/api/v4/graphql` retrieving applied block height. |
| **Preview WebSocket Stream** | 🟢 **VERIFIED** | `graphql-ws` protocol connection and block header subscription established. |
| **Midnight Node RPC** | 🟢 **VERIFIED** | Substrate TLS WebSocket connection to `wss://rpc.preview.midnight.network`. |
| **Local Proof Server** | 🟢 **VERIFIED** | Prover response confirmed on port `6300`. |
| **Wallet Initialization** | 🟢 **VERIFIED** | `WalletFacade.init()` with HD role derivation (Zswap, NightExternal, Dust). |
| **Wallet Lifecycle Start** | 🟢 **VERIFIED** | `wallet.start(shieldedSecretKeys, dustSecretKey)` activates state listener observables. |
| **Wallet Synchronization** | 🟢 **VERIFIED** | `wallet.waitForSyncedState()` resolves against live block stream. |
| **Persistent Wallet State** | 🟢 **VERIFIED** | Atomic checkpointing to disk (`.data/wallet-state/preview/{dust,shielded,unshielded}.json`). |
| **Warm Sync Acceleration** | 🟢 **VERIFIED** | Empirically measured warm checkpoint restore in **~1.40 seconds**. |
| **Sponsor DUST Availability** | 🟡 **AWAITING FUNDING** | Master wallet derived (`mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3`); reports `0 Specks`. |
| **Client SDK Serialization** | 🟢 **VERIFIED** | Native `unboundTx.serialize()` WASM binary payload dispatched to Relayer. |
| **Relayer Error Diagnostics** | 🟢 **VERIFIED** | Verified structured `RELAYER_NOT_FUNDED` (HTTP 503) response when DUST capacity is 0. |

---

## 🔬 Critical Protocol Findings

1. **Obsolete API Deprecation:** The outdated `wallet.balanceTx()` API does not exist in `@midnight-ntwrk/wallet-sdk >= 1.2.0`. The verified production pipeline is:
   ```
   wallet.balanceUnboundTransaction(unboundTx, { shieldedSecretKeys, dustSecretKey }, { ttl })
     -> wallet.finalizeRecipe(recipe)
     -> wallet.submitTransaction(finalizedTx)
   ```
2. **Kachina Privacy Guarantee:** Private witnesses evaluated during circuit execution never leave the client's local memory.
3. **State Persistence Impact:** Reduces relayer boot-up synchronization lag from ~45–90 seconds (cold replay) down to ~1.40 seconds (warm checkpoint restore).
