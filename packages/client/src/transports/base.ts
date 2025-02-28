import { LanguageServerErrorEvent, LanguageServerEvent, LanguageServerResultEvent } from '~/event';
import { logger } from '~/logger';
import type { ResponseMessage } from '~/protocol';

export abstract class Transport {
  protected events = new EventTarget();

  abstract open(): Promise<void> | void;
  abstract write(data: {}, signal?: AbortSignal): Promise<void> | void;
  abstract close(): Promise<void> | void;
  // abstract read(): AsyncIterableIterator<string>;

  /**
   * If implementing a custom transport you must write the data received from
   * the language server to this stream.
   */
  protected stream: WritableStream;

  constructor() {
    this.stream = new WritableStream({
      write: async (chunk, controller) => {
        const content = await new Response(chunk).text();
        logger.debug(`Base Transport, Message received:`);
        logger.debug(content);
        const bodyIndex = content.indexOf('\r\n\r\n') + 4;
        const body = content[0] === '{' ? content : content.slice(bodyIndex);
        logger.debug(body);
        const data = JSON.parse(body);

        if (data.result) {
          this.events.dispatchEvent(new LanguageServerResultEvent(data.id, data.result));
        } else if (data.error) {
          this.events.dispatchEvent(new LanguageServerErrorEvent(data.id, data.error));
        } else {
          this.events.dispatchEvent(new LanguageServerEvent(data.id, data.method));
        }
      },
    });
  }

  /**
   * Add a listener to the result event of the given id. Will only be called
   * once.
   */
  onResult(
    id: ResponseMessage['id'],
    callback: (data: ResponseMessage<any>) => Promise<void> | void,
    signal?: AbortSignal,
  ) {
    const listener: EventListenerObject = {
      handleEvent: async (event: LanguageServerResultEvent) => {
        logger.debug('Event received:', event);
        await callback({
          jsonrpc: '2.0',
          id: event.id,
          result: event.result,
        });
      },
    };

    this.events.addEventListener(`result:${id}`, listener, { once: true, signal });
  }
}
