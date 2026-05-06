import { FeatureFlagPort } from '../../application/ports/feature-flag.port';

export class DisabledFeatureFlagAdapter extends FeatureFlagPort {
  async isEnabled(_: string, __?: string): Promise<boolean> {
    return false;
  }
}
