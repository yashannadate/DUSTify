#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🌙 DUSTify Environment Setup for WSL2 / Linux"
echo "=================================================================="

# Check Node version
NODE_VER=$(node -v 2>/dev/null || echo "not_found")
echo "Node.js Version: $NODE_VER"

if [[ "$NODE_VER" == "not_found" ]]; then
  echo "❌ Node.js is not installed in WSL. Please install Node.js v18 or v22."
  exit 1
fi

# Ensure root node_modules is symlinked to active Midnight environment
if [ ! -d "/mnt/d/DUSTify/node_modules" ] && [ -d "/mnt/c/Users/Yash/my-app/node_modules" ]; then
  echo "🔗 Linking /mnt/c/Users/Yash/my-app/node_modules to root..."
  ln -s /mnt/c/Users/Yash/my-app/node_modules /mnt/d/DUSTify/node_modules
fi

# Ensure .data folder exists for state persistence
mkdir -p /mnt/d/DUSTify/.data/wallet-state/preview

echo "✅ Environment check passed! You are ready to run DUSTify."
echo "   Run 'npm run dev:relayer' to start the Relayer API."
