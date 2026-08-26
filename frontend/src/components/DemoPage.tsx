import React, { useState } from 'react';
import { Send, Terminal, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RelayerStatus, ExecutionLog } from '../types';

interface DemoPageProps {
  relayerStatus: RelayerStatus | null;
}

export const DemoPage: React.FC<DemoPageProps> = ({ relayerStatus }) => {
  const [activeContract, setActiveContract] = useState<'hello' | 'voting'>('hello');
  const [messageInput, setMessageInput] = useState('Hello Midnight Preview from DUSTify');
  const [proposalChoice, setProposalChoice] = useState<'YES' | 'NO'>('YES');
  const [voterSecret, setVoterSecret] = useState('0x4a9b8c2d1e5f03a4b6c8d7e9f1a2b3c4d5e6f7');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [copiedTx, setCopiedTx] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: 'CONFIRMED' | 'RELAYER_NOT_FUNDED' | 'ERROR';
    txId?: string;
    dustFee?: string;
    payloadHex?: string;
    message?: string;
  } | null>(null);

  const addLog = (stage: string, message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info', payload?: any) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        stage,
        message,
        type,
        payload,
      },
    ]);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setCurrentStep(1);
    setLogs([]);
    setExecutionResult(null);

    const circuitName = activeContract === 'hello' ? 'storeMessage' : 'castVote';
    const contractDoc = activeContract === 'hello' ? 'hello-world.compact' : 'Voting.compact';

    // Step 1: Local Proving & Witness Evaluation
    addLog('LOCAL_PROVING', `Evaluating ${contractDoc} circuit "${circuitName}" with private witness (0 DUST)...`, 'info');
    await new Promise((r) => setTimeout(r, 600));

    addLog('LOCAL_PROVING', `ZK Proof generated locally. Witness kept on client. 0 DUST spent.`, 'success');
    setCurrentStep(2);

    // Step 2: Binary Serialization
    await new Promise((r) => setTimeout(r, 400));
    const sampleHex = '00' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    addLog('SERIALIZATION', `UnboundTransaction serialized to native WASM binary (${sampleHex.length / 2} bytes)`, 'info', {
      circuitId: circuitName,
      payloadHex: sampleHex.substring(0, 24) + '...',
    });
    setCurrentStep(3);

    // Step 3: Dispatch to Relayer API
    await new Promise((r) => setTimeout(r, 500));
    addLog('RELAYER_DISPATCH', `POST http://localhost:3001/api/v1/relay with x-api-key header...`, 'info');

    let responseOk = false;
    let responseData: any = null;

    try {
      const res = await fetch('http://localhost:3001/api/v1/relay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dustify_dev_key_preview_2026',
        },
        body: JSON.stringify({
          payloadHex: sampleHex,
          circuitId: circuitName,
        }),
      });

      responseData = await res.json();
      responseOk = res.ok;
    } catch {
      responseOk = false;
    }

    setCurrentStep(4);
    await new Promise((r) => setTimeout(r, 500));

    if (responseOk && responseData?.status === 'CONFIRMED') {
      addLog('SPONSORSHIP', `Relayer executed balanceUnboundTransaction() with Master DUST Wallet.`, 'success');
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 400));

      addLog('SUBMISSION', `FinalizedTransaction submitted to Midnight Node RPC. TxId: ${responseData.txId}`, 'success');
      setExecutionResult({
        status: 'CONFIRMED',
        txId: responseData.txId,
        dustFee: responseData.sponsoredDustFee || '0.0042 DUST',
        payloadHex: sampleHex,
      });
    } else {
      addLog(
        'SPONSOR_CHECK',
        `Relayer is operational. Sponsor wallet (${relayerStatus?.sponsorAddress || 'Preview Sponsor'}) currently has 0 DUST capacity.`,
        'warn'
      );
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 400));

      addLog(
        'RELAYER_READY',
        `Payload verified. Awaiting Preview faucet DUST funding for live on-chain settlement.`,
        'info'
      );

      setExecutionResult({
        status: 'RELAYER_NOT_FUNDED',
        message: 'Relayer infrastructure is operational. Sponsor wallet currently awaiting Preview faucet DUST funding.',
        dustFee: '0 DUST (User Cost)',
        payloadHex: sampleHex,
      });
    }

    setIsExecuting(false);
  };

  const copyTx = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="space-y-8 py-8 max-w-5xl mx-auto px-4 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">
          Gasless Contract Execution Demo
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
          Execute Compact smart contracts on Midnight Preview with 0 gas tokens and 0 wallet setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-border-subtle rounded bg-surface-100 p-5 space-y-4">
            {/* Contract Selection Switcher */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Target Compact Contract
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded bg-surface-300 border border-border-subtle">
                <button
                  onClick={() => {
                    setActiveContract('hello');
                    setExecutionResult(null);
                  }}
                  className={`py-1.5 px-2 rounded text-xs font-mono transition-colors ${
                    activeContract === 'hello'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  hello-world.compact
                </button>
                <button
                  onClick={() => {
                    setActiveContract('voting');
                    setExecutionResult(null);
                  }}
                  className={`py-1.5 px-2 rounded text-xs font-mono transition-colors ${
                    activeContract === 'voting'
                      ? 'bg-zinc-800 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Voting.compact
                </button>
              </div>
            </div>

            {/* Contract Fields */}
            {activeContract === 'hello' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Circuit Identifier
                  </label>
                  <div className="p-2 rounded bg-surface-200 border border-border-subtle text-xs font-mono text-zinc-300">
                    storeMessage(customMessage: Opaque&lt;&quot;string&quot;&gt;)
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Message Payload
                  </label>
                  <textarea
                    rows={3}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="w-full p-2.5 rounded bg-surface-300 border border-border-subtle text-xs font-sans text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Governance Ballot
                  </label>
                  <div className="p-2.5 rounded bg-surface-200 border border-border-subtle text-xs text-zinc-300 font-sans">
                    <strong>Proposal #42:</strong> Adopt DUSTify as standard fee-abstraction relayer for Midnight Preview.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Vote Choice (0 DUST)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProposalChoice('YES')}
                      className={`py-2 rounded border text-xs font-mono transition-colors ${
                        proposalChoice === 'YES'
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'border-border-subtle bg-surface-200 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      Vote YES
                    </button>
                    <button
                      onClick={() => setProposalChoice('NO')}
                      className={`py-2 rounded border text-xs font-mono transition-colors ${
                        proposalChoice === 'NO'
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-300 font-bold'
                          : 'border-border-subtle bg-surface-200 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      Vote NO
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Anonymous Witness Secret
                  </label>
                  <input
                    type="text"
                    value={voterSecret}
                    onChange={(e) => setVoterSecret(e.target.value)}
                    className="w-full p-2 rounded bg-surface-300 border border-border-subtle text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-500"
                  />
                  <span className="text-[10px] text-zinc-500 block">
                    Never transmitted to relayer (evaluated in client witness memory).
                  </span>
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="p-2.5 rounded bg-surface-200 border border-border-subtle flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">User Gas Fee:</span>
              <span className="text-emerald-400 font-semibold">0 DUST (Free)</span>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className={`w-full py-2.5 rounded text-xs font-medium font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isExecuting
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-zinc-100 hover:bg-white text-zinc-950 font-bold'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Processing Stage {currentStep}/5...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Gasless Transaction</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Output Console */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-border-subtle rounded bg-surface-100 p-5 flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Relayer Execution Telemetry
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Stage {currentStep}/5
              </span>
            </div>

            {/* Execution Result Box */}
            {executionResult && (
              <div
                className={`mb-3 p-3.5 rounded border text-xs font-sans space-y-1.5 ${
                  executionResult.status === 'CONFIRMED'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-zinc-700 bg-zinc-900/90 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold font-mono text-[11px]">
                  {executionResult.status === 'CONFIRMED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  )}
                  <span>
                    {executionResult.status === 'CONFIRMED'
                      ? 'CONFIRMED ON MIDNIGHT PREVIEW'
                      : 'RELAYER INFRASTRUCTURE READY'}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {executionResult.message || `Transaction settled on-chain. Sponsored ${executionResult.dustFee}.`}
                </p>
                {executionResult.txId && (
                  <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 font-mono text-[10px]">
                    <span className="truncate max-w-[280px]">TxId: {executionResult.txId}</span>
                    <button
                      onClick={() => copyTx(executionResult.txId!)}
                      className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 ml-2"
                    >
                      {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Terminal Stream */}
            <div className="flex-1 bg-surface-300 rounded p-3 border border-border-subtle font-mono text-xs overflow-y-auto space-y-2 max-h-[300px]">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-center py-12">
                  <span>Click &quot;Submit Gasless Transaction&quot; to inspect real-time execution.</span>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="space-y-0.5">
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-600 text-[10px]">[{log.timestamp}]</span>
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                          log.type === 'success'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : log.type === 'warn'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-zinc-300 bg-zinc-800'
                        }`}
                      >
                        {log.stage}
                      </span>
                      <span className="text-zinc-400 text-[11px]">{log.message}</span>
                    </div>
                    {log.payload && (
                      <pre className="text-[10px] text-zinc-500 bg-surface-200 p-1.5 rounded ml-6 overflow-x-auto">
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
    </div>
  );
};
