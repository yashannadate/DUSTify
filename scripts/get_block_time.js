import https from 'node:https';

const query = JSON.stringify({
  query: `query {
    block {
      height
      timestamp
    }
  }`
});

const req = https.request('https://indexer.preview.midnight.network/api/v4/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query),
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('INDEXER BLOCK:', body);
    console.log('LOCAL MACHINE TIME:', new Date().toISOString());
  });
});

req.write(query);
req.end();
