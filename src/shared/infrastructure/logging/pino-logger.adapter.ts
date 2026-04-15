import { Injectable } from '@nestjs/common';
import { LoggerPort } from '../../application/ports/logger.port';
import { RequestContextPort } from '../../application/ports/request-context.port';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PinoLoggerAdapter implements LoggerPort {
  constructor(
    private readonly logger: Logger,
    private readonly context: RequestContextPort,
  ) {}

  private enrich(meta?: Record<string, any>) {
    return {
      requestId: this.context.getRequestId(),
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.log(this.enrich(meta), message);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(this.enrich(meta), message);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(this.enrich(meta), message);
  }
}
