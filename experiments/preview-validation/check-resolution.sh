#!/bin/bash
cd /mnt/c/Users/Yash/.gemini/antigravity-ide/scratch/dustify-monorepo

echo "=== Dependency Resolution Type Check ==="
echo "Does DUSTify node_modules/@midnight-ntwrk resolve to its OWN copies"
echo "or are they Windows junctions pointing to /mnt/c/Users/Yash/my-app/node_modules?"
echo ""

PKG="node_modules/@midnight-ntwrk/midnight-js-contracts"

# Python to check realpath (handles Windows junctions on WSL)
python3 << 'PYEOF'
import os
base = "/mnt/c/Users/Yash/.gemini/antigravity-ide/scratch/dustify-monorepo"
packages = [
    "midnight-js-contracts",
    "midnight-js-protocol",
    "midnight-js-types",
    "midnight-js-network-id",
    "wallet-sdk",
    "wallet-sdk-dust-wallet",
    "wallet-sdk-hd",
    "wallet-sdk-shielded",
    "ledger-v8",
    "compact-js",
]

for pkg in packages:
    p = os.path.join(base, "node_modules/@midnight-ntwrk", pkg)
    rp = os.path.realpath(p)
    is_link = os.path.islink(p)
    exists = os.path.exists(p)
    
    # Check if resolved path points to my-app
    points_to_my_app = "/my-app/" in rp
    
    print(f"  {pkg}")
    print(f"    exists:         {exists}")
    print(f"    islink:         {is_link}")
    print(f"    realpath:       {rp}")
    print(f"    shares my-app:  {points_to_my_app}")
    print()
PYEOF
