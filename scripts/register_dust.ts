import * as nodeCrypto from 'node:crypto';
if (!globalThis.crypto) {
  // @ts-expect-error webcrypto
  globalThis.crypto = nodeCrypto.webcrypto;
}

// Polyfill Iterator.prototype.toArray and map for Node v18
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.toArray) {
  IteratorPrototype.toArray = function () {
    return Array.from(this as any);
  };
}
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn: (item: any, index: number) => any) {
    let index = 0;
    for (const item of this as any) {
      yield fn(item, index++);
    }
  };
}

import { MidnightSponsorService } from '../relayer-api/src/services/midnight.js';
import { loadConfig } from '../relayer-api/src/config.js';

async function main() {
  console.log('================================================================');
  console.log('⚡ DUSTify Sponsor DUST Activation & UTXO Registration');
  console.log('================================================================');

  const config = loadConfig();
  const sponsor = new MidnightSponsorService(config);

  console.log('Initializing sponsor wallet and connecting to Preview indexer...');
  await sponsor.initialize();

  const walletCtx = (sponsor as any).walletCtx;
  if (!walletCtx || !walletCtx.wallet) {
    console.error('Wallet context initialization failed');
    process.exit(1);
  }

  const wallet = walletCtx.wallet;
  console.log('Waiting for wallet synchronization...');
  const syncedState = await wallet.waitForSyncedState();
  const now = new Date();

  console.log('\n--- CURRENT SYNCED STATE ---');
  console.log(`Public Address:        ${sponsor.getSponsorAddress()}`);
  console.log(`Current DUST Balance:  ${syncedState.dust?.balance(now) || 0n} Specks`);

  const unshieldedCoins = syncedState.unshielded?.availableCoins 
    ? Array.from(syncedState.unshielded.availableCoins) 
    : [];
  
  console.log(`Unshielded Coins:      ${unshieldedCoins.length}`);

  if (unshieldedCoins.length === 0) {
    console.log('\n⏳ No unshielded NIGHT UTXOs available in the indexer yet.');
    console.log('The faucet request was submitted at 05:55 PM UTC. The indexer sync stream is monitoring block inclusion.');
    process.exit(0);
  }

  console.log(`\nFound ${unshieldedCoins.length} NIGHT UTXO(s)! Proceeding to DUST registration...`);
  
  try {
    const estimation = await wallet.estimateRegistration(unshieldedCoins as any);
    console.log(`Registration fee estimate: ${estimation.fee} Specks`);

    const unshieldedKeystore = walletCtx.unshieldedKeystore;
    const signDustRegistration = (payload: Uint8Array) => {
      return unshieldedKeystore.signData(payload);
    };

    console.log('Constructing registerNightUtxosForDustGeneration transaction...');
    const registrationRecipe = await wallet.registerNightUtxosForDustGeneration(
      unshieldedCoins as any,
      unshieldedKeystore.getPublicKey(),
      signDustRegistration
    );

    console.log('Finalizing registration recipe...');
    const finalizedRegistrationTx = await wallet.finalizeRecipe(registrationRecipe);

    console.log('Submitting registration transaction to Midnight Preview...');
    const txId = await wallet.submitTransaction(finalizedRegistrationTx);
    console.log(`✅ Registration Transaction Submitted! TxId: ${txId}`);
    
    await (sponsor as any).savePersistedState(wallet);
    console.log('Awaiting block inclusion for DUST capacity generation...');
  } catch (err: any) {
    console.error('Registration error message:', err.message);
    console.error('Registration error cause:', err.cause);
    console.error('Registration error stack:', err.stack);
    try {
      console.error('Registration error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch {
      // ignore
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
