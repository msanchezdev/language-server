import { lsp, StdioTransport } from '@language-server/client';
import { expect } from 'bun:test';
import { describe, test } from '~/context';
/**
 * The base protocol consists of a header and a content part
 * (comparable to HTTP). The header and content part are separated by a '\r\n'.
 */
// describe('Protocol', { initialize: false }, () => {
//   describe('Header', () => {
//     test('should contain Content-Length header', async (server) => {
//       const body = JSON.stringify(
//         lsp.initialize({ processId: null, rootUri: null, capabilities: {} }),
//       );
//       const content = [`Content-Length: ${body.length}`, '', body].join('\r\n');
//       await server.transport..write(content);
//
//       let chunks = 0;
//       for await (const chunk of server.transport._reader) {
//         const response = await new Response(chunk).text();
//         const bodyStart = response.indexOf('\r\n\r\n');
//         const headers = response.slice(0, bodyStart);
//         expect(headers).toMatch(/Contnt-Length: \d+/);
//         chunks++;
//         break;
//       }
//
//       expect(chunks, 'no message received').toBe(1);
//     });
//   });
// });
