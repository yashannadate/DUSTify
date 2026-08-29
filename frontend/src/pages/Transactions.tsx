import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { RelayedTxRecord, TxStatus } from '../types';

interface TransactionsProps {
  transactions: RelayedTxRecord[];
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<'ALL' | TxStatus>('ALL');
  const [selectedTx, setSelectedTx] = useState<RelayedTxRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTxs = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    return tx.status === filter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Transactions</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor transactions processed and fee-sponsored through the DUSTify relayer.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          {(['ALL', 'CONFIRMED', 'DEMO', 'RELAYER_NOT_FUNDED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === tab
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'RELAYER_NOT_FUNDED' ? 'Awaiting Fund' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        {filteredTxs.length === 0 ? (
          <div className="py-16 text-center">
            <ArrowLeftRight className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <h3 className="text-sm font-medium text-zinc-300">No transactions match filter</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Trigger a test transaction in the Playground to record live relay activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="pb-3 pl-2 font-medium">Status</th>
                  <th className="pb-3 font-medium">Relay ID</th>
                  <th className="pb-3 font-medium">Tx ID / Circuit</th>
                  <th className="pb-3 font-medium">Network</th>
                  <th className="pb-3 font-medium">Sponsor</th>
                  <th className="pb-3 font-medium">User Cost</th>
                  <th className="pb-3 pr-2 text-right font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
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
                    <td className="py-3 text-zinc-300 font-semibold">{tx.id}</td>
                    <td className="py-3 text-zinc-200">
                      {tx.txId ? `${tx.txId.substring(0, 10)}...` : tx.circuitId}
                    </td>
                    <td className="py-3 text-zinc-400">{tx.network}</td>
                    <td className="py-3 text-zinc-400">
                      {tx.sponsorAddress.substring(0, 14)}...
                    </td>
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

      {/* Transaction Detail Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f0f13] border border-zinc-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">Transaction Details</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {selectedTx.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Status</span>
                <span className="text-emerald-400 font-bold">{selectedTx.status}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Circuit Executed</span>
                <span className="text-zinc-200">{selectedTx.circuitId}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">User DUST Spent</span>
                <span className="text-emerald-400 font-bold">{selectedTx.userDustCost}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Network</span>
                <span className="text-zinc-200">{selectedTx.network}</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Sponsor Master Address</span>
                  <button
                    onClick={() => handleCopy(selectedTx.sponsorAddress, 'addr')}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    {copiedId === 'addr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-300 break-all">{selectedTx.sponsorAddress}</p>
              </div>

              {selectedTx.txId && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-400">Transaction ID (TxHash)</span>
                  <p className="text-[10px] text-brand-300 break-all">{selectedTx.txId}</p>
                </div>
              )}
            </div>

            {/* Privacy Boundary Box */}
            <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-brand-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Zero-Custody Privacy Guarantee</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                DUSTify relayer processes transactions without custody:
              </p>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-400 pt-1">
                <div>✕ No User Private Keys</div>
                <div>✕ No Seed Phrases</div>
                <div>✕ No Private Witness State</div>
                <div>✓ 100% ZK Privacy Kept</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
