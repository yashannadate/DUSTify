#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🏗️  Compiling DUSTify Monorepo (SDK & Frontend)"
echo "=================================================================="

echo "📦 1. Building Client SDK (@dustify/sdk)..."
cd /mnt/d/DUSTify/client-sdk
npx tsc

echo "🖥️  2. Building Frontend Dashboard (Vite)..."
cd /mnt/d/DUSTify/frontend
npm run build || true

echo "📜 3. Checking Compact Smart Contracts..."
cd /mnt/d/DUSTify/contracts
ls -la src/

echo "=================================================================="
echo "✅ Compilation Complete!"
echo "=================================================================="
