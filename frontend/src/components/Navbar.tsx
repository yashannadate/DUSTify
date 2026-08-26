import React from 'react';
import { Zap, ExternalLink } from 'lucide-react';
import { RelayerStatus } from '../types';

interface NavbarProps {
  relayerStatus: RelayerStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ relayerStatus, onRefresh }) => {
  const isOnline = Boolean(relayerStatus);
  const hasDust = relayerStatus?.sponsorDustAvailability?.hasDust ?? false;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-dust-cyan via-dust-blue to-dust-violet p-0.5 shadow-lg shadow-dust-cyan/20">
            <div className="w-full h-full bg-midnight-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-dust-cyan fill-dust-cyan/20" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dust-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-dust-cyan"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-dust-cyan">
                DUSTify
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-dust-violet/20 text-dust-purple border border-dust-purple/30">
                PREVIEW
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              Zero-Friction Gas Relayer for Midnight
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Network Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-slate-400">Network:</span>
            <span className="font-semibold text-slate-200">Midnight Preview</span>
          </div>

          {/* Relayer Status Badge */}
          <button
            onClick={onRefresh}
            title="Click to refresh status"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs cursor-pointer"
          >
            {isOnline ? (
              <>
                <div className={`w-2 h-2 rounded-full ${hasDust ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
                <span className="text-slate-300 font-medium">
                  {hasDust ? 'Relayer Active' : 'Relayer Ready'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden lg:inline">
                  ({hasDust ? 'Funded' : 'Awaiting DUST'})
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                <span className="text-slate-400 font-medium">Relayer Standby</span>
              </>
            )}
          </button>

          {/* Quick Links */}
          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-dust-cyan/10 to-dust-blue/10 hover:from-dust-cyan/20 hover:to-dust-blue/20 border border-dust-cyan/30 text-dust-cyan text-xs font-semibold transition-all shadow-sm shadow-dust-cyan/10"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
