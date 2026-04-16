import { AbstractMappedPortContainer } from '../base/abstract-mapped-port-container';
import type { ServiceConnectionInfo } from '../contracts/test-service-container';
import type { StartedContainerLike } from '../contracts/started-container-like';

export interface MongoTestContainerOptions {
  startFactory: () => Promise<StartedContainerLike>;
  internalPort?: number;
  dbName?: string;
  username?: string;
  password?: string;
}

export class MongoTestContainer extends AbstractMappedPortContainer {
  private readonly dbName: string;
  private readonly username?: string;
  private readonly password?: string;

  constructor(options: MongoTestContainerOptions) {
    super({
      name: 'mongo',
      internalPort: options.internalPort ?? 27017,
      startFactory: options.startFactory,
    });

    this.dbName = options.dbName ?? 'test';
    this.username = options.username;
    this.password = options.password;
  }

  protected override buildUrl(host: string, port: number): string {
    const auth =
      this.username && this.password
        ? `${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}@`
        : '';

    return `mongodb://${auth}${host}:${port}/${this.dbName}`;
  }

  protected buildEnv(info: ServiceConnectionInfo): Record<string, string> {
    const env: Record<string, string> = {
      DB_HOST: info.host,
      DB_PORT: String(info.port),
      DB_NAME: this.dbName,
      MONGO_URL: info.url ?? '',
    };

    if (this.username) {
      env.DB_USER = this.username;
    }

    if (this.password) {
      env.DB_PASS = this.password;
    }

    return env;
  }
}
