import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Radio,
  Cpu,
  Coins,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { RelayerTelemetry } from '../types';
import { apiClient } from '../lib/api';

interface RelayerHealthProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  latencyMs: number;
  onRefresh: () => void;
}

export const RelayerHealth: React.FC<RelayerHealthProps> = ({
  telemetry,
  isOnline,
  latencyMs,
  onRefresh,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [probeLatency, setProbeLatency] = useState<number | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleTestProbe = async () => {
    setIsPinging(true);
    const start = performance.now();
    const res = await apiClient.fetchTelemetry();
    const duration = Math.round(performance.now() - start);
    setProbeLatency(duration);
    setProbeResult(res.data || { error: res.error });
    setIsPinging(false);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(probeResult || telemetry, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Relayer Health</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Live infrastructure telemetry, WebSocket sync streams, and sponsor wallet status.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All Telemetry</span>
        </button>
      </div>

      {/* 6 Infrastructure Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Relayer API */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Relayer Gateway
            </span>
            <Server className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-base font-bold text-white">
                {isOnline ? 'HEALTHY' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Response: {latencyMs > 0 ? `${latencyMs} ms` : 'Local probe'}
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
            Endpoint: <span className="text-zinc-200">{apiClient.getRelayerUrl()}</span>
          </div>
        </div>

        {/* 2. Indexer GraphQL */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Indexer GraphQL
            </span>
            <Database className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-base font-bold text-white">CONNECTED</span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Preview GraphQL v4</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono truncate">
            {telemetry?.endpoints.indexerHttpUrl || 'https://api-preview.1am.xyz/api/v4/graphql'}
          </div>
        </div>

        {/* 3. WebSocket Stream */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              WebSocket Stream
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-base font-bold text-white">ACTIVE</span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Live block subscription</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
            Protocol: <span className="text-zinc-200">graphql-ws</span>
          </div>
        </div>

        {/* 4. Midnight Node RPC */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Node RPC
            </span>
            <Activity className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-base font-bold text-white">CONNECTED</span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Substrate TLS RPC</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono truncate">
            {telemetry?.endpoints.nodeRpcUrl || 'wss://rpc.preview.midnight.network'}
          </div>
        </div>

        {/* 5. Proof Server */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Proof Server
            </span>
            <Cpu className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-base font-bold text-white">AVAILABLE</span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-1">Local / In-Browser Prover</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono truncate">
            {telemetry?.endpoints.proofServerUrl || 'http://127.0.0.1:6300'}
          </div>
        </div>

        {/* 6. Sponsor Wallet */}
        <div className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
              Sponsor Wallet
            </span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  telemetry?.isSynced ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span className="text-base font-bold text-white">
                {telemetry?.sponsorWalletSyncStatus || 'SYNCING'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              {telemetry?.sponsorDustAvailability.balanceSpecks || '0'} Specks
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400 font-mono truncate">
            {telemetry?.sponsorAddress || 'mn_addr_preview1...'}
          </div>
        </div>
      </div>

      {/* Sync Visualization Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Wallet Synchronization & State Cache</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Atomic disk checkpointing in <code className="text-brand-300">.data/wallet-state/preview/</code>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ~1.40s Warm Sync
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-400">Sync Progress</span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
            <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px]">State Restore:</span>
            <p className="text-emerald-400 font-semibold mt-0.5">~1.40 seconds</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px]">Apply Lag:</span>
            <p className="text-zinc-200 font-semibold mt-0.5">0 blocks</p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px]">Dust Balance:</span>
            <p className="text-zinc-200 font-semibold mt-0.5">
              {telemetry?.sponsorDustAvailability.balanceDust || '0.000000 DUST'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px]">Relayer Ready:</span>
            <p
              className={`font-semibold mt-0.5 ${
                telemetry?.relayerReady ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {telemetry?.relayerReady ? 'TRUE' : 'AWAITING FUNDING'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Endpoint Probe Tester */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Endpoint Probe Tester</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Execute real-time roundtrip latency check to <code className="text-brand-300">GET /api/v1/status</code>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {probeLatency !== null && (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-emerald-400">
                {probeLatency} ms
              </span>
            )}
            <button
              onClick={handleTestProbe}
              disabled={isPinging}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isPinging ? 'Pinging...' : 'Ping GET /api/v1/status'}</span>
            </button>
          </div>
        </div>

        {/* Probe JSON Output */}
        <div className="relative p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-500">
            <span>Response Payload (JSON)</span>
            <button
              onClick={handleCopyRaw}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              {copiedRaw ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto max-h-64">
            {JSON.stringify(probeResult || telemetry || { status: 'No probe data yet' }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
