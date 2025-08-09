const http = require('http');
const fs = require('fs');
const path = require('path');
const { mapTagsToAttributes, enforceKidSafeMix, quantizeAndClamp } = require('./src/prompt-mapper');

const publicDir = path.join(__dirname, 'public');

function serveStatic(req, res) {
  const filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type = ext === '.js' ? 'text/javascript' : ext === '.html' ? 'text/html' : 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

function parseBody(req, cb) {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    try {
      cb(null, JSON.parse(body || '{}'));
    } catch (e) {
      cb(e);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    return serveStatic(req, res);
  }
  if (req.method === 'POST' && req.url === '/api/map-tags') {
    return parseBody(req, (err, data) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'invalid json' }));
      }
      const result = mapTagsToAttributes(data.tags || []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }
  if (req.method === 'POST' && req.url === '/api/enforce-mix') {
    return parseBody(req, (err, data) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'invalid json' }));
      }
      const result = enforceKidSafeMix(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }
  if (req.method === 'POST' && req.url === '/api/quantize') {
    return parseBody(req, (err, data) => {
      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'invalid json' }));
      }
      try {
        const result = quantizeAndClamp(data.melody, data.key, data.scale);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  }
  res.writeHead(404);
  res.end('Not found');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
