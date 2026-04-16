import {
  startDefaultTestInfrastructure,
  type TestInfrastructureRuntime,
} from 'ia-local-package';

type RuntimeState = {
  runtime?: TestInfrastructureRuntime;
};

const state: RuntimeState = {};

export async function startTestInfrastructure(): Promise<Record<string, string>> {
  if (state.runtime) {
    return state.runtime.env;
  }

  const profile = process.env.TESTCONTAINERS_PROFILE ?? 'mongo';

  const runtime = await startDefaultTestInfrastructure({
    profile: profile === 'full' ? 'full' : 'mongo',
  });
  state.runtime = runtime;

  Object.assign(process.env, runtime.env);
  return runtime.env;
}

export async function stopTestInfrastructure(): Promise<void> {
  if (state.runtime) {
    await state.runtime.stop();
    state.runtime = undefined;
  }
}
