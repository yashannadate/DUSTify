import React, { useState } from 'react';
import { User, Cpu, Server, Wallet, ShieldCheck, CheckCircle } from 'lucide-react';

export const FlowVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 0,
      title: '1. User Action',
      icon: User,
      badge: '0 DUST Cost',
      badgeColor: 'bg-dust-cyan/20 text-dust-cyan border-dust-cyan/30',
      description: 'End user executes dApp action (e.g. vote, message). User does NOT have or need DUST tokens or faucet setup.',
      boundary: 'Client Boundary',
      boundaryColor: 'border-cyan-500/40 text-cyan-400',
      details: [
        'User initiates state transition via dApp UI',
        'Private keys & secret witness never leave browser',
        '0 NIGHT & 0 DUST capacity required from user',
      ],
    },
    {
      id: 1,
      title: '2. Local ZK Prover',
      icon: Cpu,
      badge: 'Kachina Protocol',
      badgeColor: 'bg-dust-purple/20 text-dust-purple border-dust-purple/30',
      description: 'Local prover evaluates Compact circuit with private witness, outputting an unshielded/shielded UnboundTransaction.',
      boundary: 'Local Proving',
      boundaryColor: 'border-purple-500/40 text-purple-400',
      details: [
        'Proof generated locally via Docker Proof Server / WASM',
        'Produces valid cryptographic ZK proof',
        'Transaction lacks gas inputs (UnboundTransaction)',
      ],
    },
    {
      id: 2,
      title: '3. DUSTify Relayer API',
      icon: Server,
      badge: 'Binary REST API',
      badgeColor: 'bg-dust-blue/20 text-dust-blue border-dust-blue/30',
      description: 'Client SDK serializes UnboundTransaction to native binary and dispatches to DUSTify Relayer via authenticated REST API.',
      boundary: 'Relayer Gateway',
      boundaryColor: 'border-blue-500/40 text-blue-400',
      details: [
        'POST /api/v1/relay with x-api-key authentication',
        'WASM binary deserialization: Transaction.deserialize()',
        'In-memory rate limiting and origin validation',
      ],
    },
    {
      id: 3,
      title: '4. Sponsor DUST Wallet',
      icon: Wallet,
      badge: 'Fee Sponsorship',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Relayer backend executes balanceUnboundTransaction() with Master DUST Wallet, attaching fee inputs without modifying user witness.',
      boundary: 'Sponsorship Engine',
      boundaryColor: 'border-emerald-500/40 text-emerald-400',
      details: [
        'balanceUnboundTransaction(unboundTx, { shielded, dust }, { ttl })',
        'Attaches verified DUST fee UTXOs from Sponsor Wallet',
        'finalizeRecipe() seals the FinalizedTransaction',
      ],
    },
    {
      id: 4,
      title: '5. Midnight Preview',
      icon: ShieldCheck,
      badge: 'On-Chain Settlement',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Relayer submits FinalizedTransaction to Midnight Preview Node RPC. Transaction settles on ledger, confirming state transition.',
      boundary: 'Midnight Ledger',
      boundaryColor: 'border-amber-500/40 text-amber-400',
      details: [
        'submitTransaction(finalizedTx) dispatches to Node RPC',
        'Preview indexer registers public ledger mutation',
        'User receives confirmed TxId with 0 gas spent',
      ],
    },
  ];

  return (
    <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-3">
          Gas Sponsorship Architecture
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          How DUSTify intercepts client-generated ZK proofs and attaches DUST fee inputs on Midnight Preview without compromising user privacy.
        </p>
      </div>

      {/* Interactive Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isSelected = activeStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 relative border ${
                isSelected
                  ? 'border-dust-cyan bg-white/10 shadow-lg shadow-dust-cyan/15 scale-[1.02]'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-dust-cyan to-dust-blue text-midnight-950 font-bold'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${step.badgeColor}`}>
                  {step.badge}
                </span>
              </div>

              <h3 className={`text-sm font-bold font-display mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {step.description}
              </p>

              {/* Progress Indicator */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className={`font-mono ${step.boundaryColor}`}>{step.boundary}</span>
                {isSelected && <span className="text-dust-cyan font-bold">Active View</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Detail Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.07] to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-dust-cyan/10 border border-dust-cyan/30 text-dust-cyan">
                {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-dust-cyan">
                  Step {activeStep + 1} of 5 Details
                </span>
                <h4 className="text-xl font-bold font-display text-white">
                  {steps[activeStep].title}
                </h4>
              </div>
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {steps[activeStep].description}
            </p>

            <ul className="space-y-2 pt-2">
              {steps[activeStep].details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-dust-cyan flex-shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-midnight-950/80 border border-white/10 font-mono text-xs text-slate-300 space-y-2 min-w-[320px]">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-2">
              Architectural Boundary State
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">User DUST Balance:</span>
              <span className="text-emerald-400 font-bold">0 DUST (No funds needed)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">ZK Witness Privacy:</span>
              <span className="text-dust-cyan font-bold">100% Client-Side</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Transaction State:</span>
              <span className="text-purple-400 font-semibold">
                {activeStep <= 1 ? 'UnboundTransaction' : activeStep <= 3 ? 'Recipe Balanced' : 'Finalized On-Chain'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Settlement Target:</span>
              <span className="text-amber-400 font-semibold">Midnight Preview</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
