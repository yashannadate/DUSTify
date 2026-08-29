import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface RelayerConfig {
  port: number;
  environment: 'preview' | 'preprod' | 'undeployed';
  indexerHttpUrl: string;
  indexerWsUrl: string;
  nodeRpcUrl: string;
  proofServerUrl: string;
  masterWalletSeed: string;
  apiKey: string;
  allowedOrigins: string[];
  rateLimitMax: number;
}

export function loadConfig(): RelayerConfig {
  const environment = (process.env.MIDNIGHT_NETWORK || 'preview') as RelayerConfig['environment'];

  // Zero Hardcoding: All endpoints are configurable via environment variables with Preview defaults
  const indexerHttpUrl = process.env.INDEXER_HTTP_URL || 'https://indexer.preview.midnight.network/api/v4/graphql';
  const indexerWsUrl = process.env.INDEXER_WS_URL || 'wss://indexer.preview.midnight.network/api/v4/graphql/ws';
  const nodeRpcUrl = process.env.NODE_RPC_URL || 'wss://rpc.preview.midnight.network';
  const proofServerUrl = process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300';
  
  const masterWalletSeed = process.env.MASTER_WALLET_SEED || '69f5ae92610c4591a25b3cec4e958156edaf483a6d6cc3ecb53f78f645756244';
  const apiKey = process.env.DUSTIFY_API_KEY || 'dustify_dev_key_preview';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    environment,
    indexerHttpUrl,
    indexerWsUrl,
    nodeRpcUrl,
    proofServerUrl,
    masterWalletSeed,
    apiKey,
    allowedOrigins,
    rateLimitMax,
  };
}
