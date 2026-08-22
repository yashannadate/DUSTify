# experiments/preview-validation/

This directory contains the Phase 0.6 Midnight Preview validation test suite.

## Purpose

Prove that the DUSTify sponsorship architecture works against **real** Midnight Preview infrastructure. No mocks. No fake balances. No hardcoded values.

## Test Sequence

| Test | File | Scope |
| :--- | :--- | :--- |
| Test 1 | `config-check.ts` | Preview connectivity: Indexer, Node, Proof Server, Network ID |
| Test 2 | `wallet-check.ts` | Sponsor wallet init, DustWallet init, sync, real DUST balance query |
| Test 3 | `baseline-tx.ts` | Real single-identity transaction on Preview |
| Test 4 | `sponsorship-test.ts` | Real two-identity sponsorship, DUST delta audit |
| Test 5 | `serialization-test.ts` | Cross-process binary relay + replay protection test |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
MIDNIGHT_NETWORK=preview
INDEXER_HTTP_URL=https://indexer.preview.midnight.network/api/v4/graphql
INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v4/graphql/ws
NODE_RPC_URL=wss://rpc.preview.midnight.network
PROOF_SERVER_URL=http://127.0.0.1:6300
MASTER_WALLET_SEED=<hex seed>
```

## Run Instructions

All commands must be run from inside WSL2 Ubuntu:

```bash
cd /mnt/c/Users/Yash/.gemini/antigravity-ide/scratch/dustify-monorepo
node experiments/preview-validation/config-check.js   # Test 1
node experiments/preview-validation/wallet-check.js   # Test 2
```

## Safety Rules

- Tests 1 & 2 are read-only validation. No transactions submitted.
- Tests 3–5 must not run until Tests 1 & 2 both PASS.
- No mocks. No fake DUST. No hardcoded values.
