# 📜 DUSTify Smart Contract (Midnight Compact)

This package contains the core **Midnight Compact** smart contract for the **DUSTify Gas-Abstraction & Transaction Relaying Infrastructure**.

---

## 📁 Directory Structure

```
contracts/
├── src/
│   └── Dustify.compact           # 🌙 Main DUSTify Paymaster & Relayer smart contract
├── managed/                      # Compiled ZKIR, proving keys, and TypeScript runtime bindings
│   └── dustify/
│       ├── compiler/             # Compact AST & schema definitions
│       ├── contract/             # TypeScript runtime classes (index.js, index.d.ts)
│       ├── keys/                 # Prover & verifier circuit keys
│       └── zkir/                 # Zero-Knowledge Intermediate Representation (.zkir & .bzkir)
├── scripts/
│   └── build_all.js              # Automated compilation script
├── package.json
└── README.md
```

---

## 📄 Contract Specification (`Dustify.compact`)

`Dustify.compact` is the unified on-chain paymaster engine designed for the **Midnight Network** and the **Kachina Protocol**. It decouples Zero-Knowledge witness computation from transaction fee payment.

### Public Ledger State
- `admin: Bytes<32>` — Administrator public key.
- `isInitialized: Boolean` — Guard preventing re-initialization.
- `isPaused: Boolean` — Emergency circuit breaker toggle.
- `currentEpoch: Uint<64>` — Active rate-limiting epoch number.
- `globalTotalSponsored: Uint<64>` — Lifetime total sponsored transactions count.
- `latestMessage: Opaque<"string">` — Latest disclosed public bulletin message.
- `messageCount: Uint<64>` — Total gasless messages recorded.
- `authorizedRelayers: Set<Bytes<32>>` — Whitelist of authorized relayer public key hashes.
- `dAppQuotaLimits: Map<Bytes<32>, Uint<64>>` — Daily/epoch quota allowance per dApp.
- `dAppRemainingQuota: Map<Bytes<32>, Uint<64>>` — Available sponsorship quota units in active epoch.
- `dAppTotalSponsored: Map<Bytes<32>, Uint<64>>` — Lifetime sponsored transactions per dApp.
- `usedNullifiers: Set<Bytes<32>>` — Anti-sybil user nullifiers preventing transaction replays while keeping user identities 100% private.

### Private Witnesses
- `getRelayerSecret(): Bytes<32>` — Private relayer witness proving whitelist authorization without leaking private keys.
- `getUserSecret(): Bytes<32>` — Private user witness used to construct un-linkable nullifiers.

### Circuits
| Circuit | Parameters | Description |
| :--- | :--- | :--- |
| `initialize` | `adminKey: Bytes<32>` | Initializes the contract with admin permissions. |
| `registerDApp` | `dAppId: Bytes<32>, initialQuota: Uint<64>` | Registers a dApp with an initial sponsorship allowance. |
| `authorizeRelayer` | `relayerKey: Bytes<32>` | Adds an authorized relayer to the whitelist. |
| `revokeRelayer` | `relayerKey: Bytes<32>` | Removes a relayer from the whitelist. |
| `sponsorTransaction` | `dAppId: Bytes<32>, userSalt: Bytes<32>, costUnits: Uint<64>` | Verifies relayer authorization, verifies & records anti-sybil user nullifier in ZK, enforces & decrements dApp quota, and records telemetry at 0 DUST to user. |
| `sponsorMessage` | `dAppId: Bytes<32>, userSalt: Bytes<32>, customMessage: Opaque<"string">` | Discloses a public state mutation to the Midnight ledger wrapped in zero-gas sponsorship & nullifier protection. |
| `topUpQuota` | `dAppId: Bytes<32>, additionalQuota: Uint<64>` | Deposits additional sponsorship budget for a dApp. |
| `advanceEpoch` | `newEpoch: Uint<64>` | Advances the rate-limiting epoch. |
| `setPaused` | `paused: Boolean` | Emergency pause / unpause toggle. |

---

## 🛠️ Developer Commands

### 1. Compile Smart Contract
```bash
# From repository root
npm run build:contracts

# Or directly in contracts/
node scripts/build_all.js

# Or via Compact CLI in WSL
~/.local/bin/compact compile src/Dustify.compact managed/dustify
```

### 2. Test Smart Contract
```bash
npm run test:contracts
```

### 3. Deploy to Midnight Preview
```bash
# Execute deployment script
./scripts/deploy_preview.sh

# Or directly with node/tsx:
npx tsx scripts/deploy_contract.ts
```

---

## 🌐 On-Chain Deployment on Midnight Preview

| Property | Value |
| :--- | :--- |
| **Contract Name** | `Dustify.compact` |
| **Contract Address** | `47d3df8c1670fd8aae7a110d0f489c25710a0055f827fce50eca91bf59972cfc` |
| **Deployment TxID** | `0026722c0d7df30f2815868ddcf930497da826f9db5fec2d2d315830230ef789d9` |
| **Network** | Midnight Preview (`wss://rpc.preview.midnight.network`) |
| **Sponsor Address** | `mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd` |
| **Fee Settlement** | 100% Sponsored with DUST via DUSTify Relayer |
