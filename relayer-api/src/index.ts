import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { loadConfig } from './config.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { MidnightSponsorService } from './services/midnight.js';

const config = loadConfig();
const app = express();
const sponsorService = new MidnightSponsorService(config);

// In-Memory Rate Limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  let record = requestCounts.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    requestCounts.set(ip, record);
    return next();
  }

  record.count++;
  if (record.count > config.rateLimitMax) {
    res.status(429).json({
      error: 'DUSTIFY_RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Maximum ${config.rateLimitMax} requests per minute.`,
    });
    return;
  }
  next();
}

app.use(cors({
  origin: config.allowedOrigins.length === 1 && config.allowedOrigins[0] === '*' ? '*' : config.allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
}));
app.use(express.json({ limit: '15mb' }));
app.use(rateLimitMiddleware);

const authMiddleware = createAuthMiddleware(config);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'DUSTify Relayer API',
    description: 'Zero-Friction DUST Relayer & Fee-Abstraction Infrastructure for Midnight Network',
    version: '0.1.0',
    network: config.environment,
    docs: 'https://github.com/yashannadate/DUSTify',
    endpoints: {
      status: 'GET /api/v1/status',
      relay: 'POST /api/v1/relay (Requires x-api-key)',
      health: 'GET /health',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: Date.now() });
});

// Public Status Endpoint
app.get('/api/v1/status', async (req, res) => {
  try {
    const status = await sponsorService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// Authenticated Relay Endpoint
app.post('/api/v1/relay', authMiddleware, async (req, res) => {
  try {
    const { payloadHex, circuitId, contractAddress } = req.body;

    if (!payloadHex || typeof payloadHex !== 'string') {
      res.status(400).json({
        error: 'DUSTIFY_INVALID_REQUEST',
        message: 'Missing or invalid "payloadHex" parameter (hexadecimal string required)',
      });
      return;
    }

    if (payloadHex.length < 10) {
      res.status(400).json({
        error: 'DUSTIFY_INVALID_PAYLOAD',
        message: 'Payload hex string too short to be a valid UnboundTransaction',
      });
      return;
    }

    console.log(`[DUSTify Relayer] Processing sponsorship request for circuit: ${circuitId || 'general'}`);
    
    const result = await sponsorService.sponsorAndSubmit(payloadHex, circuitId);

    res.json({
      status: 'CONFIRMED',
      txId: result.txId,
      circuitId: circuitId || null,
      contractAddress: contractAddress || null,
      sponsoredDustFee: result.sponsoredDustFee,
      timestamp: result.timestamp,
    });
  } catch (err: any) {
    console.error('[DUSTify Relayer] Relay handler error:', err.message);

    if (err.code === 'RELAYER_NOT_FUNDED') {
      res.status(503).json({
        status: 'RELAYER_NOT_FUNDED',
        error: 'RELAYER_NOT_FUNDED',
        message: err.message,
        sponsorAddress: err.sponsorAddress,
        dustBalance: err.dustBalance || '0 Specks',
      });
      return;
    }

    if (err.code === 'INVALID_TRANSACTION_PAYLOAD') {
      res.status(400).json({
        status: 'INVALID_PAYLOAD',
        error: 'INVALID_TRANSACTION_PAYLOAD',
        message: err.message,
      });
      return;
    }

    if (err.code === 'RELAYER_NOT_INITIALIZED') {
      res.status(503).json({
        status: 'INITIALIZING',
        error: 'RELAYER_NOT_INITIALIZED',
        message: 'Relayer is still syncing with Midnight network. Please retry in a few moments.',
      });
      return;
    }

    res.status(500).json({
      status: 'SUBMISSION_FAILED',
      error: 'DUSTIFY_MIDNIGHT_SUBMISSION_FAILED',
      message: err.message,
    });
  }
});

// Start Express Relayer Server
const server = app.listen(config.port, '0.0.0.0', async () => {
  console.log(`================================================================`);
  console.log(`⚡ DUSTify Master Relayer API running on http://localhost:${config.port}`);
  console.log(`   Midnight Network Target: ${config.environment.toUpperCase()}`);
  console.log(`   Indexer HTTP Endpoint:   ${config.indexerHttpUrl}`);
  console.log(`   Node RPC Endpoint:       ${config.nodeRpcUrl}`);
  console.log(`================================================================`);
  
  try {
    await sponsorService.initialize();
  } catch (err: any) {
    console.error('[DUSTify Relayer] Wallet initialization error:', err.message);
  }
});

export { app, server };
