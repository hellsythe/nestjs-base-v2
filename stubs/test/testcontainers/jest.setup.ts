import {
  startTestInfrastructure,
  stopTestInfrastructure,
} from './test-infrastructure';

beforeAll(async () => {
  await startTestInfrastructure();
}, 180000);

afterAll(async () => {
  await stopTestInfrastructure();
}, 180000);
