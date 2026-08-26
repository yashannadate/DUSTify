// Polyfills MUST execute before ANY Midnight SDK modules are loaded
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

import { WebSocket } from 'ws';
globalThis.WebSocket = WebSocket;

async function run() {
  const ledger = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
  const sdk = await import('@midnight-ntwrk/wallet-sdk');

  console.log('1. Testing Intent.new after dynamic import:');
  const ttl = new Date();
  console.log('ttl:', ttl);
  const intent = ledger.Intent.new(ttl);
  console.log('intent created successfully:', intent);
}

run().catch((err) => {
  console.log('run error:', err);
});
