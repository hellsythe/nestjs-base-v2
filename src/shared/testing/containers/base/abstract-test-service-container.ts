import type {
  ServiceConnectionInfo,
  TestServiceContainer,
} from '../contracts/test-service-container';

export abstract class AbstractTestServiceContainer
  implements TestServiceContainer
{
  private started = false;
  private info?: ServiceConnectionInfo;

  constructor(public readonly name: string) {}

  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    this.info = await this.doStart();
    this.started = true;
  }

  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.doStop();
    this.started = false;
    this.info = undefined;
  }

  async reset(): Promise<void> {
    this.assertStarted();

    if (!this.doReset) {
      return;
    }

    await this.doReset();
  }

  getConnectionInfo(): ServiceConnectionInfo {
    this.assertStarted();
    return this.info!;
  }

  getEnv(): Record<string, string> {
    const info = this.getConnectionInfo();
    return this.buildEnv(info);
  }

  protected assertStarted(): void {
    if (!this.started || !this.info) {
      throw new Error(`${this.name} container is not started`);
    }
  }

  protected abstract doStart(): Promise<ServiceConnectionInfo>;
  protected abstract doStop(): Promise<void>;
  protected doReset?(): Promise<void>;
  protected abstract buildEnv(
    connectionInfo: ServiceConnectionInfo,
  ): Record<string, string>;
}
