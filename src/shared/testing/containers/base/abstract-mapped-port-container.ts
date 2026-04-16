import { AbstractTestServiceContainer } from './abstract-test-service-container';
import type { ServiceConnectionInfo } from '../contracts/test-service-container';
import type { StartedContainerLike } from '../contracts/started-container-like';

export interface MappedPortContainerOptions {
  name: string;
  internalPort: number;
  startFactory: () => Promise<StartedContainerLike>;
}

export abstract class AbstractMappedPortContainer extends AbstractTestServiceContainer {
  protected handle?: StartedContainerLike;
  protected readonly internalPort: number;
  private readonly startFactory: () => Promise<StartedContainerLike>;

  constructor(options: MappedPortContainerOptions) {
    super(options.name);
    this.internalPort = options.internalPort;
    this.startFactory = options.startFactory;
  }

  protected async doStart(): Promise<ServiceConnectionInfo> {
    this.handle = await this.startFactory();
    const host = this.handle.getHost();
    const port = this.handle.getMappedPort(this.internalPort);

    return {
      host,
      port,
      url: this.buildUrl(host, port),
    };
  }

  protected async doStop(): Promise<void> {
    if (!this.handle) {
      return;
    }

    await this.handle.stop();
    this.handle = undefined;
  }

  protected buildUrl(host: string, port: number): string | undefined {
    return `${host}:${port}`;
  }
}
