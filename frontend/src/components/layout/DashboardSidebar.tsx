import React from 'react';
import {
  LayoutDashboard,
  AppWindow,
  KeyRound,
  ArrowLeftRight,
  Server,
  Coins,
  PlayCircle,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  X,
} from 'lucide-react';
import { DashboardTab, RelayerTelemetry } from '../../types';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onBackToLanding: () => void;
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }],
  },
  {
    title: 'Developer',
    items: [
      { id: 'apps', label: 'Applications', icon: AppWindow },
      { id: 'api-keys', label: 'API Keys', icon: KeyRound },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { id: 'relayer', label: 'Relayer Gateway', icon: Server },
      { id: 'sponsor', label: 'Sponsor Capacity', icon: Coins },
    ],
  },
  {
    title: 'Interactive',
    items: [{ id: 'playground', label: 'Playground', icon: PlayCircle, badge: 'Live' }],
  },
  {
    title: 'Resources',
    items: [
      { id: 'docs', label: 'Documentation', icon: BookOpen },
      { id: 'security', label: 'Security & Trust', icon: ShieldCheck },
    ],
  },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  onBackToLanding,
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
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#222228]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <span className="text-sm font-bold">🌙</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">DUSTify Console</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-zinc-400 rounded-md hover:text-white hover:bg-zinc-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to Website button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Product Website</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase font-mono">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/80'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-brand-400' : 'text-zinc-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Status & Links */}
        <div className="p-4 border-t border-[#222228] bg-[#09090b]/80 space-y-2.5">
          <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">Network</span>
              <span className="flex items-center font-mono text-emerald-400 text-[10px]">
                <span className="w-1.5 h-1.5 mr-1 rounded-full bg-emerald-400 animate-pulse" />
                Midnight Preview
              </span>
            </div>
          </div>

          <a
            href="https://github.com/yashannadate/DUSTify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 rounded-lg hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
};
