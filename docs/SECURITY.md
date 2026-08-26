# 🔐 DUSTify Security & Trust Model

This document outlines the security architecture, threat model, and cryptographic guarantees enforced by **DUSTify**.

---

## 1. Security & Privacy Matrix

| Security Boundary | Client Device | DUSTify Relayer |
| :--- | :---: | :---: |
| **User Secret Keys** | Stays 100% on client | **Never transmitted or requested** |
| **Private Witness** | Evaluated in local memory | **Zero access** (Kachina Protocol guarantee) |
| **ZK Proof Integrity** | Generated locally | **Immutable** (Any tampering invalidates ZK proof) |
| **Sponsor Wallet Keys** | Inaccessible to client | Stored securely in backend environment variables |
| **DUST Token Balance** | 0 DUST required from user | Deducted from Master Relayer wallet |
| **Transaction Broadcast** | Delegated | Relayed to Midnight Node RPC |

---

## 2. Threat Analysis & Abuse Controls

### Sybil & Spam Attacks
- **In-Memory Sliding Window Rate Limiter:** Limits requests per IP (default: 100 req/min).
- **API Key Guarding:** Relayer endpoints enforce `x-api-key` validation to restrict access to registered dApps.

### Malicious Payload Injection
- **Strict Payload Validation:** Binary hex string validation and length checks before passing to `Transaction.deserialize()`.
- **JSON Body Size Limits:** `express.json({ limit: '15mb' })`.

### Replay & Front-Running Attacks
- **Kachina Proof Nullifiers:** Midnight circuits consume private state nullifiers upon execution, preventing double-execution on-chain.
- **Strict Time-To-Live (TTL):** Every balanced transaction recipe includes a strict 3-minute expiration deadline (`ttl: new Date(Date.now() + 180_000)`).
