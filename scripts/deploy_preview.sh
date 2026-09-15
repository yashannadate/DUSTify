#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "🚀 DUSTify Midnight Preview Contract Deployment Script"
echo "=================================================================="
echo "Target Network: Midnight Preview"
echo "Contract:       Dustify.compact"
echo "Indexer GraphQL: https://indexer.preview.midnight.network/api/v4/graphql"
echo "Node RPC:       wss://rpc.preview.midnight.network"
echo "Proof Server:   http://127.0.0.1:6300"
echo "=================================================================="

echo "Deploying Dustify.compact to Midnight Preview..."
cd /mnt/d/DUSTify
npx tsx scripts/deploy_contract.ts

echo "✅ Deployment pipeline completed."
