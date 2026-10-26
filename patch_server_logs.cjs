const fs = require('fs');

let sh = fs.readFileSync('build_liara.sh', 'utf8');

const oldApi = `// API: Kavenegar SMS Proxy
app.post('/api/sms', (req, res) => {
  const to = req.body && req.body.to;
  const message = req.body && req.body.message;
  const key = process.env.KAVENEGAR_API_KEY;

  if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY is not set' });
  if (!to || !message) return res.status(400).json({ ok: false, error: 'to and message are required' });

  const url = \`https://api.kavenegar.com/v1/\${key}/sms/send.json?receptor=\${encodeURIComponent(to)}&message=\${encodeURIComponent(message)}\`;

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
});`;

const newApi = `// API: Kavenegar SMS Proxy
app.post('/api/sms', (req, res) => {
  console.log('--- SMS Request Received ---');
  const to = req.body && req.body.to;
  const message = req.body && req.body.message;
  const key = process.env.KAVENEGAR_API_KEY;

  console.log('To:', to);
  console.log('API Key First 5 Chars:', key ? key.substring(0, 5) + '...' : 'MISSING!');

  if (!key) {
    console.error('Error: KAVENEGAR_API_KEY is not set in Liara environment variables.');
    return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY is not set' });
  }
  if (!to || !message) {
    console.error('Error: Missing to/message in request body.');
    return res.status(400).json({ ok: false, error: 'to and message are required' });
  }

  const url = \`https://api.kavenegar.com/v1/\${key}/sms/send.json?receptor=\${encodeURIComponent(to)}&message=\${encodeURIComponent(message)}\`;
  console.log('Calling Kavenegar API...');

  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      console.log('Kavenegar Response Status:', apiRes.statusCode);
      console.log('Kavenegar Response Body:', data);
      try {
        const parsed = JSON.parse(data);
        res.status(apiRes.statusCode === 200 ? 200 : 502).json({ ok: apiRes.statusCode === 200, data: parsed });
      } catch (e) {
        console.error('Error parsing Kavenegar JSON:', e.message);
        res.status(500).json({ ok: false, error: 'Failed to parse SMS provider response' });
      }
    });
  }).on('error', (e) => {
    console.error('Kavenegar Network Error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  });
});`;

sh = sh.replace(oldApi, newApi);
fs.writeFileSync('build_liara.sh', sh);
