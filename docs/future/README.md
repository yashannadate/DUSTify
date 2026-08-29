# 🔭 Future Enhancements & Planned Contracts (Phase 2 Roadmap)

This directory contains experimental prototypes and architectural specifications planned for future phases of DUSTify.

---

## 📜 `DustifyRegistry.compact`

- **Purpose:** On-chain decentralized quota registry and circuit whitelisting policy contract.
- **Current MVP Architecture:** In the Level 4 MVP, DUSTify operates as a generic protocol-level fee-abstraction relayer. Sponsorship validation and rate-limiting are enforced at the Relayer Gateway layer (`relayer-api/src/middleware/auth.ts`), with transactions balanced and settled on Midnight Preview via the Master DUST Wallet (`wallet.balanceUnprovenTransaction`).
- **Phase 2 Vision:** Transitioning from relayer-enforced quotas to on-chain decentralized quota governance enforced directly within the Midnight state machine.
