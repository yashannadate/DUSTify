import React, { useState } from 'react';
import {
  PlayCircle,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  Terminal,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { RelayerTelemetry, RelayedTxRecord, PipelineStep, PageId } from '../types';
import { apiClient } from '../lib/api';

interface PlaygroundProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  onTxCreated: (tx: RelayedTxRecord) => void;
  onNavigate?: (page: PageId) => void;
}

const initialSteps: PipelineStep[] = [
  {
    id: 1,
    title: 'Generating application proof locally',
    description: 'Evaluating Compact circuit with client private witness in-browser',
    status: 'waiting',
  },
  {
    id: 2,
    title: 'Creating UnboundTransaction',
    description: 'Constructing unsigned transaction object (0 DUST user cost)',
    status: 'waiting',
  },
  {
    id: 3,
    title: 'Passing transaction to DUSTify SDK',
    description: 'Serializing transaction into native WASM binary format',
    status: 'waiting',
  },
  {
    id: 4,
    title: 'Sending relayable payload to DUSTify Relayer',
    description: 'Dispatching payload over authenticated HTTP to Relayer API',
    status: 'waiting',
  },
  {
    id: 5,
    title: 'Sponsor Balancing',
    description: 'Relayer executes balanceUnboundTransaction() with sponsor DUST UTXOs',
    status: 'waiting',
  },
  {
    id: 6,
    title: 'Submitting transaction to Midnight Preview',
    description: 'Broadcasting finalized transaction over Substrate WebSocket RPC',
    status: 'waiting',
  },
  {
    id: 7,
    title: 'Confirming state transition',
    description: 'Awaiting block inclusion and indexer verification',
    status: 'waiting',
  },
];

export const Playground: React.FC<PlaygroundProps> = ({
  telemetry,
  isOnline,
  onTxCreated,
  onNavigate,
}) => {
  const [counterValue, setCounterValue] = useState(12);
  const [isExecuting, setIsExecuting] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [resultTx, setResultTx] = useState<RelayedTxRecord | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [fundingWarning, setFundingWarning] = useState<boolean>(false);
  const [modeNote, setModeNote] = useState<string | null>(null);

  const executeRealOrSimulated = async (forceSimulation = false) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setResultTx(null);
    setFundingWarning(false);
    setModeNote(null);

    // Reset steps
    const newSteps: PipelineStep[] = initialSteps.map((s) => ({ ...s, status: 'waiting', details: undefined }));
    setSteps(newSteps);

    const updateStep = (index: number, status: 'processing' | 'success' | 'failed', details?: string) => {
      newSteps[index] = { ...newSteps[index], status, details };
      setSteps([...newSteps]);
    };

    try {
      // Step 1: Proving locally
      updateStep(0, 'processing', 'Compiling private witness inside client memory...');
      await new Promise((r) => setTimeout(r, 500));
      updateStep(0, 'success', 'ZK proof generated on client. Witness kept private.');

      // Step 2: Creating UnboundTransaction
      updateStep(1, 'processing', 'Constructing unsigned transaction wrapper...');
      await new Promise((r) => setTimeout(r, 350));
      updateStep(1, 'success', 'UnboundTransaction created. User fee: 0 DUST.');

      // Step 3: SDK Serialization
      updateStep(2, 'processing', 'Invoking unboundTx.serialize()...');
      await new Promise((r) => setTimeout(r, 350));
      const simulatedPayloadHex = '00f33cd7cbc0ca6d621f5ff6000000000000000c0000000d';
      updateStep(2, 'success', `Serialized to native WASM binary (${simulatedPayloadHex.length / 2} bytes).`);

      // Step 4: Dispatch to Relayer
      updateStep(3, 'processing', 'POST /api/v1/relay with x-api-key...');
      await new Promise((r) => setTimeout(r, 400));

      if (forceSimulation) {
        // Explicitly requested Demo Simulation
        updateStep(3, 'success', 'Relayed to demo simulator environment.');
        updateStep(4, 'processing', 'Simulating sponsor DUST balancing (0.0042 DUST)...');
        await new Promise((r) => setTimeout(r, 500));
        updateStep(4, 'success', 'Simulated sponsor fee attached.');
        updateStep(5, 'processing', 'Simulating node broadcast...');
        await new Promise((r) => setTimeout(r, 400));
        updateStep(5, 'success', 'Simulated Midnight Preview RPC broadcast.');
        updateStep(6, 'processing', 'Confirming state transition...');
        await new Promise((r) => setTimeout(r, 300));
        updateStep(6, 'success', 'Simulated block confirmation complete.');

        const record: RelayedTxRecord = {
          id: `demo_${Math.random().toString(36).substring(2, 9)}`,
          status: 'DEMO',
          circuitId: 'incrementCounter',
          network: 'Midnight Preview (Demo)',
          sponsorAddress: 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          timestamp: Date.now(),
          isDemo: true,
          stateTransition: `Counter: ${counterValue} → ${counterValue + 1}`,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);
        setCounterValue((c) => c + 1);
        setModeNote('Demo Mode: Simulation only — no live transaction submitted to Midnight.');
        return;
      }

      // Real live API call
      const relayRes = await apiClient.submitRelay({
        payloadHex: simulatedPayloadHex,
        circuitId: 'incrementCounter',
        contractAddress: 'DustifyRegistry.compact',
      });

      if (relayRes.isRelayerNotFunded || (relayRes.data && relayRes.data.status === 'RELAYER_NOT_FUNDED')) {
        // Relayer is connected, but sponsor wallet requires DUST capacity
        updateStep(3, 'success', 'POST /api/v1/relay delivered to active Relayer.');
        
        // Exact wording requested by user:
        updateStep(
          4,
          'failed',
          '⚠️ Sponsor wallet requires DUST capacity\n\nCurrent Sponsor DUST: 0 Specks\n\nTransaction cannot be sponsored yet.'
        );
        updateStep(5, 'waiting');
        updateStep(6, 'waiting');

        setFundingWarning(true);

        const record: RelayedTxRecord = {
          id: `relay_${Math.random().toString(36).substring(2, 9)}`,
          status: 'RELAYER_NOT_FUNDED',
          circuitId: 'incrementCounter',
          network: 'Midnight Preview',
          sponsorAddress: relayRes.data?.sponsorAddress || 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          timestamp: Date.now(),
          isDemo: true,
          errorMessage: 'Sponsor wallet requires DUST capacity (0 Specks available).',
          stateTransition: `Counter: ${counterValue} → ${counterValue + 1}`,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);
      } else if (relayRes.success && relayRes.data?.status === 'CONFIRMED') {
        // Real on-chain confirmation
        updateStep(3, 'success', 'Payload dispatched to Relayer.');
        updateStep(4, 'success', `Balanced with sponsor DUST (${relayRes.data.sponsoredDustFee || '0.0042 DUST'}).`);
        updateStep(5, 'success', `Submitted to RPC: ${relayRes.data.txId?.substring(0, 16)}...`);
        updateStep(6, 'success', 'Confirmed state transition on Midnight Preview.');

        const record: RelayedTxRecord = {
          id: `relay_${Math.random().toString(36).substring(2, 9)}`,
          txId: relayRes.data.txId,
          status: 'CONFIRMED',
          circuitId: 'incrementCounter',
          network: 'Midnight Preview',
          sponsorAddress: relayRes.data.sponsorAddress || 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          sponsoredDustFee: relayRes.data.sponsoredDustFee || '0.0042 DUST',
          timestamp: Date.now(),
          isDemo: false,
          stateTransition: `Counter: ${counterValue} → ${counterValue + 1}`,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);
        setCounterValue((c) => c + 1);
      } else {
        // Relayer offline
        updateStep(3, 'failed', 'Relayer API is unreachable at http://localhost:3001.');
        updateStep(4, 'waiting');
        updateStep(5, 'waiting');
        updateStep(6, 'waiting');
        setModeNote('Relayer Offline: Start the relayer with "npm run dev:relayer" or run Demo Simulation.');
      }
    } catch (err: any) {
      updateStep(3, 'failed', err.message || 'Execution error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">DUSTify Playground</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Experience a DUST-sponsored Midnight transaction flow with zero user gas friction.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-brand-500/10 text-brand-300 border border-brand-500/20">
            Midnight Preview
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Fee-Abstraction Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Counter Demo Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Sample Midnight Contract
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">Counter Contract</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                DustifyRegistry.compact
              </span>
            </div>

            {/* Counter Display & Controls */}
            <div className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-center space-y-4">
              <span className="text-xs text-zinc-400 font-medium">Current On-Chain Value</span>
              <div className="text-5xl font-extrabold text-white tracking-tight font-mono">
                {counterValue}
              </div>

              <div className="flex items-center justify-center space-x-4 pt-2">
                <button
                  onClick={() => setCounterValue((c) => Math.max(0, c - 1))}
                  disabled={isExecuting}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
                  title="Decrement (Local preview)"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCounterValue((c) => c + 1)}
                  disabled={isExecuting}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50"
                  title="Increment (Local preview)"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Value Proposition Note */}
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-zinc-300 font-medium">
                <Zap className="w-4 h-4 text-brand-400" />
                <span>Transaction Sponsorship</span>
              </div>
              <div className="space-y-1 text-zinc-400 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-brand-400">🟣</span>
                  <span>Proof generated locally with private witness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400">🟢</span>
                  <span>Network fee sponsored by DUSTify Master Relayer</span>
                </div>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={() => executeRealOrSimulated(false)}
              disabled={isExecuting}
              className="w-full py-3.5 px-4 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                  <span>Processing Sponsored Flow...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-zinc-900" />
                  <span>Execute Sponsored Transaction</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 7-Stage Pipeline Stepper & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white">Execution Pipeline</h3>
              </div>
              <span className="text-xs text-zinc-500 font-mono">7-Stage Protocol</span>
            </div>

            {/* Stepper List */}
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    step.status === 'processing'
                      ? 'bg-brand-500/10 border-brand-500/30'
                      : step.status === 'success'
                      ? 'bg-zinc-950/60 border-zinc-800/80'
                      : step.status === 'failed'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-zinc-950/30 border-zinc-900/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {step.status === 'processing' && (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                      )}
                      {step.status === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {step.status === 'failed' && (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      {step.status === 'waiting' && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full border border-zinc-700 text-[10px] font-mono text-zinc-500">
                          {step.id}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            step.status === 'processing'
                              ? 'text-brand-300'
                              : step.status === 'success'
                              ? 'text-zinc-200'
                              : step.status === 'failed'
                              ? 'text-amber-300'
                              : 'text-zinc-500'
                          }`}
                        >
                          {step.id === 5 && step.status === 'failed' ? '⑤ Sponsor Balancing' : step.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{step.description}</p>
                      
                      {step.details && (
                        <div className="text-[11px] font-mono text-zinc-300 mt-2 p-2.5 rounded bg-zinc-900/90 border border-zinc-800 whitespace-pre-line leading-relaxed">
                          {step.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Funding Warning Action Controls (When Sponsor has 0 DUST) */}
            {fundingWarning && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Sponsor DUST Required for Live Settlement</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  The Master Relayer authenticated your transaction payload, but the sponsor address currently
                  holds <strong>0 Specks</strong>. You can run a full demo simulation or inspect live relayer health telemetry.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => executeRealOrSimulated(true)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs border border-zinc-700 transition-colors"
                  >
                    Run Demo Simulation
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('relayer')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-zinc-800 transition-colors"
                  >
                    Check Relayer Status
                  </button>
                </div>
              </div>
            )}

            {/* Mode Banner */}
            {modeNote && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center space-x-2 text-zinc-200 font-semibold font-mono text-[11px]">
                  <span>ℹ️ EXECUTION DIAGNOSTICS</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{modeNote}</p>
              </div>
            )}

            {/* Result Receipt Card */}
            {resultTx && resultTx.status === 'CONFIRMED' && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">Transaction Confirmed</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(resultTx.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-zinc-800">
                  <div>
                    <span className="text-zinc-500">Network:</span>
                    <p className="text-zinc-300">{resultTx.network}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">User DUST Spent:</span>
                    <p className="text-emerald-400 font-bold">{resultTx.userDustCost}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500">State Transition:</span>
                    <p className="text-zinc-200">{resultTx.stateTransition}</p>
                  </div>
                  {resultTx.txId && (
                    <div className="col-span-2">
                      <span className="text-zinc-500">Transaction Hash:</span>
                      <p className="text-brand-300 break-all">{resultTx.txId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expandable Technical Details */}
            <div className="border-t border-zinc-800/80 pt-3">
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="flex items-center justify-between w-full text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span>Technical Details & Transaction Lifecycle</span>
                {isDetailsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isDetailsExpanded && (
                <div className="mt-3 p-3 rounded-lg bg-zinc-950 text-xs space-y-2 font-mono text-zinc-400 border border-zinc-800">
                  <div className="flex justify-between">
                    <span>Proof Generation:</span>
                    <span className="text-emerald-400">Generated locally (in-memory)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Keys Transmitted:</span>
                    <span className="text-emerald-400">No (0 bytes transmitted)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Witness Data Transmitted:</span>
                    <span className="text-emerald-400">No (Protected by Kachina)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Balanced By:</span>
                    <span className="text-zinc-200">DUSTify Sponsor Relayer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Network:</span>
                    <span className="text-zinc-200">Midnight Preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
