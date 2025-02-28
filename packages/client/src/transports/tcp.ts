import type { Socket } from 'bun';
import { logger } from '~/logger';
import { Transport } from './base';

/**
 * Communicate over TCP, for use in server-side environments.
 */
export class TcpTransport extends Transport {
  private socket: Socket | null = null;

  constructor(
    private options: {
      /**
       * The host to connect to
       */
      host: string;

      /**
       * The port to connect to
       */
      port: number;

      signal?: AbortSignal;
    },
  ) {
    super();
  }

  async open() {
    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
    let retry = 0;
    while (retry < 10) {
      retry++;
      try {
        this.socket = await Bun.connect({
          hostname: this.options.host,
          port: this.options.port,
          socket: {
            open: async (socket) => {
              logger.debug('TCP Socket opened');
              logger.debug('TCP Getting internal writer lock');
              writer = this.stream.getWriter();
              logger.debug('TCP Writer locked');
              logger.debug('TCP Waiting for internal writer to be ready');
              await writer.ready;
              logger.debug('TCP Internal writer ready');
            },
            close: async (socket) => {
              logger.debug('TCP Socket closed');
              await writer?.close();
              logger.debug('TCP Writer closed');
              writer = null;
            },
            data: async (socket, data) => {
              logger.debug('TCP Socket data:', data);
              if (!writer) {
                throw new Error('Writer not initialized');
              }

              logger.debug('TCP Writing data to internal stream');
              await writer.write(data);
              logger.debug('TCP Data written to internal stream');
            },
            error(socket, error) {
              logger.debug('TCP Socket error:', error);
            },
            end: async (socket) => {
              logger.debug('TCP Socket ended');
            },
            timeout(socket) {
              logger.debug('TCP Socket timeout');
            },
            connectError(socket, error) {
              logger.debug('TCP Socket connect error:', error);
            },
            handshake(socket, success, authorizationError) {
              logger.debug('TCP Socket handshake:', success, authorizationError);
            },
          },
        });
        break;
      } catch (error) {
        // We do an exponential backoff so that we don't retry too fast and
        // let the process start up.
        await new Promise((resolve) => setTimeout(resolve, 100 * retry ** 2));
      }
    }

    if (!this.socket) {
      throw new Error('Could not connect to socket');
    }
  }

  async write(data: {}, signal?: AbortSignal) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    const body = JSON.stringify(data);
    const headers = `Content-Length: ${body.length}\r\n\r\n`;

    signal?.throwIfAborted();
    this.socket.write(`${headers}${body}`);
  }

  async close() {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.end();
  }
}
