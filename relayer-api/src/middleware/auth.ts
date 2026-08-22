import { Request, Response, NextFunction } from 'express';
import { RelayerConfig } from '../config.js';

export function createAuthMiddleware(config: RelayerConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Validate API Key
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey || apiKey !== config.apiKey) {
      res.status(401).json({
        error: 'DUSTIFY_UNAUTHORIZED',
        message: 'Invalid or missing DUSTify API Key (x-api-key header required)',
      });
      return;
    }

    // 2. Validate Domain Origin for browser client requests
    const origin = req.headers.origin;
    if (origin && config.allowedOrigins.length > 0 && !config.allowedOrigins.includes(origin)) {
      res.status(403).json({
        error: 'DUSTIFY_ORIGIN_FORBIDDEN',
        message: `Origin ${origin} is not allowed to request transaction sponsorship.`,
      });
      return;
    }

    next();
  };
}
