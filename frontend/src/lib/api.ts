import { RelayerTelemetry, RelayedTxRecord } from '../types';

const RELAYER_URL = import.meta.env.VITE_RELAYER_API_URL || 'http://localhost:3001';
const API_KEY = import.meta.env.VITE_RELAYER_API_KEY || 'dustify_dev_key_preview_2026';

export const apiClient = {
  getRelayerUrl(): string {
    return RELAYER_URL;
  },

  getApiKey(): string {
    return API_KEY;
  },

  async fetchHealth(): Promise<{ online: boolean; latencyMs: number }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${RELAYER_URL}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - start);
      return { online: res.ok, latencyMs };
    } catch {
      return { online: false, latencyMs: 0 };
    }
  },

  async fetchTelemetry(): Promise<{
    data: RelayerTelemetry | null;
    error: string | null;
    latencyMs: number;
  }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${RELAYER_URL}/api/v1/status`, { signal: controller.signal });
      clearTimeout(timeout);
      const latencyMs = Math.round(performance.now() - start);

      if (!res.ok) {
        return { data: null, error: `HTTP ${res.status}: ${res.statusText}`, latencyMs };
      }

      const data: RelayerTelemetry = await res.json();
      return { data, error: null, latencyMs };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        data: null,
        error: err.name === 'AbortError' ? 'Connection timed out' : 'Relayer offline (http://localhost:3001)',
        latencyMs,
      };
    }
  },

  async submitRelay(payload: {
    payloadHex: string;
    circuitId?: string;
    contractAddress?: string;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    isRelayerNotFunded?: boolean;
  }> {
    try {
      const res = await fetch(`${RELAYER_URL}/api/v1/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503 && data.status === 'RELAYER_NOT_FUNDED') {
          return {
            success: false,
            data,
            error: data.message || 'Sponsor wallet has 0 DUST capacity on Preview.',
            isRelayerNotFunded: true,
          };
        }
        return {
          success: false,
          error: data.message || data.error || `HTTP ${res.status}`,
        };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  // Local storage for user playground transactions
  getStoredTransactions(): RelayedTxRecord[] {
    const defaultTxs: RelayedTxRecord[] = [
      {
        id: 'relay_preview_e2e_01',
        txId: '003986f9b5fb20f3a320ac0b2a744ef96fd2581334608a1a3a5371b300c84d9d4c',
        status: 'CONFIRMED',
        circuitId: 'incrementCounter',
        network: 'Midnight Preview',
        sponsorAddress: 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
        userDustCost: '0 Specks',
        sponsoredDustFee: '0.0042 DUST',
        timestamp: Date.now() - 120_000,
        isDemo: false,
        stateTransition: 'Counter: 0 → 1 (Live Preview On-Chain Confirmation)',
      },
      {
        id: 'relay_dust_reg_01',
        txId: '0050c425ed0b0625e3767ebf0b269754b8320fefbaa079d4197c778f9be29dd9a7',
        status: 'CONFIRMED',
        circuitId: 'registerNightUtxosForDustGeneration',
        network: 'Midnight Preview',
        sponsorAddress: 'mn_addr_preview19y0dne42duqurduex2hnmju94pjtm4gx44rltpmnsqk382llf4hq5tlkgd',
        userDustCost: '0 Specks',
        sponsoredDustFee: '300,000,000,000,001 Specks',
        timestamp: Date.now() - 3_600_000,
        isDemo: false,
        stateTransition: '5,000 tNIGHT UTXO Registered for Continuous DUST Generation',
      }
    ];

    try {
      const raw = localStorage.getItem('dustify_relayed_txs');
      if (!raw) return defaultTxs;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultTxs;
      return parsed;
    } catch {
      return defaultTxs;
    }
  },

  saveTransaction(record: RelayedTxRecord): void {
    try {
      const current = this.getStoredTransactions();
      const updated = [record, ...current.filter((t) => t.id !== record.id)].slice(0, 50);
      localStorage.setItem('dustify_relayed_txs', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save tx record to localStorage', err);
    }
  },
};
