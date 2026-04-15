import { Global, Module } from '@nestjs/common';
import { FeatureFlagProvider } from './feature-flag.provider';
import { FeatureFlagPort } from '../../application/ports/feature-flag.port';

@Global()
@Module({
  providers: [FeatureFlagProvider],
  exports: [FeatureFlagPort],
})
export class FeatureFlagModule {}
