import { UnleashFeatureFlagAdapter } from './unleash-feature-flag.adapter';
import { DisabledFeatureFlagAdapter } from './disabled-feature-flag.adapter';
import { ConfigService } from '@nestjs/config';
import { FeatureFlagPort } from '../../application/ports/feature-flag.port';
import { startUnleash } from 'unleash-client';

function isEnabled(value?: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value ?? '').toLowerCase());
}

export const FeatureFlagProvider = {
  provide: FeatureFlagPort,
  useFactory: async (configService: ConfigService) => {
    const unleashEnabled = isEnabled(configService.get<string>('UNLEASH_ENABLED'));

    if (!unleashEnabled) {
      return new DisabledFeatureFlagAdapter();
    }

    const client = await startUnleash({
      url: configService.getOrThrow('UNLEASH_URL'),
      appName: configService.getOrThrow('UNLEASH_APP_NAME'),
      instanceId: configService.getOrThrow('UNLEASH_INSTANCE_ID'),
      refreshInterval: Number(
        configService.getOrThrow('UNLEASH_REFRESH_INTERVAL'),
      ),
      metricsInterval: Number(
        configService.getOrThrow('UNLEASH_METRICS_INTERVAL'),
      ),
    });

    return new UnleashFeatureFlagAdapter(client);
  },
  inject: [ConfigService],
};
