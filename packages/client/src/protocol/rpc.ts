// ============================================================================
// Base Types
// ============================================================================

/**
 * Defines an integer number in the range of -2^31 to 2^31 - 1.
 */
export type integer = number;

/**
 * Defines an unsigned integer number in the range of 0 to 2^31 - 1.
 */
export type uinteger = number;

/**
 * Defines a decimal number. Since decimal numbers are very
 * rare in the language server specification we denote the
 * exact range with every decimal using the mathematics
 * interval notation (e.g. [0, 1] denotes all decimals d with
 * 0 <= d <= 1.
 */
export type decimal = number;

/**
 * The LSP any type
 *
 * @since 3.17.0
 */
export type LSPAny = LSPObject | LSPArray | string | integer | uinteger | decimal | boolean | null;

/**
 * LSP object definition.
 *
 * @since 3.17.0
 */
export type LSPObject = { [key: string]: LSPAny };

/**
 * LSP arrays.
 *
 * @since 3.17.0
 */
export type LSPArray = LSPAny[];

// ============================================================================
// Abstract Message
// ============================================================================

/**
 * A general message as defined by JSON-RPC. The language server protocol always uses “2.0” as the jsonrpc version.
 */
interface Message {
  jsonrpc: '2.0' | (string & {});
}

// ============================================================================
// Request Message
// ============================================================================

/**
 * A request message to describe a request between the client and the server.
 * Every processed request must send a response back to the sender of the
 * request.
 */
export interface RequestMessage<
  Method extends string = string,
  Params extends {} | any[] = {} | any[],
> extends Message {
  /**
   * The request id.
   */
  id: number | string;

  /**
   * The method to be invoked.
   */
  method: Method;

  /**
   * The method's params.
   */
  params?: Params;
}

let id = 1;
export function request<Method extends string, Params extends {} | any[]>(
  method: Method,
  params: Params,
): RequestMessage<Method, Params> {
  return {
    jsonrpc: '2.0',
    id: id++,
    method,
    params,
  };
}

// ============================================================================
// Response Message
// ============================================================================

/**
 * A Response Message sent as a result of a request. If a request doesn’t
 * provide a result value the receiver of a request still needs to return a
 * response message to conform to the JSON-RPC specification. The result
 * property of the ResponseMessage should be set to null in this case to
 * signal a successful request.
 */
export interface ResponseMessage<Result = any> extends Message {
  /**
   * The request id.
   */
  id: integer | string | null;

  /**
   * The result of a request. This member is REQUIRED on success.
   * This member MUST NOT exist if there was an error invoking the method.
   */
  result?: Result;

  /**
   * The error object in case a request fails.
   */
  error?: ResponseError;
}

/**
 * A Response error
 */
interface ResponseError {
  /**
   * A number indicating the error type that occurred.
   */
  code: integer;

  /**
   * A string providing a short description of the error.
   */
  message: string;

  /**
   * A primitive or structured value that contains additional
   * information about the error. Can be omitted.
   */
  data?: LSPAny;
}

/**
 * Utility type to define a response message
 */
export type Response<Result = any> = ResponseMessage<Result>;
