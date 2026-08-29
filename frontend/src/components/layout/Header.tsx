import React from 'react';
import { Menu, Activity, RefreshCw } from 'lucide-react';
import { PageId, RelayerTelemetry } from '../../types';

interface HeaderProps {
  activePage: PageId;
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  isLoading: boolean;
  latencyMs: number;
  onRefresh: () => void;
  onOpenMobile: () => void;
}

const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
  overview: {
    title: 'DUSTify Overview',
    subtitle: 'Gas abstraction infrastructure for Midnight applications.',
  },
  playground: {
    title: 'DUSTify Playground',
    subtitle: 'Experience a DUST-sponsored Midnight transaction flow.',
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'Monitor transactions processed through the DUSTify relayer.',
  },
  developers: {
    title: 'Developer Setup',
    subtitle: 'Integrate DUSTify into your Midnight application.',
  },
  relayer: {
    title: 'Relayer Health',
    subtitle: 'Live infrastructure telemetry and sponsor wallet status.',
  },
  security: {
    title: 'Privacy by Architecture',
    subtitle: 'DUSTify sponsors transaction fees without taking custody of user secrets.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  telemetry,
  isOnline,
  isLoading,
  latencyMs,
  onRefresh,
  onOpenMobile,
}) => {
  const current = pageTitles[activePage] || {
    title: 'DUSTify',
    subtitle: 'Fee-Abstraction for Midnight',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 md:px-8 bg-[#09090b]/80 backdrop-blur-md border-b border-[#222228]">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onOpenMobile}
          className="p-2 text-zinc-400 rounded-lg hover:text-white hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {current.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-zinc-400">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Telemetry & Network Status Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Telemetry"
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
        </button>

        {/* Network & Live Status Indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs">
          <span className="flex items-center text-zinc-300 font-mono text-[11px]">
            <span
              className={`w-2 h-2 mr-1.5 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isOnline ? 'SYSTEM OPERATIONAL' : 'OFFLINE / DEMO'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono text-[11px]">
            {latencyMs > 0 ? `${latencyMs}ms` : 'Midnight Preview'}
          </span>
        </div>
      </div>
    </header>
  );
};
