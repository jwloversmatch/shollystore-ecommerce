import { Request, Response, NextFunction } from 'express';

const SENSITIVE_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];

export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const isSensitive = SENSITIVE_PATHS.some((p) => req.path.startsWith(p.replace('/api', ''))) ||
    req.path.includes('/auth/');

  if (isSensitive && req.method !== 'GET') {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const originalEnd = res.end.bind(res);

    res.end = function (...args: Parameters<typeof originalEnd>) {
      if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 423) {
        console.warn(`[SECURITY] ${req.method} ${req.originalUrl} → ${res.statusCode} from ${ip}`);
      }
      return originalEnd(...args);
    } as typeof res.end;
  }

  next();
};

/** Log state-changing admin operations */
export const auditLog = (action: string) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const userId = (req as { user?: { _id?: string } }).user?._id ?? 'anonymous';
    const ip = req.ip || 'unknown';
    console.info(`[AUDIT] ${action} by user=${userId} ip=${ip} path=${req.originalUrl}`);
    next();
  };
