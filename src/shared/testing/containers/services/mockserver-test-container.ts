import { AbstractMappedPortContainer } from '../base/abstract-mapped-port-container';
import type { ServiceConnectionInfo } from '../contracts/test-service-container';
import type { StartedContainerLike } from '../contracts/started-container-like';

export interface MockServerTestContainerOptions {
  startFactory: () => Promise<StartedContainerLike>;
  internalPort?: number;
}

export class MockServerTestContainer extends AbstractMappedPortContainer {
  constructor(options: MockServerTestContainerOptions) {
    super({
      name: 'mockserver',
      internalPort: options.internalPort ?? 1080,
      startFactory: options.startFactory,
    });
  }

  protected override buildUrl(host: string, port: number): string {
    return `http://${host}:${port}`;
  }

  protected buildEnv(info: ServiceConnectionInfo): Record<string, string> {
    return {
      MOCKSERVER_HOST: info.host,
      MOCKSERVER_PORT: String(info.port),
      MOCKSERVER_URL: info.url ?? '',
    };
  }
}
