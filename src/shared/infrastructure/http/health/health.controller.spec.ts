import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

/**
 * @group integration
 */
describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  test('should be defined', () => {
    // assert
    expect(controller).toBeDefined();
  });

  test('should respond with ok', async () => {
    // act
    const resp = await controller.check();

    // assert
    expect(resp.status).toBe('ok');
  });
});
