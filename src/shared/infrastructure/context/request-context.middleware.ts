import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContextAdapter } from './request-context.adapter';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextAdapter) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const transactionId = req.headers['x-request-id']?.toString() ?? randomUUID();
    req.headers['x-request-id'] = transactionId;

    res.setHeader('x-request-id', transactionId);
    res.setHeader('x-transaction-id', transactionId);

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return originalJson(body);
      }

      if ('transactionId' in (body as Record<string, unknown>)) {
        return originalJson(body);
      }

      return originalJson({
        ...(body as Record<string, unknown>),
        transactionId,
      });
    }) as Response['json'];

    this.context.runWithRequestId(transactionId, next);
  }
}
