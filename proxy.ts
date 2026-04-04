import { createServer } from 'node:http';

import next from 'next';
import { NextRequest } from 'next/server';

import { reduceRight, type MiddlewareFactory } from './lib/middleware/chain';
import { withAuth, withCors, withRateLimit } from './lib/middleware/middlewares';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME ?? 'localhost';
const port = parseInt(process.env.PORT ?? '3000', 10);

next({ dev, hostname });

export const chain: MiddlewareFactory[] = [withCors, withRateLimit, withAuth];

function convertNodeRequest(request: import('node:http').IncomingMessage): Request {
  const headers: HeadersInit = {};
  Object.entries(request.headers).forEach(([key, value]) => {
    if (value) {
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }
  });

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  return new Request(url, {
    method: request.method,
    headers,
  });
}

createServer(async (req, res) => {
  try {
    const request = convertNodeRequest(req);
    const nextRequest = new NextRequest(request);

    // Apply middleware chain
    const response = await reduceRight(chain, nextRequest);

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.statusCode = response.status;

    const body = await response.text();
    res.end(body);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}).listen(port, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
