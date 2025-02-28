import type { integer } from './protocol';

export class LanguageServerEvent extends Event {
  constructor(
    public id: integer | string,
    public method: string,
  ) {
    super(`${method}:${id}`);
  }
}

export class LanguageServerResultEvent<T = any> extends LanguageServerEvent {
  constructor(
    public id: integer | string,
    public result: T,
  ) {
    super(id, 'result');
  }
}

export class LanguageServerErrorEvent<T = any> extends LanguageServerEvent {
  constructor(
    public id: integer | string,
    public error: T,
  ) {
    super(id, 'error');
  }
}
