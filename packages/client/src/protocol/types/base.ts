// // ============================================================================
// // Notification Message
// // ============================================================================
//
// /**
//  * A notification message. A processed notification message must not send a
//  * response back. They work like events.
//  */
// export interface NotificationMessage<Params extends LSPArray | LSPObject> extends Message {
//   /**
//    * The method to be invoked.
//    */
//   method: string;
//
//   /**
//    * The notification's params.
//    */
//   params?: Params;
// }
//
// // ============================================================================
// // Cancellation Support
// // ============================================================================
//
// interface CancelParams {
//   /**
//    * The request id to cancel.
//    */
//   id: integer | string;
// }
//
// // ============================================================================
// // Progress Message
// // ============================================================================
//
// type ProgressToken = integer | string;
//
// interface ProgressParams<T> {
//   /**
//    * The progress token provided by the client or server.
//    */
//   token: ProgressToken;
//
//   /**
//    * The progress data.
//    */
//   value: T;
// }
