export interface DustifyClientConfig {
  relayerUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export interface SponsorOptions {
  circuitId?: string;
  contractAddress?: string;
}

export interface SponsorResponse {
  status: 'SUBMITTED' | 'CONFIRMED' | 'RELAYER_NOT_FUNDED' | 'REJECTED';
  txId?: string;
  circuitId?: string | null;
  contractAddress?: string | null;
  sponsoredDustFee?: string;
  timestamp: number;
  error?: string;
  message?: string;
  dustBalance?: string;
  sponsorAddress?: string;
}

export interface RelayerStatusResponse {
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

/**
 * Helper to convert Uint8Array to hex string safely across Node & Browser
 */
function uint8ArrayToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export class DustifyClient {
  private relayerUrl: string;
  private apiKey: string;
  private timeoutMs: number;

  constructor(config: DustifyClientConfig) {
    if (!config.relayerUrl) throw new Error('[DUSTify SDK] relayerUrl is required');
    if (!config.apiKey) throw new Error('[DUSTify SDK] apiKey is required');

    this.relayerUrl = config.relayerUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs || 60_000;
  }

  /**
   * Serializes an UnboundTransaction (proven locally with 0 DUST paid by end user)
   * and routes it to the DUSTify Relayer for DUST fee sponsorship.
   *
   * The client / user needs 0 DUST tokens, 0 DUST capacity, and 0 faucet navigation.
   */
  async relay(unboundTx: any, options?: SponsorOptions): Promise<SponsorResponse> {
    return this.sponsorAndSubmit(unboundTx, options);
  }

  /**
   * Main entry point to sponsor an UnboundTransaction.
   * Accepts proven transaction object with .serialize(), raw Uint8Array, or hex string.
   */
  async sponsorAndSubmit(
    unboundTx: any,
    optionsOrCircuitId?: string | SponsorOptions
  ): Promise<SponsorResponse> {
    const options: SponsorOptions =
      typeof optionsOrCircuitId === 'string'
        ? { circuitId: optionsOrCircuitId }
        : optionsOrCircuitId || {};

    let payloadHex: string;

    if (typeof unboundTx === 'string') {
      payloadHex = unboundTx;
    } else if (unboundTx instanceof Uint8Array) {
      payloadHex = uint8ArrayToHex(unboundTx);
    } else if (unboundTx && typeof unboundTx.serialize === 'function') {
      const bytes: Uint8Array = unboundTx.serialize();
      payloadHex = uint8ArrayToHex(bytes);
    } else {
      throw new Error(
        '[DUSTify SDK] Invalid transaction payload. Expected UnboundTransaction instance with .serialize(), Uint8Array, or hex string.'
      );
    }

    console.log(`[DUSTify SDK] Dispatching payload (${payloadHex.length / 2} bytes) to Relayer at ${this.relayerUrl}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.relayerUrl}/api/v1/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          payloadHex,
          circuitId: options.circuitId,
          contractAddress: options.contractAddress,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503 && data.status === 'RELAYER_NOT_FUNDED') {
          console.warn('[DUSTify SDK] Relayer is awaiting DUST funding on Midnight network:', data.message);
          return {
            status: 'RELAYER_NOT_FUNDED',
            error: data.error,
            message: data.message,
            sponsorAddress: data.sponsorAddress,
            dustBalance: data.dustBalance,
            timestamp: Date.now(),
          };
        }
        throw new Error(`DUSTify Relayer Rejected Request (${response.status}): ${data.message || data.error || response.statusText}`);
      }

      console.log(`[DUSTify SDK] Sponsorship confirmed on-chain! TxId: ${data.txId}`);
      return data as SponsorResponse;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`[DUSTify SDK] Request timed out after ${this.timeoutMs}ms waiting for Relayer response.`);
      }
      throw err;
    }
  }

  /**
   * Fetches current Relayer operational status, Midnight network, and DUST balance
   */
  async getStatus(): Promise<RelayerStatusResponse> {
    const response = await fetch(`${this.relayerUrl}/api/v1/status`);
    if (!response.ok) {
      throw new Error(`[DUSTify SDK] Failed to fetch Relayer status (${response.status})`);
    }
    return (await response.json()) as RelayerStatusResponse;
  }

  /**
   * Simple ping check to verify Relayer is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.relayerUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
