import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Cpu } from 'lucide-react';

export const SdkPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'relayer' | 'contract'>('client');
  const [copied, setCopied] = useState(false);

  const snippets = {
    client: `import { DustifyClient } from '@dustify/sdk';

// 1. Initialize lightweight DUSTify client
const dustify = new DustifyClient({
  relayerUrl: 'https://relayer.dustify.network', // or http://localhost:3001
  apiKey: 'dustify_dev_key_preview_2026',
});

// 2. User evaluates Compact circuit locally with private witness (0 DUST)
// Kachina protocol ensures witness never leaves the client browser
const unboundTx = await proofProvider.proveTx(unprovenTx);

// 3. One-line gas sponsorship and on-chain submission
const receipt = await dustify.sponsorAndSubmit(unboundTx, 'storeMessage');

console.log('✅ Confirmed on Midnight Preview! TxId:', receipt.txId);
console.log('⚡ Sponsored DUST fee:', receipt.sponsoredDustFee);`,

    relayer: `import { MidnightSponsorService } from '@dustify/relayer-api';

// Relayer backend initializes Master DUST Wallet
const sponsor = new MidnightSponsorService({
  environment: 'preview',
  indexerHttpUrl: 'https://api-preview.1am.xyz/api/v4/graphql',
  nodeRpcUrl: 'wss://rpc.preview.midnight.network',
  masterWalletSeed: process.env.MASTER_WALLET_SEED,
});

await sponsor.initialize();

// Relayer pipeline receives serialized binary UnboundTransaction
// Attaches DUST inputs via balanceUnboundTransaction and submits
const result = await sponsor.sponsorAndSubmit(payloadHex, circuitId);
console.log('Submitted on-chain:', result.txId);`,

    contract: `pragma language_version >= 0.22;
import CompactStandardLibrary;

// Public ledger state on Midnight Network
export ledger message: Opaque<"string">;

// Circuit to store a message on the blockchain
// Evaluated locally by user with 0 DUST gas fee
export circuit storeMessage(customMessage: Opaque<"string">): [] {
    message = disclose(customMessage);
}`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-3">
          Developer SDK Integration
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Integrate gasless Midnight transactions into any dApp in 3 lines of code using <code className="text-dust-cyan">@dustify/sdk</code>.
        </p>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Code Editor Header / Tabs */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-midnight-950/80 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'client'
                  ? 'bg-dust-cyan/20 text-dust-cyan border border-dust-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>dApp Client SDK</span>
            </button>
            <button
              onClick={() => setActiveTab('relayer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'relayer'
                  ? 'bg-dust-blue/20 text-dust-blue border border-dust-blue/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Relayer Backend API</span>
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'contract'
                  ? 'bg-dust-purple/20 text-dust-purple border border-dust-purple/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Compact Contract</span>
            </button>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-midnight-950/95 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
