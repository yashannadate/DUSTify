import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onExploreDemo: () => void;
  onExploreSdk: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreDemo, onExploreSdk }) => {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-dust-cyan/15 via-dust-blue/10 to-dust-violet/20 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center relative z-10">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-md shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-dust-cyan"></span>
          <span className="font-medium">Fee-Abstraction Infrastructure for Midnight Network</span>
          <span className="text-slate-500">|</span>
          <span className="text-dust-cyan font-semibold">Preview Ready</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Zero Gas Friction.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-dust-cyan via-dust-blue to-dust-purple">
            Pure Zero-Knowledge.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-sans font-light leading-relaxed mb-10">
          Eliminate DUST token friction, faucet navigation, and gas fee hurdles for Midnight dApps. Users generate local ZK proofs at <strong className="text-white font-semibold">0 DUST cost</strong> — DUSTify sponsors on-chain settlement.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-dust-cyan to-dust-blue hover:from-cyan-400 hover:to-blue-500 text-midnight-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-dust-cyan/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Launch Live Gasless Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreSdk}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <Terminal className="w-4 h-4 text-dust-cyan" />
            <span>Developer SDK Integration</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-panel p-4 rounded-xl text-center glass-panel-hover">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-dust-cyan mb-1">0 DUST</div>
            <div className="text-xs text-slate-400 font-medium">User Gas Cost</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center glass-panel-hover">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-dust-purple mb-1">100%</div>
            <div className="text-xs text-slate-400 font-medium">Private Witness Kept Local</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center glass-panel-hover">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400 mb-1">~1.4s</div>
            <div className="text-xs text-slate-400 font-medium">Warm Checkpoint Sync</div>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center glass-panel-hover">
            <div className="text-2xl sm:text-3xl font-extrabold font-display text-amber-400 mb-1">1-Click</div>
            <div className="text-xs text-slate-400 font-medium">dApp Onboarding</div>
          </div>
        </div>
      </div>
    </section>
  );
};
