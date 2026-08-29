const INDEXER_HTTP = 'https://indexer.preview.midnight.network/api/v4/graphql';

async function main() {
  const hash = process.argv[2];
  if (hash) {
    const cleanHash = hash.startsWith('00') ? hash.slice(2) : hash;
    const txQuery = `
      query GetTx($hash: String!) {
        transactions(offset: { hash: $hash }, limit: 1) {
          hash
          id
          block {
            height
            hash
            timestamp
          }
        }
      }
    `;
    const res = await fetch(INDEXER_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: txQuery, variables: { hash: cleanHash } }),
    });
    const json = await res.json();
    console.log('Transaction Query Result:', JSON.stringify(json, null, 2));
    return;
  }

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
