import '../relayer-api/src/polyfills.js';

import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { MidnightSponsorService } from '../relayer-api/src/services/midnight.js';
import { loadConfig } from '../relayer-api/src/config.js';

async function main() {
  console.log('================================================================');
  console.log('🚀 DUSTify End-to-End Real Sponsored Transaction on Midnight Preview');
  console.log('================================================================');

  const config = loadConfig();
  const sponsor = new MidnightSponsorService(config);

  console.log('1. Initializing Sponsor Relayer and syncing with Midnight Preview...');
  await sponsor.initialize();

  const status = await sponsor.getStatus();
  console.log('\n--- SPONSOR STATUS ---');
  console.log('Sponsor Address:', status.sponsorAddress);
  console.log('DUST Balance:', status.sponsorDustAvailability.balanceDust, `(${status.sponsorDustAvailability.balanceSpecks} Specks)`);
  console.log('Relayer Ready:', status.relayerReady);

  if (!status.sponsorDustAvailability.hasDust) {
    throw new Error('Sponsor has 0 DUST!');
  }

  // 2. User creates a transaction locally with 0 DUST
  console.log('\n2. User Identity creating transaction locally (0 DUST)...');
  const ttl = new Date(Date.now() + 600_000); // 10-minute TTL
  const intent = ledger.Intent.new(ttl);
  
  // User creates an unproven transaction on Preview network
  const userTx = Transaction.fromParts('preview', undefined, undefined, intent);
  console.log('User transaction created locally with 0 DUST inputs.');

  // Check how userTx can be serialized / deserialized
  console.log('Checking serialization format...');
  const serialized = userTx.serialize();
  console.log(`Serialized transaction length: ${serialized.length} bytes`);
  const payloadHex = Buffer.from(serialized).toString('hex');
  console.log(`Payload hex (first 64 chars): ${payloadHex.slice(0, 64)}...`);

  // 3. Test deserialization on Relayer side
  console.log('\n3. Relayer deserializing payload...');
  let deserializedTx: any;
  try {
    deserializedTx = Transaction.deserialize('signature', 'pre-proof', 'pre-binding', serialized);
    console.log('🎉 Deserialized with (signature, pre-proof, pre-binding): SUCCESS!');
  } catch (e: any) {
    console.log('Failed with pre-binding:', e.message);
  }

  // 4. Test balancing with sponsor DUST wallet
  console.log('\n4. Sponsor balancing transaction with DUST...');
  const wallet = (sponsor as any).walletCtx.wallet;
  const walletCtx = (sponsor as any).walletCtx;

  try {
    const recipe = await wallet.balanceUnprovenTransaction(
      deserializedTx,
      {
        shieldedSecretKeys: walletCtx.shieldedSecretKeys,
        dustSecretKey: walletCtx.dustSecretKey,
      },
      {
        ttl: new Date(Date.now() + 300_000),
      }
    );
    console.log('🎉 Transaction successfully balanced into Recipe!');

    console.log('\n5. Finalizing recipe with sponsor DUST...');
    const finalizedTx = await wallet.finalizeRecipe(recipe);
    console.log('🎉 Transaction finalized into FinalizedTransaction!');

    console.log('\n6. Submitting sponsored transaction to Midnight Preview...');
    const txId = await wallet.submitTransaction(finalizedTx);
    console.log(`\n================================================================`);
    console.log(`✅ REAL SPONSORED TRANSACTION SUBMITTED TO MIDNIGHT PREVIEW!`);
    console.log(`TxId: ${txId}`);
    console.log(`================================================================`);
    
    await (sponsor as any).savePersistedState(wallet);
  } catch (err: any) {
    console.error('Balancing / Submission error:', err);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
