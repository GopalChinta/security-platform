import morgan from 'morgan';
import { Request, Response } from 'express';

// Custom token for request IP address
morgan.token('client-ip', (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
});

// Custom token for authenticated user and tenant
morgan.token('auth-user', (req: Request) => {
  if (req.user) {
    return `[${req.user.tenantSlug}:${req.user.role}:${req.user.email}]`;
  }
  return '[anonymous]';
});

export const requestLogger = morgan(
  ':client-ip - :auth-user ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
  {
    skip: (req: Request, _res: Response) => {
      // Don't log health check in test mode
      return process.env.NODE_ENV === 'test' && req.path === '/health';
    },
  }
);
