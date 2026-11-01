const fs = require('fs');

function patchServerJS(file) {
  let code = fs.readFileSync(file, 'utf8');
  const newSMS = `
app.post('/api/sms', async (req, res) => {
  try {
    const { to, message, template, token, token2, token3 } = req.body || {};
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY تنظیم نشده' });
    if (!to) return res.status(400).json({ ok: false, error: 'to required' });

    let url = '';
    // If template is provided, use the verify/lookup endpoint (no sender line needed)
    if (template && token) {
      url = \`https://api.kavenegar.com/v1/\${key}/verify/lookup.json?receptor=\${encodeURIComponent(to)}&token=\${encodeURIComponent(token)}&template=\${encodeURIComponent(template)}\`;
      if (token2) url += \`&token2=\${encodeURIComponent(token2)}\`;
      if (token3) url += \`&token3=\${encodeURIComponent(token3)}\`;
    } else {
      if (!message) return res.status(400).json({ ok: false, error: 'message required when template is not used' });
      const sender = process.env.KAVENEGAR_SENDER || '';
      url = \`https://api.kavenegar.com/v1/\${key}/sms/send.json?receptor=\${encodeURIComponent(to)}&message=\${encodeURIComponent(message)}\`;
      if (sender) url += \`&sender=\${encodeURIComponent(sender)}\`;
    }

    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : (data.return && data.return.status === 412 ? 412 : 502)).json({ ok: r.ok, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});
`;
  code = code.replace(/app\.post\('\/api\/sms', async \(req, res\) => \{[\s\S]*?\}\catch[\s\S]*?\}\);/, newSMS.trim());
  fs.writeFileSync(file, code);
}

function patchBuildLiara(file) {
  let code = fs.readFileSync(file, 'utf8');
  const newSMS = `
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
`;
  code = code.replace(/app\.post\('\/api\/sms', \(req, res\) => \{[\s\S]*?\}\)\.on\('error'[\s\S]*?\}\);/, newSMS.trim());
  fs.writeFileSync(file, code);
}

patchServerJS('server.js');
patchBuildLiara('build_liara.sh');
