import type { TestServiceContainer } from './contracts/test-service-container';

export class ContainerOrchestrator {
  private readonly startedContainers: TestServiceContainer[] = [];

  constructor(private readonly containers: TestServiceContainer[]) {}

  async startAll(): Promise<Record<string, string>> {
    for (const container of this.containers) {
      await container.start();
      this.startedContainers.push(container);
    }

    return this.getMergedEnv();
  }

  async stopAll(): Promise<void> {
    for (let i = this.startedContainers.length - 1; i >= 0; i -= 1) {
      await this.startedContainers[i].stop();
    }

    this.startedContainers.length = 0;
  }

  async resetAll(): Promise<void> {
    for (const container of this.startedContainers) {
      if (container.reset) {
        await container.reset();
      }
    }
  }

  getMergedEnv(): Record<string, string> {
    return this.containers.reduce<Record<string, string>>((acc, container) => {
      Object.assign(acc, container.getEnv());
      return acc;
    }, {});
  }
}
