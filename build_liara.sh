#!/bin/bash
set -e

rm -rf liara_build
mkdir -p liara_build
cp -r dist liara_build/


# Add Enamad validation file
touch liara_build/dist/48183196.txt

cat << 'SERVER' > liara_build/server.js
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '5mb' })); 

const DB_FILE = process.env.NODE_ENV === 'production' ? path.join(__dirname, 'data', 'database.json') : path.join(__dirname, 'database.json');
// Ensure data dir exists if running locally or not mounted properly
if (!fs.existsSync(path.dirname(DB_FILE))) {
  try { fs.mkdirSync(path.dirname(DB_FILE), { recursive: true }); } catch(e){}
}

app.get('/api/db', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    res.sendFile(DB_FILE);
  } else {
    res.json(null);
  }
});

app.post('/api/db', (req, res) => {
  const tempFile = DB_FILE + '.tmp';
  fs.writeFile(tempFile, JSON.stringify(req.body), (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    fs.rename(tempFile, DB_FILE, (err2) => {
      if (err2) return res.status(500).json({ ok: false, error: err2.message });
      res.json({ ok: true });
    });
  });
});


app.post('/api/zibal/request', (req, res) => {
  const { amount, callbackUrl, description, orderId } = req.body || {};
  const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';

  const data = JSON.stringify({
    merchant, amount, callbackUrl, description, orderId
  });

  const options = {
    hostname: 'gateway.zibal.ir',
    path: '/v1/request',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  };

  const zReq = https.request(options, (zRes) => {
    let d = '';
    zRes.on('data', chunk => { d += chunk; });
    zRes.on('end', () => {
      try {
        const parsed = JSON.parse(d);
        res.status(200).json({ ok: parsed.result === 100, data: parsed });
      } catch (e) {
        res.status(500).json({ ok: false, error: 'Failed to parse Zibal response' });
      }
    });
  });
  zReq.on('error', (e) => res.status(500).json({ ok: false, error: e.message }));
  zReq.write(data);
  zReq.end();
});

app.post('/api/zibal/verify', (req, res) => {
  const { trackId } = req.body || {};
  const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';

  const data = JSON.stringify({ merchant, trackId });
  const options = {
    hostname: 'gateway.zibal.ir',
    path: '/v1/verify',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
  };

  const zReq = https.request(options, (zRes) => {
    let d = '';
    zRes.on('data', chunk => { d += chunk; });
    zRes.on('end', () => {
      try {
        const parsed = JSON.parse(d);
        res.status(200).json({ ok: parsed.result === 100, data: parsed });
      } catch (e) {
        res.status(500).json({ ok: false, error: 'Failed to parse Zibal response' });
      }
    });
  });
  zReq.on('error', (e) => res.status(500).json({ ok: false, error: e.message }));
  zReq.write(data);
  zReq.end();
});

app.post('/api/sms', (req, res) => {
  const { to, message, template, token, token2, token3 } = req.body || {};
  const key = process.env.KAVENEGAR_API_KEY;

  if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY is not set' });
  if (!to) return res.status(400).json({ ok: false, error: 'to is required' });

  let url = '';
  if (template && token) {
    url = 'https://api.kavenegar.com/v1/' + key + '/verify/lookup.json?receptor=' + encodeURIComponent(to) + '&token=' + encodeURIComponent(token) + '&template=' + encodeURIComponent(template);
    if (token2) url += '&token2=' + encodeURIComponent(token2);
    if (token3) url += '&token3=' + encodeURIComponent(token3);
  } else {
    if (!message) return res.status(400).json({ ok: false, error: 'message required' });
    const sender = process.env.KAVENEGAR_SENDER || '';
    url = 'https://api.kavenegar.com/v1/' + key + '/sms/send.json?receptor=' + encodeURIComponent(to) + '&message=' + encodeURIComponent(message);
    if (sender) url += '&sender=' + encodeURIComponent(sender);
  }

  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.status(apiRes.statusCode === 200 ? 200 : (parsed.return && parsed.return.status === 412 ? 412 : 502)).json({ ok: apiRes.statusCode === 200, data: parsed });
      } catch (e) {
        res.status(500).json({ ok: false, error: 'Failed to parse SMS provider response' });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ ok: false, error: e.message });
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log("Server started successfully on port " + PORT);
});
SERVER

cat << 'PKG' > liara_build/package.json
{
  "name": "chabahar-battery-production",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.1"
  }
}
PKG

cat << 'LIARA' > liara_build/liara.json
{
  "app": "emdadbattery",
  "platform": "node",
  "port": 3000,
  "disks": [
    {
      "name": "data",
      "mountTo": "data"
    }
  ]
}
LIARA

cd liara_build
rm -f ../site-for-liara.zip
zip -r ../site-for-liara.zip dist server.js package.json liara.json
cd ..
rm -rf liara_build
