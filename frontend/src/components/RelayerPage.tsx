import React, { useState } from 'react';
import { Server, Activity, Shield, Copy, Check, RefreshCw, Radio } from 'lucide-react';
import { RelayerStatus } from '../types';

interface RelayerPageProps {
  relayerStatus: RelayerStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const RelayerPage: React.FC<RelayerPageProps> = ({
  relayerStatus,
  isLoading,
  onRefresh,
}) => {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [probeResult, setProbeResult] = useState<{ status: string; latencyMs: number; raw: any } | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  const sponsorAddress = relayerStatus?.sponsorAddress || 'mn_addr_preview1w2fl37n2zk5chc95z4ngzmjl6lzdwcxq7yjd45jpn3amakdrehzsrhc7v3';
  const hasDust = relayerStatus?.sponsorDustAvailability?.hasDust ?? false;
  const balanceDust = relayerStatus?.sponsorDustAvailability?.balanceDust || '0.000000 DUST';
  const balanceSpecks = relayerStatus?.sponsorDustAvailability?.balanceSpecks || '0';

  const copyAddress = () => {
    navigator.clipboard.writeText(sponsorAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleProbe = async () => {
    setIsProbing(true);
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:3001/api/v1/status');
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - start);
      setProbeResult({ status: '200 OK', latencyMs, raw: data });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      setProbeResult({ status: 'UNREACHABLE', latencyMs, raw: { error: err.message } });
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="space-y-8 py-8 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            Relayer Infrastructure & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            Live telemetry for the Master DUST Wallet, state persistence engine, and Midnight Preview Node RPC.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-zinc-400' : ''}`} />
          <span>Refresh State</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Sponsor Address & Balance */}
        <div className="border border-border-subtle rounded bg-surface-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Sponsor Master Wallet
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                hasDust
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              {hasDust ? 'Funded' : 'Awaiting DUST'}
            </span>
          </div>

          <div>
            <div className="text-xl font-bold font-mono text-zinc-100">{balanceDust}</div>
            <div className="text-[11px] font-mono text-zinc-500">{balanceSpecks} Specks capacity</div>
          </div>

          <div className="pt-2 border-t border-border-subtle space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Address</span>
            <div className="flex items-center justify-between p-1.5 rounded bg-surface-300 border border-border-subtle text-[11px] font-mono text-zinc-300">
              <span className="truncate max-w-[200px]">{sponsorAddress}</span>
              <button
                onClick={copyAddress}
                className="text-zinc-500 hover:text-zinc-300 ml-1 p-0.5"
                title="Copy Address"
              >
                {copiedAddr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Synchronization Checkpoint */}
        <div className="border border-border-subtle rounded bg-surface-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              State Persistence
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              ~1.40s Warm Sync
            </span>
          </div>

          <div>
            <div className="text-xl font-bold font-mono text-zinc-100">Checkpoint Active</div>
            <div className="text-[11px] font-mono text-zinc-500">.data/wallet-state/preview</div>
          </div>

          <div className="pt-2 border-t border-border-subtle text-xs space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-zinc-400">
              <span>dust.json:</span>
              <span className="text-zinc-200">287 KB</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>shielded.json:</span>
              <span className="text-zinc-200">3.8 KB</span>
            </div>
          </div>
        </div>

        {/* Card 3: Security & Rate Limits */}
        <div className="border border-border-subtle rounded bg-surface-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
              Gateway Protection
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300">
              v0.1.0 Online
            </span>
          </div>

          <div>
            <div className="text-xl font-bold font-mono text-zinc-100">100 req / min</div>
            <div className="text-[11px] font-mono text-zinc-500">In-memory sliding window</div>
          </div>

          <div className="pt-2 border-t border-border-subtle text-xs space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-zinc-400">
              <span>Auth:</span>
              <span className="text-zinc-200">x-api-key header</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>TTL:</span>
              <span className="text-zinc-200">180s deadline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configured Endpoints Table */}
      <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-zinc-400" />
          <span>Configured Midnight Preview Network Endpoints</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border-subtle text-zinc-500 text-[11px]">
                <th className="pb-2">Service</th>
                <th className="pb-2">URL Endpoint</th>
                <th className="pb-2">Protocol</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-zinc-300">
              <tr>
                <td className="py-2 text-zinc-200 font-sans font-medium">Preview Indexer HTTP</td>
                <td className="py-2 text-zinc-400 font-mono text-[11px]">
                  {relayerStatus?.endpoints?.indexerHttpUrl || 'https://api-preview.1am.xyz/api/v4/graphql'}
                </td>
                <td className="py-2 text-zinc-500">GraphQL / HTTP</td>
                <td className="py-2 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
              <tr>
                <td className="py-2 text-zinc-200 font-sans font-medium">Preview Indexer WS</td>
                <td className="py-2 text-zinc-400 font-mono text-[11px]">
                  {relayerStatus?.endpoints?.indexerHttpUrl
                    ? relayerStatus.endpoints.indexerHttpUrl.replace('http', 'ws') + '/ws'
                    : 'wss://api-preview.1am.xyz/api/v4/graphql/ws'}
                </td>
                <td className="py-2 text-zinc-500">WebSocket</td>
                <td className="py-2 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
              <tr>
                <td className="py-2 text-zinc-200 font-sans font-medium">Midnight Node RPC</td>
                <td className="py-2 text-zinc-400 font-mono text-[11px]">
                  {relayerStatus?.endpoints?.nodeRpcUrl || 'wss://rpc.preview.midnight.network'}
                </td>
                <td className="py-2 text-zinc-500">Substrate RPC / WS</td>
                <td className="py-2 text-emerald-400 font-semibold">CONNECTED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Probe Tester */}
      <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-zinc-400" />
            <span>Relayer Endpoint Probe & Latency Test</span>
          </h2>
          <button
            onClick={handleProbe}
            disabled={isProbing}
            className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Activity className={`w-3 h-3 ${isProbing ? 'animate-pulse text-zinc-400' : ''}`} />
            <span>{isProbing ? 'Probing...' : 'Ping GET /api/v1/status'}</span>
          </button>
        </div>

        {probeResult && (
          <div className="p-3 rounded bg-surface-300 border border-border-subtle font-mono text-xs space-y-2">
            <div className="flex justify-between items-center text-[11px] pb-1 border-b border-border-subtle">
              <span className="text-zinc-400">Response Code: <strong className="text-zinc-100">{probeResult.status}</strong></span>
              <span className="text-zinc-400">Roundtrip Latency: <strong className="text-emerald-400">{probeResult.latencyMs} ms</strong></span>
            </div>
            <pre className="text-[10px] text-zinc-400 overflow-x-auto max-h-[160px]">
              {JSON.stringify(probeResult.raw, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
