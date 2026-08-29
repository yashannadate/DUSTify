import * as nodeCrypto from 'node:crypto';
import { WebSocket } from 'ws';

// 1. Polyfill globalThis.crypto for Node 18 WebAssembly
if (!globalThis.crypto) {
  // @ts-expect-error webcrypto
  globalThis.crypto = nodeCrypto.webcrypto;
}

// 2. Polyfill WebSocket
if (!globalThis.WebSocket) {
  // @ts-expect-error WebSocket
  globalThis.WebSocket = WebSocket;
}

// 3. Polyfill Array.prototype methods (ES2023) for Node v18
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function (start: number, deleteCount: number, ...items: any[]) {
    const copy = this.slice();
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

if (!(Array.prototype as any).toSorted) {
  (Array.prototype as any).toSorted = function (compareFn?: any) {
    const copy = this.slice();
    return copy.sort(compareFn);
  };
}

if (!(Array.prototype as any).toReversed) {
  (Array.prototype as any).toReversed = function () {
    const copy = this.slice();
    return copy.reverse();
  };
}

if (!(Array.prototype as any).with) {
  (Array.prototype as any).with = function (index: number, value: any) {
    const copy = this.slice();
    const actualIndex = index < 0 ? copy.length + index : index;
    copy[actualIndex] = value;
    return copy;
  };
}

// 4. Polyfill Iterator.prototype helpers for Node v18
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

if (!IteratorPrototype.filter) {
  IteratorPrototype.filter = function* (fn: (item: any, index: number) => boolean) {
    let index = 0;
    for (const item of this as any) {
      if (fn(item, index++)) {
        yield item;
      }
    }
  };
}

if (!IteratorPrototype.find) {
  IteratorPrototype.find = function (fn: (item: any, index: number) => boolean) {
    let index = 0;
    for (const item of this as any) {
      if (fn(item, index++)) {
        return item;
      }
    }
    return undefined;
  };
}

if (!IteratorPrototype.some) {
  IteratorPrototype.some = function (fn: (item: any, index: number) => boolean) {
    let index = 0;
    for (const item of this as any) {
      if (fn(item, index++)) return true;
    }
    return false;
  };
}

if (!IteratorPrototype.every) {
  IteratorPrototype.every = function (fn: (item: any, index: number) => boolean) {
    let index = 0;
    for (const item of this as any) {
      if (!fn(item, index++)) return false;
    }
    return true;
  };
}

if (!IteratorPrototype.forEach) {
  IteratorPrototype.forEach = function (fn: (item: any, index: number) => void) {
    let index = 0;
    for (const item of this as any) {
      fn(item, index++);
    }
  };
}

// 5. Polyfill Set.prototype.difference
if (!(Set.prototype as any).difference) {
  (Set.prototype as any).difference = function (other: Set<any>) {
    const result = new Set();
    for (const elem of this) {
      if (!other.has(elem)) {
        result.add(elem);
      }
    }
    return result;
  };
}
