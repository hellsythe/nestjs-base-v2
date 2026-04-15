import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { RequestContextAdapter } from './request-context.adapter';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextAdapter) {}

  use(req: Request, _: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    this.context.runWithRequestId(requestId, next);
  }
}
