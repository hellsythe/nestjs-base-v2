import { AbstractMappedPortContainer } from '../base/abstract-mapped-port-container';
import type { ServiceConnectionInfo } from '../contracts/test-service-container';
import type { StartedContainerLike } from '../contracts/started-container-like';

export interface UnleashTestContainerOptions {
  startFactory: () => Promise<StartedContainerLike>;
  internalPort?: number;
  appName?: string;
}

export class UnleashTestContainer extends AbstractMappedPortContainer {
  private readonly appName: string;

  constructor(options: UnleashTestContainerOptions) {
    super({
      name: 'unleash',
      internalPort: options.internalPort ?? 4242,
      startFactory: options.startFactory,
    });

    this.appName = options.appName ?? 'test-app';
  }

  protected override buildUrl(host: string, port: number): string {
    return `http://${host}:${port}/api`;
  }

  protected buildEnv(info: ServiceConnectionInfo): Record<string, string> {
    return {
      UNLEASH_URL: info.url ?? '',
      UNLEASH_APP_NAME: this.appName,
    };
  }
}
