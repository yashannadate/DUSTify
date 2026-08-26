import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Server, BookOpen, Layers } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'sdk' | 'api' | 'contracts' | 'wsl'>('quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const snippets = {
    sdkInstall: `npm install @dustify/sdk`,
    sdkUsage: `import { DustifyClient } from '@dustify/sdk';

// 1. Initialize DUSTify client
const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001', // or hosted relayer URL
  apiKey: 'dustify_dev_key_preview_2026',
});

// 2. User evaluates Compact circuit locally (0 DUST required)
// Kachina protocol ensures witness never leaves the client browser
const unboundTx = await proofProvider.proveTx(unprovenTx);

// 3. One-line gas fee sponsorship and on-chain submission
const receipt = await dustify.sponsorAndSubmit(unboundTx, {
  circuitId: 'storeMessage',
});

if (receipt.status === 'CONFIRMED') {
  console.log('Confirmed on Midnight Preview! TxId:', receipt.txId);
  console.log('Sponsored DUST fee:', receipt.sponsoredDustFee);
} else if (receipt.status === 'RELAYER_NOT_FUNDED') {
  console.warn('Sponsor wallet awaiting DUST faucet capacity:', receipt.message);
}`,

    relayerStatus: `// GET http://localhost:3001/api/v1/status
{
  "service": "DUSTify Relayer API",
  "version": "0.1.0",
  "uptimeSeconds": 312,
  "network": "preview",
  "sponsorAddress": "mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3",
  "sponsorWalletSyncStatus": "SYNCED",
  "isSynced": true,
  "sponsorDustAvailability": {
    "balanceSpecks": "0",
    "balanceDust": "0.000000 DUST",
    "hasDust": false,
    "status": "AWAITING_FUNDING"
  },
  "relayerReady": false,
  "endpoints": {
    "indexerHttpUrl": "https://api-preview.1am.xyz/api/v4/graphql",
    "nodeRpcUrl": "wss://rpc.preview.midnight.network",
    "proofServerUrl": "http://127.0.0.1:6300"
  }
}`,

    relayerRelay: `// POST http://localhost:3001/api/v1/relay
// Header: x-api-key: dustify_dev_key_preview_2026
// Header: Content-Type: application/json

// Request Body:
{
  "payloadHex": "00112233445566778899aabbccddeeff...",
  "circuitId": "storeMessage"
}

// Success Response (200 OK):
{
  "status": "CONFIRMED",
  "txId": "0a1b2c3d4e5f6789...",
  "circuitId": "storeMessage",
  "sponsoredDustFee": "0.0042 DUST",
  "timestamp": 1724698000000
}`,

    compactContract: `pragma language_version >= 0.22;
import CompactStandardLibrary;

// Public ledger state on Midnight Preview
export ledger message: Opaque<"string">;

// Circuit to store a message on the blockchain
// Evaluated locally by user with 0 DUST gas fee
export circuit storeMessage(customMessage: Opaque<"string">): [] {
    message = disclose(customMessage);
}`,

    wslSetup: `# 1. Clone the repository
git clone https://github.com/yashannadate/DUSTify.git
cd DUSTify

# 2. Configure environment
cp .env.example .env

# 3. Start Relayer API (inside WSL2 Ubuntu)
npm run dev:relayer

# 4. In a separate terminal, start the Frontend
npm run dev:frontend`,
  };

  return (
    <div className="space-y-8 py-8 max-w-5xl mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Developer Documentation & API Reference
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Integrate zero-friction gasless transactions into your Midnight applications using `@dustify/sdk`.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side Navigation */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
              activeSection === 'quickstart'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quick Start</span>
          </button>
          <button
            onClick={() => setActiveSection('sdk')}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
              activeSection === 'sdk'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Client SDK</span>
          </button>
          <button
            onClick={() => setActiveSection('api')}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
              activeSection === 'api'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Relayer REST API</span>
          </button>
          <button
            onClick={() => setActiveSection('contracts')}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
              activeSection === 'contracts'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Compact Contracts</span>
          </button>
          <button
            onClick={() => setActiveSection('wsl')}
            className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
              activeSection === 'wsl'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>WSL2 Setup</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-9 space-y-6">
          {activeSection === 'quickstart' && (
            <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                1. Quick Start Integration
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                DUSTify allows dApp users to execute zero-knowledge circuits without holding DUST gas tokens.
                Install `@dustify/sdk` and route your local `UnboundTransaction` directly to the Relayer.
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Installation</span>
                  <button
                    onClick={() => copySnippet('install', snippets.sdkInstall)}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    {copiedKey === 'install' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'install' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200">
                  <code>{snippets.sdkInstall}</code>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Usage Example</span>
                  <button
                    onClick={() => copySnippet('usage', snippets.sdkUsage)}
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    {copiedKey === 'usage' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'usage' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 overflow-x-auto">
                  <pre>{snippets.sdkUsage}</pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sdk' && (
            <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                2. Client SDK API Reference
              </h2>

              <div className="space-y-3 text-xs font-sans">
                <div className="p-3 rounded bg-surface-200 border border-border-subtle space-y-1">
                  <div className="font-mono font-bold text-zinc-200">new DustifyClient(config)</div>
                  <p className="text-zinc-400">
                    Instantiates the client with <code className="text-zinc-300">relayerUrl</code> and <code className="text-zinc-300">apiKey</code>.
                  </p>
                </div>

                <div className="p-3 rounded bg-surface-200 border border-border-subtle space-y-1">
                  <div className="font-mono font-bold text-zinc-200">dustify.sponsorAndSubmit(unboundTx, options)</div>
                  <p className="text-zinc-400">
                    Accepts a proven <code className="text-zinc-300">UnboundTransaction</code> (with native <code className="text-zinc-300">.serialize()</code> method), binary <code className="text-zinc-300">Uint8Array</code>, or hex string. Dispatches payload to the Relayer and returns receipt with on-chain <code className="text-zinc-300">txId</code>.
                  </p>
                </div>

                <div className="p-3 rounded bg-surface-200 border border-border-subtle space-y-1">
                  <div className="font-mono font-bold text-zinc-200">dustify.getStatus()</div>
                  <p className="text-zinc-400">
                    Fetches real-time telemetry from the Relayer, including target Midnight network, applied block sync status, and available sponsor DUST balance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                3. Relayer REST API Specification
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>GET /api/v1/status (Public)</span>
                    <button
                      onClick={() => copySnippet('status', snippets.relayerStatus)}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      {copiedKey === 'status' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'status' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 overflow-x-auto">
                    <pre>{snippets.relayerStatus}</pre>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>POST /api/v1/relay (Authenticated)</span>
                    <button
                      onClick={() => copySnippet('relay', snippets.relayerRelay)}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      {copiedKey === 'relay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'relay' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 overflow-x-auto">
                    <pre>{snippets.relayerRelay}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contracts' && (
            <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                4. Compact Smart Contract Integration
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                DUSTify is contract-agnostic. Any Compact circuit can be executed locally and relayed for gas sponsorship.
              </p>

              <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 overflow-x-auto">
                <pre>{snippets.compactContract}</pre>
              </div>
            </div>
          )}

          {activeSection === 'wsl' && (
            <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
              <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-200">
                5. Local Development in WSL2 Ubuntu
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Midnight cryptography and WASM bindings require a Linux runtime. Follow these commands to run both Relayer and Frontend locally:
              </p>

              <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs text-zinc-200 overflow-x-auto">
                <pre>{snippets.wslSetup}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
