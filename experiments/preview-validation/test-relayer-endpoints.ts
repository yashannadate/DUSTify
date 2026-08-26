import { loadConfig } from '../../relayer-api/src/config.js';
import { MidnightSponsorService } from '../../relayer-api/src/services/midnight.js';

async function main() {
  console.log('Testing MidnightSponsorService initialization & status check...');
  const config = loadConfig();
  console.log('Config loaded. Network:', config.environment);
  console.log('Indexer HTTP:', config.indexerHttpUrl);
  console.log('Node RPC:', config.nodeRpcUrl);

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
  console.log('✅ MidnightSponsorService status check passed!');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Relayer test error:', err);
  process.exit(1);
});
