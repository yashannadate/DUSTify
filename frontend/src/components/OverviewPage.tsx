import React from 'react';
import { ArrowRight, Check, X, Shield, Terminal, Zap } from 'lucide-react';
import { RelayerStatus } from '../types';

interface OverviewProps {
  relayerStatus: RelayerStatus | null;
  onGoToDemo: () => void;
  onGoToDocs: () => void;
}

export const OverviewPage: React.FC<OverviewProps> = ({
  relayerStatus,
  onGoToDemo,
  onGoToDocs,
}) => {
  const hasDust = relayerStatus?.sponsorDustAvailability?.hasDust ?? false;

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Target Network: Midnight Preview</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 font-sans">
          Gas Abstraction & Relayer Infrastructure for Midnight
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed font-sans">
          DUSTify eliminates DUST token requirements, faucet navigation, and gas fee hurdles for Midnight dApps. Users evaluate zero-knowledge circuits locally at <strong className="text-zinc-100 font-semibold">0 DUST cost</strong> — DUSTify sponsors on-chain settlement.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={onGoToDemo}
            className="px-4 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Launch Gasless Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onGoToDocs}
            className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Developer SDK Docs</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded border border-border-subtle bg-surface-100 space-y-1">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">User Gas Cost</div>
          <div className="text-xl font-bold font-mono text-zinc-100">0 DUST</div>
          <div className="text-[11px] text-zinc-500 font-sans">No tokens needed by user</div>
        </div>
        <div className="p-4 rounded border border-border-subtle bg-surface-100 space-y-1">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Witness Privacy</div>
          <div className="text-xl font-bold font-mono text-zinc-100">100% Local</div>
          <div className="text-[11px] text-zinc-500 font-sans">Kachina Protocol guarantee</div>
        </div>
        <div className="p-4 rounded border border-border-subtle bg-surface-100 space-y-1">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Warm Sync Time</div>
          <div className="text-xl font-bold font-mono text-zinc-100">~1.40s</div>
          <div className="text-[11px] text-zinc-500 font-sans">State restore from disk</div>
        </div>
        <div className="p-4 rounded border border-border-subtle bg-surface-100 space-y-1">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Sponsor Status</div>
          <div className="text-xl font-bold font-mono text-zinc-100">
            {hasDust ? 'DUST Ready' : 'Ready (0 DUST)'}
          </div>
          <div className="text-[11px] text-zinc-500 font-sans">
            {hasDust ? 'Funded' : 'Awaiting Preview faucet'}
          </div>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
            End-to-End Transaction Pipeline
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">5-Stage Execution</span>
        </div>

        <div className="p-4 rounded bg-surface-300 border border-border-subtle overflow-x-auto">
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
{`┌─────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ 1. User & Browser   │  ──►  │ 2. Local ZK Prover   │  ──►  │ 3. DUSTify Relayer   │
│ 0 DUST required     │       │ Evaluates Witness    │       │ POST /api/v1/relay   │
│ Private State       │       │ UnboundTransaction   │       │ WASM Binary Payload  │
└─────────────────────┘       └──────────────────────┘       └──────────┬───────────┘
                                                                        │
                                                                        │ balanceUnboundTx()
                                                                        ▼
┌─────────────────────┐                                      ┌──────────────────────┐
│ 5. Midnight Preview │  ◄────────────────────────────────── │ 4. Sponsor Wallet    │
│ On-Chain Settlement │       submitTransaction()            │ Attaches DUST Inputs │
│ Confirmed TxHash    │                                      │ finalizeRecipe()     │
└─────────────────────┘                                      └──────────────────────┘`}
          </pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-surface-200 border border-border-subtle space-y-1">
            <div className="font-semibold text-zinc-200 font-sans">What Remains Local (Client)</div>
            <p className="text-zinc-400 leading-relaxed font-sans">
              Private application state, secret witness computation, and ZK proof generation execute exclusively inside the user&apos;s browser memory. Zero private keys are transmitted.
            </p>
          </div>
          <div className="p-3 rounded bg-surface-200 border border-border-subtle space-y-1">
            <div className="font-semibold text-zinc-200 font-sans">What DUSTify Handles (Relayer)</div>
            <p className="text-zinc-400 leading-relaxed font-sans">
              Validates binary transaction payload, attaches sponsor DUST UTXOs via <code className="text-zinc-300">balanceUnboundTransaction()</code>, finalizes recipe, and broadcasts to Midnight Node RPC.
            </p>
          </div>
        </div>
      </div>

      {/* Problem vs. Solution Table */}
      <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
          UX Friction Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-border-subtle text-zinc-500 font-mono text-[11px]">
                <th className="pb-2">Onboarding Step</th>
                <th className="pb-2">Traditional Midnight dApp</th>
                <th className="pb-2">With DUSTify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-zinc-300">
              <tr>
                <td className="py-2.5 font-medium text-zinc-200">Wallet Setup & Network</td>
                <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>Manual extension configuration</span>
                </td>
                <td className="py-2.5 text-zinc-200 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Instant (0 wallet setup needed)</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-zinc-200">Gas Token Acquisition</td>
                <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>Navigate external tNIGHT faucet</span>
                </td>
                <td className="py-2.5 text-zinc-200 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>0 DUST required from user</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-zinc-200">DUST Generation Latency</td>
                <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span>Wait 10+ minutes for DUST ticks</span>
                </td>
                <td className="py-2.5 text-zinc-200 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Instant (Sponsor pool supplies DUST)</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-zinc-200">Client Witness Privacy</td>
                <td className="py-2.5 text-zinc-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>100% Private (Local Proving)</span>
                </td>
                <td className="py-2.5 text-zinc-200 font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>100% Private (Preserved untouched)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
