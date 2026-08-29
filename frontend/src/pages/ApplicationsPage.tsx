import React, { useState, useEffect } from 'react';
import { AppWindow, Plus, CheckCircle2, Globe, Key, X, ExternalLink } from 'lucide-react';
import { AppRecord } from '../types';

export const ApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<AppRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appName, setAppName] = useState('');
  const [origin, setOrigin] = useState('http://localhost:5173');

  useEffect(() => {
    const saved = localStorage.getItem('dustify_apps');
    if (saved) {
      setApps(JSON.parse(saved));
    } else {
      const defaults: AppRecord[] = [
        {
          id: 'app_counter_demo',
          name: 'Counter Demo dApp',
          origin: 'http://localhost:5173',
          env: 'Preview Testnet',
          apiKeyPrefix: 'dustify_dev_key...',
          txCount: 14,
          status: 'Connected',
          createdAt: Date.now() - 86400000,
        },
        {
          id: 'app_governance_voting',
          name: 'Anonymous Voting dApp',
          origin: 'http://localhost:5173',
          env: 'Preview Testnet',
          apiKeyPrefix: 'dustify_gov_key...',
          txCount: 8,
          status: 'Connected',
          createdAt: Date.now() - 172800000,
        },
      ];
      setApps(defaults);
      localStorage.setItem('dustify_apps', JSON.stringify(defaults));
    }
  }, []);

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    const newApp: AppRecord = {
      id: `app_${Math.random().toString(36).substring(2, 9)}`,
      name: appName.trim(),
      origin: origin.trim() || '*',
      env: 'Preview Testnet',
      apiKeyPrefix: `dustify_${Math.random().toString(36).substring(2, 6)}...`,
      txCount: 0,
      status: 'Connected',
      createdAt: Date.now(),
    };

    const updated = [newApp, ...apps];
    setApps(updated);
    localStorage.setItem('dustify_apps', JSON.stringify(updated));
    setAppName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Applications</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Register and manage your Midnight dApps authorized to use DUSTify fee-sponsorship.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <AppWindow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{app.id}</span>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{app.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-zinc-800/80">
              <div>
                <span className="text-zinc-500 text-[10px]">Allowed Origin:</span>
                <p className="text-zinc-300 truncate">{app.origin}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">Environment:</span>
                <p className="text-zinc-300">{app.env}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">API Key Prefix:</span>
                <p className="text-brand-300">{app.apiKeyPrefix}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px]">Relayed Txs:</span>
                <p className="text-white font-bold">{app.txCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0f0f13] border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Register New dApp</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Marketplace"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Allowed Origin (CORS)</label>
                <input
                  type="text"
                  placeholder="http://localhost:5173 or https://myapp.com"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Target Network</label>
                <input
                  type="text"
                  disabled
                  value="Midnight Preview (Testnet)"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono cursor-not-allowed"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Create Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
