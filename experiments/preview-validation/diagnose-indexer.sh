#!/bin/bash
# Diagnose exact BlockOffset schema on Preview Indexer and WS handshake requirements
INDEXER="https://indexer.preview.midnight.network/api/v4/graphql"

echo "=== BlockOffset type schema ==="
curl -s "$INDEXER" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"BlockOffset\") { name inputFields { name type { name kind ofType { name } } } } }"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))"

echo ""
echo "=== Querying latest block with no offset ==="
curl -s "$INDEXER" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ block { height hash } }"}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))"

echo ""
echo "=== Testing WS with proper graphql-ws subprotocol ==="
# The indexer WS requires graphql-ws subprotocol header
curl -si "wss://indexer.preview.midnight.network/api/v4/graphql/ws" \
  --header "Upgrade: websocket" \
  --header "Sec-WebSocket-Protocol: graphql-ws" \
  2>&1 | head -20 || echo "curl ws probe done"
