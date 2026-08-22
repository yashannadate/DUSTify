#!/bin/bash
set -e
cd /mnt/c/Users/Yash/.gemini/antigravity-ide/scratch/dustify-monorepo

echo "=== DUSTify Package Resolution Audit ==="
echo "Root: $(pwd)"
echo ""

PACKAGES=(
  "midnight-js-contracts"
  "midnight-js-protocol"
  "midnight-js-types"
  "midnight-js-network-id"
  "midnight-js-http-client-proof-provider"
  "midnight-js-indexer-public-data-provider"
  "midnight-js-level-private-state-provider"
  "midnight-js-node-zk-config-provider"
  "wallet-sdk"
  "wallet-sdk-facade"
  "wallet-sdk-dust-wallet"
  "wallet-sdk-hd"
  "wallet-sdk-shielded"
  "compact-js"
  "compact-runtime"
  "ledger-v8"
)

for pkg in "${PACKAGES[@]}"; do
  PKG_JSON="node_modules/@midnight-ntwrk/$pkg/package.json"
  if [ -f "$PKG_JSON" ]; then
    VERSION=$(python3 -c "import json,sys; d=json.load(open('$PKG_JSON')); print(d.get('version','?'))")
    RESOLVED=$(readlink -f "node_modules/@midnight-ntwrk/$pkg")
    echo "  FOUND   @midnight-ntwrk/$pkg@$VERSION"
    echo "          => $RESOLVED"
  else
    echo "  MISSING @midnight-ntwrk/$pkg"
  fi
  echo ""
done
