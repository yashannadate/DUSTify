import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Code2,
  Cpu,
  Coins,
  Server,
  Zap,
  Lock,
  ChevronDown,
  Layers,
  Sparkles,
  Check,
  Copy,
} from 'lucide-react';
import { RelayerTelemetry } from '../types';

interface LandingPageProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  onLaunchDashboard: (initialTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  telemetry,
  isOnline,
  onLaunchDashboard,
}) => {
  const [productOpen, setProductOpen] = useState(false);
  const [devsOpen, setDevsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sdkCode = `import { DustifyClient } from '@dustify/sdk';

// 1. Initialize the client with your issued API key
const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',
  apiKey: 'dustify_dev_key_preview_2026',
});

// 2. User evaluates Compact circuit locally (Witness stays in memory)
const unboundTx = await proofProvider.proveTx(unprovenTx);

// 3. One-line fee sponsorship & on-chain relay
const result = await dustify.sponsorAndSubmit(unboundTx, {
  circuitId: 'storeMessage',
});

if (result.status === 'CONFIRMED') {
  console.log('Confirmed on Midnight Preview! TxId:', result.txId);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setProductOpen(false);
    setDevsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-brand-500/30 selection:text-brand-300 font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <span className="text-base font-bold">🌙</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold tracking-tight text-white">DUSTify</span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                Preview
              </span>
            </div>
          </div>

          {/* Center Navigation Links & Dropdowns */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-zinc-400">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProductOpen(!productOpen);
                  setDevsOpen(false);
                }}
                className="flex items-center space-x-1 hover:text-white transition-colors py-2"
              >
                <span>Product</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {productOpen && (
                <div className="absolute top-full left-0 w-48 mt-1 p-2 rounded-xl bg-[#0f0f13] border border-zinc-800 shadow-2xl space-y-1">
                  <button
                    onClick={() => scrollTo('how-it-works')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => onLaunchDashboard('relayer')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    Sponsor Relayer
                  </button>
                  <button
                    onClick={() => scrollTo('security')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    Security
                  </button>
                </div>
              )}
            </div>

            {/* Developers Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setDevsOpen(!devsOpen);
                  setProductOpen(false);
                }}
                className="flex items-center space-x-1 hover:text-white transition-colors py-2"
              >
                <span>Developers</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {devsOpen && (
                <div className="absolute top-full left-0 w-48 mt-1 p-2 rounded-xl bg-[#0f0f13] border border-zinc-800 shadow-2xl space-y-1">
                  <button
                    onClick={() => scrollTo('integration')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    SDK Quickstart
                  </button>
                  <button
                    onClick={() => onLaunchDashboard('docs')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    API Reference
                  </button>
                  <button
                    onClick={() => onLaunchDashboard('playground')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg"
                  >
                    Interactive Playground
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => onLaunchDashboard('docs')} className="hover:text-white transition-colors">
              Docs
            </button>
            <button onClick={() => scrollTo('architecture')} className="hover:text-white transition-colors">
              Architecture
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/yashannadate/DUSTify"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg border border-transparent hover:border-zinc-700 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => onLaunchDashboard('overview')}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-all shadow-md"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MIDNIGHT NETWORK · PREVIEW</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Build Midnight dApps. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-brand-400">
                Leave the DUST friction behind.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              DUSTify is a developer infrastructure layer for Midnight that enables sponsored transaction flows.
              Your application users interact with your dApp while DUSTify routes eligible transactions through a
              sponsor-powered relayer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onLaunchDashboard('playground')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-brand-950/40"
              >
                <span>Explore the Playground</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onLaunchDashboard('docs')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Read the Docs</span>
              </button>
            </div>
          </div>

          {/* Architecture Flow Visualizer */}
          <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800 text-xs">
              <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
                End-to-End Execution Pipeline
              </span>
              <span className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Client Privacy Kept</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">01</span>
                <span className="font-semibold text-white my-2">USER</span>
                <span className="text-[10px] text-zinc-400">Interacts with dApp</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">02</span>
                <span className="font-semibold text-white my-2">DAPP</span>
                <span className="text-[10px] text-zinc-400">Prepares Circuit</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-brand-500/30 text-brand-300 flex flex-col justify-between">
                <span className="text-[10px] text-brand-400">03</span>
                <span className="font-semibold my-2">LOCAL PROOF</span>
                <span className="text-[10px] text-zinc-400">0 DUST Spent</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-brand-500/30 text-brand-300 flex flex-col justify-between">
                <span className="text-[10px] text-brand-400">04</span>
                <span className="font-semibold my-2">DUSTIFY SDK</span>
                <span className="text-[10px] text-zinc-400">WASM Binary Hex</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">05</span>
                <span className="font-semibold text-white my-2">RELAYER API</span>
                <span className="text-[10px] text-zinc-400">Authenticates Key</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-emerald-300 flex flex-col justify-between">
                <span className="text-[10px] text-emerald-400">06</span>
                <span className="font-semibold my-2">SPONSOR DUST</span>
                <span className="text-[10px] text-zinc-400">Balances UTXOs</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 text-emerald-300 flex flex-col justify-between">
                <span className="text-[10px] text-emerald-400">07</span>
                <span className="font-semibold my-2">MIDNIGHT</span>
                <span className="text-[10px] text-zinc-400">On-Chain Block</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM / SOLUTION SECTION */}
      <section className="py-20 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Midnight applications should not make every user a fee expert.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Web3 privacy applications often stumble on initial user onboarding friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem Card 1 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">DUST Friction</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Fee-paying capacity introduces additional onboarding and transaction flow complexity, forcing users
                to locate testnet faucets before trying your app.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-brand-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Relayer Infrastructure</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Developers need a secure, rate-limited way to manage sponsored transaction execution without exposing
                master wallet keys to the browser.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Developer Complexity</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Wallet synchronization and transaction lifecycle handling can add friction to application
                development. DUSTify simplifies this to a single SDK call.
              </p>
            </div>
          </div>

          {/* DUSTify Solution Callout Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600/10 via-zinc-900 to-zinc-900 border border-brand-500/20 text-center">
            <span className="text-xs font-mono text-brand-400 uppercase tracking-wider font-semibold">
              The DUSTify Solution
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              One integration layer for sponsored Midnight transaction flows.
            </h3>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
              Step-by-Step Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From user interaction to on-chain execution.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  STEP 01
                </span>
                <h4 className="text-sm font-semibold text-white mt-3">User interacts</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The user uses the developer's Midnight application normally.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
                0 DUST required
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  STEP 02
                </span>
                <h4 className="text-sm font-semibold text-white mt-3">Transaction generated locally</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The application prepares the transaction and required application proof locally.
                </p>
              </div>
              <div className="text-[10px] font-mono text-brand-400 pt-2 border-t border-zinc-800">
                Local ZK Witness
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  STEP 03
                </span>
                <h4 className="text-sm font-semibold text-white mt-3">SDK routes the payload</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  <code className="text-brand-300">@dustify/sdk</code> sends the eligible payload to the configured relayer.
                </p>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800">
                WASM Serialization
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  STEP 04
                </span>
                <h4 className="text-sm font-semibold text-white mt-3">Sponsor balances fees</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The sponsor wallet balances the transaction using sponsor-owned DUST capacity.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 pt-2 border-t border-zinc-800">
                balanceUnboundTx
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  STEP 05
                </span>
                <h4 className="text-sm font-semibold text-white mt-3">Submitted to Midnight</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  The finalized transaction is submitted to the configured Midnight network.
                </p>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 pt-2 border-t border-zinc-800">
                Node RPC Broadcast
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-center text-xs text-zinc-400 font-mono">
            🔒 Private keys and private witness material are never handed to the DUSTify relayer.
          </div>
        </div>
      </section>

      {/* 5. DEVELOPER INTEGRATION SECTION */}
      <section id="integration" className="py-20 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
              Developer SDK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Integrate in minutes, not weeks.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Install <code className="text-brand-300">@dustify/sdk</code> and sponsor your first transaction with a single call.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative rounded-2xl bg-zinc-950 border border-zinc-800 p-6 font-mono text-xs text-zinc-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 text-zinc-500 text-[11px]">
              <span>src/integration.ts</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto leading-relaxed">{sdkCode}</pre>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => onLaunchDashboard('docs')}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              View SDK Docs
            </button>
            <button
              onClick={() => onLaunchDashboard('playground')}
              className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors"
            >
              Open Playground
            </button>
          </div>
        </div>
      </section>

      {/* 6. ARCHITECTURE SECTION */}
      <section id="architecture" className="py-20 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
              Kachina Privacy Alignment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Designed around Midnight's privacy model.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clear cryptographic zones ensure user secrets never leave client device memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Zone 1: Client Device */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-brand-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-brand-400 uppercase font-mono">CLIENT DEVICE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300">
                  Private
                </span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-zinc-300">
                <li className="flex items-center space-x-2">
                  <span className="text-brand-400">✓</span>
                  <span>dApp Web Application</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-brand-400">✓</span>
                  <span>User Private Identity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-brand-400">✓</span>
                  <span>Local Witness Evaluation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-brand-400">✓</span>
                  <span>ZK Proof Generation</span>
                </li>
              </ul>
            </div>

            {/* Zone 2: DUSTify Infrastructure */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-white uppercase font-mono">DUSTIFY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Relayer
                </span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-zinc-300">
                <li className="flex items-center space-x-2">
                  <span className="text-zinc-400">✓</span>
                  <span>@dustify/sdk Client</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-zinc-400">✓</span>
                  <span>Authenticated Relayer API</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-zinc-400">✓</span>
                  <span>Sponsor Master Wallet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-zinc-400">✓</span>
                  <span>Transaction Fee Balancing</span>
                </li>
              </ul>
            </div>

            {/* Zone 3: Midnight Network */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-emerald-400 uppercase font-mono">MIDNIGHT NETWORK</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                  On-Chain
                </span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-zinc-300">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Preview GraphQL Indexer</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Substrate Node RPC</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>State Settlement & Blocks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Kachina State Transition</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECURITY SECTION */}
      <section id="security" className="py-20 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
              Security Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built for sponsored execution, with clear boundaries.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Private material stays local</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                User credentials, secret keys, and raw zero-knowledge witness computations remain on the client device
                at all times.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Authenticated relayer access</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                dApp API keys and origin controls protect relayer endpoints from spam, unauthorized callers, and
                sybil abuse.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Sponsor isolation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sponsor credentials remain securely within the Relayer backend environment and are never transmitted
                to frontend code.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <h3 className="text-sm font-semibold text-white">Replay-aware architecture</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kachina nullifier sets and balanced recipe time-to-live (<code className="text-brand-300">ttl</code>)
                deadlines guard against replay attempts. On-chain replay settlement verification is active upon sponsor funding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA & FOOTER */}
      <section className="py-20 border-t border-zinc-800/80 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start building Midnight experiences with less fee friction.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Explore our developer dashboard, test the live playground, or clone the repository to run locally.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onLaunchDashboard('overview')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Developer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/yashannadate/DUSTify"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span>🌙 DUSTify</span>
            <span>•</span>
            <span>Built for Midnight Network</span>
            <span>•</span>
            <span className="text-emerald-400">Preview</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com/yashannadate/DUSTify" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
              GitHub
            </a>
            <button onClick={() => onLaunchDashboard('docs')} className="hover:text-zinc-300">
              Documentation
            </button>
            <button onClick={() => scrollTo('architecture')} className="hover:text-zinc-300">
              Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
