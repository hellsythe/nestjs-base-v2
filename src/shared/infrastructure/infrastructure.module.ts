import { Module } from '@nestjs/common';

import { MongoModule } from './persistence/mongo/mongo.module';
import { HealthModule } from './http/health/health.module';
import { PinoLoggerModule } from './logging/pino-logger.module';
import { ConfigModule } from '@nestjs/config';
import { FeatureFlagModule } from './feature-flags/feature-flag.module';
import { RequestContextModule } from './context/request-context.module';
import { HttpConfigModule } from './http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    RequestContextModule,
    MongoModule,
    HealthModule,
    FeatureFlagModule,
    PinoLoggerModule,
    HttpConfigModule,
  ],
  exports: [MongoModule, ConfigModule, FeatureFlagModule],
})
export class InfrastructureModule {}
