import { logger } from '~/logger';
import { Transport } from './base';

export class WebSocketTransport extends Transport {
  private socket: WebSocket | null = null;

  constructor(private url: string) {
    super();
  }

  async open() {
    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
    let retry = 0;
    while (retry < 10) {
      retry++;
      try {
        this.socket = new WebSocket(this.url);
        logger.debug('WebSocket connecting');
        await new Promise((resolve, reject) => {
          this.socket!.addEventListener('open', (event) => {
            logger.debug('WebSocket connected');
            resolve(event);
          });
          this.socket!.addEventListener('error', (error) => {
            logger.debug('WebSocket error:', error);
            reject(error);
          });
        });
        logger.debug('WebSocket getting internal writer lock');
        writer = this.stream.getWriter();
        logger.debug('WebSocket writer locked');
        this.socket.addEventListener('message', async (event) => {
          logger.debug('WebSocket message received:');
          logger.debug(event.data);
          await writer!.write(event.data);
        });
        this.socket.addEventListener('close', async (event) => {
          logger.debug('WebSocket closed');
          await writer?.close();
          writer = null;
        });
        await writer.ready;
        break;
      } catch (error) {
        // We do an exponential backoff so that we don't retry too fast and
        // let the process start up.
        await new Promise((resolve) => setTimeout(resolve, 100 * retry ** 2));
      }
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Could not connect to socket');
    }
  }

  async write(data: {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket not connected');
    }

    const message = JSON.stringify(data);
    logger.debug('WebSocket sending message:');
    logger.debug(message);
    this.socket.send(message);
    logger.debug('WebSocket message sent');
  }

  async close() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket not connected');
    }

    this.socket.close();
  }
}
