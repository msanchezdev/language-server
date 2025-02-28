export interface Config {
  /**
   * Path to the language server executable
   */
  server: string;

  /**
   * Arguments to pass to the language server
   */
  args: string[];

  /**
   * Transport to use for sending and receiving messages
   */
  transport:
    | 'stdio'
    | {
        protocol: 'tcp' | 'ws' | 'wss' | 'unix';
        host: string;
        port: number;
        path: string;
      };

  /**
   * If true will run all tests, including server initialization tests
   */
  all: boolean;

  // /**
  //  * If false the transport will not send headers, just the body to the server
  //  */ // TODO: to conform with tsserver
  // header: boolean;
}
