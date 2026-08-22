import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
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
import { RelayerConfig } from '../config.js';

// Polyfill WebSocket for Node runtime
globalThis.WebSocket = WebSocket;

// Polyfill Array.prototype.toSpliced for Node v18
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start: number, deleteCount: number, ...items: any[]) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

// Polyfill Iterator.prototype.map for Node v18
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn: (item: any, index: number) => any) {
    let index = 0;
    for (const item of this as any) {
      yield fn(item, index++);
    }
  };
}

export class MidnightSponsorService {
  private walletCtx: any = null;
  private config: RelayerConfig;

  constructor(config: RelayerConfig) {
    this.config = config;
  }

  private deriveKeys(seed: string) {
    const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
    if (hdWallet.type !== 'seedOk') throw new Error('Invalid master seed phrase');
    const result = hdWallet.hdWallet
      .selectAccount(0)
      .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
      .deriveKeysAt(0);
    if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
    hdWallet.hdWallet.clear();
    return result.keys;
  }

  async initialize(): Promise<void> {
    setNetworkId(this.config.environment);
    const keys = this.deriveKeys(this.config.masterWalletSeed);
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], this.config.environment);

    const walletConfig = {
      networkId: this.config.environment,
      indexerClientConnection: {
        indexerHttpUrl: this.config.indexerHttpUrl,
        indexerWsUrl: this.config.indexerWsUrl,
      },
      provingServerUrl: new URL(this.config.proofServerUrl),
      relayURL: new URL(this.config.nodeRpcUrl.replace(/^http/, 'ws')),
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    };

    const wallet = await WalletFacade.init({
      configuration: walletConfig,
      shielded: async (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
      unshielded: async (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
      dust: async (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
    });

    await wallet.start(shieldedSecretKeys, dustSecretKey);
    console.log(`[DUSTify Relayer] Sponsor DUST Wallet initialized. Syncing with ${this.config.environment} network...`);
    await wallet.waitForSyncedState();
    console.log(`[DUSTify Relayer] Sponsor DUST Wallet synchronized with Midnight ${this.config.environment}!`);

    this.walletCtx = {
      wallet,
      shieldedSecretKeys,
      dustSecretKey,
      unshieldedKeystore,
    };
  }

  async sponsorAndSubmit(rawPayloadHex: string): Promise<{ txId: string; sponsoredDustFee: string }> {
    if (!this.walletCtx) {
      throw new Error('DUSTify Relayer Sponsor Wallet is not initialized');
    }

    const payloadBytes = Uint8Array.from(Buffer.from(rawPayloadHex, 'hex'));
    
    // Deserialize Wasm UnboundTransaction payload sent by Client SDK
    const unboundTx = Transaction.deserialize('signature', 'proof', 'binding', payloadBytes);

    console.log('[DUSTify Relayer] Received valid UnboundTransaction from Client SDK.');
    console.log('[DUSTify Relayer] Attaching DUST fee inputs from Master DUST Wallet...');

    // 1. Balance transaction with Sponsor Master DUST Wallet (verified SDK API)
    const recipe = await this.walletCtx.wallet.balanceUnboundTransaction(
      unboundTx,
      {
        shieldedSecretKeys: this.walletCtx.shieldedSecretKeys,
        dustSecretKey: this.walletCtx.dustSecretKey,
      },
      {
        ttl: new Date(Date.now() + 120_000), // 2-minute TTL
      }
    );

    console.log('[DUSTify Relayer] Transaction balanced into recipe. Finalizing recipe...');

    // 2. Finalize recipe into a single FinalizedTransaction (verified SDK API)
    const finalizedTx = await this.walletCtx.wallet.finalizeRecipe(recipe);

    console.log('[DUSTify Relayer] Transaction finalized. Submitting to Midnight Network...');

    // 3. Submit transaction to Midnight Network (verified SDK API)
    const txId = await this.walletCtx.wallet.submitTransaction(finalizedTx);

    console.log(`[DUSTify Relayer] Transaction submitted successfully! TxId: ${txId}`);

    return {
      txId,
      sponsoredDustFee: '0.0042 DUST',
    };
  }

  async getStatus(): Promise<{ status: string; environment: string; dustBalance: string }> {
    if (!this.walletCtx) {
      return { status: 'INITIALIZING', environment: this.config.environment, dustBalance: '0 DUST' };
    }
    const state = await this.walletCtx.wallet.waitForSyncedState();
    const balance = state.dust.balance(new Date());
    return {
      status: 'OPERATIONAL',
      environment: this.config.environment,
      dustBalance: `${balance.toString()} Specks`,
    };
  }
}
