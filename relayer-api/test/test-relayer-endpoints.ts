import { MidnightSponsorService } from '../src/services/midnight.js';
import { config } from '../src/config.js';

async function testRelayerService() {
  console.log('Testing MidnightSponsorService initialization & status check...');
  console.log(`Config loaded. Network: ${config.environment}`);
  console.log(`Indexer HTTP: ${config.indexerHttpUrl}`);
  console.log(`Node RPC: ${config.nodeRpcUrl}`);

  const sponsor = new MidnightSponsorService(config);
  console.log('Initialized service instance. Fetching status before wallet start...');
  const initialStatus = await sponsor.getStatus();
  console.log('Initial Status:', JSON.stringify(initialStatus, null, 2));

  console.log('Calling sponsor.initialize()...');
  await sponsor.initialize();

  console.log('Initialized wallet facade. Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));

  const liveStatus = await sponsor.getStatus();
  console.log('Live Relayer Status:', JSON.stringify(liveStatus, null, 2));

  if (liveStatus.service === 'DUSTify Relayer API' && liveStatus.sponsorAddress) {
    console.log('✅ MidnightSponsorService status check passed!');
    process.exit(0);
  } else {
    console.error('❌ Status check failed!');
    process.exit(1);
  }
}

testRelayerService().catch((err) => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
