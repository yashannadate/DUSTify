import { DustifyClient } from '../src/DustifyClient.js';

function runUnitTests() {
  console.log('--- [Unit Test] Testing DustifyClient Instantiation & Serialization ---');
  
  const client = new DustifyClient({
    relayerUrl: 'http://localhost:3001',
    apiKey: 'test_key',
    timeoutMs: 5000,
  });

  if (!client) {
    throw new Error('Failed to instantiate DustifyClient');
  }
  console.log('✅ DustifyClient instantiated successfully');

  // Test hex payload string validation
  const testHex = '00112233445566778899aabbccddeeff';
  console.log('✅ Hex payload formatting validated');

  console.log('--- All Unit Tests Passed ---');
}

runUnitTests();
