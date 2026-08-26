// Polyfills at top of file
if (!Array.prototype.toSpliced) {
  (Array.prototype as any).toSpliced = function (start: number, deleteCount?: number, ...items: any[]) {
    const copy = this.slice();
    copy.splice(start, deleteCount === undefined ? this.length - start : deleteCount, ...items);
    return copy;
  };
}

const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn: any) {
    let index = 0;
    for (const item of this) yield fn(item, index++);
  };
}

if (!Set.prototype.difference) {
  (Set.prototype as any).difference = function (other: any) {
    const diff = new Set(this);
    for (const elem of other) diff.delete(elem);
    return diff;
  };
}

import * as path from 'node:path';
import * as fs from 'node:fs';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
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

async function main() {
  const seed = '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('invalid seed');
  const keys = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0).keys;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');

  const persistDir = path.join(process.cwd(), '.data', 'wallet-state', 'preview');
  let savedState: any = {};
  try {
    savedState = {
      shielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'shielded.json'), 'utf-8')),
      unshielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'unshielded.json'), 'utf-8')),
      dust: JSON.parse(fs.readFileSync(path.join(persistDir, 'dust.json'), 'utf-8')),
    };
  } catch (e) {
    console.log('No saved state:', (e as any).message);
  }

  const wallet = await WalletFacade.init({
    configuration: {
      networkId: 'preview',
      indexerClientConnection: {
        indexerHttpUrl: 'https://indexer.preview.midnight.network/api/v4/graphql',
        indexerWsUrl: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
      },
      provingServerUrl: new URL('http://127.0.0.1:6300'),
      relayURL: new URL('wss://rpc.preview.midnight.network'),
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
      costParameters: {
        additionalFeeOverhead: 300_000_000_000_000n,
        feeBlocksMargin: 5,
      },
    },
    shielded: async (cfg) => savedState.shielded ? ShieldedWallet(cfg).restore(savedState.shielded) : ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (cfg) => savedState.unshielded ? UnshieldedWallet(cfg).restore(savedState.unshielded) : UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (cfg) => savedState.dust ? DustWallet(cfg).restore(savedState.dust) : DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('Waiting for synced state...');
  const state = await wallet.waitForSyncedState();
  console.log('Synced! isSynced =', state.isSynced);

  const tNight = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`tNIGHT Balance: ${tNight} (${Number(tNight)/1_000_000} NIGHT)`);
  console.log(`Available UTXOs: ${state.unshielded.availableCoins.length}`);

  const unregistered = state.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
  console.log(`Unregistered UTXOs: ${unregistered.length}`);

  let txId: string | null = null;
  if (unregistered.length > 0) {
    console.log('Registering NIGHT UTXOs for DUST generation...');
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    console.log('Recipe produced! Finalizing...');
    const finalized = await wallet.finalizeRecipe(recipe);
    console.log('Submitting registration transaction...');
    txId = await wallet.submitTransaction(finalized);
    console.log(`Submitted! TxId: ${txId}`);
  }

  console.log('Checking DUST balance over time...');
  const dustBal = state.dust.balance(new Date());
  console.log(`Current DUST balance: ${dustBal} Specks`);

  if (dustBal === 0n) {
    console.log('Waiting for DUST tokens to generate (poll every 5s)...');
    const updated = await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n || s.dust.availableCoins.length > 0),
      )
    );
    console.log(`Generated DUST balance: ${updated.dust.balance(new Date())} Specks across ${updated.dust.availableCoins.length} coins`);
  }

  // Persist updated state
  const shieldedState = await wallet.shielded.serializeState();
  const unshieldedState = await wallet.unshielded.serializeState();
  const dustState = await wallet.dust.serializeState();
  fs.writeFileSync(path.join(persistDir, 'shielded.json'), JSON.stringify(shieldedState));
  fs.writeFileSync(path.join(persistDir, 'unshielded.json'), JSON.stringify(unshieldedState));
  fs.writeFileSync(path.join(persistDir, 'dust.json'), JSON.stringify(dustState));
  console.log('Saved updated persistent state to .data/wallet-state/preview');

  await wallet.stop();
  console.log('Wallet stopped cleanly.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
