const fs = require('fs');

let script = fs.readFileSync('build_liara.sh', 'utf8');

const zibalEndpoints = `
app.post('/api/zibal/request', (req, res) => {
  const { amount, callbackUrl, description, orderId } = req.body || {};
  const merchant = process.env.ZIBAL_MERCHANT || 'zibal';

  const data = JSON.stringify({
    merchant, amount, callbackUrl, description, orderId
  });

  const options = {
    hostname: 'gateway.zibal.ir',
    path: '/v1/request',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
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
  const merchant = process.env.ZIBAL_MERCHANT || 'zibal';

  const data = JSON.stringify({ merchant, trackId });
  const options = {
    hostname: 'gateway.zibal.ir',
    path: '/v1/verify',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
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
`;

script = script.replace("app.post('/api/sms', (req, res) => {", zibalEndpoints);

fs.writeFileSync('build_liara.sh', script);
