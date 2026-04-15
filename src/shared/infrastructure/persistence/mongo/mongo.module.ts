import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.getOrThrow<string>('DB_HOST');
        const port = config.getOrThrow<string>('DB_PORT');
        const db = config.getOrThrow<string>('DB_NAME');
        const user = config.get<string>('DB_USER');
        const pass = config.get<string>('DB_PASS');

        const credentials =
          user && pass
            ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
            : '';

        return {
          uri: `mongodb://${credentials}${host}:${port}/${db}`,
          authSource: 'admin',
          autoIndex: false,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          retryWrites: false, // MongoDB 4.0 standalone doesn't support retryable writes
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {}
