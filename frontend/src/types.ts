export interface RelayerStatus {
  service: string;
  version: string;
  uptimeSeconds: number;
  network: string;
  sponsorAddress: string | null;
  sponsorWalletSyncStatus: 'INITIALIZING' | 'SYNCING' | 'SYNCED' | 'ERROR';
  isSynced: boolean;
  sponsorDustAvailability: {
    balanceSpecks: string;
    balanceDust: string;
    hasDust: boolean;
    status: 'READY' | 'AWAITING_FUNDING';
  };
  relayerReady: boolean;
  endpoints: {
    indexerHttpUrl: string;
    nodeRpcUrl: string;
    proofServerUrl: string;
  };
}

export type TxStepStatus = 'idle' | 'in_progress' | 'completed' | 'failed' | 'warning';

export interface ExecutionLog {
  id: string;
  timestamp: string;
  stage: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
  payload?: any;
}
