import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// سرویس پیامک کاوه‌نگار
app.post('/api/sms', async (req, res) => {
  try {
    const { to, message } = req.body || {};
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY تنظیم نشده' });
    if (!to || !message) return res.status(400).json({ ok: false, error: 'to/message required' });

    const url = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}`;
    const r = await fetch(url);
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, data });
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
