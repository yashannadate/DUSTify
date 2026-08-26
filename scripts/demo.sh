#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🎬 Launching DUSTify Live Demo Suite"
echo "=================================================================="

echo "Starting Relayer API on port 3001..."
cd /mnt/d/DUSTify/relayer-api
npx tsx src/index.ts
