# 📜 DUSTify Smart Contracts (Midnight Compact)

This package contains the Compact smart contracts deployed on the **Midnight Preview Network** to demonstrate Zero-Friction DUST fee-abstraction.

---

## 📁 Directory Structure

```
contracts/
├── src/
│   ├── DustifyRegistry.compact   # Primary sponsorship registry & dApp quota policy contract
│   ├── Voting.compact            # Anonymous governance voting showcase
│   └── hello-world.compact       # Public state mutation showcase
├── artifacts/                    # Generated keys, ZKIR, and contract runtime bindings
│   └── hello-world/
└── README.md
```

---

## 📄 Contracts Overview

### 1. `DustifyRegistry.compact`
Maintains on-chain registry state for authorized dApps, whitelisted circuit hashes, and daily sponsorship limits on Midnight Preview.

### 2. `Voting.compact`
Demonstrates gasless decentralized governance. Voters evaluate zero-knowledge proofs locally on their device to prevent double voting via nullifiers while the DUSTify Relayer pays the on-chain settlement fee.

### 3. `hello-world.compact`
Demonstrates basic public ledger state mutation (`storeMessage`) sponsored seamlessly by the Relayer.

---

## 🛠️ Compilation Guide (WSL2 Ubuntu)

Midnight Compact smart contracts must be compiled inside Linux/WSL:

```bash
# Compile Compact contract
compact compile src/DustifyRegistry.compact artifacts/DustifyRegistry
```

---

## 🌐 On-Chain Deployment on Midnight Preview

To deploy a compiled contract using the DUSTify deployment script:

```bash
# Execute deployment script
./scripts/deploy_preview.sh
```
