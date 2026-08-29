import React from 'react';
import { ShieldCheck, Lock, Key, EyeOff, Server, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="space-y-3 pb-4 border-b border-zinc-800/80">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kachina Protocol Compliance</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Privacy by Architecture</h2>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
          DUSTify sponsors transaction fees without taking custody of user identity secrets, private keys,
          or zero-knowledge witness states.
        </p>
      </div>

      {/* Privacy Boundary Dual-Panel Diagram */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div className="text-center max-w-md mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Cryptographic Separation
          </span>
          <h3 className="text-base font-semibold text-white mt-0.5">The Safe Relay Boundary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Panel 1: User Device */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-brand-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-brand-300">
                <Lock className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  USER DEVICE (CLIENT)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                STAYS ON DEVICE
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 font-mono">
              <li className="flex items-center space-x-2">
                <span className="text-brand-400">🔒</span>
                <span>User Private Keys & Keystores</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-brand-400">🔒</span>
                <span>BIP-39 Mnemonic Seed Phrase</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-brand-400">🔒</span>
                <span>Private Witness Computation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-brand-400">🔒</span>
                <span>Local ZK Proof Generation (0 DUST)</span>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-zinc-500 leading-relaxed font-sans">
              Witness evaluation and circuit constraints execute strictly inside browser memory.
            </div>
          </div>

          {/* Panel 2: DUSTify Relayer */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-emerald-300">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  DUSTIFY RELAYER (SERVER)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FEE ABSTRACTION
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 font-mono">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Receives UnboundTransaction WASM binary</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Balances fee with Sponsor-owned DUST</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Seals transaction recipe</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>Broadcasts to Midnight Preview Node RPC</span>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-zinc-500 leading-relaxed font-sans">
              The relayer possesses 0 access to client secrets; tampering invalidates the ZK proof.
            </div>
          </div>
        </div>
      </div>

      {/* 4 Security Guarantees Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. No User Key Custody */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Key className="w-4 h-4 text-brand-400" />
            <span>No User Key Custody</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            DUSTify neither requests, receives, nor stores user private keys or credentials. Authentication is
            handled exclusively via dApp API keys.
          </p>
        </div>

        {/* 2. Local Privacy */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <EyeOff className="w-4 h-4 text-emerald-400" />
            <span>Local Privacy Preservation</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            In compliance with Midnight's Kachina model, private application witnesses are calculated locally.
            Only the finalized zero-knowledge proof is dispatched.
          </p>
        </div>

        {/* 3. Sponsor Isolation */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <Server className="w-4 h-4 text-brand-400" />
            <span>Sponsor Wallet Isolation</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The Master Sponsor wallet is isolated within the Relayer backend environment, preventing client-side
            dApps from draining fee capacity.
          </p>
        </div>

        {/* 4. Replay-Aware Architecture */}
        <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Replay-Aware Architecture</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Designed around Kachina protocol nullifier sets to prevent double-spending on-chain, and balanced recipes
            enforce strict 3-minute expiration deadlines (`ttl`). Full on-chain replay verification is activated upon sponsor funding.
          </p>
        </div>
      </div>
    </div>
  );
};
