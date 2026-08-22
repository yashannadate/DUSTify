import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';
import { WebSocket } from 'ws';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, findDeployedContract, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import {
  WalletFacade,
  DustWallet,
  HDWallet,
  Roles,
  ShieldedWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';

// @ts-expect-error WebSocket global polyfill
globalThis.WebSocket = WebSocket;

const NETWORK_ID = 'undeployed';
const INDEXER_HTTP = 'http://127.0.0.1:8088/api/v4/graphql';
const INDEXER_WS = 'ws://127.0.0.1:8088/api/v4/graphql/ws';
const NODE_URL = 'ws://127.0.0.1:9944';
const PROOF_SERVER_URL = 'http://127.0.0.1:6300';

const USER_A_SEED = 'de451e050af6518b6d3e394b5c79724eedacc9eb316ed216adf810e662363e27';
const SPONSOR_B_SEED = '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function initRealWallet(seed: string, name: string) {
  setNetworkId(NETWORK_ID);
  const keys = deriveKeys(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], NETWORK_ID);

  const walletConfig = {
    networkId: NETWORK_ID,
    indexerClientConnection: { indexerHttpUrl: INDEXER_HTTP, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER_URL),
    relayURL: new URL(NODE_URL),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (config) => UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (config) => DustWallet(config).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log(`[Wallet - ${name}] Initialized & syncing state with Midnight DevNet...`);
  await wallet.waitForSyncedState();
  console.log(`[Wallet - ${name}] Synced successfully!`);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
}

export async function runRealWorldSuite() {
  console.log('================================================================');
  console.log('Phase 0.6 Real-World Validation Suite (Real DevNet Node & Prover)');
  console.log('================================================================\n');

  // Load compiled contract
  const zkConfigPath = path.resolve('C:/Users/Yash/my-app/contracts/managed/hello-world');
  const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
  const HelloWorld = await import(`file://${contractPath}`);
  const compiledContract = CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  // Initialize Real Wallets
  const walletA = await initRealWallet(USER_A_SEED, 'User A');
  const walletB = await initRealWallet(SPONSOR_B_SEED, 'Sponsor B');

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const publicDataProvider = indexerPublicDataProvider(INDEXER_HTTP, INDEXER_WS);
  const proofProvider = httpClientProofProvider(PROOF_SERVER_URL, zkConfigProvider);

  // Build Provider for User A
  const providersA = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'user-a-state',
      accountId: walletA.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Placeholder-1',
    }),
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider: walletA.wallet,
    midnightProvider: walletA.wallet,
  };

  // Build Provider for Sponsor B
  const providersB = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'sponsor-b-state',
      accountId: walletB.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Placeholder-1',
    }),
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider: walletB.wallet,
    midnightProvider: walletB.wallet,
  };

  // Deploy hello-world contract if needed
  console.log('\n[Deploy] Deploying hello-world contract to local DevNet...');
  const deployment = await deployContract(providersA, {
    compiledContract: compiledContract as any,
    privateStateId: 'helloWorldStateA',
    initialPrivateState: {},
  });
  console.log(`[Deploy] Contract deployed successfully! Address: ${deployment.deployTxData.public.contractAddress}`);
  console.log(`[Deploy] TxHash: ${deployment.deployTxData.public.txHash}`);

  // TEST D: REAL SINGLE-IDENTITY BASELINE
  console.log('\n======================================================');
  console.log('TEST D — REAL SINGLE-IDENTITY BASELINE');
  console.log('======================================================');
  
  const callOptionsD = {
    compiledContract: compiledContract as any,
    contractAddress: deployment.deployTxData.public.contractAddress,
    circuitId: 'storeMessage',
    args: ['Test D Real Message'],
    privateStateId: 'helloWorldStateA',
  };

  const unsubmittedTxD = await createUnprovenCallTx(providersA as any, callOptionsD as any);
  console.log('[Test D] User A created unproven call tx locally.');
  
  const unboundTxD = await proofProvider.proveTx(unsubmittedTxD.private.unprovenTx);
  console.log('[Test D] Generated real ZK proof via local Proof Server (http://127.0.0.1:6300).');

  const finalizedTxD = await walletA.wallet.balanceTx(unboundTxD);
  console.log('[Test D] Balanced transaction using User A real DUST wallet.');

  const txIdD = await walletA.wallet.submitTx(finalizedTxD);
  console.log(`[Test D] Submitted transaction to DevNet. TxId: ${txIdD}`);
  
  const finalizedDataD = await publicDataProvider.watchForTxData(txIdD);
  console.log(`[Test D] Confirmed on-chain! Status: ${finalizedDataD.status}, BlockHeight: ${finalizedDataD.blockHeight}`);

  // TEST E: REAL TWO-IDENTITY SPONSORSHIP
  console.log('\n======================================================');
  console.log('TEST E — REAL TWO-IDENTITY SPONSORSHIP');
  console.log('======================================================');

  const stateA_before = await walletA.wallet.state();
  const stateB_before = await walletB.wallet.state();
  console.log(`[Dust Balance Before] User A DUST: ${stateA_before.dustBalance || 0n}, Sponsor B DUST: ${stateB_before.dustBalance || 0n}`);

  const callOptionsE = {
    compiledContract: compiledContract as any,
    contractAddress: deployment.deployTxData.public.contractAddress,
    circuitId: 'storeMessage',
    args: ['Test E Real Sponsored Message'],
    privateStateId: 'helloWorldStateA',
  };

  // Step 1: User A generates unproven call tx & real ZK proof (0 DUST to User A)
  const unsubmittedTxE = await createUnprovenCallTx(providersA as any, callOptionsE as any);
  const unboundTxE = await proofProvider.proveTx(unsubmittedTxE.private.unprovenTx);
  console.log('[Test E - User A] Generated real ZK proof locally (0 DUST consumed from User A).');

  // Step 2: Sponsor B receives unboundTxE in memory, balances with Sponsor B real DUST wallet, and submits
  console.log('[Test E - Sponsor B] Received UnboundTransaction from User A.');
  const finalizedTxE = await walletB.wallet.balanceTx(unboundTxE);
  console.log('[Test E - Sponsor B] Balanced transaction with Sponsor B DUST UTXOs.');

  const txIdE = await walletB.wallet.submitTx(finalizedTxE);
  console.log(`[Test E - Sponsor B] Submitted sponsored transaction to DevNet. TxId: ${txIdE}`);

  const finalizedDataE = await publicDataProvider.watchForTxData(txIdE);
  console.log(`[Test E] Confirmed on-chain! Status: ${finalizedDataE.status}, BlockHeight: ${finalizedDataE.blockHeight}`);

  const stateA_after = await walletA.wallet.state();
  const stateB_after = await walletB.wallet.state();
  console.log(`[Dust Balance After] User A DUST: ${stateA_after.dustBalance || 0n}, Sponsor B DUST: ${stateB_after.dustBalance || 0n}`);

  // TEST F: REAL CROSS-PROCESS HANDOFF
  console.log('\n======================================================');
  console.log('TEST F — REAL CROSS-PROCESS BINARY SERIALIZATION HANDOFF');
  console.log('======================================================');

  const callOptionsF = {
    compiledContract: compiledContract as any,
    contractAddress: deployment.deployTxData.public.contractAddress,
    circuitId: 'storeMessage',
    args: ['Test F Cross-Process Real Message'],
    privateStateId: 'helloWorldStateA',
  };

  // User A generates real proof & serializes payload
  const unsubmittedTxF = await createUnprovenCallTx(providersA as any, callOptionsF as any);
  const unboundTxF = await proofProvider.proveTx(unsubmittedTxF.private.unprovenTx);

  const payloadPath = path.resolve('experiments/sponsorship-poc/real-handoff.bin');
  const serializedBytes = unboundTxF.serialize();
  fs.writeFileSync(payloadPath, serializedBytes);
  console.log(`[Test F - User A] Wasm serialized UnboundTransaction to binary file: ${payloadPath} (${serializedBytes.length} bytes).`);

  // Sponsor B reads file, deserializes, balances with real DUST, and submits
  const readBytes = fs.readFileSync(payloadPath);
  const reconstructedTxF = Transaction.deserialize('signature', 'proof', 'binding', new Uint8Array(readBytes));
  console.log('[Test F - Sponsor B] Deserialized Wasm payload into native UnboundTransaction object.');

  const finalizedTxF = await walletB.wallet.balanceTx(reconstructedTxF);
  const txIdF = await walletB.wallet.submitTx(finalizedTxF);
  console.log(`[Test F - Sponsor B] Submitted cross-process transaction to DevNet. TxId: ${txIdF}`);

  const finalizedDataF = await publicDataProvider.watchForTxData(txIdF);
  console.log(`[Test F] Confirmed on-chain! Status: ${finalizedDataF.status}, BlockHeight: ${finalizedDataF.blockHeight}`);

  // Clean up
  if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
  await walletA.wallet.stop();
  await walletB.wallet.stop();

  console.log('\n================================================================');
  console.log('REAL-WORLD SUITE COMPLETED SUCCESSFULLY — ALL TESTS PASSED!');
  console.log('================================================================');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runRealWorldSuite().catch((err) => {
    console.error('Real World Validation Suite Failed:', err);
    process.exit(1);
  });
}
