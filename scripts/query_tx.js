const INDEXER_HTTP = 'https://indexer.preview.midnight.network/api/v4/graphql';

async function main() {
  const query = `
    query LatestBlock {
      block {
        height
        hash
        timestamp
        transactions {
          hash
          id
        }
      }
    }
  `;

  const res = await fetch(INDEXER_HTTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  console.log('Latest block:', JSON.stringify(json.data.block, null, 2));
}

main().catch(console.error);
