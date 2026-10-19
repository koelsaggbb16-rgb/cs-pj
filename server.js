const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 8080;
const BASE_DIR = __dirname;
const DATA_FILE = path.join(BASE_DIR, 'data', 'custom_data.json');

let publicTunnelUrl = null;
let tunnelProcess = null;

function startPublicTunnel() {
  if (tunnelProcess) {
    try { tunnelProcess.kill(); } catch (e) {}
  }

  // Create a reverse SSH tunnel via localhost.run (no installation or account required)
  tunnelProcess = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', `80:localhost:${PORT}`,
    'nokey@localhost.run'
  ]);

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.(?:lhr\.life|localhost\.run)/);
    if (match && match[0]) {
      if (publicTunnelUrl !== match[0]) {
        publicTunnelUrl = match[0];
        console.log(`Public Mobile URL (LTE/5G/Anywhere): ${publicTunnelUrl}`);
      }
    }
  };

  tunnelProcess.stdout.on('data', handleOutput);
  tunnelProcess.stderr.on('data', handleOutput);

  tunnelProcess.on('close', () => {
    publicTunnelUrl = null;
    // Automatically reconnect if tunnel drops
    setTimeout(startPublicTunnel, 3000);
  });

  tunnelProcess.on('error', (err) => {
    console.warn('SSH tunnel error:', err.message);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function getLocalIpAddresses() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ name, address: net.address });
      }
    }
  }
  return ips;
}

// Helper: read POST body
function parseJsonBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 2 * 1024 * 1024) { // 2MB limit
      req.connection.destroy();
    }
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      callback(null, data);
    } catch (e) {
      callback(e, null);
    }
  });
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlParts = req.url.split('?');
  const reqPath = decodeURI(urlParts[0]);

  // API 0: GET /api/network-info
  if (req.method === 'GET' && reqPath === '/api/network-info') {
    const ips = getLocalIpAddresses();
    const localUrls = ips.map(ip => `http://${ip.address}:${PORT}`);
    const urls = [];
    if (publicTunnelUrl) {
      urls.push(publicTunnelUrl);
    }
    urls.push(...localUrls);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      port: PORT,
      publicUrl: publicTunnelUrl,
      ips,
      localUrls,
      urls
    }));
    return;
  }

  // API 1: GET /api/data
  if (req.method === 'GET' && reqPath === '/api/data') {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(content);
        return;
      } catch (err) {
        console.error('Failed to read custom_data.json', err);
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ customTitles: {}, categoriesConfig: null }));
    return;
  }

  // API 2: POST /api/save
  if (req.method === 'POST' && reqPath === '/api/save') {
    parseJsonBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
        return;
      }

      try {
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true }));
      } catch (writeErr) {
        console.error('Failed to write custom_data.json', writeErr);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'File write error' }));
      }
    });
    return;
  }

  // API 3: POST /api/reset
  if (req.method === 'POST' && reqPath === '/api/reset') {
    if (fs.existsSync(DATA_FILE)) {
      try {
        fs.unlinkSync(DATA_FILE);
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Static files handling
  let normalizedPath = reqPath;
  if (normalizedPath === '/' || normalizedPath === '') {
    normalizedPath = '/index.html';
  }

  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  // Security check: must stay within BASE_DIR
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`Server is running at http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`Mobile / Network access: http://${ip.address}:${PORT}`);
  });
  startPublicTunnel();
});
