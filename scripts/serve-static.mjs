import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.argv[2] || 'dist/site';
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || '4173');
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function safeFile(pathname) {
  const requested = decodeURIComponent(pathname).replace(/^\/+/, '');
  const direct = normalize(join(root, requested));
  if (!direct.startsWith(normalize(root))) return null;
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  if (!extname(requested)) {
    const index = join(direct, 'index.html');
    if (existsSync(index) && statSync(index).isFile()) return index;
  }
  return null;
}

createServer((request, response) => {
  const pathname = new URL(request.url || '/', `http://${host}`).pathname;
  const file = safeFile(pathname);
  const missing = !file;
  const resolved = file || join(root, '404.html');
  response.writeHead(missing ? 404 : 200, {
    'Content-Type': types[extname(resolved)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  createReadStream(resolved).pipe(response);
}).listen(port, host, () => console.log(`Static site on http://${host}:${port}`));
