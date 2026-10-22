// ============================================================
//  ارسال پیامک خودکار به صاحب‌کار (کاوه‌نگار) — برای دیپلوی روی Vercel
//  راهاندازی:
//    1) در kavenegar.com ثبت‌نام و یک پلن پیامکی بخرید (حدود ۱۰۰ پیامک کافی است).
//    2) در پنل کاوه‌نگار «API Key» را کپی کنید.
//    3) این پروژه را با GitHub روی Vercel بالا بیاورید (راهنمای داخل «راهنمای-اعلان-صاحب-کار.html»).
//    4) در تنظیمات پروژه Vercel → Environment Variables → کلید SMS_API_KEY بسازید و کلید کاوه‌نگار را بچسبانید.
//    5) در پنل ادمین سایت → تنظیمات → «پنل صاحب‌کار و اعلان‌ها» شماره موبایل صاحب‌کار را وارد و پیامک را روشن کنید.
//  این فایل روی کامپیوتر مشتری اجرا نمی‌شود؛ فقط سرور Vercel آن را اجرا می‌کند و کلید محرمانه می‌ماند.
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });
  try {
    const { to, message } = req.body || {};
    const key = process.env.KAVENEGAR_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: 'KAVENEGAR_API_KEY تنظیم نشده' });
    if (!to || !message) return res.status(400).json({ ok: false, error: 'to/message required' });

    const url = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(process.env.SMS_SENDER || '')}`;
    const r = await fetch(url, { method: 'GET' });
    const data = await r.json().catch(() => ({}));
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
