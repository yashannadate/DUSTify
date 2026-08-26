# 🚀 DUSTify Local Development & Setup Guide

This guide walks through configuring and running the complete DUSTify monorepo locally.

---

## 📋 Prerequisites

- **OS:** Windows with **WSL2 Ubuntu 24.04 LTS** (or native Linux/macOS)
- **Node.js:** `v18.19.1` or `v22.x`
- **Docker:** Required for running the local Midnight Proof Server (`http://127.0.0.1:6300`)
- **Package Manager:** `npm` (v9+)

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yashannadate/DUSTify.git
cd DUSTify
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Build Subpackages
```bash
npm run build
```

---

## 🏃 Running the Services

### Terminal 1: Midnight Relayer API (Inside WSL2 / Linux)
```bash
# Inside WSL2 Ubuntu:
npm run dev:relayer
```
*Listens on [http://localhost:3001](http://localhost:3001)*

### Terminal 2: React Frontend Dashboard
```powershell
# Inside Windows PowerShell or Terminal:
npm run dev:frontend
```
*Opens on [http://localhost:5173](http://localhost:5173)*

---

## 🧪 Running Automated Tests

```bash
# Run Relayer health & status verification test
npm run test:relayer

# Run SDK client integration test
npm run test:sdk
```
