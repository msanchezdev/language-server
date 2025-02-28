import { logger } from './logger';
import type { RequestMessage, ResponseMessage } from './protocol';
import type { Transport } from './transports/base';

export interface LanguageServerClientOptions {
  /**
   * The transport to use for sending and receiving messages
   */
  transport: Transport;

  /**
   * Whether to log debug messages
   */
  debug?: boolean;
}

export class LanguageServerClient {
  readonly transport: Transport;

  constructor(options: LanguageServerClientOptions) {
    this.transport = options.transport;
    logger.setLogLevel(options.debug ? 'debug' : 'silent');
  }

  /**
   * Connect to the language server
   */
  async connect() {
    await this.transport.open();
  }

  send<Method extends string, Params extends {} | any[], Result = any>(
    data: RequestMessage<Method, Params>,
    options?: {
      /**
       * Signal to abort the request
       */
      signal?: AbortSignal;
    },
  ): Promise<void> & {
    /**
     * Promise that resolves when the response is received
     */
    result: Promise<ResponseMessage<Result>>;
  } {
    logger.debug('Sending message:', data);
    const { promise: result, resolve, reject } = Promise.withResolvers<ResponseMessage<Result>>();
    this.transport.onResult(data.id, resolve);
    if (options?.signal) {
      try {
        options.signal.throwIfAborted();
        options.signal.addEventListener('abort', () => {
          logger.debug('Request aborted', options.signal?.reason);
          reject(options.signal?.reason);
        });
      } catch (error) {
        // If request was aborted before it was sent, we don't want to log twice
        logger.debug('Request aborted', error);
        return Object.assign(Promise.reject(undefined), {
          result: Promise.reject(error),
        });
      }
    }

    const promise = Promise.resolve(this.transport.write(data, options?.signal));
    return Object.assign(promise, {
      result,
    });
  }
}
