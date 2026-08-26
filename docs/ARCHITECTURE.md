# 🏗️ DUSTify Architecture Specification

This document provides a comprehensive technical breakdown of **DUSTify**, the zero-friction DUST sponsorship and fee-abstraction infrastructure layer for the **Midnight Network**.

---

## 1. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND / CLIENT APPLICATION                   │
│  React 18 + Vite 5 + Tailwind CSS (Monochrome Dark Minimalist)         │
│  • Governance Voting Simulator (Voting.compact)                        │
│  • Public Message Storage Simulator (hello-world.compact)              │
│  • Real-Time Preview Telemetry & Endpoint Health Monitor               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Evaluates Compact Circuit locally
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          LOCAL PROOF PROVIDER                          │
│  @midnight-ntwrk/midnight-js-http-client-proof-provider                │
│  • Executes private witness evaluation locally (Kachina Protocol)      │
│  • Generates cryptographically sealed UnboundTransaction               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Native Binary Serialization (.serialize())
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          DUSTIFY CLIENT SDK                            │
│  @dustify/sdk (TypeScript)                                             │
│  • DustifyClient.sponsorAndSubmit(unboundTx, options)                  │
│  • Binary-safe Hex / Uint8Array encoding & error dispatch              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ POST /api/v1/relay (x-api-key authenticated)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         DUSTIFY RELAYER GATEWAY                        │
│  relayer-api (Node.js + Express + TypeScript)                          │
│  • In-memory sliding window rate limiter (100 req/min)                 │
│  • CORS & domain origin verification                                   │
│  • Payload validation & Transaction.deserialize()                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Attaches Master DUST Wallet inputs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       MASTER SPONSOR WALLET ENGINE                     │
│  @midnight-ntwrk/wallet-sdk (WalletFacade + DustWallet)                │
│  • State Persistence: .data/wallet-state/preview (~1.40s warm sync)    │
│  • wallet.balanceUnboundTransaction(unboundTx, { shielded, dust }, ttl)│
│  • wallet.finalizeRecipe(recipe)                                       │
│  • wallet.submitTransaction(finalizedTx)                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Submits sealed transaction over WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MIDNIGHT PREVIEW NETWORK                        │
│  • Indexer GraphQL: https://api-preview.1am.xyz/api/v4/graphql         │
│  • Node RPC: wss://rpc.preview.midnight.network                        │
│  • On-Chain Settlement & State Transition                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Separation of Concerns

Under Midnight's **Kachina Protocol**, privacy is preserved by ensuring that private application state and secret witness data never leave the client's local memory.

DUSTify maintains strict alignment with this principle:
1. **What the Client Computes (0 DUST):**
   - Private witness computation.
   - Zero-knowledge proof generation via local Prover.
   - Generates un-gas-backed `UnboundTransaction`.
2. **What the Relayer Handles (Sponsored):**
   - Validates the binary payload.
   - Attaches sponsor DUST UTXOs via `wallet.balanceUnboundTransaction()`.
   - Finalizes the recipe into a `FinalizedTransaction`.
   - Broadcasts to the Midnight Node RPC (`wss://rpc.preview.midnight.network`).

---

## 3. Why Native Binary Serialization is Critical

In the Midnight SDK, `UnboundTransaction` instances are backed by native WebAssembly pointers.
- ❌ Standard `JSON.stringify(unboundTx)` will corrupt or drop internal non-enumerable WASM pointers.
- ✅ `@dustify/sdk` invokes `unboundTx.serialize()`, producing a binary `Uint8Array` that is transported over HTTP as a clean binary hex string.
- ✅ The Relayer deserializes the exact object via `Transaction.deserialize('signature', 'proof', 'binding', bytes)`.

---

## 4. Wallet State Persistence Engine

On cold startup, a Midnight wallet must replay historical blocks to reconstruct its UTXO state:
- DUSTify checkpoints `dust.json`, `shielded.json`, and `unshielded.json` in `.data/wallet-state/preview/`.
- On server restart, `MidnightSponsorService` restores from the checkpoint, achieving a warm sync in **~1.40 seconds**.
