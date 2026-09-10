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
| **Sponsor DUST Availability** | 🟢 **VERIFIED** | Master wallet derived & funded (`mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd`); reports active DUST capacity (`325,254,460,000 DUST`). |
| **Client SDK Serialization** | 🟢 **VERIFIED** | Native `unboundTx.serialize()` WASM binary payload dispatched to Relayer. |
| **Real Contract Deployment** | 🟢 **VERIFIED** | Successfully deployed `hello-world.compact` on Midnight Preview (`ce0b5972a303044c51bcaa14cd4acacabef944a09ef67464a2da51046a7af5d9`, TxID: `00fdde9e4dd2ea2425bf0c77108be70d83301474d87c36b51233d8af95126caccd`). |
| **Real DUST Registration Tx** | 🟢 **VERIFIED** | Successfully submitted on Midnight Preview (`0050c425ed0b0625e3767ebf0b269754b8320fefbaa079d4197c778f9be29dd9a7`). |
| **Real E2E Sponsored Tx** | 🟢 **VERIFIED** | Successfully submitted on Midnight Preview (`003986f9b5fb20f3a320ac0b2a744ef96fd2581334608a1a3a5371b300c84d9d4c`). |
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
