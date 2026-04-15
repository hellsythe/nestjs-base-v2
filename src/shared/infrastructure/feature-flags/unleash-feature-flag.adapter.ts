import { FeatureFlagPort } from '../../application/ports/feature-flag.port';

export class UnleashFeatureFlagAdapter extends FeatureFlagPort {
  constructor(private readonly client: any) {
    super();
  }

  onModuleDestroy() {
    this.client.destroy();
  }

  async isEnabled(flag: string, context?: string): Promise<boolean> {
    return this.client.isEnabled(flag, { userId: context }, false);
  }
}
