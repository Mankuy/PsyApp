import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface AuditLogEntry {
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  userId?: string;
  statusCode: number;
  durationMs: number;
  bodyKeys?: string[];
  queryKeys?: string[];
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuditLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const entry: AuditLogEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        userId: (req as any).user?.id,
        statusCode: res.statusCode,
        durationMs: duration,
        bodyKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body) : undefined,
        queryKeys: req.query && typeof req.query === 'object' ? Object.keys(req.query) : undefined,
      };

      this.logger.log(JSON.stringify(entry));
    });

    next();
  }
}
