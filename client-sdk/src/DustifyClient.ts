import { Buffer } from 'buffer';
import { Transaction } from '@midnight-ntwrk/midnight-js-protocol/ledger';

export interface DustifyClientConfig {
  relayerUrl: string;
  apiKey: string;
}

export interface SponsorResponse {
  status: 'CONFIRMED' | 'REJECTED';
  txId: string;
  sponsoredDustFee: string;
  timestamp: number;
}

export class DustifyClient {
  private relayerUrl: string;
  private apiKey: string;

  constructor(config: DustifyClientConfig) {
    this.relayerUrl = config.relayerUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  /**
   * Intercepts an UnboundTransaction (proven locally at 0 DUST cost),
   * serializes it, and sends it to the DUSTify Relayer for DUST fee sponsorship.
   * 
   * The user/client does NOT need a DUST wallet or DUST capacity.
   */
  async sponsorAndSubmit(unboundTx: any, circuitId?: string): Promise<SponsorResponse> {
    console.log('[DUSTify SDK] Serializing UnboundTransaction (0 DUST consumed from user)...');
    
    // Native Wasm serialization
    const bytes: Uint8Array = unboundTx.serialize();
    const payloadHex = Buffer.from(bytes).toString('hex');

    console.log(`[DUSTify SDK] Payload serialized (${bytes.length} bytes). Sending to Relayer API...`);

    const response = await fetch(`${this.relayerUrl}/api/v1/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify({
        payloadHex,
        circuitId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DUSTify Relayer Sponsorship Rejected (${response.status}): ${errorText}`);
    }

    const data: SponsorResponse = await response.json();
    console.log(`[DUSTify SDK] Sponsorship confirmed! TxId: ${data.txId}`);
    return data;
  }
}
