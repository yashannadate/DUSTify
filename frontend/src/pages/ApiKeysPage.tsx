import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Copy, Check, ShieldCheck, X, AlertTriangle, Info } from 'lucide-react';
import { ApiKeyRecord } from '../types';

function generateSecureApiKey(): string {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return `dustify_${hex}`;
}

export const ApiKeysPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dustify_api_keys');
    if (saved) {
      setKeys(JSON.parse(saved));
    } else {
      const defaultKeys: ApiKeyRecord[] = [
        {
          id: 'key_preview_default',
          name: 'Primary Relayer Secret',
          prefix: 'dustify_dev_key_...',
          createdAt: Date.now() - 604800000,
          lastUsed: 'Just now',
          status: 'Active',
        },
        {
          id: 'key_demo_app',
          name: 'Demo Counter Application',
          prefix: 'dustify_demo_app_...',
          createdAt: Date.now() - 259200000,
          lastUsed: '5 minutes ago',
          status: 'Active',
        },
      ];
      setKeys(defaultKeys);
      localStorage.setItem('dustify_api_keys', JSON.stringify(defaultKeys));
    }
  }, []);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    // Cryptographically secure key generation
    const rawSecret = generateSecureApiKey();
    
    // Store only non-sensitive metadata and masked prefix — never store full plaintext secret
    const newRecord: ApiKeyRecord = {
      id: `key_${Date.now().toString(36)}`,
      name: keyName.trim(),
      prefix: `${rawSecret.substring(0, 16)}...`,
      createdAt: Date.now(),
      lastUsed: 'Never',
      status: 'Active',
    };

    const updated = [newRecord, ...keys];
    setKeys(updated);
    localStorage.setItem('dustify_api_keys', JSON.stringify(updated));
    setNewlyCreatedKey(rawSecret);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setKeyName('');
    setNewlyCreatedKey(null); // Wipe secret from memory
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">API Keys & Authentication</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage authentication credentials for the DUSTify Relayer gateway.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Architecture Scope Notice */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
        <div className="flex items-center space-x-2 text-brand-400 font-semibold">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Level 4 MVP Architecture Scope</span>
        </div>
        <p className="text-zinc-400 leading-relaxed pl-6">
          The DUSTify Level 4 relayer authenticates requests via the <code className="text-brand-300">x-api-key</code> header validated against the server-side <code className="text-zinc-200">DUSTIFY_API_KEY</code> environment secret. The dashboard provides cryptographic key generation and prefix tracking. Multi-tenant database key isolation and self-service key rotation are scheduled for the Level 5 production roadmap.
        </p>
      </div>

      {/* API Keys Table */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="pb-3 pl-2">Key Name</th>
                <th className="pb-3">Key Prefix</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Used</th>
                <th className="pb-3 pr-2 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300 text-[11px]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 pl-2 font-sans font-semibold text-white">{k.name}</td>
                  <td className="py-3.5 text-brand-300">{k.prefix}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-zinc-400 font-sans">{k.lastUsed}</td>
                  <td className="py-3.5 pr-2 text-right text-zinc-500 font-sans">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0f0f13] border border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Create New API Key</h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!newlyCreatedKey ? (
              <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium">Key Description / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staging Relayer Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="pt-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-amber-200">
                      Secret Key Generated — Store Securely
                    </p>
                    <p className="text-[10px] leading-relaxed text-amber-300/80">
                      This secret key is shown only once. It is not saved in plaintext and cannot be recovered after leaving this screen. Store it in your backend environment variables.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-brand-300 break-all flex items-center justify-between">
                  <span>{newlyCreatedKey}</span>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey, 'newKey')}
                    className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 ml-2 flex-shrink-0"
                  >
                    {copiedKey === 'newKey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors"
                >
                  I have saved this key
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
