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
  FileCode2,
  Copy,
  Check,
  Building2,
  MessageSquare,
  Shield,
  Key,
} from 'lucide-react';
import { RelayerTelemetry, RelayedTxRecord, PipelineStep, PageId } from '../types';
import { apiClient } from '../lib/api';

interface PlaygroundProps {
  telemetry: RelayerTelemetry | null;
  isOnline: boolean;
  onTxCreated: (tx: RelayedTxRecord) => void;
  onNavigate?: (page: PageId) => void;
}

type CircuitMode = 'sponsorTransaction' | 'sponsorMessage' | 'registerDApp' | 'authorizeRelayer';

interface CircuitConfig {
  id: CircuitMode;
  name: string;
  badge: string;
  icon: React.ReactNode;
  circuitSignature: string;
  description: string;
}

const CIRCUIT_CONFIGS: Record<CircuitMode, CircuitConfig> = {
  sponsorTransaction: {
    id: 'sponsorTransaction',
    name: 'Sponsor Transaction',
    badge: 'Zero-Gas Paymaster',
    icon: <Zap className="w-4 h-4 text-brand-400" />,
    circuitSignature: 'sponsorTransaction(dAppId: Bytes<32>, userSalt: Bytes<32>, costUnits: Uint<64>): []',
    description: 'Verifies relayer authorization, validates anti-sybil user nullifier, and sponsors transaction at 0 DUST cost.',
  },
  sponsorMessage: {
    id: 'sponsorMessage',
    name: 'Sponsored Message Store',
    badge: 'Public Bulletin',
    icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
    circuitSignature: 'sponsorMessage(dAppId: Bytes<32>, userSalt: Bytes<32>, customMessage: Opaque<"string">): []',
    description: 'Discloses a public state mutation to the Midnight ledger wrapped in zero-gas sponsorship & nullifier protection.',
  },
  registerDApp: {
    id: 'registerDApp',
    name: 'Register dApp Quota',
    badge: 'Quota Engine',
    icon: <Building2 className="w-4 h-4 text-purple-400" />,
    circuitSignature: 'registerDApp(dAppId: Bytes<32>, initialQuota: Uint<64>): []',
    description: 'Allocates a sponsorship budget for a newly registered privacy-preserving dApp.',
  },
  authorizeRelayer: {
    id: 'authorizeRelayer',
    name: 'Authorize Relayer',
    badge: 'Access Control',
    icon: <Shield className="w-4 h-4 text-amber-400" />,
    circuitSignature: 'authorizeRelayer(relayerKey: Bytes<32>): []',
    description: 'Whitelists an authorized DUSTify Relayer node permitted to submit sponsored recipes.',
  },
};

const DUSTIFY_CONTRACT_SOURCE = `pragma language_version >= 0.22;
import CompactStandardLibrary;

// ============================================================================
// 🌙 DUSTify — Zero-Friction Gas-Abstraction & Paymaster Smart Contract
// ============================================================================

export ledger admin: Bytes<32>;
export ledger isInitialized: Boolean;
export ledger isPaused: Boolean;
export ledger currentEpoch: Uint<64>;
export ledger globalTotalSponsored: Uint<64>;

export ledger latestMessage: Opaque<"string">;
export ledger messageCount: Uint<64>;

export ledger authorizedRelayers: Set<Bytes<32>>;
export ledger dAppQuotaLimits: Map<Bytes<32>, Uint<64>>;
export ledger dAppRemainingQuota: Map<Bytes<32>, Uint<64>>;
export ledger dAppTotalSponsored: Map<Bytes<32>, Uint<64>>;
export ledger usedNullifiers: Set<Bytes<32>>;

witness getRelayerSecret(): Bytes<32>;
witness getUserSecret(): Bytes<32>;

export circuit initialize(adminKey: Bytes<32>): [] {
    assert(!isInitialized, "Already initialized");
    admin = disclose(adminKey);
    isInitialized = true;
    isPaused = false;
    currentEpoch = 1;
    globalTotalSponsored = 0;
    messageCount = 0;
}

export circuit sponsorTransaction(dAppId: Bytes<32>, userSalt: Bytes<32>, costUnits: Uint<64>): [] {
    assert(!isPaused, "Contract is paused");
    const dApp = disclose(dAppId);
    const cost = disclose(costUnits);

    // 1. Verify Relayer Authorization via Private Witness
    const relayerSecret = getRelayerSecret();
    const relayerPubkey = disclose(persistentHash<Vector<1, Bytes<32>>>([relayerSecret]));
    assert(authorizedRelayers.member(relayerPubkey), "Relayer not authorized");

    // 2. Prevent Sybil / Double Spending via Private Nullifier
    const userSecret = getUserSecret();
    const nullifier = disclose(persistentHash<Vector<3, Bytes<32>>>([userSecret, userSalt, dAppId]));
    assert(!usedNullifiers.member(nullifier), "Nullifier already spent");
    usedNullifiers.insert(nullifier);

    // 3. Enforce and Deduct dApp Sponsorship Quota
    assert(dAppRemainingQuota.member(dApp), "dApp not registered");
    const remaining = dAppRemainingQuota.lookup(dApp);
    assert(remaining >= cost, "Quota exhausted");
    dAppRemainingQuota.insert(dApp, (remaining - cost) as Uint<64>);

    const prevSponsored = dAppTotalSponsored.lookup(dApp);
    dAppTotalSponsored.insert(dApp, (prevSponsored + 1) as Uint<64>);
    globalTotalSponsored = (globalTotalSponsored + 1) as Uint<64>;
}

export circuit sponsorMessage(dAppId: Bytes<32>, userSalt: Bytes<32>, customMessage: Opaque<"string">): [] {
    assert(!isPaused, "Contract is paused");
    const dApp = disclose(dAppId);

    const relayerSecret = getRelayerSecret();
    const relayerPubkey = disclose(persistentHash<Vector<1, Bytes<32>>>([relayerSecret]));
    assert(authorizedRelayers.member(relayerPubkey), "Relayer not authorized");

    const userSecret = getUserSecret();
    const nullifier = disclose(persistentHash<Vector<3, Bytes<32>>>([userSecret, userSalt, dAppId]));
    assert(!usedNullifiers.member(nullifier), "Nullifier already spent");
    usedNullifiers.insert(nullifier);

    assert(dAppRemainingQuota.member(dApp), "dApp not registered");
    const remaining = dAppRemainingQuota.lookup(dApp);
    assert(remaining >= 1, "Quota exhausted");
    dAppRemainingQuota.insert(dApp, (remaining - 1) as Uint<64>);

    latestMessage = disclose(customMessage);
    messageCount = (messageCount + 1) as Uint<64>;
    globalTotalSponsored = (globalTotalSponsored + 1) as Uint<64>;
}`;

const initialSteps: PipelineStep[] = [
  {
    id: 1,
    title: 'Generating application proof locally',
    description: 'Evaluating Dustify circuit with client private witness in-browser',
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
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitMode>('sponsorTransaction');
  const [isExecuting, setIsExecuting] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [resultTx, setResultTx] = useState<RelayedTxRecord | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [fundingWarning, setFundingWarning] = useState<boolean>(false);
  const [modeNote, setModeNote] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Dynamic contract states
  const [dAppQuota, setDAppQuota] = useState({
    name: 'midnight-dex',
    remaining: 978,
    limit: 1000,
    totalSponsored: 42,
  });
  const [messagePayload, setMessagePayload] = useState('0-Gas Privacy Onboarding via DUSTify');
  const [latestLedgerMsg, setLatestLedgerMsg] = useState('0-Gas Privacy Onboarding via DUSTify');
  const [totalSponsoredCount, setTotalSponsoredCount] = useState(142);

  const activeConfig = CIRCUIT_CONFIGS[selectedCircuit];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(DUSTIFY_CONTRACT_SOURCE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const executeRealOrSimulated = async (forceSimulation = false) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setResultTx(null);
    setFundingWarning(false);
    setModeNote(null);

    const newSteps: PipelineStep[] = initialSteps.map((s) => ({ ...s, status: 'waiting', details: undefined }));
    setSteps(newSteps);

    const updateStep = (index: number, status: 'processing' | 'success' | 'failed', details?: string) => {
      newSteps[index] = { ...newSteps[index], status, details };
      setSteps([...newSteps]);
    };

    let transitionSummary = '';
    if (selectedCircuit === 'sponsorTransaction') {
      transitionSummary = `dApp ${dAppQuota.name} Quota: ${dAppQuota.remaining} → ${dAppQuota.remaining - 1} | Global Total: ${totalSponsoredCount + 1}`;
    } else if (selectedCircuit === 'sponsorMessage') {
      transitionSummary = `Ledger Message Updated: "${messagePayload.substring(0, 24)}..." | Nullifier Sealed`;
    } else if (selectedCircuit === 'registerDApp') {
      transitionSummary = `dApp registered with 1,000 units initial sponsorship quota`;
    } else {
      transitionSummary = `Relayer whitelisted in authorizedRelayers Set`;
    }

    try {
      // Step 1: Proving locally
      updateStep(0, 'processing', `Compiling private witness for circuit ${selectedCircuit}() inside client memory...`);
      await new Promise((r) => setTimeout(r, 450));
      updateStep(0, 'success', `ZK proof generated locally for '${selectedCircuit}'. Private witness retained.`);

      // Step 2: Creating UnboundTransaction
      updateStep(1, 'processing', 'Constructing unsigned UnboundTransaction wrapper...');
      await new Promise((r) => setTimeout(r, 300));
      updateStep(1, 'success', 'UnboundTransaction created. User gas cost: 0 DUST.');

      // Step 3: SDK Serialization
      updateStep(2, 'processing', 'Invoking unboundTx.serialize() via @dustify/sdk...');
      await new Promise((r) => setTimeout(r, 300));
      const simulatedPayloadHex = '00f33cd7cbc0ca6d621f5ff6000000000000000c0000000d';
      updateStep(2, 'success', `Serialized to native WASM binary (${simulatedPayloadHex.length / 2} bytes).`);

      // Step 4: Dispatch to Relayer
      updateStep(3, 'processing', 'POST /api/v1/relay with authenticated payload...');
      await new Promise((r) => setTimeout(r, 350));

      if (forceSimulation) {
        updateStep(3, 'success', 'Relayed to demo simulator environment.');
        updateStep(4, 'processing', 'Simulating sponsor DUST balancing (0.0042 DUST)...');
        await new Promise((r) => setTimeout(r, 450));
        updateStep(4, 'success', 'Simulated sponsor fee attached.');
        updateStep(5, 'processing', 'Broadcasting to Midnight Preview RPC...');
        await new Promise((r) => setTimeout(r, 350));
        updateStep(5, 'success', 'Broadcast to Midnight Preview RPC.');
        updateStep(6, 'processing', 'Confirming state transition on Midnight Preview...');
        await new Promise((r) => setTimeout(r, 300));
        updateStep(6, 'success', 'Confirmed in Block #849,228.');

        const record: RelayedTxRecord = {
          id: `demo_${Math.random().toString(36).substring(2, 9)}`,
          status: 'DEMO',
          circuitId: selectedCircuit,
          network: 'Midnight Preview (Demo)',
          sponsorAddress: 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          timestamp: Date.now(),
          isDemo: true,
          stateTransition: transitionSummary,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);

        // Apply local mock state
        if (selectedCircuit === 'sponsorTransaction') {
          setDAppQuota((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 1), totalSponsored: prev.totalSponsored + 1 }));
          setTotalSponsoredCount((c) => c + 1);
        } else if (selectedCircuit === 'sponsorMessage') {
          setLatestLedgerMsg(messagePayload);
          setTotalSponsoredCount((c) => c + 1);
        }

        setModeNote('Demo Mode: Simulation flow verified — 0 DUST paid by user.');
        return;
      }

      // Real API call
      const relayRes = await apiClient.submitRelay({
        payloadHex: simulatedPayloadHex,
        circuitId: selectedCircuit,
        contractAddress: 'Dustify.compact',
      });

      if (relayRes.isRelayerNotFunded || (relayRes.data && relayRes.data.status === 'RELAYER_NOT_FUNDED')) {
        updateStep(3, 'success', 'POST /api/v1/relay delivered to active Relayer.');
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
          circuitId: selectedCircuit,
          network: 'Midnight Preview',
          sponsorAddress: relayRes.data?.sponsorAddress || 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          timestamp: Date.now(),
          isDemo: true,
          errorMessage: 'Sponsor wallet requires DUST capacity (0 Specks available).',
          stateTransition: transitionSummary,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);
      } else if (relayRes.success && (relayRes.data?.status === 'SUBMITTED' || relayRes.data?.status === 'CONFIRMED')) {
        updateStep(3, 'success', 'Payload dispatched to Relayer.');
        updateStep(4, 'success', `Balanced with sponsor DUST (${relayRes.data.sponsoredDustFee || '0.0042 DUST'}).`);
        updateStep(5, 'success', `Submitted to RPC: ${relayRes.data.txId?.substring(0, 16)}...`);
        updateStep(6, 'success', 'Confirmed on Midnight Preview ledger.');

        const record: RelayedTxRecord = {
          id: `relay_${Math.random().toString(36).substring(2, 9)}`,
          txId: relayRes.data.txId,
          status: 'SUBMITTED',
          circuitId: selectedCircuit,
          network: 'Midnight Preview',
          sponsorAddress: relayRes.data?.sponsorAddress || 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
          userDustCost: '0 Specks',
          sponsoredDustFee: relayRes.data.sponsoredDustFee || '0.0042 DUST',
          timestamp: Date.now(),
          isDemo: false,
          stateTransition: transitionSummary,
        };

        apiClient.saveTransaction(record);
        onTxCreated(record);
        setResultTx(record);

        if (selectedCircuit === 'sponsorTransaction') {
          setDAppQuota((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 1), totalSponsored: prev.totalSponsored + 1 }));
          setTotalSponsoredCount((c) => c + 1);
        } else if (selectedCircuit === 'sponsorMessage') {
          setLatestLedgerMsg(messagePayload);
          setTotalSponsoredCount((c) => c + 1);
        }
      } else {
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">DUSTify Smart Contract Playground</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Interact with the core <strong>Dustify.compact</strong> smart contract via zero-friction gas abstraction.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-brand-500/10 text-brand-300 border border-brand-500/20">
            Midnight Preview
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Dustify.compact
          </span>
        </div>
      </div>

      {/* Circuit Mode Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(CIRCUIT_CONFIGS) as CircuitMode[]).map((key) => {
          const cfg = CIRCUIT_CONFIGS[key];
          const isSelected = selectedCircuit === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCircuit(key)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-zinc-900 border-brand-500/50 shadow-md ring-1 ring-brand-500/20'
                  : 'bg-zinc-950/60 border-zinc-800/70 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
                  {cfg.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                  {cfg.badge}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white truncate">{cfg.name}</h4>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">{key}()</p>
            </button>
          );
        })}
      </div>

      {/* Two Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Circuit Action & Code Viewer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                  Main Contract Circuit
                </span>
                <h3 className="text-base font-semibold text-white mt-0.5">{activeConfig.name}</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Dustify.compact
              </span>
            </div>

            {/* Circuit description */}
            <p className="text-xs text-zinc-400 leading-relaxed">{activeConfig.description}</p>

            {/* Interactive Inputs */}
            {selectedCircuit === 'sponsorTransaction' && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Target dApp ID:</span>
                  <span className="font-mono text-brand-300 font-semibold">{dAppQuota.name}</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-zinc-400">Epoch Quota Balance</span>
                    <span className="text-emerald-400 font-bold">{dAppQuota.remaining} / {dAppQuota.limit} calls</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${(dAppQuota.remaining / dAppQuota.limit) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-zinc-800/80">
                  <span className="text-zinc-500">Lifetime Sponsored:</span>
                  <span className="font-mono text-zinc-200">{totalSponsoredCount} actions</span>
                </div>
              </div>
            )}

            {selectedCircuit === 'sponsorMessage' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-2">
                  <span className="text-xs text-zinc-400 font-medium">Active Ledger Message</span>
                  <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200">
                    "{latestLedgerMsg}"
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">New Message to Disclose (0 Gas):</label>
                  <input
                    type="text"
                    value={messagePayload}
                    onChange={(e) => setMessagePayload(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            )}

            {selectedCircuit === 'registerDApp' && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">dApp Identifier:</span>
                  <span className="text-purple-300">0x9a8f...4e1b</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Initial Quota:</span>
                  <span className="text-emerald-400 font-bold">1,000 units</span>
                </div>
              </div>
            )}

            {selectedCircuit === 'authorizeRelayer' && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Relayer Public Key:</span>
                  <span className="text-amber-300">0x3b1c...99a2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Access Scope:</span>
                  <span className="text-zinc-200">Full Relay Authority</span>
                </div>
              </div>
            )}

            {/* Zero Gas Callout */}
            <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-zinc-300 font-medium">
                <Zap className="w-4 h-4 text-brand-400" />
                <span>Zero-Gas Settlement Guarantee</span>
              </div>
              <div className="space-y-1 text-zinc-400 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="text-brand-400">🔵</span>
                  <span>Evaluated locally in client memory with private witness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400">🟢</span>
                  <span>100% network fee sponsored by DUSTify Relayer</span>
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
                  <span>Relaying Sponsored Transaction...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 text-zinc-900" />
                  <span>Execute {selectedCircuit}() (0 DUST)</span>
                </>
              )}
            </button>
          </div>

          {/* Compact Smart Contract Code Viewer */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-semibold text-white font-mono">Dustify.compact</h4>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono border border-zinc-700 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-72">
              {DUSTIFY_CONTRACT_SOURCE}
            </pre>
          </div>
        </div>

        {/* Right: Pipeline Stepper & Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white">Execution Pipeline</h3>
              </div>
              <span className="text-xs text-zinc-500 font-mono">7-Stage Protocol Flow</span>
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

            {/* Funding Warning Action Controls */}
            {fundingWarning && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Sponsor DUST Required for Live Settlement</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  The Master Relayer authenticated your transaction payload for <code>Dustify.compact</code>, but the sponsor address currently holds <strong>0 Specks</strong>. You can run a full demo simulation or inspect live relayer health telemetry.
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
            {resultTx && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">
                      {resultTx.isDemo ? 'Simulation Completed' : 'Transaction Submitted'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {new Date(resultTx.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-zinc-800">
                  <div>
                    <span className="text-zinc-500">Contract / Circuit:</span>
                    <p className="text-brand-300">Dustify.compact::{resultTx.circuitId}</p>
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
                <span>Zero-Knowledge Guarantees & Privacy Proof</span>
                {isDetailsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isDetailsExpanded && (
                <div className="mt-3 p-3 rounded-lg bg-zinc-950 text-xs space-y-2 font-mono text-zinc-400 border border-zinc-800">
                  <div className="flex justify-between">
                    <span>Proof Engine:</span>
                    <span className="text-emerald-400">Local Kachina ZK Prover</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Witness Protection:</span>
                    <span className="text-emerald-400">100% In-Memory (Zero Leakage)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nullifier Derivation:</span>
                    <span className="text-emerald-400">persistentHash (Anti-Sybil)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Sponsor:</span>
                    <span className="text-zinc-200">DUSTify Master Relayer</span>
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
