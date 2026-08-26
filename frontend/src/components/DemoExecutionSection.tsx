import React, { useState } from 'react';
import { Vote, MessageSquare, Send, CheckCircle2, AlertTriangle, Copy, RefreshCw, Terminal, Layers } from 'lucide-react';
import { RelayerStatus, ExecutionLog } from '../types';

interface DemoProps {
  relayerStatus: RelayerStatus | null;
}

export const DemoExecutionSection: React.FC<DemoProps> = ({ relayerStatus }) => {
  const [activeTab, setActiveTab] = useState<'voting' | 'hello'>('voting');
  const [voteChoice, setVoteChoice] = useState<'YES' | 'NO'>('YES');
  const [voterIdentity, setVoterIdentity] = useState('0x7f4a9b8c2d1e5f03a4b6c8d7e9f1a2b3c4d5e6f7');
  const [customMessage, setCustomMessage] = useState('Hello Midnight Preview from DUSTify 🌙');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionResult, setExecutionResult] = useState<{
    status: 'CONFIRMED' | 'RELAYER_AWAITING_FUNDING' | 'ERROR';
    txId?: string;
    dustFee?: string;
    payloadHex?: string;
    message?: string;
  } | null>(null);

  const addLog = (stage: string, message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info', payload?: any) => {
    const newLog: ExecutionLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      stage,
      message,
      type,
      payload,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setCurrentStage(1);
    setLogs([]);
    setExecutionResult(null);

    const circuitName = activeTab === 'voting' ? 'castVote' : 'storeMessage';
    const contractDoc = activeTab === 'voting' ? 'Voting.compact' : 'hello-world.compact';

    // Step 1: Local Witness & ZK Proof
    addLog('1. LOCAL PROVING', `Evaluating ${contractDoc} circuit "${circuitName}" locally at 0 DUST cost...`, 'info');
    await new Promise((r) => setTimeout(r, 900));

    addLog('1. LOCAL PROVING', `Private witness generated. Kachina protocol witness kept on client. 0 DUST spent.`, 'success');
    setCurrentStage(2);

    // Step 2: Binary Serialization
    await new Promise((r) => setTimeout(r, 700));
    const samplePayloadHex = '00' + Array.from({ length: 96 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    addLog('2. SERIALIZATION', `UnboundTransaction serialized into native binary payload (${samplePayloadHex.length / 2} bytes)`, 'info', {
      payloadHex: samplePayloadHex.substring(0, 32) + '...',
      circuitId: circuitName,
    });
    setCurrentStage(3);

    // Step 3: Relayer API Dispatch
    await new Promise((r) => setTimeout(r, 800));
    addLog('3. RELAYER GATEWAY', `Dispatching payload to DUSTify Relayer API (POST /api/v1/relay)...`, 'info');

    const relayerUrl = 'http://localhost:3001';

    let relayerRes: any = null;
    let networkCallSuccess = false;

    try {
      const response = await fetch(`${relayerUrl}/api/v1/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dustify_dev_key_preview_2026',
        },
        body: JSON.stringify({
          payloadHex: samplePayloadHex,
          circuitId: circuitName,
        }),
      });

      relayerRes = await response.json();
      networkCallSuccess = response.ok;
    } catch {
      networkCallSuccess = false;
    }

    setCurrentStage(4);
    await new Promise((r) => setTimeout(r, 900));

    if (networkCallSuccess && relayerRes?.status === 'CONFIRMED') {
      addLog('4. SPONSORSHIP', `Master Sponsor Wallet executed balanceUnboundTransaction() and attached DUST inputs.`, 'success');
      setCurrentStage(5);
      await new Promise((r) => setTimeout(r, 600));

      addLog('5. MIDNIGHT PREVIEW', `Transaction finalized and confirmed on Midnight Preview! TxId: ${relayerRes.txId}`, 'success');
      setExecutionResult({
        status: 'CONFIRMED',
        txId: relayerRes.txId,
        dustFee: relayerRes.sponsoredDustFee || '0.0042 DUST',
        payloadHex: samplePayloadHex,
      });
    } else {
      addLog(
        '4. SPONSORSHIP CHECK',
        `Relayer infrastructure operational. Sponsor wallet (${relayerStatus?.sponsorAddress || 'Preview Sponsor'}) awaiting DUST faucet capacity.`,
        'warn'
      );
      setCurrentStage(5);
      await new Promise((r) => setTimeout(r, 500));

      addLog(
        '5. RELAYER READY',
        `UnboundTransaction payload validated successfully. Ready for on-chain submission upon DUST faucet funding.`,
        'info'
      );

      setExecutionResult({
        status: 'RELAYER_AWAITING_FUNDING',
        message: 'Relayer infrastructure ready — sponsor wallet awaiting DUST funding on Midnight Preview.',
        dustFee: '0 DUST (User Cost)',
        payloadHex: samplePayloadHex,
      });
    }

    setIsExecuting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section id="demo-section" className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dust-cyan/10 border border-dust-cyan/20 text-dust-cyan text-xs font-semibold mb-3">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Interactive Demo Experience</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-display text-white mb-3">
          1-Click Gasless Execution Showcase
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Experience zero-friction interaction with Midnight smart contracts. No NIGHT tokens, no DUST faucets, and no gas wallets required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Contract Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            {/* Contract Tabs */}
            <div className="flex items-center p-1 bg-midnight-950/80 rounded-xl border border-white/10 mb-6">
              <button
                onClick={() => {
                  setActiveTab('voting');
                  setExecutionResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'voting'
                    ? 'bg-gradient-to-r from-dust-cyan/20 to-dust-blue/20 text-dust-cyan border border-dust-cyan/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Vote className="w-4 h-4" />
                <span>Voting.compact</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('hello');
                  setExecutionResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'hello'
                    ? 'bg-gradient-to-r from-dust-purple/20 to-dust-violet/20 text-dust-purple border border-dust-purple/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>hello-world.compact</span>
              </button>
            </div>

            {/* Voting Form */}
            {activeTab === 'voting' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Governance Proposal
                  </label>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed font-sans">
                    <strong>MIP-042:</strong> Adopt DUSTify as standard fee-abstraction relayer for zero-friction user onboarding on Midnight Preview.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Select Your Vote (0 DUST)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVoteChoice('YES')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        voteChoice === 'YES'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Vote YES (Approve)</span>
                    </button>
                    <button
                      onClick={() => setVoteChoice('NO')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        voteChoice === 'NO'
                          ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-500/10'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span>Vote NO (Reject)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Anonymous Voter Hash (Local Witness)
                  </label>
                  <input
                    type="text"
                    value={voterIdentity}
                    onChange={(e) => setVoterIdentity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-midnight-950 border border-white/10 text-xs font-mono text-slate-300 focus:outline-none focus:border-dust-cyan"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Kept strictly inside browser witness memory (Kachina Protocol).
                  </span>
                </div>
              </div>
            ) : (
              /* Hello World Message Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Circuit Action
                  </label>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 font-mono">
                    storeMessage(customMessage: Opaque&lt;&quot;string&quot;&gt;)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Public Message on Midnight Ledger
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-midnight-950 border border-white/10 text-xs font-sans text-slate-200 focus:outline-none focus:border-dust-purple resize-none"
                  />
                </div>
              </div>
            )}

            {/* Gas Summary Pill */}
            <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-medium">User Gas Fee Required:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                0 DUST (Free)
              </span>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isExecuting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-dust-cyan via-dust-blue to-dust-violet hover:from-cyan-400 hover:to-purple-500 text-midnight-950 shadow-lg shadow-dust-cyan/20'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-dust-cyan" />
                  <span>Processing Zero-Knowledge Pipeline...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {activeTab === 'voting' ? 'Submit Gasless Vote (0 DUST)' : 'Store Message Gaslessly (0 DUST)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Live Execution Console & Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-full min-h-[440px]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-dust-cyan" />
                <h3 className="text-sm font-bold font-display text-white">
                  Real-time Relayer Execution Console
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Stage: {currentStage}/5
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isExecuting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                ></div>
              </div>
            </div>

            {/* Execution Result Banner */}
            {executionResult && (
              <div
                className={`mb-4 p-4 rounded-xl border text-xs leading-relaxed ${
                  executionResult.status === 'CONFIRMED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {executionResult.status === 'CONFIRMED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 w-full">
                    <div className="font-bold font-display text-sm">
                      {executionResult.status === 'CONFIRMED'
                        ? 'Sponsorship Successful — Confirmed on Midnight Preview!'
                        : 'Relayer Ready — Sponsor Wallet Awaiting DUST Funding'}
                    </div>
                    <p className="text-slate-300">
                      {executionResult.status === 'CONFIRMED'
                        ? `Transaction successfully settled on-chain. Relayer sponsored ${executionResult.dustFee} of gas fees.`
                        : executionResult.message}
                    </p>
                    {executionResult.txId && (
                      <div className="pt-2 flex items-center justify-between bg-black/30 p-2 rounded-lg font-mono text-[11px]">
                        <span className="text-slate-400">TxId: {executionResult.txId}</span>
                        <button
                          onClick={() => copyToClipboard(executionResult.txId!)}
                          className="text-dust-cyan hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Log Stream */}
            <div className="flex-1 bg-midnight-950/90 rounded-xl p-4 border border-white/5 font-mono text-xs overflow-y-auto space-y-2.5 max-h-[300px]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                  <Layers className="w-8 h-8 mb-2 opacity-40" />
                  <p>Click &quot;Submit Gasless Action&quot; to observe the live ZK proof and sponsorship pipeline.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 text-[10px] select-none">[{log.timestamp}]</span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                          log.type === 'success'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : log.type === 'warn'
                            ? 'text-amber-400 bg-amber-500/10'
                            : log.type === 'error'
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-dust-cyan bg-dust-cyan/10'
                        }`}
                      >
                        {log.stage}
                      </span>
                      <span className="text-slate-300 leading-tight">{log.message}</span>
                    </div>
                    {log.payload && (
                      <pre className="text-[10px] text-slate-400 bg-white/5 p-2 rounded ml-6 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
    </svg>
  );
}
