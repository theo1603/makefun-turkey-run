// Gobble Getaway — a tiny static server for local play-testing.
// `node serve.ts` serves game/ on http://localhost:8080; open it in a
// desktop browser and play. Development convenience only, not part of
// the entry: the game itself is the plain files under game/.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const port = Number(process.argv[2] ?? 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname = url.pathname;
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(root, normalize(decodeURIComponent(pathname))));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    if (!statSync(file).isFile()) throw new Error('not a file');
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Gobble Getaway is on http://localhost:${port}`);
});
