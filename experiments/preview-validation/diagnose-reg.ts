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
import { WebSocket } from 'ws';
(globalThis as any).WebSocket = WebSocket;

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

async function main() {
  const seed = '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  const keys = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0).keys;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], 'preview');

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

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  const state = await wallet.waitForSyncedState();
  const utxos = state.unshielded.availableCoins;

  const now = new Date();
  const split = await wallet.dust.splitNightUtxosForDustRegistration(now, utxos.map(({ utxo, meta }: any) => ({
    ...utxo,
    ctime: meta.ctime,
    registeredForDustGeneration: meta.registeredForDustGeneration,
  })), true);

  console.log('--- split.guaranteedUtxos ---');
  console.dir(split.guaranteedUtxos, { depth: 5 });

  const vk = unshieldedKeystore.getPublicKey();
  const ownerAddress = ledger.addressFromKey(vk);

  const inputs = split.guaranteedUtxos.map((u: any) => ({
    value: u.utxo.value,
    type: u.utxo.type,
    intentHash: u.utxo.intentHash,
    outputNo: u.utxo.outputNo,
    owner: vk,
  }));
  const totalValue = inputs.reduce((a: bigint, b: any) => a + b.value, 0n);
  const output = {
    owner: ownerAddress,
    type: ledger.nativeToken().raw,
    value: totalValue,
  };

  console.log('--- Inputs & Output ---');
  console.log('inputs:', inputs);
  console.log('output:', output);

  console.log('--- Building UnshieldedOffer directly ---');
  const offer = ledger.UnshieldedOffer.new(inputs, [output], []);
  console.log('offer:', offer);

  console.log('--- Building Intent directly ---');
  const ttl = new Date(Date.now() + 3600000);
  const intent = ledger.Intent.new(ttl);
  console.log('intent:', intent);

  console.log('--- Setting guaranteedUnshieldedOffer ---');
  intent.guaranteedUnshieldedOffer = offer;
  console.log('intent with offer:', intent);

  console.log('--- Building Transaction directly ---');
  const tx = ledger.Transaction.fromParts('preview', undefined, undefined, intent);
  console.log('tx:', tx);

  console.log('--- Attaching Dust Registration ---');
  const receiverAddress = await wallet.dust.getAddress();
  console.log('receiverAddress:', receiverAddress);
  const txWithDust = await wallet.dust.attachDustRegistration(tx, now, vk, receiverAddress, split.feePayment);
  console.log('txWithDust:', txWithDust);

  console.log('--- Finalizing with Proof Server ---');
  const finalized = await wallet.finalizeRecipe({
    type: 'UNPROVEN_TRANSACTION',
    transaction: txWithDust,
  });
  console.log('finalized:', finalized);

  console.log('--- Submitting Transaction ---');
  const txId = await wallet.submitTransaction(finalized);
  console.log('SUCCESS! Registration TxId:', txId);

  await wallet.stop();
}

main().catch((err) => {
  console.error('Fatal in test:', err);
  process.exit(1);
});
