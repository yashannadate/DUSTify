# ⚡ @dustify/relayer-api — DUSTify Master Relayer Backend

Express & Node.js backend service providing automated DUST transaction sponsorship and blockchain submission for Midnight applications.

---

## 🏗️ Features

- **Automated DUST Fee Sponsorship:** Executes `wallet.balanceUnboundTransaction()`, `wallet.finalizeRecipe()`, and `wallet.submitTransaction()`.
- **Atomic Wallet State Persistence:** Checkpoints state to `.data/wallet-state/preview/` for fast warm restart (~1.40s).
- **Built-in Security Middleware:** API key authentication, CORS origin validation, and sliding-window rate limiting.
- **Live Health Telemetry:** Exposes public `GET /api/v1/status` and `GET /health` endpoints.

---

## 🏃 Run

```bash
# Inside WSL2 Ubuntu:
npm run dev
```
*Listens on [http://localhost:3001](http://localhost:3001)*
