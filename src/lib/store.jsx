import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seed } from './seed';
import { uid } from './utils';

const KEY = 'chb_store_v1';
const Ctx = createContext(null);

export const RANK = { new: 0, reviewing: 1, assigned: 2, enroute: 3, arrived: 4, done: 5 };
export const ORDER = ['new', 'reviewing', 'assigned', 'enroute', 'arrived', 'done'];
export const LABEL = {
  new: 'ثبت شد', reviewing: 'در حال بررسی', assigned: 'امدادگر تعیین شد',
  enroute: 'در مسیر شما', arrived: 'رسید به محل', done: 'عملیات انجام شد'
};

function migrate(s) {
  const base = seed();
  return {
    ...base, ...s, __v: 2,
    settings: { ...base.settings, ...(s.settings || {}) },
    homeContent: { ...base.homeContent, ...(s.homeContent || {}) }
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && (s.__v === 1 || s.__v === 2)) return migrate(s);
    }
  } catch (e) { /* ignore */ }
  return seed();
}

const REPORTS = [
  { battery: 'سپاهان SE 60 سیلد', oldState: 'سلول معیوب — غیرقابل شارژ', price: 4150000, note: 'باتری تعویض؛ دینام تست شد و سالم بود.' },
  { battery: 'نیرو N 55 اتمی', oldState: 'تخلیه کامل — نیازمند شارژ طولانی', price: 3350000, note: 'تعویض انجام شد؛ قطب‌ها ضدزنگ زده شد.' },
  { battery: '—', oldState: 'باتری سالم؛ اتصالات شل', price: 150000, note: 'سرویس اتصالات و تست شارژ؛ توصیه به مراجعه بعدی.' },
  { battery: 'دلکور DX 70', oldState: 'کاملاً فرسوده — عمر مفید پایان', price: 6450000, note: 'نصب و کالیبره شد؛ فاکتور و گارانتی تحویل شد.' }
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function genReport() {
  const r = pick(REPORTS);
  return { ...r, at: Date.now() };
}

// شبیه‌ساز چرخه حیات درخواست — درخواست‌ها به‌مرور و باورپذیر جلو می‌روند
function simulate(s) {
  const now = Date.now();
  let changed = false;
  const techs = s.technicians || [];
  const reqs = (s.requests || []).map((r) => {
    if (r.manualHold || RANK[r.status] >= 5) return r;
    let r2 = { ...r };
    const t = (now - r.createdAt) / 1000;
    const adv = (st) => {
      if (RANK[r2.status] < RANK[st]) {
        r2.timeline = [...(r2.timeline || []), { status: st, at: now }];
        r2.status = st; changed = true;
      }
    };
    if (t > 30) adv('reviewing');
    // تا وقتی ودیعه تایید یا بخشش نشده، از «بررسی» جلوتر نمی‌رویم
    const depOk = !r2.deposit || r2.deposit.status === 'approved' || r2.deposit.status === 'waived';
    if (t > 80 && depOk && RANK[r2.status] < 2) {
      const online = techs.filter((x) => x.online);
      if (online.length) {
        if (!r2.technicianId) r2.technicianId = pick(online).id;
        adv('assigned');
      }
    }
    if (t > 110 && RANK[r2.status] < 3) { r2.enrouteAt = now; adv('enroute'); }
    if (r2.status === 'enroute' && r2.enrouteAt && now - r2.enrouteAt > (r2.travel || 180) * 1000) {
      r2.arrivedAt = now; adv('arrived');
    }
    if (r2.status === 'arrived' && r2.arrivedAt && now - r2.arrivedAt > 60000) {
      r2.doneAt = now;
      if (!r2.report) r2.report = genReport();
      adv('done');
    }
    return r2;
  });
  return changed ? { ...s, requests: reqs } : s;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toasts, setToasts] = useState([]);

  const toast = (msg, type = 'success') => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const update = (fn) => setState((prev) => fn(prev));
  const upsert = (coll, item) => update((s) => {
    const list = [...(s[coll] || [])];
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list[i] = { ...list[i], ...item };
    else list.push({ ...item, id: item.id || uid() });
    return { ...s, [coll]: list };
  });
  const remove = (coll, id) => update((s) => ({ ...s, [coll]: (s[coll] || []).filter((x) => x.id !== id) }));
  const patch = (coll, id, part) => update((s) => ({
    ...s, [coll]: (s[coll] || []).map((x) => (x.id === id ? { ...x, ...part } : x))
  }));

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }, [state]);

  // همگام‌سازی زنده بین تب‌های همان مرورگر (مثلاً پنل صاحب‌کار کنار سایت)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue);
        if (next && next.__v) setState((prev) => (JSON.stringify(prev) === e.newValue ? prev : next));
      } catch (err) { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setState((prev) => simulate(prev)), 4000);
    return () => clearInterval(iv);
  }, []);

  const value = useMemo(
    () => ({ state, update, upsert, remove, patch, toast, toasts }),
    [state, toasts]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
export { genReport };
