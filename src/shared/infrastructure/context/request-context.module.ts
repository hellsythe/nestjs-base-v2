import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestContextAdapter } from './request-context.adapter';
import { RequestContextPort } from '../../application/ports/request-context.port';
import { RequestContextMiddleware } from './request-context.middleware';

@Global()
@Module({
  providers: [
    RequestContextAdapter,
    RequestContextMiddleware,
    {
      provide: RequestContextPort,
      useExisting: RequestContextAdapter,
    },
  ],
  exports: [RequestContextPort],
})
export class RequestContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
