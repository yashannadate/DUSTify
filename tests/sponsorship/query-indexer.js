import fetch from 'node-fetch';

const INDEXER_HTTP = 'https://indexer.preview.midnight.network/api/v4/graphql';

async function querySchema() {
  const query = `{
    block {
      height
      hash
    }
    currentEpochInfo {
      epochNo
    }
  }`;

  try {
    const res = await fetch(INDEXER_HTTP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    console.log('Preview Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Schema query failed:', err.message);
  }
}

querySchema();
