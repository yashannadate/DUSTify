import React from 'react';
import {
  Activity,
  Globe,
  Coins,
  ArrowRight,
  KeyRound,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { DashboardTab, RelayerTelemetry, RelayedTxRecord } from '../types';

interface DashboardOverviewProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  transactions: RelayedTxRecord[];
  onSelectTab: (tab: DashboardTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  telemetry,
  isOnline,
  transactions,
  onSelectTab,
}) => {
  const hasDust = telemetry?.sponsorDustAvailability.hasDust ?? false;
  const dustSpecks = telemetry?.sponsorDustAvailability.balanceSpecks || '0';
  const recentTxs = transactions.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Good evening, Developer.</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor your sponsored Midnight transaction infrastructure, applications, and relayer capacity.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
            Preview Testnet
          </span>
        </div>
      </div>

      {/* Top 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Relayer Status */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Relayer Status</span>
            <Activity className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-lg font-bold text-white tracking-tight">
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Authenticated relay service</p>
          </div>
        </div>

        {/* 2. Network */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Network</span>
            <Globe className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight uppercase">
              {telemetry?.network || 'MIDNIGHT PREVIEW'}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Configured via environment</p>
          </div>
        </div>

        {/* 3. Sponsor Capacity */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Sponsor Capacity</span>
            <Coins className={`w-4 h-4 ${hasDust ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight font-mono">
              {hasDust ? `${dustSpecks} Specks` : '0 Specks (Unfunded)'}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {hasDust ? 'Ready for live sponsorship' : 'Funding required before live sponsorship'}
            </p>
          </div>
        </div>

        {/* 4. Transactions */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Relayed Transactions</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-tight font-mono">
              {transactions.length}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Total recorded attempts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onSelectTab('api-keys')}
            className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 group-hover:text-white mb-2">
              <KeyRound className="w-4 h-4 text-brand-400" />
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="text-xs font-semibold text-white">Create API Key</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Authenticate dApp relay requests</p>
          </button>

          <button
            onClick={() => onSelectTab('playground')}
            className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 group-hover:text-white mb-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="text-xs font-semibold text-white">Open Playground</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Test live fee-sponsored execution</p>
          </button>

          <button
            onClick={() => onSelectTab('docs')}
            className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 group-hover:text-white mb-2">
              <BookOpen className="w-4 h-4 text-zinc-300" />
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h4 className="text-xs font-semibold text-white">View Integration Guide</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Install and configure @dustify/sdk</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time telemetry and execution receipts</p>
          </div>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            View All →
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800">
            <Clock className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-xs font-medium text-zinc-300">No transactions recorded yet</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Execute a transaction in the Playground to see real-time activity here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-2 pl-2">Status</th>
                  <th className="pb-2">Application / Circuit</th>
                  <th className="pb-2">Relay ID</th>
                  <th className="pb-2">Sponsor Fee</th>
                  <th className="pb-2">Network</th>
                  <th className="pb-2 pr-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-[11px]">
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
                    <td className="py-3 text-white font-sans">{tx.circuitId}</td>
                    <td className="py-3 text-zinc-400">{tx.id}</td>
                    <td className="py-3 text-emerald-400">{tx.userDustCost}</td>
                    <td className="py-3 text-zinc-400">{tx.network}</td>
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
