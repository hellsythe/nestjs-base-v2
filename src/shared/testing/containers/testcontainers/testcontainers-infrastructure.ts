import {
  GenericContainer,
  Network,
  StartedTestContainer,
  Wait,
} from 'testcontainers';

import { ContainerOrchestrator } from '../container-orchestrator';
import { MongoTestContainer } from '../services/mongo-test-container';
import { UnleashTestContainer } from '../services/unleash-test-container';
import type { StartedContainerLike } from '../contracts/started-container-like';

export type TestInfrastructureProfile = 'mongo' | 'full';

export interface TestInfrastructureRuntime {
  orchestrator: ContainerOrchestrator;
  env: Record<string, string>;
  stop: () => Promise<void>;
}

export interface TestInfrastructureOptions {
  profile?: TestInfrastructureProfile;
}

function toStartedContainerLike(
  container: StartedTestContainer,
): StartedContainerLike {
  return {
    getHost: () => container.getHost(),
    getMappedPort: (port: number) => container.getMappedPort(port),
    stop: () => container.stop(),
  };
}

function buildBaseEnv(env: Record<string, string>): Record<string, string> {
  return {
    ...env,
    DB_USER: env.DB_USER ?? 'admin',
    DB_PASS: env.DB_PASS ?? 'admin',
    BASE_URL: 'http://localhost:3000',
    LOG_LEVEL: 'warn',
    HTTP_TIMEOUT: '60000',
    UNLEASH_URL: env.UNLEASH_URL ?? 'http://localhost:4242/api',
    UNLEASH_APP_NAME: env.UNLEASH_APP_NAME ?? 'ia-test',
    UNLEASH_INSTANCE_ID: env.UNLEASH_INSTANCE_ID ?? 'test-instance',
  };
}

export async function startDefaultTestInfrastructure(
  options?: TestInfrastructureOptions,
): Promise<TestInfrastructureRuntime> {
  const profile = options?.profile ?? 'mongo';

  const mongo = new MongoTestContainer({
    startFactory: async () =>
      toStartedContainerLike(
        await new GenericContainer('mongo:4.0')
          .withEnvironment({
            MONGO_INITDB_ROOT_USERNAME: 'admin',
            MONGO_INITDB_ROOT_PASSWORD: 'admin',
          })
          .withExposedPorts(27017)
          .withWaitStrategy(Wait.forListeningPorts())
          .start(),
      ),
    dbName: 'ia_test',
    username: 'admin',
    password: 'admin',
  });

  if (profile !== 'full') {
    const orchestrator = new ContainerOrchestrator([mongo]);
    const env = buildBaseEnv(await orchestrator.startAll());

    return {
      orchestrator,
      env,
      stop: async () => {
        await orchestrator.stopAll();
      },
    };
  }

  const network = await new Network().start();

  const postgres = await new GenericContainer('postgres:14.19-alpine3.21')
    .withEnvironment({
      POSTGRES_DB: 'db',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'unleash',
    })
    .withNetwork(network)
    .withNetworkAliases('unleash-db')
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .start();

  const postgresUrl = 'postgres://postgres:unleash@unleash-db:5432/db';

  const unleash = new UnleashTestContainer({
    startFactory: async () =>
      toStartedContainerLike(
        await new GenericContainer('unleashorg/unleash-server:7.2.3')
          .withEnvironment({
            AUTH_TYPE: 'none',
            AUTH_ENABLE_API_TOKENS: 'false',
            DATABASE_URL: postgresUrl,
            DATABASE_SSL: 'false',
            LOG_LEVEL: 'warn',
          })
          .withNetwork(network)
          .withExposedPorts(4242)
          .withStartupTimeout(180000)
          .withWaitStrategy(Wait.forListeningPorts())
          .start(),
      ),
    appName: 'ia-test',
  });

  const orchestrator = new ContainerOrchestrator([mongo, unleash]);
  const env = buildBaseEnv(await orchestrator.startAll());

  return {
    orchestrator,
    env,
    stop: async () => {
      await orchestrator.stopAll();
      await postgres.stop();
      await network.stop();
    },
  };
}
