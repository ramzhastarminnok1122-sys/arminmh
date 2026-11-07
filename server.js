import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());


app.post('/api/zibal/request', async (req, res) => {
  try {
    const { amount, callbackUrl, description, orderId } = req.body || {};
    const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';
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
    const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';
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

app.post('/api/sms', async (req, res) => {
  try {
    const { to, message } = req.body || {};
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY تنظیم نشده' });
    if (!to || !message) return res.status(400).json({ ok: false, error: 'to/message required' });

    const sender = process.env.KAVENEGAR_SENDER || '';
    let url = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}`;
    if (sender) url += `&sender=${encodeURIComponent(sender)}`;
    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : (data.return && data.return.status === 412 ? 412 : 502)).json({ ok: r.ok, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// سرو کردن فایل‌های سایت
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback برای React Router
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
