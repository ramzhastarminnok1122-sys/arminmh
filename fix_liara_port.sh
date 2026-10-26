#!/bin/bash
set -e

# Create a fresh build directory
rm -rf liara_build
mkdir -p liara_build
cp -r dist liara_build/

cat << 'SERVER' > liara_build/server.js
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '5mb' }));

const DB_FILE = path.join(__dirname, 'database.json');

app.get('/api/db', (req, res) => {
  if (fs.existsSync(DB_FILE)) {
    res.sendFile(DB_FILE);
  } else {
    res.json(null);
  }
});

app.post('/api/db', (req, res) => {
  fs.writeFile(DB_FILE, JSON.stringify(req.body), (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    res.json({ ok: true });
  });
});

app.post('/api/sms', (req, res) => {
  const to = req.body && req.body.to;
  const message = req.body && req.body.message;
  const key = process.env.KAVENEGAR_API_KEY;

  if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY is not set' });
  if (!to || !message) return res.status(400).json({ ok: false, error: 'to and message are required' });

  const url = "https://api.kavenegar.com/v1/" + key + "/sms/send.json?receptor=" + encodeURIComponent(to) + "&message=" + encodeURIComponent(message);

  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.status(apiRes.statusCode === 200 ? 200 : 502).json({ ok: apiRes.statusCode === 200, data: parsed });
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

// HARDCODE PORT 3000 AND 0.0.0.0 BIND TO FORCE LIARA TO RECOGNIZE THE HEALTHCHECK
app.listen(3000, '0.0.0.0', () => {
  console.log("Server successfully bound to 0.0.0.0:3000");
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
  "port": 3000
}
LIARA

cd liara_build
rm -f ../site-for-liara.zip
zip -r ../site-for-liara.zip dist server.js package.json liara.json
cd ..
rm -rf liara_build
