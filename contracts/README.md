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
