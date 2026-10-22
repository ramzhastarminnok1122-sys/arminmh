import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, RANK, LABEL, ORDER } from '../../lib/store';
import { Icon, StatusBadge, Badge, Modal, Btn } from '../../components/ui';
import { cn, toFa, dt, dOnly, isToday, uid } from '../../lib/utils';
import { beep, askNotifyPermission, browserNotify, speak } from '../../lib/notify';

const KEY_O = 'chb_owner';
const KEY_VOICE = 'chb_owner_voice';
const QUICK_REPLIES = ['الان اعزام شد؛ حدود ۱۵ دقیقه دیگر هستم. 🚚', 'سلام، برای هماهنگی لطفاً جواب بدهید.', 'امدادگر در مسیر شماست؛ سر جواب باشید لطفاً.', 'وديعه شما تایید شد؛ امدادگر به‌سمت شما حرکت کرد. ✅'];

export default function OwnerPanel() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [authed, setAuthed] = useState(() => localStorage.getItem(KEY_O) === '1');
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState('live');
  const [alerts, setAlerts] = useState([]);
  const [fishView, setFishView] = useState(null);
  const [perm, setPerm] = useState(() => ('Notification' in window) ? Notification.permission : 'unsupported');
  const [voice, setVoice] = useState(() => localStorage.getItem(KEY_VOICE) === '1');
  const [drafts, setDrafts] = useState({});
  const seen = useRef(null);

  const s = state.settings || {};
  const reqs = state.requests || [];
  const orders = state.orders || [];
  const pays = state.payments || [];
  const techs = state.technicians || [];

  const login = () => {
    if (pw === (s.ownerPw || '123654')) { localStorage.setItem(KEY_O, '1'); setAuthed(true); setPw(''); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 700); }
  };
  const logout = () => { localStorage.removeItem(KEY_O); setAuthed(false); };

  const toggleVoice = () => {
    const v = !voice;
    setVoice(v);
    localStorage.setItem(KEY_VOICE, v ? '1' : '0');
    if (v) { speak('اعلان صوتی پنل مدیر فعال شد'); toast('از این به بعد هر خبر جدید، با صدای بلند گفته می‌شود 🔊'); }
  };

  /* ---- زنگ + اعلان + اعلام صوتی هر درخواست/سفارش/فیش جدید ---- */
  useEffect(() => {
    if (!authed) return;
    const sig = JSON.stringify({ r: reqs.map((x) => x.id), o: orders.map((x) => x.id), p: pays.map((x) => x.id) });
    if (seen.current === null) { seen.current = sig; return; }
    if (sig === seen.current) return;
    const old = JSON.parse(seen.current);
    seen.current = sig;

    const fresh = [];
    reqs.filter((x) => !old.r.includes(x.id)).forEach((x) => fresh.push({
      id: x.id, tab: 'reqs', at: x.createdAt,
      title: '🚨 درخواست امداد جدید — ' + x.code,
      body: `${x.name} — ${toFa(x.phone)} | ${x.problem} — ${x.vehicle?.brand || ''} ${x.vehicle?.model || ''}`,
      speak: `درخواست امداد جدید از ${x.name}، ${x.problem}، ${x.vehicle?.brand || ''} ${x.vehicle?.model || ''}`
    }));
    orders.filter((x) => !old.o.includes(x.id)).forEach((x) => fresh.push({
      id: x.id, tab: 'orders', at: x.createdAt,
      title: '🛒 سفارش باتری جدید',
      body: `${x.name} — ${toFa(x.phone)} | ${x.batteryLabel} — ${toFa((x.price || 0).toLocaleString('en-US'))} تومان`,
      speak: `سفارش باتری جدید از ${x.name}، ${x.batteryLabel}`
    }));
    pays.filter((x) => !old.p.includes(x.id)).forEach((x) => fresh.push({
      id: x.id, tab: 'pays', at: x.at,
      title: `🧾 فیش جدید — ${toFa((x.amount || 0).toLocaleString('en-US'))} تومان`,
      body: `${x.name} — ${toFa(x.phone)} | ${x.label || ''}`,
      speak: `فیش پرداخت جدید، مبلغ ${Math.round((x.amount || 0) / 1000)} هزار تومان، از ${x.name}`
    }));
    if (!fresh.length) return;
    setAlerts((a) => [...fresh, ...a].slice(0, 30));
    beep();
    if (voice) speak(fresh.map((f) => f.speak).join('. '));
    fresh.forEach((f) => browserNotify(f.title, f.body));
    if ('Notification' in window) setPerm(Notification.permission);
  }, [state, authed, voice]);

  useEffect(() => {
    document.title = alerts.length ? `(${toFa(alerts.length)}) 🔔 پنل مدیر` : 'پنل مدیر';
    return () => { document.title = 'امداد باتری چابهار'; };
  }, [alerts.length]);

  /* ---- عملیات واقعی: تایید/رد فیش ---- */
  const approvePay = (p) => {
    update((st) => {
      let next = { ...st, payments: st.payments.map((x) => x.id === p.id ? { ...x, status: 'approved' } : x) };
      if (p.kind === 'order') next.orders = st.orders.map((o) => o.id === p.refId ? { ...o, status: 'پرداخت شد — در حال آماده‌سازی' } : o);
      else if (p.kind === 'deposit') next.requests = st.requests.map((r) => r.code === p.refId ? { ...r, deposit: { ...(r.deposit || {}), status: 'approved' } } : r);
      else next.requests = st.requests.map((r) => r.code === p.refId ? { ...r, invoicePaid: true } : r);
      return next;
    });
    toast(p.kind === 'deposit' ? 'ودیعه تایید شد؛ اعزام فعال شد.' : 'پرداخت تایید شد.');
  };
  const rejectPay = (p) => {
    update((st) => {
      let next = { ...st, payments: st.payments.map((x) => x.id === p.id ? { ...x, status: 'rejected' } : x) };
      if (p.kind === 'order') next.orders = st.orders.map((o) => o.id === p.refId ? { ...o, status: 'رد شد — بازآپلود رسید' } : o);
      else if (p.kind === 'deposit') next.requests = st.requests.map((r) => r.code === p.refId ? { ...r, deposit: { ...(r.deposit || {}), status: 'rejected' } } : r);
      else next.requests = st.requests.map((r) => r.code === p.refId ? { ...r, invoicePaid: false } : r);
      return next;
    });
    toast('فیش رد شد؛ مشتری می‌تواند مجدد آپلود کند.');
  };

  /* ---- تخصیص امدادگر ---- */
  const assign = (r, techId) => {
    update((st) => ({ ...st, requests: st.requests.map((x) => x.id === r.id ? {
      ...x, technicianId: techId || null, manualHold: true,
      status: RANK[x.status] < 2 ? 'assigned' : x.status,
      timeline: RANK[x.status] < 2 ? [...(x.timeline || []), { status: 'assigned', at: Date.now() }] : x.timeline
    } : x) }));
    const t = techs.find((x) => x.id === techId);
    toast(t ? `${t.name} برای ${r.code} تخصیص یافت.` : 'تخصیص برداشته شد.');
  };

  /* ---- گفتگو با مشتری (پاسخ یا شروع) ---- */
  const sendChat = (r, text) => {
    const t = (text || drafts[r.id] || '').trim();
    if (!t) return;
    update((st) => ({ ...st, requests: st.requests.map((x) => x.id === r.id ? { ...x, chat: [...(x.chat || []), { id: uid(), from: 'agent', text: t, at: Date.now(), by: 'مدیر' }] } : x) }));
    setDrafts((d) => ({ ...d, [r.id]: '' }));
    toast('پیام شما برای مشتری ارسال شد.');
  };

  /* ---- آمار ---- */
  const todayReqs = reqs.filter((r) => isToday(r.createdAt));
  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const pendingPays = pays.filter((p) => p.status === 'pending');
  const approvedSum = pays.filter((p) => p.status === 'approved' && isToday(p.at)).reduce((t, p) => t + (p.amount || 0), 0);
  const activeReqs = reqs.filter((r) => RANK[r.status] < 5);
  const unreadChats = reqs.filter((r) => (r.chat || []).some((m) => m.from === 'customer') && !(r.chat || []).some((m) => m.from === 'agent' && m.at > (r.chat.filter((c) => c.from === 'customer').pop()?.at || 0)));

  const payOfReq = (r) => ({
    dep: pays.find((p) => p.kind === 'deposit' && p.refId === r.code),
    inv: pays.find((p) => p.kind === 'service' && p.refId === r.code)
  });
  const payChip = (p, label) => !p ? null : (
    <span className={cn('own-pay', p.status)}>{label}: {p.status === 'approved' ? '✔ پرداخت شد' : p.status === 'rejected' ? '✖ رد شد' : '… منتظر تایید شما'}</span>
  );

  /* ---- کارت درخواست با چت و تخصیص ---- */
  const ReqCard = ({ r }) => {
    const { dep, inv } = payOfReq(r);
    const tech = techs.find((t) => t.id === r.technicianId);
    const chat = r.chat || [];
    return (
      <div className="own-item">
        <div className="own-item-head">
          <b>{r.code}</b> <StatusBadge status={r.status} />
          {(dep?.status === 'pending' || (!dep && r.deposit?.status === 'pending')) && <Badge tone="amber" dot>ودیعه منتظر</Badge>}
          <small>{dt(r.createdAt)}</small>
        </div>
        <p><Icon name="user" size={14} /> {r.name} — <a href={`tel:${r.phone}`} style={{ direction: 'ltr', color: 'var(--brand)', fontWeight: 700 }}>{toFa(r.phone)}</a></p>
        <p><Icon name="car" size={14} /> {r.problem} — {r.vehicle?.brand} {r.vehicle?.model}</p>
        <p><Icon name="pin" size={14} /> {r.location?.desc}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
          {dep && payChip(dep, 'ودیعه')}
          {inv && payChip(inv, 'فاکتور')}
          {r.report?.price > 0 && !inv && <span className="own-pay none">فاکتور {toFa(r.report.price.toLocaleString('en-US'))} تومان — فیش نیامده</span>}
          {r.status === 'done' && r.report && <span className="own-pay approved">کار شد — {r.report.battery}</span>}
        </div>

        {/* اکشن‌های فیش‌ها */}
        {(dep?.status === 'pending' || inv?.status === 'pending') && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {dep?.status === 'pending' && <>
              <Btn variant="green" size="sm" icon="check" onClick={() => approvePay(dep)}>تایید ودیعه</Btn>
              <Btn variant="ghost" size="sm" icon="x" onClick={() => rejectPay(dep)}>رد فیش ودیعه</Btn>
            </>}
            {inv?.status === 'pending' && <>
              <Btn variant="green" size="sm" icon="check" onClick={() => approvePay(inv)}>تایید فاکتور</Btn>
              <Btn variant="ghost" size="sm" icon="x" onClick={() => rejectPay(inv)}>رد فاکتور</Btn>
            </>}
          </div>
        )}

        {/* تخصیص امدادگر */}
        {RANK[r.status] < 5 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}><Icon name="truck" size={14} /> امدادگر:</span>
            <select className="input" style={{ width: 'auto', padding: '7px 12px' }} value={r.technicianId || ''} onChange={(e) => assign(r, e.target.value)}>
              <option value="">— تعیین کنید —</option>
              {techs.map((t) => <option key={t.id} value={t.id}>{t.name} {t.online ? '🟢' : '⚪'}</option>)}
            </select>
            {tech && <span className="own-pay approved">{tech.name} — {LABEL[r.status]}</span>}
          </div>
        )}

        {/* گفتگو با مشتری */}
        {RANK[r.status] < 5 && (
          <div style={{ marginTop: 12 }}>
            <div className="mini-chat">
              {chat.length === 0 && <small style={{ color: 'var(--muted-2)' }}>اولین پیام را شما بفرستید — مشتری در صفحه پیگیری می‌بیند.</small>}
              {chat.map((m) => <div key={m.id} className={cn('chat-msg', m.from)}>{m.text}<small>{m.from === 'agent' ? `${m.by || 'مدیر'} — ` : ''}{dt(m.at)}</small></div>)}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {QUICK_REPLIES.map((q) => <button key={q} className="chip" style={{ fontSize: '.76rem', padding: '6px 11px' }} onClick={() => sendChat(r, q)}>{q}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input className="input" value={drafts[r.id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && sendChat(r)} placeholder="پیام به مشتری…" />
              <Btn variant="dark" size="sm" icon="telegram" onClick={() => sendChat(r)}>ارسال</Btn>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OrderCard = ({ o }) => {
    const pay = pays.find((p) => p.kind === 'order' && p.refId === o.id);
    return (
      <div className="own-item">
        <div className="own-item-head"><b>🛒 {o.batteryLabel}</b><small>{dt(o.createdAt)}</small></div>
        <p><Icon name="user" size={14} /> {o.name} — <a href={`tel:${o.phone}`} style={{ direction: 'ltr', color: 'var(--brand)', fontWeight: 700 }}>{toFa(o.phone)}</a></p>
        <p><Icon name="pin" size={14} /> {o.address} — {o.vehicle}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          <span className="own-pay amount">{toFa((o.price || 0).toLocaleString('en-US'))} تومان</span>
          <span className={cn('own-pay', o.status === 'پرداخت شد — در حال آماده‌سازی' ? 'approved' : o.status === 'رد شد — بازآپلود رسید' ? 'rejected' : 'pending')}>{o.status}</span>
          {pay?.receipt && <button className="chip" onClick={() => setFishView(pay)}><Icon name="eye" size={14} /> عکس فیش</button>}
        </div>
      </div>
    );
  };

  const sortedReqs = [...reqs].sort((a, b) => b.createdAt - a.createdAt);
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);
  const sortedPays = [...pays].sort((a, b) => b.at - a.at);

  if (!authed) {
    return (
      <div className="owner-gate">
        <div className={cn('owner-gate-card', pwErr && 'shake')}>
          <span className="owner-gate-ic"><Icon name="briefcase" size={30} /></span>
          <h1>پنل مدیر</h1>
          <p>امدادها، سفارش‌ها، فیش‌ها و گفتگو با مشتری‌ها — همه در یک جا</p>
          <div className="phone-box" style={{ maxWidth: 280, margin: '18px auto 6px' }}>
            <input className={cn('input', pwErr && 'err')} type="password" value={pw} autoFocus
              onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="رمز پنل مدیر" />
          </div>
          {pwErr && <p className="field-error"><Icon name="alert" size={14} /> رمز درست نیست</p>}
          <button className="btn btn-primary" style={{ width: 280, justifyContent: 'center', marginTop: 14 }} onClick={login}>ورود</button>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-shell">
      <header className="owner-top">
        <div>
          <b>پنل مدیر</b>
          <small>امداد باتری چابهار — {dOnly(Date.now())}</small>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-sm" iconEnd="chevron">برگشت به سایت</Link>
          <button className={cn('chip', voice && 'on')} onClick={toggleVoice} title="اعلام صوتی اعلان‌ها">
            <Icon name="bell" size={15} /> {voice ? 'اعلام صوتی روشن است 🔊' : 'اعلام صوتی خاموش'}
          </button>
          {perm !== 'granted' && perm !== 'unsupported' && (
            <button className="btn btn-yellow btn-sm" onClick={async () => setPerm(await askNotifyPermission())}>
              <Icon name="bell" size={15} /> فعال‌سازی اعلان گوشی
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={logout}>خروج</button>
        </div>
      </header>

      <div className="own-hint">
        <Icon name="bell" size={17} />
        <span>تا این صفحه باز باشد، با هر سفارش جدید <b>زنگ و اعلام صوتی</b> دارید. با اپ رایگان <b>ntfy</b> حتی وقتی سایت باز نیست هم روی گوشی‌تان نوتیف می‌آید (آموزش در راهنمای اعلان). پیامک هم بعد از اتصال کاوه‌نگار، بدون باز بودن سایت می‌آید.</span>
      </div>

      {alerts.length > 0 && (
        <div className="owner-alerts">
          {alerts.slice(0, 4).map((a) => (
            <button key={a.id + a.at} className="owner-alert" onClick={() => { setTab(a.tab); setAlerts((x) => x.filter((y) => y.id !== a.id)); }}>
              <b>{a.title}</b>
              <span>{a.body}</span>
              <small>برای دیدن، لمس کنید — {dt(a.at)}</small>
            </button>
          ))}
          {alerts.length > 4 && <button className="owner-alert more" onClick={() => setAlerts([])}>+ {toFa(alerts.length - 4)} اعلان دیگر — پاک کردن همه</button>}
        </div>
      )}

      <div className="own-tiles">
        <button className="own-tile red" onClick={() => setTab('reqs')} style={{ cursor: 'pointer' }}><b>{toFa(activeReqs.length)}</b><span>امداد فعال در خیابان</span></button>
        <button className="own-tile blue" onClick={() => setTab('orders')} style={{ cursor: 'pointer' }}><b>{toFa(todayOrders.length)}</b><span>سفارش باتری امروز</span></button>
        <button className="own-tile amber" onClick={() => setTab('pays')} style={{ cursor: 'pointer' }}><b>{toFa(pendingPays.length)}</b><span>فیش منتظر تایید شما</span></button>
        <button className="own-tile green" onClick={() => setTab('pays')} style={{ cursor: 'pointer' }}><b>{toFa(approvedSum.toLocaleString('en-US'))}</b><span>تومان تاییدشده امروز</span></button>
      </div>

      <div className="tech-tabs" style={{ marginTop: 14 }}>
        {[
          ['live', unreadChats.length ? `💬 گفتگو (${toFa(unreadChats.length)})` : '💬 گفتگو'],
          ['reqs', `امدادها (${toFa(reqs.length)})`],
          ['orders', `سفارش‌ها (${toFa(orders.length)})`],
          ['pays', `فیش‌ها (${toFa(pays.length)})`]
        ].map(([k, l]) => (
          <button key={k} className={cn('tab', tab === k && 'active')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'live' && (
        <div className="own-list">
          <div className="own-empty" style={{ textAlign: 'start', padding: '18px 22px' }}>
            <b style={{ color: 'var(--ink)' }}>💬 اتاق گفتگو</b>
            <p style={{ marginTop: 6, fontSize: '.88rem' }}>مشتری‌هایی که در صفحه پیگیری پیام داده‌اند اینجاست — جوابشان را بدهید یا اول شما حرف بزنید. پیام‌های آماده هم پایین هر کارت هست.</p>
          </div>
          {activeReqs.sort((a, b) => (b.chat?.length || 0) - (a.chat?.length || 0)).map((r) => <ReqCard key={r.id} r={r} />)}
          {!activeReqs.length && <div className="own-empty">فعلاً درخواست بازی نداریم.</div>}
        </div>
      )}

      {tab === 'reqs' && (
        <div className="own-list">
          {sortedReqs.map((r) => <ReqCard key={r.id} r={r} />)}
          {!sortedReqs.length && <div className="own-empty">هنوز هیچ درخواست امدادی ثبت نشده.</div>}
        </div>
      )}

      {tab === 'orders' && (
        <div className="own-list">
          {sortedOrders.map((o) => <OrderCard key={o.id} o={o} />)}
          {!sortedOrders.length && <div className="own-empty">هنوز هیچ سفارشی ثبت نشده.</div>}
        </div>
      )}

      {tab === 'pays' && (
        <div className="own-list">
          {sortedPays.map((p) => (
            <div key={p.id} className="own-item">
              <div className="own-item-head">
                <b>🧾 {p.kind === 'deposit' ? 'ودیعه' : p.kind === 'service' ? 'فاکتور امداد' : 'سفارش باتری'}</b>
                <Badge tone={p.status === 'approved' ? 'green' : p.status === 'rejected' ? 'red' : 'amber'} dot>{p.status === 'approved' ? 'تایید شد' : p.status === 'rejected' ? 'رد شد' : 'منتظر تایید شما'}</Badge>
                <small>{dt(p.at)}</small>
              </div>
              <p><Icon name="user" size={14} /> {p.name} — <a href={`tel:${p.phone}`} style={{ direction: 'ltr', color: 'var(--brand)', fontWeight: 700 }}>{toFa(p.phone)}</a></p>
              <p><Icon name="banknote" size={14} /> <b>{toFa((p.amount || 0).toLocaleString('en-US'))} تومان</b> — {p.label}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {p.receipt && <button className="chip" onClick={() => setFishView(p)}><Icon name="eye" size={14} /> عکس فیش</button>}
                {p.status === 'pending' && <>
                  <Btn variant="green" size="sm" icon="check" onClick={() => approvePay(p)}>تایید — پول آمد</Btn>
                  <Btn variant="ghost" size="sm" icon="x" onClick={() => rejectPay(p)}>رد</Btn>
                </>}
              </div>
            </div>
          ))}
          {!sortedPays.length && <div className="own-empty">هنوز فیشی آپلود نشده.</div>}
        </div>
      )}

      <Modal open={!!fishView} onClose={() => setFishView(null)} title="عکس فیش واریز" width={520}>
        {fishView && <img src={fishView.receipt} alt="فیش" style={{ width: '100%', borderRadius: 14 }} />}
      </Modal>
    </div>
  );
}
