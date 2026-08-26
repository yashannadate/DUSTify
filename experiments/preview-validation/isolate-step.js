if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start, deleteCount, ...items) {
    const copy = this.slice();
    copy.splice(start, deleteCount === undefined ? this.length - start : deleteCount, ...items);
    return copy;
  };
}
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
if (!IteratorPrototype.map) {
  IteratorPrototype.map = function* (fn) {
    let index = 0;
    for (const item of this) yield fn(item, index++);
  };
}
if (!Set.prototype.difference) {
  Set.prototype.difference = function (other) {
    const diff = new Set(this);
    for (const elem of other) diff.delete(elem);
    return diff;
  };
}

import * as path from 'node:path';
import * as fs from 'node:fs';
import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;

import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
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

function testIntent(stepName) {
  try {
    const ttl = new Date(Date.now() + 3600000);
    const intent = ledger.Intent.new(ttl);
    console.log(`[PASS] Intent.new at step: ${stepName}`);
  } catch (err) {
    console.log(`[FAIL] Intent.new at step: ${stepName} -> ${err.message || err}`);
  }
}

async function main() {
  testIntent('0. Initial');

  const seed = '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  const keys = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0).keys;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');

  testIntent('1. After keys derived');

  const persistDir = path.join(process.cwd(), '.data', 'wallet-state', 'preview');
  const savedState = {
    shielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'shielded.json'), 'utf-8')),
    unshielded: JSON.parse(fs.readFileSync(path.join(persistDir, 'unshielded.json'), 'utf-8')),
    dust: JSON.parse(fs.readFileSync(path.join(persistDir, 'dust.json'), 'utf-8')),
  };

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
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    },
    shielded: async (cfg) => ShieldedWallet(cfg).restore(savedState.shielded),
    unshielded: async (cfg) => UnshieldedWallet(cfg).restore(savedState.unshielded),
    dust: async (cfg) => DustWallet(cfg).restore(savedState.dust),
  });

  testIntent('2. After WalletFacade.init');

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  testIntent('3. After wallet.start');

  const state = await wallet.waitForSyncedState();
  testIntent('4. After wallet.waitForSyncedState');

  const utxos = state.unshielded.availableCoins;
  const now = new Date();
  const split = await wallet.dust.splitNightUtxosForDustRegistration(now, utxos.map(({ utxo, meta }) => ({
    ...utxo,
    ctime: meta.ctime,
    registeredForDustGeneration: meta.registeredForDustGeneration,
  })), true);

  testIntent('5. After splitNightUtxosForDustRegistration');

  await wallet.stop();
  testIntent('6. After wallet.stop');
}

main().catch(console.error);
