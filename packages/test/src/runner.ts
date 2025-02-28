import {
  getOverrides,
  getTest,
  isTest,
  useTest,
  useTestStore,
  type TestConfig,
  type TestSuiteConfig,
} from './context';
import {
  LanguageServerClient,
  lsp,
  StdioTransport,
  TcpTransport,
  Transport,
  WebSocketTransport,
} from '@language-server/client';

export function useRunner() {
  const suite = useTest([]);
  let { promise: finished, resolve, reject } = Promise.withResolvers();

  async function start() {
    if (suite.status === 'running') {
      return;
    }

    await runTestSuite([], suite).catch(() => {});
    resolve();
  }

  return {
    status: suite.status,
    start,
    finished,
  };
}

async function runTestSuite(path: number[], suite: TestSuiteConfig) {
  const referencedSuite = getTest(path, suite) as TestSuiteConfig | null;
  if (!referencedSuite) {
    throw new Error(`Could not find test suite with path ${path.join('.')}`);
  }

  useTestStore.getState().setStatus(path, 'running');

  for (const test of Object.values(referencedSuite.tests)) {
    const testPath = [...path, test.id];
    if (isTest(test)) {
      await runTest(testPath, suite).catch(() => {});
    } else {
      await runTestSuite(testPath, suite).catch(() => {});
    }
  }

  useTestStore.getState().setStatus(path, 'success');
}

function runTest(path: number[], suite: TestSuiteConfig) {
  return new Promise<void>(async (resolve, reject) => {
    const test = getTest(path, suite) as TestConfig | null;
    if (!test) {
      throw new Error(`Could not find test with path ${path.join('.')}`);
    }
    useTestStore.getState().setStatus(path, 'running', undefined);

    const controller = new AbortController();
    const overrides = getOverrides(path, suite);
    const lspProcess = Bun.spawn({
      cmd: [overrides.server!, ...overrides.args!],
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      signal: controller.signal,
    });
    lspProcess.exited.then(async (exitCode) => {
      if (controller.signal.aborted) {
        const error = new Error(
          controller.signal.reason
            ? controller.signal.reason?.message
            : `Exited with code ${exitCode}:\n${await new Response(lspProcess.stderr).text()}`,
        );
        useTestStore.getState().setStatus(path, 'failed', error);
        clearTimeout(timeoutId);
        reject(error);
      }
    });

    let transport: Transport;
    if (overrides.transport === 'stdio') {
      transport = new StdioTransport(lspProcess);
    } else if (overrides.transport.protocol === 'tcp') {
      transport = new TcpTransport({
        host: overrides.transport.host,
        port: overrides.transport.port,
      });
    } else if (overrides.transport.protocol === 'ws') {
      transport = new WebSocketTransport(
        `${overrides.transport.protocol}://${overrides.transport.host}:${overrides.transport.port}`,
      );
    } else {
      throw new Error(`Unsupported transport ${overrides.transport.protocol}`);
    }

    const client = new LanguageServerClient({
      transport,
      debug: true,
    });
    await client.connect();
    const timeout = overrides.timeout ?? 10000;
    const timeoutId = setTimeout(async () => {
      await client.transport.close();
      controller.abort(new Error(`Timeout after ${timeout} ms`));
    }, timeout);

    if (overrides.initialize) {
      await client.send(
        lsp.initialize(
          overrides.initialize === true
            ? {
                processId: null,
                rootUri: null,
                capabilities: {},
              }
            : overrides.initialize,
        ),
      ).result;
    }

    try {
      await test.fn(client);
      useTestStore.getState().setStatus(path, 'success', undefined);
      clearTimeout(timeoutId);
      await client.transport.close();
      lspProcess.kill('SIGTERM');
      resolve();
    } catch (error) {
      console.log(
        error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack}`
          : 'Test failed unexpectedly',
      );
      useTestStore.getState().setStatus(path, 'failed', error);
      clearTimeout(timeoutId);
      await client.transport.close();
      lspProcess.kill('SIGTERM');
      reject(error);
    }
  });
}
