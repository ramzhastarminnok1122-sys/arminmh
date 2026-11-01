const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');

const zibalEndpoints = `
app.post('/api/zibal/request', async (req, res) => {
  try {
    const { amount, callbackUrl, description, orderId } = req.body || {};
    const merchant = process.env.ZIBAL_MERCHANT || 'zibal';
    const r = await fetch('https://gateway.zibal.ir/v1/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, amount, callbackUrl, description, orderId })
    });
    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: data.result === 100, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.post('/api/zibal/verify', async (req, res) => {
  try {
    const { trackId } = req.body || {};
    const merchant = process.env.ZIBAL_MERCHANT || 'zibal';
    const r = await fetch('https://gateway.zibal.ir/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, trackId })
    });
    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: data.result === 100, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// سرویس پیامک کاوه‌نگار
`;

server = server.replace("// سرویس پیامک کاوه‌نگار", zibalEndpoints);
fs.writeFileSync('server.js', server);
