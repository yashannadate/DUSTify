import { DustifyClient } from '../../client-sdk/src/DustifyClient.js';

async function testSdk() {
  console.log('Testing DustifyClient SDK against live relayer...');
  const client = new DustifyClient({
    relayerUrl: 'http://localhost:3001',
    apiKey: 'dustify_dev_key_preview_2026',
  });

  const isHealthy = await client.checkHealth();
  console.log('Health Ping:', isHealthy ? 'ONLINE' : 'OFFLINE');

  const status = await client.getStatus();
  console.log('Status via SDK:', JSON.stringify(status, null, 2));

  // Test relaying sample payload to verify fee-sponsorship handling
  console.log('Sending sample payload to relayer...');
  const result = await client.sponsorAndSubmit('00112233445566778899aabbccddeeff', 'storeMessage');
  console.log('Relay Result:', JSON.stringify(result, null, 2));
}

testSdk().catch(err => {
  console.error('SDK test error:', err.message);
});
