// Optional local preview. The website itself is plain HTML, CSS, and JavaScript.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function createServer() {
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    let file;
    try { const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname)); }
    catch { res.writeHead(400); return res.end('Bad request'); }
    const type = types[path.extname(file)];
    if (!file.startsWith(root + path.sep) || !type) { res.writeHead(404); return res.end('Not found'); }
    fs.readFile(file, (error, content) => {
      if (error) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : content);
    });
  });
}
if (require.main === module) {
  const server = createServer();
  server.listen(process.env.PORT || 4001, '127.0.0.1', () => console.log(`Wabi Sabi showcase: http://localhost:${server.address().port}`));
}
module.exports = { createServer };
