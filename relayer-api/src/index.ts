import express from 'express';
import cors from 'cors';
import { loadConfig } from './config.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { MidnightSponsorService } from './services/midnight.js';

const config = loadConfig();
const app = express();
const sponsorService = new MidnightSponsorService(config);

app.use(cors({ origin: config.allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

const authMiddleware = createAuthMiddleware(config);

// Status Endpoint (Public)
app.get('/api/v1/status', async (req, res) => {
  try {
    const status = await sponsorService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// Relay Endpoint (Authenticated)
app.post('/api/v1/relay', authMiddleware, async (req, res) => {
  try {
    const { payloadHex, circuitId, contractAddress } = req.body;

    if (!payloadHex) {
      res.status(400).json({ error: 'DUSTIFY_INVALID_REQUEST', message: 'Missing payloadHex' });
      return;
    }

    console.log(`[DUSTify Relayer] Received sponsorship request for circuit: ${circuitId || 'unknown'}`);
    
    const result = await sponsorService.sponsorAndSubmit(payloadHex);

    res.json({
      status: 'CONFIRMED',
      txId: result.txId,
      sponsoredDustFee: result.sponsoredDustFee,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[DUSTify Relayer] Sponsorship failed:', err.message);
    res.status(500).json({
      error: 'DUSTIFY_MIDNIGHT_SUBMISSION_FAILED',
      message: err.message,
    });
  }
});

// Start Express Relayer Server
app.listen(config.port, async () => {
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
