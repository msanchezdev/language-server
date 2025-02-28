import type { ClientCapabilities } from '../capabilities/client';
import {
  request,
  type integer,
  type LSPAny,
  type RequestMessage,
  type ResponseMessage,
} from '../rpc';

export interface InitializeParams {
  /**
   * The process Id of the parent process that started the server. Is null if
   * the process has not been started by another process. If the parent
   * process is not alive then the server should exit (see exit notification)
   * its process.
   */
  processId: integer | null;

  /**
   * Information about the client
   *
   * @since 3.15.0
   */
  clientInfo?: {
    /**
     * The name of the client as defined by the client.
     */
    name: string;

    /**
     * The client's version as defined by the client.
     */
    version?: string;
  };

  /**
   * The locale the client is currently showing the user interface
   * in. This must not necessarily be the locale of the operating
   * system.
   *
   * Uses IETF language tags as the value's syntax
   * (See https://en.wikipedia.org/wiki/IETF_language_tag)
   *
   * @since 3.16.0
   */
  locale?: string;

  /**
   * The rootPath of the workspace. Is null
   * if no folder is open.
   *
   * @deprecated in favour of `rootUri`.
   */
  rootPath?: string | null;

  /**
   * The rootUri of the workspace. Is null if no
   * folder is open. If both `rootPath` and `rootUri` are set
   * `rootUri` wins.
   *
   * @deprecated in favour of `workspaceFolders`
   */
  rootUri: DocumentUri | null;

  /**
   * User provided initialization options.
   */
  initializationOptions?: LSPAny;

  /**
   * The capabilities provided by the client (editor or tool)
   */
  capabilities: ClientCapabilities;

  /**
   * The initial trace setting. If omitted trace is disabled ('off').
   */
  trace?: TraceValue;

  /**
   * The workspace folders configured in the client when the server starts.
   * This property is only available if the client supports workspace folders.
   * It can be `null` if the client supports workspace folders but none are
   * configured.
   *
   * @since 3.6.0
   */
  workspaceFolders?: WorkspaceFolder[] | null;
}

export interface InitializeResult {
  capabilities: {};
}

/**
 * This is the first request from the client to the server.
 * @client
 * - Client must not send additional requests until the server has
 *   responded with an `InitializeResult`.
 * - May only be sent once.
 *
 * @server
 * - Server must not send any request or notification to the client before
 *   sending an `InitializeResult`. With the exception of the
 *   `window/showMessage`, `window/logMessage`, `telemetry/event`, and
 *   `window/showMessageRequest` requests.
 */
export type InitializeRequest = RequestMessage<'initialize', InitializeParams>;

export type InitializeResponse = ResponseMessage<InitializeResult>;

export function initialize(params: InitializeParams): InitializeRequest {
  return request('initialize', params);
}
