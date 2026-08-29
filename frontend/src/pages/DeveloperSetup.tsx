import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const DeveloperSetup: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const installCode = `npm install @dustify/sdk`;

  const configCode = `import { DustifyClient } from '@dustify/sdk';

// Initialize the DUSTify client
const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',       // Or your production Relayer endpoint
  apiKey: 'dustify_dev_key_preview_2026',    // Issued dApp API key
  timeoutMs: 30000,                          // Optional request timeout
});`;

  const relayCode = `// 1. User proves Compact circuit locally (Private witness never leaves client memory)
const unboundTx = await proofProvider.proveTx(unprovenTx);

// 2. Transmit un-gas-backed payload to Relayer for DUST fee-sponsorship
const receipt = await dustify.sponsorAndSubmit(unboundTx, {
  circuitId: 'storeMessage',                 // Circuit identifier
  contractAddress: '0x1234...abcd',          // Optional target contract
});

// 3. Inspect confirmed on-chain receipt
if (receipt.status === 'CONFIRMED') {
  console.log('Transaction confirmed on Midnight Preview!');
  console.log('Transaction Hash:', receipt.txId);
  console.log('Sponsored Fee:', receipt.sponsoredDustFee);
}`;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="space-y-3 pb-4 border-b border-zinc-800/80">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
          <Code2 className="w-3.5 h-3.5" />
          <span>TypeScript & Browser SDK</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Integrate DUSTify into your Midnight Application
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Sponsor transaction fees for your dApp users without forcing them to acquire `tNIGHT`,
          register DUST capacity, or manage wallet gas tokens.
        </p>
      </div>

      {/* Integration Architecture */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Integration Flow</h3>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-center">
          <div className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-400">1. Midnight dApp</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Local ZK Proof</p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />
          <div className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-zinc-950 border border-brand-500/30 text-brand-300">
            <span className="font-semibold">2. @dustify/sdk</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">Native Binary Serializer</p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />
          <div className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <span className="text-zinc-300">3. DUSTify Relayer</span>
            <p className="text-[10px] text-zinc-500 mt-0.5">Sponsor Balances Fee</p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />
          <div className="w-full sm:w-auto flex-1 p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-emerald-300">
            <span className="font-semibold">4. Midnight Preview</span>
            <p className="text-[10px] text-zinc-400 mt-0.5">On-Chain Settlement</p>
          </div>
        </div>
      </div>

      {/* Step 1: Install */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white">
            1
          </span>
          <h3 className="text-sm font-semibold text-white">Install the Client SDK</h3>
        </div>
        <div className="relative p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 flex items-center justify-between">
          <code>{installCode}</code>
          <button
            onClick={() => handleCopy(installCode, 'step1')}
            className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Step 2: Configure */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white">
            2
          </span>
          <h3 className="text-sm font-semibold text-white">Instantiate DustifyClient</h3>
        </div>
        <div className="relative p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
          <pre className="overflow-x-auto">{configCode}</pre>
          <button
            onClick={() => handleCopy(configCode, 'step2')}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Step 3: Relay & Settle */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono font-bold text-white">
            3
          </span>
          <h3 className="text-sm font-semibold text-white">Sponsor and Submit Transaction</h3>
        </div>
        <div className="relative p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
          <pre className="overflow-x-auto leading-relaxed">{relayCode}</pre>
          <button
            onClick={() => handleCopy(relayCode, 'step3')}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SDK API Methods Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Exported SDK Methods</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="pb-2">Method</th>
                <th className="pb-2">Arguments</th>
                <th className="pb-2">Returns</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-[11px]">
              <tr>
                <td className="py-2.5 text-brand-300 font-semibold">sponsorAndSubmit()</td>
                <td className="py-2.5 text-zinc-400">unboundTx, options</td>
                <td className="py-2.5 text-emerald-400">Promise&lt;SponsorResponse&gt;</td>
                <td className="py-2.5 text-zinc-400 font-sans">Serializes binary and relays to backend for fee-sponsorship.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-brand-300 font-semibold">getStatus()</td>
                <td className="py-2.5 text-zinc-400">none</td>
                <td className="py-2.5 text-emerald-400">Promise&lt;RelayerStatusResponse&gt;</td>
                <td className="py-2.5 text-zinc-400 font-sans">Fetches network status, DUST balance, and endpoints.</td>
              </tr>
              <tr>
                <td className="py-2.5 text-brand-300 font-semibold">checkHealth()</td>
                <td className="py-2.5 text-zinc-400">none</td>
                <td className="py-2.5 text-emerald-400">Promise&lt;boolean&gt;</td>
                <td className="py-2.5 text-zinc-400 font-sans">Liveness ping check to verify Relayer availability.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
