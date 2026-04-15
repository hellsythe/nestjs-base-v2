import { Global, Module } from '@nestjs/common';
import { LoggerModule, Params } from 'nestjs-pino';
import { pinoConfig } from './pino.config';
import { PinoLoggerAdapter } from './pino-logger.adapter';
import { LoggerPort } from '../../application/ports/logger.port';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<Params> => {
        return {
          pinoHttp: {
            ...pinoConfig(),
            autoLogging: true,
            level: configService.get('LOG_LEVEL'),
            genReqId: (req) => req.headers['x-request-id']?.toString() ?? randomUUID(),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: LoggerPort,
      useClass: PinoLoggerAdapter,
    },
  ],
  exports: [LoggerPort],
})
export class PinoLoggerModule {}
