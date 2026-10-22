/* ===== اعلان‌های صاحب‌کار =====
   دو مسیر:
   1) ntfy — رایگان و بدون سرور؛ نوتیف مستقیم روی گوشی صاحب‌کار (اپ ntfy).
   2) پیامک — از طریق تابع سروری api/sms.js (کاوه‌نگار) هنگام دیپلوی روی Vercel.
   هر دو «بی‌صدا» شکست می‌خورند تا هرگز تجربه مشتری خراب نشود. */

const endpoint = (s) => (s?.settings?.notify?.ntfyTopic || '').trim();

export async function notifyOwner(state, { title, body }) {
  const s = state?.settings?.notify || {};
  const jobs = [];
  if (endpoint(state)) {
    jobs.push(fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: endpoint(state), title, message: body, tags: ['battery', 'bell'], priority: 'high' })
    }).catch(() => {}));
  }
  if (s.smsEnabled && (s.ownerPhone || '').trim()) {
    jobs.push(fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: (s.ownerPhone || '').trim(), message: `${title}\n${body}` })
    }).catch(() => {}));
  }
  if (jobs.length) await Promise.all(jobs).catch(() => {});
}

/* ===== کمک‌کارهای اعلان مرورگر برای پنل صاحب‌کار ===== */
export function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    [0, 0.28].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = t ? 990 : 740;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.24);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.26);
    });
    setTimeout(() => ctx.close(), 900);
  } catch (e) { /* ignore */ }
}

export async function askNotifyPermission() {
  try {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    const p = await Notification.requestPermission();
    return p;
  } catch (e) { return 'denied'; }
}

export function browserNotify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, dir: 'rtl', lang: 'fa', tag: 'chb-owner-' + Date.now() });
    }
  } catch (e) { /* ignore */ }
}

/* ===== اعلام صوتی فارسی (سورپرایز پنل مدیر) ===== */
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fa-IR';
    u.rate = 0.95;
    const v = window.speechSynthesis.getVoices().find((x) => (x.lang || '').startsWith('fa'));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
}

export const fmMoney = (n) => Number(n || 0).toLocaleString('en-US');
