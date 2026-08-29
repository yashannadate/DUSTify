import '../relayer-api/src/polyfills.js';

import * as path from 'path';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { createUnprovenDeployTx } from '@midnight-ntwrk/midnight-js-contracts';
import { MidnightSponsorService } from '../relayer-api/src/services/midnight.js';
import { loadConfig } from '../relayer-api/src/config.js';
// @ts-expect-error hello-world contract module
import { Contract } from '../contracts/managed/hello-world/contract/index.js';

async function main() {
  console.log('================================================================');
  console.log('🚀 Deploying hello-world.compact to Midnight Preview');
  console.log('================================================================');

  // 1. Initialize Sponsor Service with existing configuration & funded wallet
  console.log('\n1. Initializing Sponsor Wallet & syncing with Midnight Preview...');
  const config = loadConfig();
  const sponsor = new MidnightSponsorService(config);
  await sponsor.initialize();

  const status = await sponsor.getStatus();
  console.log('\n--- SPONSOR WALLET STATUS ---');
  console.log('Sponsor Address:', status.sponsorAddress);
  console.log('DUST Balance:   ', status.sponsorDustAvailability.balanceDust, `(${status.sponsorDustAvailability.balanceSpecks} Specks)`);
  console.log('Sync Status:    ', status.sponsorWalletSyncStatus);

  if (!status.sponsorDustAvailability.hasDust) {
    throw new Error('Sponsor wallet has 0 DUST! Cannot pay contract deployment fee.');
  }

  const walletCtx = (sponsor as any).walletCtx;
  const wallet = walletCtx.wallet;
  const shieldedSecretKeys = walletCtx.shieldedSecretKeys;
  const dustSecretKey = walletCtx.dustSecretKey;

  const coinPublicKey = shieldedSecretKeys.coinPublicKey;
  const encPublicKey = shieldedSecretKeys.encryptionPublicKey;

  // 2. Prepare Contract & ZK Providers
  console.log('\n2. Loading compiled contract & ZK configuration...');
  const zkConfigPath = path.resolve(process.cwd(), 'contracts', 'managed', 'hello-world');
  console.log('ZK Artifacts Directory:', zkConfigPath);
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const compiledContract = CompiledContract.withVacantWitnesses(
    CompiledContract.make('hello-world', Contract)
  );

  const mockWalletProvider = {
    getCoinPublicKey: () => coinPublicKey,
    getEncryptionPublicKey: () => encPublicKey,
    balanceTx: async () => { throw new Error('Not used in unproven deploy tx creation'); }
  };

  // 3. Create Unproven Deployment Transaction
  console.log('\n3. Creating unproven deployment transaction...');
  const unsubmittedDeploy = await createUnprovenDeployTx(
    {
      zkConfigProvider,
      walletProvider: mockWalletProvider,
    } as any,
    {
      compiledContract: compiledContract as any,
    }
  );

  const contractAddress = String(unsubmittedDeploy.public.contractAddress);
  const unprovenTx = unsubmittedDeploy.private.unprovenTx;
  console.log('Contract Address Derived:', contractAddress);

  // 4. Sponsor Balances Deployment Transaction with DUST
  console.log('\n4. Balancing deployment transaction with sponsor DUST capacity...');
  const recipe = await wallet.balanceUnprovenTransaction(
    unprovenTx,
    {
      shieldedSecretKeys,
      dustSecretKey,
    },
    {
      ttl: new Date(Date.now() + 300_000), // 5-minute TTL
    }
  );
  console.log('Transaction balanced into Recipe successfully.');

  // 5. Finalize Recipe
  console.log('\n5. Finalizing deployment recipe via proof server...');
  const finalizedTx = await wallet.finalizeRecipe(recipe);
  console.log('Recipe finalized into FinalizedTransaction.');

  // 6. Submit to Midnight Preview Node RPC
  console.log('\n6. Submitting deployment transaction to Midnight Preview RPC...');
  const txId = await wallet.submitTransaction(finalizedTx);

  console.log('\n================================================================');
  console.log('🎉 CONTRACT DEPLOYED ON MIDNIGHT PREVIEW!');
  console.log('================================================================');
  console.log('Contract Name:      hello-world.compact');
  console.log('Contract Address:  ', contractAddress);
  console.log('Deployment TxId:   ', txId);
  console.log('Network:            Midnight Preview (wss://rpc.preview.midnight.network)');
  console.log('Sponsor:           ', status.sponsorAddress);
  console.log('================================================================');

  await (sponsor as any).savePersistedState(wallet);
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Deployment failed with error:', err);
  process.exit(1);
});
