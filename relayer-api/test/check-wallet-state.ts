import { MidnightSponsorService } from '../src/services/midnight.js';
import { loadConfig } from '../src/config.js';

async function stepACheckFunding() {
  console.log('================================================================');
  console.log('🔍 STEP A: Checking Sponsor Wallet Funding on Midnight Preview');
  console.log('================================================================');

  const config = loadConfig();
  const sponsor = new MidnightSponsorService(config);
  
  console.log('Initializing sponsor wallet facade and starting preview sync...');
  await sponsor.initialize();

  // Access the internal wallet instance
  const walletCtx = (sponsor as any).walletCtx;
  if (!walletCtx || !walletCtx.wallet) {
    console.error('Wallet context not available');
    process.exit(1);
  }

  console.log('Waiting for wallet state synchronization with Midnight Preview indexer...');
  const syncedState = await walletCtx.wallet.waitForSyncedState();
  const now = new Date();

  console.log('\n=================== EMPIRICAL WALLET STATE ===================');
  console.log(`Public Sponsor Address:  ${sponsor.getSponsorAddress()}`);
  console.log(`Target Network:          ${config.environment}`);
  console.log(`Indexer HTTP Endpoint:   ${config.indexerHttpUrl}`);
  console.log(`Node RPC Endpoint:       ${config.nodeRpcUrl}`);
  
  // 1. DUST State
  const dustBalance = syncedState.dust ? syncedState.dust.balance(now) : 0n;
  const dustAvailableCoins = syncedState.dust?.availableCoins ? Array.from(syncedState.dust.availableCoins) : [];
  const dustPendingCoins = syncedState.dust?.pendingCoins ? Array.from(syncedState.dust.pendingCoins) : [];

  console.log('\n--- 🪙 DUST STATE ---');
  console.log(`DUST Balance (Specks):   ${dustBalance.toString()}`);
  console.log(`DUST Balance (Formatted):${(Number(dustBalance) / 1_000_000).toFixed(6)} DUST`);
  console.log(`DUST Available Coins:    ${dustAvailableCoins.length}`);
  console.log(`DUST Pending Coins:      ${dustPendingCoins.length}`);

  // 2. Unshielded State (NIGHT UTXOs)
  const unshieldedAvailableCoins = syncedState.unshielded?.availableCoins ? Array.from(syncedState.unshielded.availableCoins) : [];
  const unshieldedPendingCoins = syncedState.unshielded?.pendingCoins ? Array.from(syncedState.unshielded.pendingCoins) : [];
  const unshieldedBalances = syncedState.unshielded?.balances ? syncedState.unshielded.balances : {};

  console.log('\n--- 🌙 UNSHIELDED STATE (NIGHT TOKENS) ---');
  console.log(`Unshielded Available Coins: ${unshieldedAvailableCoins.length}`);
  console.log(`Unshielded Pending Coins:   ${unshieldedPendingCoins.length}`);
  console.log(`Unshielded Raw Balances:    ${JSON.stringify(unshieldedBalances, (k, v) => typeof v === 'bigint' ? v.toString() : v)}`);

  // 3. Shielded State (Zswap)
  const shieldedAvailableCoins = syncedState.shielded?.availableCoins ? Array.from(syncedState.shielded.availableCoins) : [];
  console.log('\n--- 🛡️ SHIELDED STATE (ZSWAP) ---');
  console.log(`Shielded Available Coins:   ${shieldedAvailableCoins.length}`);

  console.log('\n================================================================');
  if (dustBalance > 0n || dustAvailableCoins.length > 0) {
    console.log('✅ STEP A RESULT: DUST CAPACITY AVAILABLE! Proceeding to next step.');
  } else if (unshieldedAvailableCoins.length > 0) {
    console.log('⚡ STEP A RESULT: UNSHIELDED NIGHT UTXOs FOUND! Ready for DUST registration/activation (Step B).');
  } else {
    console.log('⏳ STEP A RESULT: Faucet UTXOs are still pending indexer inclusion / block confirmation.');
  }
  console.log('================================================================\n');

  process.exit(0);
}

stepACheckFunding().catch((err) => {
  console.error('❌ Error during Step A check:', err);
  process.exit(1);
});
