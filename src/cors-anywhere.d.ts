declare module 'cors-anywhere' {
  import { Server } from 'node:http';

  interface Options {
    originWhitelist?: string[];
    requireHeader?: string[];
    removeHeaders?: string[];
  }

  function createServer(options?: Options): Server;
}
