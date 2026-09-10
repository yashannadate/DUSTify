# 📜 DUSTify Smart Contracts (Midnight Compact)

This package contains the Compact smart contracts deployed on the **Midnight Preview Network** to demonstrate Zero-Friction DUST fee-abstraction.

---

## 📁 Directory Structure

```
contracts/
├── src/
│   └── hello-world.compact       # Public state mutation showcase
├── managed/                      # Generated keys, ZKIR, and contract runtime bindings
│   └── hello-world/
└── README.md
```

---

## 📄 Contracts Overview

### `hello-world.compact`
Demonstrates public ledger state mutation (`storeMessage`) proved locally by the user with 0 DUST paid by the end user and sponsored seamlessly on Midnight Preview by the DUSTify Relayer.

---

## 🛠️ Compilation Guide (WSL2 Ubuntu)

Midnight Compact smart contracts must be compiled inside Linux/WSL:

```bash
# Compile Compact contract
~/.local/bin/compact compile src/hello-world.compact managed/hello-world
```

---

## 🌐 On-Chain Deployment on Midnight Preview

To deploy a compiled contract using the DUSTify deployment script:

```bash
# Execute deployment script
./scripts/deploy_preview.sh
```

### ✅ Deployed Contract Reference

| Property | Value |
| :--- | :--- |
| **Contract Name** | `hello-world.compact` |
| **Contract Address** | `ce0b5972a303044c51bcaa14cd4acacabef944a09ef67464a2da51046a7af5d9` |
| **Deployment TxID** | `00fdde9e4dd2ea2425bf0c77108be70d83301474d87c36b51233d8af95126caccd` |
| **Network** | Midnight Preview (`wss://rpc.preview.midnight.network`) |
| **Fee Settlement** | 100% Sponsored with DUST via DUSTify Relayer |
