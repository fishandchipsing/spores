// ambient-world proxy
// usage: ANTHROPIC_KEY=... EL_KEY=... node proxy.js  →  http://localhost:3001

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT      = process.env.PORT || 3001;
const EL_HOST   = 'api.elevenlabs.io';
const ANT_HOST  = 'api.anthropic.com';
const CACHE_DIR = path.join(__dirname, 'sfx-cache');

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── serve HTML ───────────────────────────────────────────────────────────
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const file = path.join(__dirname, 'ambient-world.html');
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(404); res.end('ambient-world.html not found');
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/lab') {
    const file = path.join(__dirname, 'ambient-lab.html');
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(404); res.end('ambient-lab.html not found');
    }
    return;
  }

  if (req.method === 'GET' && req.url === '/walk') {
    const file = path.join(__dirname, 'ambient-walk.html');
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(404); res.end('ambient-walk.html not found');
    }
    return;
  }

  // ── list cached files → JSON ─────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/sfx-cache') {
    try {
      const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.mp3'));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(files));
    } catch(e) {
      res.writeHead(500); res.end(e.message);
    }
    return;
  }

  // ── serve a single cached file ───────────────────────────────────────────
  if (req.method === 'GET' && req.url.startsWith('/sfx-cache/')) {
    const filename = path.basename(decodeURIComponent(req.url.slice('/sfx-cache/'.length)));
    const filepath = path.join(CACHE_DIR, filename);
    if (fs.existsSync(filepath)) {
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.writeHead(404); res.end('not found');
    }
    return;
  }

  // ── proxy /claude → Anthropic ────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/claude') {
    const apiKey = process.env.ANTHROPIC_KEY;
    if (!apiKey) { res.writeHead(503); res.end('ANTHROPIC_KEY not configured'); return; }

    const bodyChunks = [];
    req.on('data', chunk => bodyChunks.push(chunk));
    req.on('end', () => {
      const bodyBuf = Buffer.concat(bodyChunks);
      const options = {
        hostname: ANT_HOST,
        path:     '/v1/messages',
        method:   'POST',
        headers:  {
          'x-api-key':        apiKey,
          'anthropic-version':'2023-06-01',
          'Content-Type':     'application/json',
          'Content-Length':   bodyBuf.length,
        },
      };

      const proxyReq = https.request(options, proxyRes => {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (proxyRes.statusCode !== 200) console.error(`Claude ${proxyRes.statusCode}:`, buf.toString().slice(0,300));
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(buf);
        });
      });

      proxyReq.on('error', err => {
        console.error('Claude proxy error:', err.message);
        res.writeHead(502); res.end(err.message);
      });

      proxyReq.write(bodyBuf);
      proxyReq.end();
    });
    return;
  }

  // ── proxy /sfx → ElevenLabs + cache to disk ──────────────────────────────
  if (req.method === 'POST' && req.url === '/sfx') {
    const elKey = process.env.EL_KEY;
    if (!elKey) { res.writeHead(503); res.end('EL_KEY not configured'); return; }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let parsed;
      try { parsed = JSON.parse(body); } catch(e) { res.writeHead(400); res.end('bad json'); return; }

      const world   = (parsed.world || 'unknown').replace(/[^a-z0-9]/gi, '_');
      const payload = JSON.stringify({
        text:             parsed.text,
        duration_seconds: parsed.duration_seconds ?? 4,
        prompt_influence: parsed.prompt_influence ?? 0.4,
      });

      const options = {
        hostname: EL_HOST,
        path:     '/v1/sound-generation',
        method:   'POST',
        headers:  {
          'xi-api-key':   elKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const proxyReq = https.request(options, proxyRes => {
        const chunks = [];
        proxyRes.on('data', chunk => chunks.push(chunk));
        proxyRes.on('end', () => {
          const audio = Buffer.concat(chunks);

          if (proxyRes.statusCode === 200) {
            const filename = `${world}-${Date.now()}.mp3`;
            fs.writeFile(path.join(CACHE_DIR, filename), audio, err => {
              if (err) console.error('cache write error:', err.message);
              else     console.log(`  cached ${filename}`);
            });
          }

          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(audio);
        });
      });

      proxyReq.on('error', err => {
        console.error('Proxy error:', err.message);
        res.writeHead(502); res.end(err.message);
      });

      proxyReq.write(payload);
      proxyReq.end();
    });
    return;
  }

  res.writeHead(404); res.end('not found');
});

server.listen(PORT, () => {
  console.log(`\nambient world proxy`);
  console.log(`→ http://localhost:${PORT}`);
  console.log(`→ cache: ${CACHE_DIR}`);
  console.log(`→ ANTHROPIC_KEY: ${process.env.ANTHROPIC_KEY ? 'set' : 'MISSING'}`);
  console.log(`→ EL_KEY:        ${process.env.EL_KEY        ? 'set' : 'not set (sfx disabled)'}\n`);
});
