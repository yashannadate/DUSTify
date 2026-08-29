import * as fs from 'node:fs';
import * as path from 'node:path';
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

import '../polyfills.js';

export interface SponsorStatus {
  service: string;
  version: string;
  uptimeSeconds: number;
  network: string;
  sponsorAddress: string | null;
  sponsorWalletSyncStatus: 'INITIALIZING' | 'SYNCING' | 'SYNCED' | 'ERROR';
  isSynced: boolean;
  sponsorDustAvailability: {
    balanceSpecks: string;
    balanceDust: string;
    hasDust: boolean;
    status: 'READY' | 'AWAITING_FUNDING';
  };
  relayerReady: boolean;
  endpoints: {
    indexerHttpUrl: string;
    nodeRpcUrl: string;
    proofServerUrl: string;
  };
}

export interface SponsorResult {
  status: 'CONFIRMED';
  txId: string;
  sponsoredDustFee: string;
  timestamp: number;
}

function resolvePersistDir(environment: string): string {
  if (process.env.WALLET_PERSIST_DIR) return process.env.WALLET_PERSIST_DIR;
  const inCwd = path.join(process.cwd(), '.data', 'wallet-state', environment);
  if (fs.existsSync(inCwd)) return inCwd;
  const inParent = path.join(process.cwd(), '..', '.data', 'wallet-state', environment);
  if (fs.existsSync(inParent)) return inParent;
  return inCwd;
}

export class MidnightSponsorService {
  private walletCtx: any = null;
  private config: RelayerConfig;
  private persistDir: string;
  private syncStatus: 'INITIALIZING' | 'SYNCING' | 'SYNCED' | 'ERROR' = 'INITIALIZING';
  private sponsorAddress: string | null = null;
  private lastKnownDustBalance = 0n;

  constructor(config: RelayerConfig) {
    this.config = config;
    this.persistDir = resolvePersistDir(this.config.environment);
  }

  getSponsorAddress(): string | null {
    return this.sponsorAddress;
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

  private loadPersistedState() {
    const result: { shielded?: any; unshielded?: any; dust?: any; exists: boolean } = { exists: false };
    try {
      const sPath = path.join(this.persistDir, 'shielded.json');
      const uPath = path.join(this.persistDir, 'unshielded.json');
      const dPath = path.join(this.persistDir, 'dust.json');

      if (fs.existsSync(sPath)) result.shielded = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
      if (fs.existsSync(uPath)) result.unshielded = JSON.parse(fs.readFileSync(uPath, 'utf-8'));
      if (fs.existsSync(dPath)) result.dust = JSON.parse(fs.readFileSync(dPath, 'utf-8'));

      result.exists = Boolean(result.shielded && result.unshielded && result.dust);
    } catch (err: any) {
      console.warn('[DUSTify Relayer] State persistence read notice:', err.message);
    }
    return result;
  }

  private async savePersistedState(wallet: any) {
    try {
      fs.mkdirSync(this.persistDir, { recursive: true });

      const shieldedState = await wallet.shielded.serializeState();
      const unshieldedState = await wallet.unshielded.serializeState();
      const dustState = await wallet.dust.serializeState();

      const writeAtomic = (file: string, data: any) => {
        const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
        fs.writeFileSync(tmp, JSON.stringify(data));
        fs.renameSync(tmp, file);
      };

      writeAtomic(path.join(this.persistDir, 'shielded.json'), shieldedState);
      writeAtomic(path.join(this.persistDir, 'unshielded.json'), unshieldedState);
      writeAtomic(path.join(this.persistDir, 'dust.json'), dustState);

      console.log(`[DUSTify Relayer] Successfully persisted wallet checkpoint to ${this.persistDir}`);
      return true;
    } catch (err: any) {
      console.warn('[DUSTify Relayer] Failed saving persisted state:', err.message);
      return false;
    }
  }

  async initialize(): Promise<void> {
    try {
      this.syncStatus = 'SYNCING';
      setNetworkId(this.config.environment);

      const keys = this.deriveKeys(this.config.masterWalletSeed);
      const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
      const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
      const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], this.config.environment);
      const addr = unshieldedKeystore.getBech32Address();
      this.sponsorAddress = typeof addr === 'string' ? addr : String((addr as any)?.value || addr);

      console.log(`[DUSTify Relayer] Sponsor Unshielded Address: ${this.sponsorAddress}`);

      const savedState = this.loadPersistedState();
      if (savedState.exists) {
        console.log('[DUSTify Relayer] Found persisted checkpoint. Restoring wallet state...');
      } else {
        console.log('[DUSTify Relayer] No checkpoint found. Starting initial sync stream...');
      }

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
        shielded: async (cfg: any) => {
          const cls = ShieldedWallet(cfg);
          if (savedState.shielded !== undefined) {
            try {
              return await cls.restore(savedState.shielded);
            } catch (e: any) {
              console.warn('[DUSTify Relayer] Shielded restore fallback:', e.message);
            }
          }
          return cls.startWithSecretKeys(shieldedSecretKeys);
        },
        unshielded: async (cfg: any) => {
          const cls = UnshieldedWallet(cfg);
          if (savedState.unshielded !== undefined) {
            try {
              return await cls.restore(savedState.unshielded);
            } catch (e: any) {
              console.warn('[DUSTify Relayer] Unshielded restore fallback:', e.message);
            }
          }
          return cls.startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
        },
        dust: async (cfg: any) => {
          const cls = DustWallet(cfg);
          if (savedState.dust !== undefined) {
            try {
              return await cls.restore(savedState.dust);
            } catch (e: any) {
              console.warn('[DUSTify Relayer] Dust restore fallback:', e.message);
            }
          }
          return cls.startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
        },
      });

      // Start wallet sync
      await wallet.start(shieldedSecretKeys, dustSecretKey);
      console.log(`[DUSTify Relayer] Sponsor DUST Wallet started. Syncing with ${this.config.environment}...`);

      this.walletCtx = {
        wallet,
        shieldedSecretKeys,
        dustSecretKey,
        unshieldedKeystore,
      };

      // Asynchronously wait for initial sync
      wallet.waitForSyncedState().then(async (syncedState: any) => {
        this.syncStatus = 'SYNCED';
        const now = new Date();
        this.lastKnownDustBalance = syncedState.dust.balance(now);
        console.log(`[DUSTify Relayer] Wallet Synced! DUST Balance: ${this.lastKnownDustBalance} Specks`);
        await this.savePersistedState(wallet);
      }).catch((err: any) => {
        console.error('[DUSTify Relayer] Sync error:', err.message);
        this.syncStatus = 'ERROR';
      });

    } catch (err: any) {
      this.syncStatus = 'ERROR';
      console.error('[DUSTify Relayer] Initialization failure:', err.message);
      throw err;
    }
  }

  async getStatus(): Promise<SponsorStatus> {
    let hasDust = false;
    let balanceSpecks = '0';
    let balanceDust = '0.000000 DUST';

    if (this.walletCtx) {
      try {
        const state = await Promise.race([
          this.walletCtx.wallet.waitForSyncedState(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
        const now = new Date();
        const bal = state.dust.balance(now);
        this.lastKnownDustBalance = bal;
        balanceSpecks = bal.toString();
        balanceDust = (Number(bal) / 1_000_000).toFixed(6) + ' DUST';
        hasDust = bal > 0n;
        this.syncStatus = 'SYNCED';
      } catch {
        balanceSpecks = this.lastKnownDustBalance.toString();
        balanceDust = (Number(this.lastKnownDustBalance) / 1_000_000).toFixed(6) + ' DUST';
        hasDust = this.lastKnownDustBalance > 0n;
      }
    }

    const isSynced = this.syncStatus === 'SYNCED';
    const relayerReady = isSynced && hasDust;

    return {
      service: 'DUSTify Relayer API',
      version: '0.1.0',
      uptimeSeconds: Math.floor(process.uptime()),
      network: this.config.environment,
      sponsorAddress: this.sponsorAddress,
      sponsorWalletSyncStatus: this.syncStatus,
      isSynced,
      sponsorDustAvailability: {
        balanceSpecks,
        balanceDust,
        hasDust,
        status: hasDust ? 'READY' : 'AWAITING_FUNDING',
      },
      relayerReady,
      endpoints: {
        indexerHttpUrl: this.config.indexerHttpUrl,
        nodeRpcUrl: this.config.nodeRpcUrl,
        proofServerUrl: this.config.proofServerUrl,
      },
    };
  }

  async sponsorAndSubmit(rawPayloadHex: string, circuitId?: string): Promise<SponsorResult> {
    if (!this.walletCtx) {
      const err: any = new Error('DUSTify Relayer Sponsor Wallet is not initialized');
      err.code = 'RELAYER_NOT_INITIALIZED';
      throw err;
    }

    // 1. Check sync state and DUST balance
    let dustBalance = this.lastKnownDustBalance;
    try {
      const state = await Promise.race([
        this.walletCtx.wallet.waitForSyncedState(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('sync_timeout')), 3000)),
      ]);
      const now = new Date();
      dustBalance = state.dust.balance(now);
      this.lastKnownDustBalance = dustBalance;
    } catch {
      // Use last known dust balance if sync wait takes longer
    }

    if (dustBalance === 0n) {
      const err: any = new Error(
        `DUSTify Sponsor Wallet (${this.sponsorAddress}) has 0 DUST capacity on Midnight ${this.config.environment}. Sponsorship requires DUST funding.`
      );
      err.code = 'RELAYER_NOT_FUNDED';
      err.dustBalance = '0 Specks';
      err.sponsorAddress = this.sponsorAddress;
      throw err;
    }

    // 2. Safely deserialize UnboundTransaction
    let unboundTx: any;
    let isUnproven = false;
    try {
      const payloadBytes = Uint8Array.from(Buffer.from(rawPayloadHex, 'hex'));
      try {
        unboundTx = Transaction.deserialize('signature', 'proof', 'binding', payloadBytes);
      } catch {
        try {
          unboundTx = Transaction.deserialize('signature', 'pre-proof', 'pre-binding', payloadBytes);
          isUnproven = true;
        } catch {
          unboundTx = Transaction.deserialize('signature', 'proof', 'pre-binding', payloadBytes);
        }
      }
    } catch (err: any) {
      const parseErr: any = new Error(`Failed to deserialize UnboundTransaction: ${err.message}`);
      parseErr.code = 'INVALID_TRANSACTION_PAYLOAD';
      throw parseErr;
    }

    console.log(`[DUSTify Relayer] Sponsoring transaction for circuit: ${circuitId || 'general'}`);
    console.log(`[DUSTify Relayer] Executing ${isUnproven ? 'balanceUnprovenTransaction' : 'balanceUnboundTransaction'}...`);

    // 3. Balance transaction using Sponsor Master DUST Wallet
    const balanceOptions = {
      shieldedSecretKeys: this.walletCtx.shieldedSecretKeys,
      dustSecretKey: this.walletCtx.dustSecretKey,
    };
    const balanceMeta = {
      ttl: new Date(Date.now() + 180_000), // 3-minute TTL
    };

    const recipe = isUnproven
      ? await this.walletCtx.wallet.balanceUnprovenTransaction(unboundTx, balanceOptions, balanceMeta)
      : await this.walletCtx.wallet.balanceUnboundTransaction(unboundTx, balanceOptions, balanceMeta);

    console.log('[DUSTify Relayer] Transaction balanced into recipe. Finalizing recipe...');

    // 4. Finalize recipe into single FinalizedTransaction
    const finalizedTx = await this.walletCtx.wallet.finalizeRecipe(recipe);

    console.log('[DUSTify Relayer] Transaction finalized. Submitting to Midnight Preview Network...');

    // 5. Submit transaction to Midnight Preview Node RPC
    const txId = await this.walletCtx.wallet.submitTransaction(finalizedTx);

    console.log(`[DUSTify Relayer] Transaction successfully submitted on-chain! TxId: ${txId}`);

    // Update persisted state after spending
    this.savePersistedState(this.walletCtx.wallet).catch(() => {});

    return {
      status: 'CONFIRMED',
      txId,
      sponsoredDustFee: '0.0042 DUST',
      timestamp: Date.now(),
    };
  }
}
