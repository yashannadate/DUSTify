import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  ArrowLeftRight,
  Terminal,
  Activity,
  ShieldCheck,
  ExternalLink,
  X,
} from 'lucide-react';
import { PageId, RelayerTelemetry } from '../../types';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'playground', label: 'Playground', icon: PlayCircle, badge: 'Live Demo' },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'developers', label: 'Developer Setup', icon: Terminal },
  { id: 'relayer', label: 'Relayer Health', icon: Activity },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  telemetry,
  isOnline,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#0c0c0f] border-r border-[#222228] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#222228]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-400">
              <span className="text-base font-bold">🌙</span>
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white">DUSTify</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                L4
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-zinc-400 rounded-md hover:text-white hover:bg-zinc-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/80 text-white font-semibold shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Status & Links */}
        <div className="p-4 border-t border-[#222228] bg-[#09090b]/60 space-y-3">
          <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-zinc-400">Target Network</span>
              <span className="flex items-center text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Preview
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Sponsor Capacity:</span>
              <span className="text-zinc-300">
                {telemetry?.sponsorDustAvailability.balanceSpecks || '0'} Specks
              </span>
            </div>
          </div>

          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 rounded-lg hover:text-white hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-800"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>
    </>
  );
};
