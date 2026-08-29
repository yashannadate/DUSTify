export type ViewMode = 'landing' | 'dashboard';

export type DashboardTab =
  | 'overview'
  | 'apps'
  | 'api-keys'
  | 'transactions'
  | 'relayer'
  | 'sponsor'
  | 'playground'
  | 'docs'
  | 'security';

export interface SponsorDustAvailability {
  balanceSpecks: string;
  balanceDust: string;
  hasDust: boolean;
  status: 'READY' | 'AWAITING_FUNDING';
}

export interface RelayerEndpoints {
  indexerHttpUrl: string;
  nodeRpcUrl: string;
  proofServerUrl: string;
}

export interface RelayerTelemetry {
  service: string;
  version: string;
  uptimeSeconds: number;
  network: string;
  sponsorAddress: string | null;
  sponsorWalletSyncStatus: 'INITIALIZING' | 'SYNCING' | 'SYNCED' | 'ERROR';
  isSynced: boolean;
  sponsorDustAvailability: SponsorDustAvailability;
  relayerReady: boolean;
  endpoints: RelayerEndpoints;
}

export type TxStatus = 'CONFIRMED' | 'PENDING' | 'FAILED' | 'DEMO' | 'RELAYER_NOT_FUNDED';

export interface RelayedTxRecord {
  id: string;
  txId?: string;
  appName?: string;
  status: TxStatus;
  circuitId: string;
  network: string;
  sponsorAddress: string;
  userDustCost: string;
  sponsoredDustFee?: string;
  timestamp: number;
  isDemo: boolean;
  payloadHex?: string;
  errorMessage?: string;
  stateTransition?: string;
}

export interface PipelineStep {
  id: number;
  title: string;
  description: string;
  status: 'waiting' | 'processing' | 'success' | 'failed';
  details?: string;
}

export interface AppRecord {
  id: string;
  name: string;
  origin: string;
  env: string;
  apiKeyPrefix: string;
  txCount: number;
  status: 'Connected' | 'Pending';
  createdAt: number;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  fullKey?: string;
  createdAt: number;
  lastUsed: string;
  status: 'Active' | 'Revoked';
}
