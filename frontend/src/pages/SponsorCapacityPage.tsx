import React, { useState } from 'react';
import { Coins, AlertTriangle, CheckCircle2, ShieldCheck, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { RelayerTelemetry } from '../types';
import { apiClient } from '../lib/api';

interface SponsorCapacityPageProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  onRefresh: () => void;
}

export const SponsorCapacityPage: React.FC<SponsorCapacityPageProps> = ({
  telemetry,
  isOnline,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const sponsorAddress =
    telemetry?.sponsorAddress ||
    'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd';
  const hasDust = telemetry?.sponsorDustAvailability.hasDust ?? false;
  const balanceSpecks = telemetry?.sponsorDustAvailability.balanceSpecks || '0';
  const balanceDust = telemetry?.sponsorDustAvailability.balanceDust || '0.000000 DUST';

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sponsor Capacity</h2>
          <p className="text-xs text-zinc-400 mt-1">
            DUSTify sponsors eligible transaction fees using relayer-owned DUST capacity on Midnight Preview.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Balance</span>
        </button>
      </div>

      {/* Warning if 0 Specks */}
      {!hasDust && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Sponsor Wallet DUST Capacity Depleted</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            The configured sponsor master wallet currently has <strong>0 Specks</strong> of available DUST capacity.
            Live on-chain sponsored transaction execution requires testnet <code className="text-amber-300">tNIGHT</code> to
            generate DUST capacity across block epochs.
          </p>
          <div className="pt-2 text-xs font-mono text-zinc-400">
            <span>Sponsor Address: </span>
            <span className="text-zinc-200">{sponsorAddress}</span>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <span className="text-zinc-500 uppercase text-[10px] font-mono font-semibold">Available DUST</span>
          <div className="text-2xl font-bold text-white font-mono">{balanceSpecks} Specks</div>
          <p className="text-xs text-zinc-400 font-mono">{balanceDust}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <span className="text-zinc-500 uppercase text-[10px] font-mono font-semibold">Wallet Status</span>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                telemetry?.isSynced ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-lg font-bold text-white uppercase">
              {telemetry?.sponsorWalletSyncStatus || 'SYNCING'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">Warm sync active (~1.40s restore)</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <span className="text-zinc-500 uppercase text-[10px] font-mono font-semibold">Network Target</span>
          <div className="text-lg font-bold text-white uppercase">
            {telemetry?.network || 'MIDNIGHT PREVIEW'}
          </div>
          <p className="text-xs text-zinc-400">Substrate RPC WebSocket</p>
        </div>
      </div>

      {/* Sponsor Address Copy Box */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Sponsor Master Address</h3>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Address'}</span>
          </button>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 break-all">
          {sponsorAddress}
        </div>
      </div>

      {/* How Sponsorship Works Diagram */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
        <h3 className="text-sm font-semibold text-white">How Sponsorship Works on Midnight</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-brand-400 font-bold">1. tNIGHT Holding</span>
            <p className="text-zinc-400 font-sans leading-relaxed">
              Holding unshielded testnet NIGHT generates DUST capacity across block epochs on Midnight Preview.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-brand-400 font-bold">2. Fee Attachment</span>
            <p className="text-zinc-400 font-sans leading-relaxed">
              When an eligible transaction arrives, the Relayer executes <code className="text-zinc-300">balanceUnboundTransaction()</code> using sponsor DUST UTXOs.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-emerald-400 font-bold">3. 0 DUST User Flow</span>
            <p className="text-zinc-400 font-sans leading-relaxed">
              The user pays 0 DUST and spends 0 gas tokens, enabling seamless onboarding to privacy dApps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
