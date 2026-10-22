const FA = '۰۱۲۳۴۵۶۷۸۹';
export const toFa = (s) => String(s ?? '').replace(/\d/g, (d) => FA[+d]);
export const toEn = (s) =>
  String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export const fmtNum = (n) => toFa(Number(n || 0).toLocaleString('en-US'));
export const fmtToman = (n) => `${fmtNum(n)} تومان`;

export const normPhone = (p) => toEn(p).replace(/[\s\-()]/g, '');
// پیش‌شماره‌های واقعی اپراتورهای ایران: 090-093 و 099
export const isMobile = (p) => /^09[01239]\d{8}$/.test(normPhone(p));

export const uid = () => Math.random().toString(36).slice(2, 10);
export const reqCode = () => 'CHB-' + Math.floor(100000 + Math.random() * 900000);

const dtf = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
const dfOnly = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' });
const dayFmt = new Intl.DateTimeFormat('fa-IR', { weekday: 'short', day: 'numeric', month: 'short' });
export const dt = (ts) => dtf.format(new Date(ts));
export const dOnly = (ts) => dfOnly.format(new Date(ts));
export const dayLabel = (ts) => dayFmt.format(new Date(ts));
export const isToday = (ts) => dOnly(ts) === dOnly(Date.now());

export const ago = (ts) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'لحظه‌ای پیش';
  if (m < 60) return `${toFa(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toFa(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${toFa(d)} روز پیش`;
  return dOnly(ts);
};

export const cn = (...a) => a.filter(Boolean).join(' ');
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const countdown = (ms) => {
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
};

/* ================= اعتبارسنجی‌های ضد ورود بی‌معنا ================= */

export function nameError(n) {
  const t = (n || '').trim().replace(/\s+/g, ' ');
  if (!t) return 'نام الزامی است';
  const w = t.split(' ');
  if (w.length < 2) return 'نام و نام خانوادگی را کامل بنویسید';
  if (t.length < 5) return 'نام واردشده کوتاه است';
  if (/\d/.test(t)) return 'در نام نباید عدد بنویسید';
  if (/[a-zA-Z\u0600-\u06FF]/.test(t) === false) return 'نام فقط باید حرف باشد';
  if (/([\u0600-\u06FFa-zA-Z])\1{2,}/.test(t)) return 'متن نام معتبر نیست';
  if (w.some((x) => x.length < 2)) return 'هر بخش از نام حداقل ۲ حرف باشد';
  return null;
}

export function addrError(desc, pickedOnMap) {
  const t = (desc || '').trim();
  if (t && /(.+?)\1{4,}/.test(t)) return 'متن آدرس معتبر نیست';
  if (pickedOnMap && t.length < 10) return null; // نقطه نقشه + شرح کوتاه قابل قبول
  if (t.length < 10) return 'آدرس را دقیق‌تر بنویسید یا موقعیت را روی نقشه انتخاب کنید';
  const w = t.split(/\s+/).filter(Boolean);
  if (w.length < 2) return 'آدرس باید حداقل دو کلمه باشد';
  if (/([\u0600-\u06FF])\1{3,}/.test(t)) return 'متن آدرس معتبر نیست';
  return null;
}

export function declError(t) {
  const s = (t || '').trim();
  if (s.length < 15) return 'بیانیه باید حداقل ۱۵ کاراکتر باشد';
  const w = s.split(/\s+/).filter(Boolean);
  if (w.length < 3) return 'بیانیه باید حداقل ۳ کلمه باشد';
  if (/(.+?)\1{4,}/.test(s)) return 'متن بیانیه معتبر نیست';
  return null;
}

export const hashPw = (p) => btoa(unescape(encodeURIComponent('chb#' + p))).split('').reverse().join('');

/* ================= اعتبارسنجی سخت‌گیرانه شماره موبایل ================= */

export function phoneError(p) {
  const t = normPhone(p);
  if (!t) return 'شماره موبایل الزامی است';
  if (!/^09/.test(t)) return 'شماره باید با ۰۹ شروع شود';
  if (!/^09[01239]\d{8}$/.test(t)) return 'پیش‌شماره یا تعداد ارقام درست نیست (نمونه درست: 09121234567)';
  if (/(\d)\1{6,}/.test(t)) return 'این شماره آزمایشی/تکراری به نظر می‌رسد';
  if (/0123456789|12345678|98765432|09876543/.test(t)) return 'الگوی شماره معتبر نیست';
  return null;
}

/* ================= دستیار هوشمند خودرو ================= */

export const VEHICLE_DB = {
  /* --- سواری و سبک --- */
  'پراید': ['131', '132', '111', 'SL', 'SE', 'صد'],
  'تیبا': ['تیبا ۱', 'تیبا ۲', 'تیبا1', 'تیبا2', 'SD', 'هاچبک'],
  'کوییک': ['R', 'S', 'اتوماتیک', 'کوییک'],
  'پژو': ['206', '207 SD', '207i', 'پارس', '405', 'ROA', 'روآ', 'RD', 'ROD', 'SLX', 'آرد'],
  'سمند': ['LX', 'EF7', 'سورن', 'سورن پلاس', 'پلاس', 'XU'],
  'رانا': ['رانا', 'L90', 'T90', 'پلاس'],
  'دنا': ['دنا', 'دنا پلاس', 'پلاس'],
  'شاهین': ['شاهین', 'S16'],
  'ری‌را': ['ری‌را', 'کوانتوم'],
  'هیوندای': ['النترا', 'اکسنت', 'توسان', 'سوناتا', 'ورنا', 'i10', 'i20'],
  'کیا': ['سراتو', 'ریو', 'اسپورتیج', 'سورنتو', 'اپتیما', 'پیکانتو'],
  'تویوتا': ['کمری', 'کرولا', 'پرادو', 'لندکروزر', 'هایلوکس', 'یاریس'],
  'نیسان': ['زامیاد', 'جوک', 'قشقایی', 'تیانا', 'یافت'],
  'مزدا': ['323', '2000', 'GV'],
  'ام‌وی‌ام': ['X22', 'X33', 'X55', '315', '530'],
  'جک': ['J4', 'S3', 'S5', 'دسته‌دندە'],
  'وانت': ['زامیاد', 'پیکان', 'آریسان', 'کارا', 'نیسان'],
  'موتورسیکلت': ['هوندا', 'پالس', 'کارزم', '۱۱۰', '125', '150', '180'],
  /* --- سنگین و تجاری --- */
  'کامیون بنز': ['1924', '1921', '1928', '2624', '608', '407'],
  'ولوو': ['FH12', 'F12', 'N12', 'FH16', 'FM'],
  'اسکانیا': ['113', '141', '124', 'R450', 'G400'],
  'خاور': ['608', 'باری', 'کمپرسی'],
  'ایسوزو': ['نهر', 'NPR', 'کامیونت', 'ده‌ماکس'],
  'فوتون': ['آومان', 'TX', 'کانتر'],
  'دونگ‌فنگ': ['تریلا', 'کمپرسی', 'دابل'],
  'تریلر': ['کشنده', 'یخچالی', 'باری', 'تانکر'],
  'کمپرسی': ['تک‌محوره', 'دو‌محوره', 'جفت'],
  'لودر': ['کوماتسو', 'کاترپیلار', 'ZL30', 'ZL50'],
  'بیل مکانیکی': ['کوماتسو', 'هیتاچی', 'JCB', 'PC200'],
  'جنرالات': ['GMC', 'یونیلودر'],
  'سایر': []
};

export const BRAND_GROUPS = [
  { label: 'سواری و سبک', items: ['پراید', 'تیبا', 'کوییک', 'پژو', 'سمند', 'دنا', 'رانا', 'شاهین', 'ری‌را', 'هیوندای', 'کیا', 'تویوتا', 'نیسان', 'مزدا', 'ام‌وی‌ام', 'جک', 'وانت', 'موتورسیکلت'] },
  { label: 'سنگین و تجاری — تریلر و کامیون', items: ['کامیون بنز', 'ولوو', 'اسکانیا', 'خاور', 'ایسوزو', 'فوتون', 'دونگ‌فنگ', 'تریلر', 'کمپرسی', 'لودر', 'بیل مکانیکی', 'جنرالات', 'سایر'] }
];

export function aiCheckVehicle({ brand, model, year }) {
  const tips = [];
  let ok = true, severity = 'ok', suggestion = null;

  // --- سال ساخت ---
  const y = toEn(String(year || '')).trim().replace(/[^\d]/g, '');
  let yearMsg = null;
  if (y) {
    const ny = parseInt(y, 10);
    const jalali = ny >= 1340 && ny <= 1405;
    const greg = ny >= 1965 && ny <= 2026;
    if (!jalali && !greg) {
      ok = false; severity = 'error';
      yearMsg = ny > 1405 && ny <= 2200
        ? `سال ساخت نمی‌تواند جلوتر از امسال باشد («${year}») به‌روزرسانی؟`
        : `سال «${year}» منطقی نیست؛ سال را مثلاً ۱۳۹۹ یا ۲۰۱۸ وارد کنید.`;
    }
  }

  // --- مدل / تیپ ---
  const m = (model || '').trim();
  let modelState = 'ok';
  if (m) {
    const list = VEHICLE_DB[brand] || [];
    const inDb = list.some((k) => m === k || m.includes(k) || k.includes(m));
    // مدل‌های عددی معتبر ایران (۱۳۲، ۲۰۶، ۴۰۵…) اگر در فهرست برند باشند مشکلی ندارند
    if (!inDb && /(^|\s)تیپ\s*[0-9۰-۹]/.test(m)) {
      modelState = 'bad'; ok = false;
      if (severity === 'ok') severity = 'warn';
      tips.push(`«${m}» برای امدادگر گویا نیست؛ کد دقیق تیپ را بنویسید — مثلاً پراید ۱۳۱ یا ۱۳۲.`);
    } else if (!inDb && (/(.)\1{2,}/.test(m) || /^[\d\s.]+$/.test(m) || m.length < 2 || m.length > 25)) {
      modelState = 'bad'; ok = false;
      if (severity === 'ok') severity = 'warn';
      tips.push(`مدل «${m}» واقعی به نظر نمی‌رسد. نمونه‌های درست: ۲۰۶، پارس، LX، سراتو…`);
    } else if (!inDb && list.length) {
      modelState = 'unknown';
        if (severity === 'ok') severity = 'warn';
        const near = list.find((k) => k.slice(0, 2).toLowerCase() === m.slice(0, 2).toLowerCase()) || list.find((k) => k[0].toLowerCase() === m[0].toLowerCase());
        suggestion = near ? `${near}` : null;
        tips.push(`تیپ «${m}» با برند «${brand}» هم‌خوانی ندارد${near ? ` — منظورتان «${brand} ${near}» بود؟` : '؛ اگر مطمئنید، تیک «همین درست است» را بزنید.'}`);
    }
  }
  return { ok, yearMsg, modelState, suggestion, tips, severity };
}

/* ================= باشگاه مشتریان ================= */

export const LOYALTY_TIERS = [
  { name: 'برنزی', min: 0, disc: 0, color: '#c47a3d', bg: 'rgba(196,122,61,.13)' },
  { name: 'نقره‌ای', min: 80, disc: 3, color: '#7c8aa0', bg: 'rgba(124,138,160,.14)' },
  { name: 'طلایی', min: 200, disc: 7, color: '#c99a10', bg: 'rgba(217,165,20,.15)' }
];

export function loyaltyOf(state, phone) {
  const done = (state.requests || []).filter((r) => r.phone === phone && r.status === 'done').length;
  const approvedSum = (state.payments || []).filter((p) => p.phone === phone && p.status === 'approved').reduce((a, p) => a + (p.amount || 0), 0);
  const u = (state.users || []).find((x) => x.phone === phone);
  const bonus = u?.bonusPoints || 0;
  const points = done * 15 + Math.floor(approvedSum / 100000) * 3 + bonus;
  let ti = 0;
  LOYALTY_TIERS.forEach((t, i) => { if (points >= t.min) ti = i; });
  const next = LOYALTY_TIERS[ti + 1] || null;
  return {
    points, tier: LOYALTY_TIERS[ti], next, discount: LOYALTY_TIERS[ti].disc,
    progress: next ? Math.min(100, Math.round(((points - LOYALTY_TIERS[ti].min) / (next.min - LOYALTY_TIERS[ti].min)) * 100)) : 100
  };
}

const ADDR_KW = ['بلوار', 'خیابان', 'کوچه', 'میدان', 'جاده', 'شهرک', 'فلکه', 'پمپ', 'جنب', 'نبش', 'انتهای', 'ابتدای', 'پلاک', 'روبه', 'سه‌راه', 'سه راه', 'چهارراه', 'تقاطع', 'بازار', 'پارک', 'اسکله', 'کمپ', 'دروازه'];

export function aiCheckLocation({ desc = '', point = null, areas = [] }) {
  const flags = [];
  let score = 0;
  const text = (desc || '').trim();
  if (point) score += 45; else flags.push('موقعیت روی نقشه انتخاب نشده است');
  if (ADDR_KW.some((k) => text.includes(k))) score += 30;
  else if (text) flags.push('کلمه شاخص آدرس (بلوار، میدان، کوچه…) در متن نیامده');
  if (text.length >= 15) score += 15; else flags.push('شرح آدرس کوتاه است');
  if (text.split(/\s+/).filter(Boolean).length >= 3) score += 10;
  let area = null, dist = Infinity;
  if (point) {
    for (const a of areas) {
      if (!a.map) continue;
      const d = Math.hypot(a.map.x - point.x, a.map.y - point.y);
      if (d < dist) { dist = d; area = a; }
    }
    if (dist > 260) flags.push('نقطه انتخابی خارج از محدوده‌های رسمی سرویس است — نیاز به هماهنگی تلفنی');
  }
  return { confidence: clamp(score, 5, 98), area: area?.name || null, ok: score >= 60 && !!point, flags };
}

/* ================= فشرده‌سازی تصویر آپلودی ================= */

export function compressImage(file, maxW = 1000, q = 0.72) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const sc = Math.min(1, maxW / img.width);
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * sc);
        cv.height = Math.round(img.height * sc);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/jpeg', q));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
