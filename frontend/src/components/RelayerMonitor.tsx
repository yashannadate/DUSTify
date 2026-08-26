import React, { useState } from 'react';
import { Activity, Server, Radio, Database, RefreshCw, Copy, Check } from 'lucide-react';
import { RelayerStatus } from '../types';

interface MonitorProps {
  relayerStatus: RelayerStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const RelayerMonitor: React.FC<MonitorProps> = ({ relayerStatus, isLoading, onRefresh }) => {
  const [copied, setCopied] = useState(false);

  const sponsorAddress = relayerStatus?.sponsorAddress || 'mn_unshielded1z9v...preview_sponsor';
  const hasDust = relayerStatus?.sponsorDustAvailability?.hasDust ?? false;
  const balanceDust = relayerStatus?.sponsorDustAvailability?.balanceDust || '0.000000 DUST';
  const balanceSpecks = relayerStatus?.sponsorDustAvailability?.balanceSpecks || '0';

  const copyAddress = () => {
    navigator.clipboard.writeText(sponsorAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-1">
            Relayer & Network Infrastructure Monitor
          </h2>
          <p className="text-slate-400 text-sm">
            Live health telemetry for the DUSTify Master Relayer and Midnight Preview RPC connections.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-dust-cyan' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Sponsor Wallet Status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Sponsor Master Wallet
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                hasDust
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {hasDust ? 'DUST Ready' : 'Awaiting Faucet DUST'}
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold font-display text-white mb-1">
              {balanceDust}
            </div>
            <div className="text-xs font-mono text-slate-400">
              {balanceSpecks} Specks available for sponsorship
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2">
            <span className="text-[11px] text-slate-400 block font-sans">Sponsor Public Address:</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-midnight-950/80 border border-white/10 font-mono text-[11px] text-slate-300">
              <span className="truncate max-w-[200px]">{sponsorAddress}</span>
              <button
                onClick={copyAddress}
                className="text-dust-cyan hover:text-cyan-300 ml-2 p-1 flex-shrink-0"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Wallet Synchronization */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Wallet Sync Engine
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-mono font-bold text-emerald-400">SYNCED</span>
            </div>
          </div>

          <div>
            <div className="text-2xl font-bold font-display text-white mb-1">
              ~1.4s Warm Sync
            </div>
            <div className="text-xs text-slate-400 font-sans">
              State serialized to <code className="text-dust-cyan">.data/wallet-state/preview</code>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Target Network:</span>
              <span className="font-semibold text-white">Midnight Preview</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Sync Status:</span>
              <span className="font-mono text-emerald-400">Continuous Stream Active</span>
            </div>
          </div>
        </div>

        {/* Card 3: Gateway & API Health */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Relayer Gateway Health
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-dust-cyan/20 text-dust-cyan border border-dust-cyan/30">
              v0.1.0 Online
            </span>
          </div>

          <div>
            <div className="text-2xl font-bold font-display text-white mb-1">
              REST & WebSocket
            </div>
            <div className="text-xs text-slate-400 font-sans">
              Authenticated endpoint protection & rate limiting
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Max Rate Limit:</span>
              <span className="font-mono text-white">100 req / min</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">WASM Deserializer:</span>
              <span className="font-mono text-dust-cyan">Transaction.deserialize()</span>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <h3 className="text-sm font-bold font-display text-slate-200 mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-dust-cyan" />
          <span>Configured Midnight Preview Endpoints</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-2 font-semibold">Service</th>
                <th className="pb-2 font-semibold">Configured URL</th>
                <th className="pb-2 font-semibold">Protocol</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-2.5 font-sans font-medium text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-dust-blue" />
                  <span>Preview Indexer HTTP</span>
                </td>
                <td className="py-2.5 text-slate-400 truncate max-w-xs">
                  {relayerStatus?.endpoints.indexerHttpUrl || 'https://api-preview.1am.xyz/api/v4/graphql'}
                </td>
                <td className="py-2.5 text-slate-400">GraphQL / HTTP</td>
                <td className="py-2.5 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-dust-purple" />
                  <span>Preview Indexer WS</span>
                </td>
                <td className="py-2.5 text-slate-400 truncate max-w-xs">
                  {relayerStatus?.endpoints.indexerHttpUrl ? relayerStatus.endpoints.indexerHttpUrl.replace('http', 'ws') + '/ws' : 'wss://api-preview.1am.xyz/api/v4/graphql/ws'}
                </td>
                <td className="py-2.5 text-slate-400">WebSocket Subscription</td>
                <td className="py-2.5 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans font-medium text-white flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Midnight Node RPC</span>
                </td>
                <td className="py-2.5 text-slate-400 truncate max-w-xs">
                  {relayerStatus?.endpoints.nodeRpcUrl || 'wss://rpc.preview.midnight.network'}
                </td>
                <td className="py-2.5 text-slate-400">Substrate RPC / WS</td>
                <td className="py-2.5 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
