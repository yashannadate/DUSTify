import React, { useState, useEffect } from 'react';
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

  const cyclingPhrases = ['PROVE.', 'SPONSOR.', 'SUBMIT.'];
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % cyclingPhrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const sdkCode = `import { DustifyClient } from '@dustify/sdk';

// 1. Initialize the client with your issued API key
const dustify = new DustifyClient({
  relayerUrl: 'http://localhost:3001',
  apiKey: process.env.DUSTIFY_API_KEY || '<YOUR_API_KEY>',
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
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-brand-500/30 selection:text-white font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
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
                <div className="absolute top-full left-0 w-48 mt-1 p-2 rounded-xl bg-[#0f0f0f] border border-zinc-800 shadow-2xl space-y-1">
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
                <div className="absolute top-full left-0 w-48 mt-1 p-2 rounded-xl bg-[#0f0f0f] border border-zinc-800 shadow-2xl space-y-1">
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
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-black">
        {/* Subtle electric blue ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono tracking-wider uppercase text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>MIDNIGHT DEVELOPER INFRASTRUCTURE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              DUST WITHOUT THE FRICTION.
            </h1>

            {/* Subtle Animated Cycling Text Treatment */}
            <div className="flex items-center justify-center space-x-3 text-xs sm:text-sm font-mono font-bold tracking-widest text-zinc-500 pt-1">
              {cyclingPhrases.map((phrase, idx) => (
                <span
                  key={phrase}
                  className={`transition-all duration-300 px-2.5 py-1 rounded-md ${
                    idx === cycleIndex
                      ? 'text-white bg-brand-500 shadow-lg shadow-brand-500/40 scale-105'
                      : 'text-zinc-500 opacity-60'
                  }`}
                >
                  {phrase}
                </span>
              ))}
            </div>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              DUSTify abstracts DUST acquisition from the end user by letting trusted dApp backends sponsor transaction fees through a secure relayer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onLaunchDashboard('playground')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-xs sm:text-sm hover:bg-brand-600 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/30"
              >
                <span>Try DUSTify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onLaunchDashboard('docs')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>View Documentation</span>
              </button>
            </div>

            {/* Compact Technical Status Strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-950/90 border border-zinc-800/90 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-zinc-500">NETWORK:</span>
                <span className="font-semibold text-white">MIDNIGHT PREVIEW</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-950/90 border border-zinc-800/90 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-500">RELAYER:</span>
                <span className="font-semibold text-emerald-400">ONLINE</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-950/90 border border-zinc-800/90 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                <span className="text-zinc-500">CAPACITY:</span>
                <span className="font-semibold text-white">DUST SPONSORING</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-950/90 border border-zinc-800/90 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-zinc-500">EXECUTION:</span>
                <span className="font-semibold text-white">CLIENT-SIDE PROVING</span>
              </div>
            </div>
          </div>

          {/* Architecture Flow Visualizer */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 max-w-5xl mx-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800 text-xs">
              <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
                End-to-End Execution Pipeline
              </span>
              <span className="flex items-center space-x-1.5 text-brand-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Client Witness Kept Local</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">01</span>
                <span className="font-semibold text-white my-2">USER</span>
                <span className="text-[10px] text-zinc-400">Interacts with dApp</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">02</span>
                <span className="font-semibold text-white my-2">DAPP</span>
                <span className="text-[10px] text-zinc-400">Prepares Circuit</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-brand-500/30 text-brand-300 flex flex-col justify-between">
                <span className="text-[10px] text-brand-400">03</span>
                <span className="font-semibold my-2 text-white">LOCAL PROOF</span>
                <span className="text-[10px] text-zinc-400">0 DUST User Cost</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-brand-500/30 text-brand-300 flex flex-col justify-between">
                <span className="text-[10px] text-brand-400">04</span>
                <span className="font-semibold my-2 text-white">DUSTIFY SDK</span>
                <span className="text-[10px] text-zinc-400">WASM Binary Hex</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500">05</span>
                <span className="font-semibold text-white my-2">RELAYER API</span>
                <span className="text-[10px] text-zinc-400">Authenticates Key</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-brand-500/30 text-brand-300 flex flex-col justify-between">
                <span className="text-[10px] text-brand-400">06</span>
                <span className="font-semibold my-2 text-white">SPONSOR DUST</span>
                <span className="text-[10px] text-zinc-400">Balances UTXOs</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-emerald-300 flex flex-col justify-between">
                <span className="text-[10px] text-emerald-400">07</span>
                <span className="font-semibold my-2 text-white">MIDNIGHT</span>
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

      {/* 4. HOW DUSTify WORKS SECTION */}
      <section id="how-it-works" className="py-24 border-t border-zinc-800/80 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono uppercase tracking-widest">
              <span>Architecture &amp; Lifecycle</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              HOW DUSTify WORKS
            </h2>
            <div className="space-y-1 text-xl sm:text-2xl font-bold text-zinc-100">
              <p>Built a Midnight DApp?</p>
              <p className="text-brand-400">Don't make every user manage DUST.</p>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto pt-2">
              DUSTify lets Midnight DApp developers sponsor transaction fees for their users through a dedicated relayer. Users authorize their actions while DUSTify handles the sponsor-side DUST and transaction submission infrastructure.
            </p>
            {/* Core Product Messages */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-brand-500/30 text-xs font-mono text-white">
                "Your users use the DApp. <span className="text-brand-400 font-bold">DUSTify handles the DUST.</span>"
              </div>
              <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300">
                "Sponsor transaction fees without building the relayer infrastructure yourself."
              </div>
            </div>
          </div>

          {/* Animated Electric-Blue Flow Indicator */}
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider pb-3 border-b border-zinc-800 text-center">
              Active Transaction Pipeline Flow
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-xs font-mono text-center">
              <div className="flex-1 w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                User Action
              </div>
              <span className="text-brand-400 font-bold hidden sm:inline">→</span>
              <span className="text-brand-400 font-bold sm:hidden">↓</span>
              <div className="flex-1 w-full p-2.5 rounded-lg bg-zinc-900 border border-brand-500/40 text-brand-300">
                Local Proof
              </div>
              <span className="text-brand-400 font-bold hidden sm:inline">→</span>
              <span className="text-brand-400 font-bold sm:hidden">↓</span>
              <div className="flex-1 w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                UnboundTransaction
              </div>
              <span className="text-brand-400 font-bold hidden sm:inline">→</span>
              <span className="text-brand-400 font-bold sm:hidden">↓</span>
              <div className="flex-1 w-full p-2.5 rounded-lg bg-zinc-900 border border-brand-500/40 text-white font-bold shadow-sm shadow-brand-500/20">
                DUSTify Sponsor
              </div>
              <span className="text-brand-400 font-bold hidden sm:inline">→</span>
              <span className="text-brand-400 font-bold sm:hidden">↓</span>
              <div className="flex-1 w-full p-2.5 rounded-lg bg-zinc-900 border border-emerald-500/40 text-emerald-300">
                Midnight Preview
              </div>
            </div>
          </div>

          {/* TWO PERSPECTIVES: LEFT (DAPP DEVELOPER) vs RIGHT (END USER) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: FOR THE DAPP DEVELOPER */}
            <div className="p-7 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                    For the DApp Developer
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">BACKEND / OPERATOR</span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">YOUR DApp</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You build your product normally. DUSTify integrates into your trusted backend to handle the sponsor-side fee balancing and network broadcast.
                </p>

                <ol className="space-y-3 pt-2 text-xs text-zinc-300 font-sans">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">1</span>
                    <span><strong>Build normally:</strong> Write your Midnight DApp and Compact smart contract with standard business logic.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">2</span>
                    <span><strong>Integrate SDK:</strong> Install <code className="text-brand-300 font-mono">@dustify/sdk</code> into your trusted backend or serverless route.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">3</span>
                    <span><strong>Configure Secret Key:</strong> Store your server-side <code className="text-brand-300 font-mono">DUSTIFY_API_KEY</code> securely in environment variables.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">4</span>
                    <span><strong>Maintain DUST Capacity:</strong> Hold sponsor-owned tNIGHT UTXOs continuously generating DUST capacity.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">5</span>
                    <span><strong>Relay Payload:</strong> When a user performs an eligible action, your backend dispatches the authorized <code className="text-brand-300 font-mono">UnboundTransaction</code> payload to DUSTify.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center">6</span>
                    <span><strong>Automated Submission:</strong> DUSTify validates the request, balances fees with <code className="text-brand-300 font-mono">balanceUnboundTransaction()</code>, seals via <code className="text-brand-300 font-mono">finalizeRecipe()</code>, and submits to Midnight Preview.</span>
                  </li>
                </ol>

                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Developer Architecture Flow</div>
                  <div className="text-brand-400 font-bold text-xs pt-1">
                    YOUR DApp ──► User-authorized transaction ──► DUSTify Relayer ──► Sponsor DUST ──► Midnight Preview
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 font-mono">
                ⚠️ <strong>DEVELOPER CREDENTIAL NOTICE:</strong> The API key belongs strictly to the backend operator. End users never touch, see, or enter an API key.
              </div>
            </div>

            {/* RIGHT: FOR THE END USER */}
            <div className="p-7 sm:p-8 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                    For the End User
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">SEAMLESS USER EXPERIENCE</span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">YOUR USERS</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The end user simply experiences your application. No faucet navigation, no waiting for DUST generation, and 0 DUST paid by the sponsored end user.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                    <span className="text-[11px] font-semibold text-white font-mono uppercase tracking-wider">Realistic User Flow:</span>
                    <div className="flex flex-col space-y-2 text-xs font-mono text-zinc-300">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        <span>1. Open DApp in browser</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        <span>2. Choose action (<code className="text-brand-300">"Vote"</code>, <code className="text-brand-300">"Mint"</code>, <code className="text-brand-300">"Submit"</code>, <code className="text-brand-300">"Update"</code>, <code className="text-brand-300">"Claim"</code>)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        <span>3. Authorize the transaction (local ZK witness evaluation)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        <span>4. DUSTify sponsors the transaction fee behind the scenes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>5. Transaction submitted directly to Midnight Preview</span>
                      </div>
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>6. Done! State mutated on-chain.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">User Experience Flow</div>
                    <div className="text-emerald-400 font-bold text-xs pt-1">
                      Open DApp ──► Choose Action ──► Authorize ──► DUSTify Sponsors Fee ──► Midnight ──► Done
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <span className="font-semibold text-white">Policy Scoping:</span>
                <p>Sponsorship is explicitly applied to <span className="text-brand-300 font-semibold">"sponsored actions configured by the DApp"</span> rather than blanket blind execution.</p>
              </div>
            </div>

          </div>

          {/* VISUAL SIDE-BY-SIDE COMPARISON: WITHOUT DUSTify vs WITH DUSTify */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                REMOVE THE DUST ONBOARDING FRICTION
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Your users interact with your application first. Your infrastructure handles transaction sponsorship behind the scenes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* WITHOUT DUSTify */}
              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-red-500/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                  <span className="font-bold text-red-400">WITHOUT DUSTify (HIGH FRICTION)</span>
                  <span className="text-zinc-500">TRADITIONAL FLOW</span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 text-zinc-300">1. DApp interaction</div>
                  <div className="text-center text-zinc-600">↓</div>
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-red-300">2. User discovers they need transaction resources</div>
                  <div className="text-center text-zinc-600">↓</div>
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-red-300">3. Acquire &amp; manage NIGHT and DUST tokens</div>
                  <div className="text-center text-zinc-600">↓</div>
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-900/40 text-red-300">4. DUST generation &amp; wallet preparation (10+ min wait)</div>
                  <div className="text-center text-zinc-600">↓</div>
                  <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 text-zinc-300">5. Sign gas fee deduction</div>
                  <div className="text-center text-zinc-600">↓</div>
                  <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 text-zinc-300">6. Submit to Midnight</div>
                </div>
              </div>

              {/* WITH DUSTify */}
              <div className="p-6 rounded-2xl bg-zinc-950/80 border border-brand-500/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                  <span className="font-bold text-brand-400">WITH DUSTify (ZERO USER GAS FRICTION)</span>
                  <span className="text-emerald-400">SPONSORED RELAY</span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="p-2.5 rounded bg-zinc-900/70 border border-zinc-800 text-white font-semibold">1. DApp interaction</div>
                  <div className="text-center text-brand-400">↓</div>
                  <div className="p-2.5 rounded bg-brand-950/30 border border-brand-500/30 text-brand-200">2. User performs action &amp; authorizes transaction</div>
                  <div className="text-center text-brand-400">↓</div>
                  <div className="p-2.5 rounded bg-brand-950/30 border border-brand-500/30 text-white font-bold">3. DUSTify sponsors DUST fee via backend relayer</div>
                  <div className="text-center text-brand-400">↓</div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-semibold">4. Confirmed on Midnight Preview</div>
                </div>
              </div>
            </div>
          </div>

          {/* IMPORTANT SECURITY EXPLANATION: WHO CONTROLS WHAT? */}
          <div className="p-7 sm:p-9 rounded-3xl bg-zinc-950/90 border border-zinc-800 space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
                Security &amp; Cryptographic Trust Boundary
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                WHO CONTROLS WHAT?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
                DUSTify cleanly decouples transaction fee funding from identity and zero-knowledge witness generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* USER */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center space-x-2 text-white font-mono font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>USER</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-400 font-bold">✓</span>
                    <span>Authorizes the transaction</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-400 font-bold">✓</span>
                    <span>Keeps their private keys strictly on client</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-400 font-bold">✓</span>
                    <span>Performs required client-side Compact proving</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-brand-400 font-bold">✓</span>
                    <span>Does not receive or need the sponsor's wallet credentials</span>
                  </li>
                </ul>
              </div>

              {/* DUSTIFY / SPONSOR */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                <div className="flex items-center space-x-2 text-white font-mono font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>DUSTify / SPONSOR</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Holds sponsor-side DUST capacity from registered tNIGHT</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Validates incoming requests with <code className="text-brand-300 font-mono">x-api-key</code></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Attaches sponsor DUST via <code className="text-brand-300 font-mono">balanceUnboundTransaction()</code></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Finalizes recipe &amp; submits transaction to Midnight Preview</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Does NOT receive or request the user's private keys</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Visual Separation Cascade */}
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 text-center font-mono text-xs space-y-2">
              <div className="text-zinc-300">
                <span className="text-brand-400 font-bold">USER SIDE:</span> Private keys • Local proving • Transaction intent
              </div>
              <div className="text-zinc-500">↓</div>
              <div className="text-zinc-300">
                <span className="text-brand-400 font-bold">DUSTify RELAYER:</span> Authentication • Validation • DUST balancing • Submission
              </div>
              <div className="text-zinc-500">↓</div>
              <div className="text-emerald-400 font-bold">
                MIDNIGHT PREVIEW: Proof validation • Fee validation • State transition
              </div>
            </div>
          </div>

          {/* API KEY = DEVELOPER CREDENTIAL CALLOUT */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-brand-500/30 max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2 text-white font-mono font-bold text-sm">
                <Lock className="w-4 h-4 text-brand-400" />
                <span>API KEY = DEVELOPER CREDENTIAL</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                Backend-to-Relayer Secret
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              The DUSTify API key is used exclusively by the DApp's trusted backend to authenticate with the relayer gateway. It is <strong>NOT</strong> required by normal end users. Never expose the API key in public frontend code or browser bundles.
            </p>
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-300 flex items-center justify-between">
              <span>DApp Backend &nbsp;──[ x-api-key: &lt;YOUR_API_KEY&gt; ]──► &nbsp;DUSTify Relayer</span>
              <span className="text-[10px] text-zinc-500">Server-side Only</span>
            </div>
          </div>

          {/* REALISTIC EXAMPLE: PRIVATE VOTING DApp */}
          <div className="p-7 sm:p-9 rounded-3xl bg-zinc-950/90 border border-zinc-800 max-w-5xl mx-auto space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold">
                Real-World dApp Scenario
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                EXAMPLE: PRIVATE VOTING DApp
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                <span className="font-bold text-red-400">Without DUSTify:</span>
                <p className="text-zinc-400 leading-relaxed font-sans">
                  User opens PrivateVote → discovers they need DUST → prepares wallet resources → waits for DUST availability → finally votes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-brand-500/30 space-y-3">
                <span className="font-bold text-brand-400">With DUSTify:</span>
                <p className="text-zinc-200 leading-relaxed font-sans">
                  User opens PrivateVote → clicks "Vote" → authorizes the action → DUSTify sponsors the DUST fee → Midnight processes the transaction → Vote submitted.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 italic text-center font-sans">
              "The user doesn't need to understand the underlying DUST sponsorship infrastructure to use the application."
            </p>
          </div>

          {/* SECTION CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onLaunchDashboard('developers')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-500 text-white font-semibold text-xs sm:text-sm hover:bg-brand-600 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/30"
            >
              <span>BUILD WITH DUSTify</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onLaunchDashboard('playground')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>TRY THE DEMO</span>
            </button>
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
