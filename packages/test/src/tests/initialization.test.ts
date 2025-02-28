import { expect } from 'bun:test';
import { lsp } from '@language-server/client';
import { describe, test } from '../context';
import { style } from '~/style';

describe(`Initialization`, { initialize: false }, () => {
  test(`should reply to (${style.method('initialize')}) request`, async (server) => {
    const request = lsp.initialize({ processId: null, rootUri: null, capabilities: {} });
    const result = await server.send(request).result;
    expect(result).toMatchObject({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        capabilities: expect.anything(),
      },
    });
  });
  // test(`should ignore extra (${style.method('initialize')}) events`, async (server) => {
  //   const result1 = await server.send(
  //     lsp.initialize({ processId: null, rootUri: null, capabilities: {} }),
  //   ).result;
  //   expect(result1).toMatchObject({
  //     jsonrpc: '2.0',
  //     id: result1.id,
  //     result: expect.any(Object),
  //   });
  //
  //   const result2 = server.send(
  //     lsp.initialize({ processId: null, rootUri: null, capabilities: {} }),
  //     { signal: AbortSignal.timeout(1000) },
  //   ).result;
  //   expect(result2).rejects.toMatchObject({ name: 'TimeoutError' });
  // });
  //
  // test(`should receive capabilities`, async ({ send, waitForEvent }) => {
  //   await new Promise((resolve) => setTimeout(resolve, 4000));
  // });
});
