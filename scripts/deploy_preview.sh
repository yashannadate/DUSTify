#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🚀 DUSTify Midnight Preview Contract Deployment Script"
echo "=================================================================="
echo "Target Network: Midnight Preview"
echo "Indexer GraphQL: https://api-preview.1am.xyz/api/v4/graphql"
echo "Node RPC:       wss://rpc.preview.midnight.network"
echo "=================================================================="

# Check for sponsor wallet balance
echo "Checking Sponsor Wallet DUST Capacity..."
cd /mnt/d/DUSTify
npx tsx tests/integration/test-relayer-endpoints.ts

echo "Ready to broadcast contract deployment transaction on Midnight Preview."
