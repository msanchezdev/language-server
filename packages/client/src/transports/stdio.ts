import type { PipedSubprocess } from 'bun';
import { Transport } from './base';

/**
 * Communicate over a process's stdin and stdout. For use in server-side
 * environments.
 */
export class StdioTransport extends Transport {
  constructor(private process: PipedSubprocess) {
    super();
    process.stdout.pipeTo(this.stream);
  }

  async open() {}

  async write(data: {}, signal?: AbortSignal) {
    const body = JSON.stringify(data);
    const headers = `Content-Length: ${body.length}\r\n\r\n`;

    if (signal?.aborted) {
      return Promise.reject(signal.reason);
    }

    this.process.stdin.write(`${headers}${body}`);
  }

  async close() {}
}
