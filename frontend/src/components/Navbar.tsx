import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { RelayerStatus } from '../types';

export type NavTab = 'overview' | 'demo' | 'relayer' | 'docs';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  relayerStatus: RelayerStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  relayerStatus,
  isLoading,
  onRefresh,
}) => {
  const isOnline = Boolean(relayerStatus);
  const isSynced = relayerStatus?.isSynced ?? false;
  const hasDust = relayerStatus?.sponsorDustAvailability?.hasDust ?? false;

  return (
    <header className="border-b border-border-subtle bg-surface-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-zinc-100 text-zinc-950 flex items-center justify-center font-mono font-bold text-xs">
              D
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-100 font-mono">
              DUSTify
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              preview
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Gasless Demo
            </button>
            <button
              onClick={() => setActiveTab('relayer')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'relayer'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Relayer & Telemetry
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Documentation
            </button>
          </nav>
        </div>

        {/* Right Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Relayer Ping Status */}
          <button
            onClick={onRefresh}
            title="Click to refresh telemetry"
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs transition-colors cursor-pointer"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline
                  ? hasDust
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="text-zinc-300 font-mono text-[11px]">
              {isOnline
                ? hasDust
                  ? 'Relayer Ready (Funded)'
                  : 'Relayer Ready (0 DUST)'
                : 'Relayer Standby'}
            </span>
            <RefreshCw className={`w-3 h-3 text-zinc-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="GitHub Repository"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden border-t border-border-subtle px-2 py-1 gap-1 overflow-x-auto bg-surface-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'demo' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
          }`}
        >
          Demo
        </button>
        <button
          onClick={() => setActiveTab('relayer')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'relayer' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
          }`}
        >
          Relayer
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            activeTab === 'docs' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
          }`}
        >
          Docs
        </button>
      </div>
    </header>
  );
};
