import { IncomingMessage, ServerResponse } from 'node:http';
import corsAnywhere from 'cors-anywhere';

const corsProxy = corsAnywhere.createServer({
  originWhitelist: [],
  requireHeader: [],
  removeHeaders: ['cookie', 'cookie2'],
});

export function proxyHandler(req: IncomingMessage, res: ServerResponse): void {
  corsProxy.emit('request', req, res);
}
