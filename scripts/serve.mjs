import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../docs/', import.meta.url)));
const port = Number(process.env.PORT ?? 4173);
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.ico', 'image/x-icon'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const path = decodeURIComponent(request.url.split('?')[0]);
    const file = resolve(root, path === '/' ? 'index.html' : '.' + path);
    const type = mime.get(extname(file));
    if (!path.startsWith('/') || !file.startsWith(root + sep) || !type) throw new Error('Invalid path');
    const target = await realpath(file);
    if (!target.startsWith(root + sep)) throw new Error('Invalid path');
    const body = await readFile(target);
    response.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
    }).end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log('Worth Your Time is serving on http://127.0.0.1:' + port);
});
