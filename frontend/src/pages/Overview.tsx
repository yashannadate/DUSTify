import React from 'react';
import {
  Activity,
  Globe,
  Coins,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { PageId, RelayerTelemetry, RelayedTxRecord } from '../types';

interface OverviewProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  transactions: RelayedTxRecord[];
  onNavigate: (page: PageId) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  telemetry,
  isOnline,
  transactions,
  onNavigate,
}) => {
  const dustSpecks = telemetry?.sponsorDustAvailability.balanceSpecks || '0';
  const dustFormatted = telemetry?.sponsorDustAvailability.balanceDust || '0.000000 DUST';
  const isSynced = telemetry?.isSynced ?? false;
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top 4 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Relayer Status */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Relayer Status</span>
            <Activity
              className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}
            />
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xl font-bold text-white tracking-tight">
              {isOnline ? 'ONLINE' : 'CONNECTING / DEMO'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {isOnline
              ? 'Ready to sponsor transactions'
              : 'Simulation mode active (local proof provider)'}
          </p>
        </div>

        {/* Card 2: Network */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Network</span>
            <Globe className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl font-bold text-white tracking-tight uppercase">
              {telemetry?.network || 'MIDNIGHT PREVIEW'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {isOnline ? 'Node RPC: wss://rpc.preview...' : 'Target: Preview Testnet'}
          </p>
        </div>

        {/* Card 3: Sponsor DUST */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Sponsor DUST</span>
            <Coins className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="flex items-baseline space-x-1.5 mb-1">
            <span className="text-xl font-bold text-white tracking-tight font-mono">
              {isOnline ? dustSpecks : '0'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">Specks</span>
          </div>
          <p className="text-xs text-zinc-400">
            {isOnline ? `${dustFormatted} available` : 'Connect relayer to view balance'}
          </p>
        </div>

        {/* Card 4: Wallet Synchronization */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Wallet Sync</span>
            <Cpu className="w-4 h-4 text-brand-400" />
          </div>
          <div className="flex items-center space-x-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSynced ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-xl font-bold text-white tracking-tight">
              {isOnline ? (isSynced ? 'SYNCHRONIZED' : 'SYNCING STREAM') : 'WARM CHECKPOINT'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {isOnline ? 'Apply lag: 0 (WebSocket stream)' : 'Restore speed: ~1.40s'}
          </p>
        </div>
      </div>

      {/* Architecture Flow Visualizer */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">DUSTify Fee-Abstraction Architecture</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Decoupling zero-knowledge proof generation from on-chain transaction fee settlement.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>🔒 Private keys & witness state never leave user device</span>
          </div>
        </div>

        {/* 4-Stage Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  STEP 01
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Client</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">USER / DAPP</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                User interacts with dApp. ZK circuit evaluated locally with private witness at{' '}
                <strong className="text-zinc-200">0 DUST cost</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-emerald-400">
              ✓ 0 DUST spent
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  STEP 02
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">SDK</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">DUSTIFY SDK</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Serializes <code className="text-brand-300">UnboundTransaction</code> into native WASM
                binary and dispatches over authenticated HTTP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-brand-400">
              ✓ Native binary hex
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  STEP 03
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Relayer</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">DUSTIFY RELAYER</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Balances transaction with sponsor DUST UTXOs via{' '}
                <code className="text-brand-300">balanceUnboundTransaction()</code> and seals recipe.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-300">
              ✓ Sponsor attaches fee
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  STEP 04
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Ledger</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">MIDNIGHT PREVIEW</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Finalized transaction broadcast via Node RPC WebSocket and settled on Midnight block
                height.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] font-mono text-emerald-400">
              ✓ Settled on-chain
            </div>
          </div>
        </div>
      </div>

      {/* Recent Relay Activity Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Relay Activity</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live transaction telemetry processed through DUSTify infrastructure.
            </p>
          </div>
          <button
            onClick={() => onNavigate('playground')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Launch Playground</span>
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300">No relayed transactions yet.</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Run a transaction through the Playground to see real-time fee-sponsored activity here.
            </p>
            <button
              onClick={() => onNavigate('playground')}
              className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              <span>Go to Playground</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-3 pl-2 font-medium">Status</th>
                  <th className="pb-3 font-medium">Relay ID</th>
                  <th className="pb-3 font-medium">Transaction / Circuit</th>
                  <th className="pb-3 font-medium">Network</th>
                  <th className="pb-3 font-medium">User DUST Cost</th>
                  <th className="pb-3 pr-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {recentTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 pl-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.status === 'DEMO'
                            ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-300">{tx.id}</td>
                    <td className="py-3 text-white font-sans font-medium">{tx.circuitId}</td>
                    <td className="py-3 text-zinc-400">{tx.network}</td>
                    <td className="py-3 text-emerald-400 font-semibold">{tx.userDustCost}</td>
                    <td className="py-3 pr-2 text-right text-zinc-500 font-sans">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
