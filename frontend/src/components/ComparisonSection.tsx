import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-3">
          Why DUSTify Matters for Midnight
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          A fundamental leap forward in user onboarding and developer experience on the Midnight Network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Midnight Flow */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-500/[0.03] to-transparent space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400">
              Traditional Onboarding
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              High User Friction
            </span>
          </div>

          <h3 className="text-xl font-bold font-display text-white">
            Manual Faucet & DUST Management
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>User must find and navigate external testnet faucet.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>User must acquire tNIGHT tokens before doing anything.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>User must register unshielded UTXOs for DUST generation.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>User must wait 10+ minutes for DUST capacity to tick.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>High drop-off rate for new dApp users at the gas hurdle.</span>
            </li>
          </ul>
        </div>

        {/* DUSTify Flow */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-dust-cyan/40 bg-gradient-to-b from-dust-cyan/[0.06] to-transparent space-y-4 shadow-xl shadow-dust-cyan/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-dust-cyan">
              DUSTify Infrastructure
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-dust-cyan/20 text-dust-cyan border border-dust-cyan/30 font-bold">
              0 Gas Friction
            </span>
          </div>

          <h3 className="text-xl font-bold font-display text-white">
            Instant 1-Click Zero-Knowledge Action
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0 mt-0.5" />
              <span><strong>0 DUST required:</strong> User immediately interacts with dApp.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0 mt-0.5" />
              <span><strong>100% Client Witness Privacy:</strong> Kachina witness is strictly local.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0 mt-0.5" />
              <span><strong>Seamless SDK:</strong> dApp developers add 3 lines of TypeScript code.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0 mt-0.5" />
              <span><strong>Warm Sync in ~1.4s:</strong> Persistent state ensures instant relayer response.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0 mt-0.5" />
              <span><strong>Massive Conversion:</strong> Removes the #1 barrier to Web3 adoption.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
