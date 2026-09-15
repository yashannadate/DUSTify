import { DustifyClient } from '../src/DustifyClient.js';

async function testSdk() {
  console.log('Testing DustifyClient SDK against live relayer...');
  const client = new DustifyClient({
    relayerUrl: 'http://localhost:3001',
    apiKey: process.env.DUSTIFY_API_KEY || 'dustify_dev_key_preview',
  });

  const isHealthy = await client.checkHealth();
  console.log('Health Ping:', isHealthy ? 'ONLINE' : 'OFFLINE');

  const status = await client.getStatus();
  console.log('Status via SDK:', JSON.stringify(status, null, 2));

  // Test Capacity & Fee Estimate SDK method
  console.log('\nTesting Capacity Estimation via SDK...');
  const estimate = await client.getCapacityEstimate('sponsorTransaction');
  console.log('Capacity Estimate:', JSON.stringify(estimate, null, 2));

  // Test Transaction Lookup SDK method
  console.log('\nTesting Transaction Status Lookup via SDK...');
  const txStatus = await client.getTransactionStatus('0026722c0d7df30f2815868ddcf930497da826f9db5fec2d2d315830230ef789d9');
  console.log('Transaction Status:', JSON.stringify(txStatus, null, 2));

  // Test Metrics SDK method
  console.log('\nTesting Relayer Operational Metrics via SDK...');
  const metrics = await client.getMetrics();
  console.log('Relayer Metrics:', JSON.stringify(metrics, null, 2));

  // Test relaying sample payload to verify fee-sponsorship handling
  console.log('\nSending sample payload to relayer...');
  const result = await client.sponsorAndSubmit('00112233445566778899aabbccddeeff', 'sponsorTransaction');
  console.log('Relay Result:', JSON.stringify(result, null, 2));
}

testSdk().catch(err => {
  console.error('SDK test error:', err.message);
});
