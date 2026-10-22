import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, LABEL, ORDER, RANK } from '../lib/store';
import { Btn, Icon, StatusBadge, Stars, Badge } from '../components/ui';
import ChabaharMap, { MapLegend } from '../components/ChabaharMap';
import { cn, clamp, toFa, dt, uid } from '../lib/utils';

/* ---------- دستیار هوشمند پاسخگو ---------- */
function botReply(req, text, techName) {
  const t = text.toLowerCase();
  const has = (...w) => w.some((x) => text.includes(x));
  if (has('سلام', 'درود', 'وقت')) return 'سلام و درود! 👋 من دستیار هوشمند امداد هستم. هر سوالی درباره درخواست‌تان دارید بپرسید؛ اگر پیچیده بود، همکاران انسانی هم در چت هستند.';
  if (has('کجا', 'کِجا', 'دیر', 'طول', 'چقدر', 'کی می', 'چه وقت', 'راه')) {
    if (RANK[req.status] >= 4) return 'امدادگر به محل رسیده و مشغول کار است. الان کنار خودروی شماست. 🚻';
    if (req.status === 'enroute') return `${techName || 'امدادگر ما'} الان در مسیر شماست و بر اساس ترافیک مسیر، حدود ${Math.max(1, Math.ceil(((req.travel || 180) * 1000 - (Date.now() - req.enrouteAt)) / 60000))} دقیقه دیگر می‌رسد. نقشه زنده بالای همین صفحه را ببینید. 🚗`;
    if (req.status === 'assigned') return `${techName || 'امدادگر'} تعیین شده و دارد تجهیزات را آماده می‌کند؛ چند دقیقه دیگر حرکت می‌کند.`;
    return 'درخواست شما در صف بررسی است و در حال هماهنگی نزدیک‌ترین امدادگر هستیم. معمولاً کل فرایند کمتر از ۳۰ دقیقه است.';
  }
  if (has('قیمت', 'هزینه', 'تومان', 'چند', 'پول', 'نرخ')) {
    if (req.report && req.report.price > 0) return `صورت‌حساب نهایی شما ${toFa(req.report.price.toLocaleString('en-US'))} تومان است؛ از دکمه «پرداخت فاکتور» در همین صفحه می‌توانید رسید را آپلود کنید.`;
    if (req.report) return 'برای شما هزینه امداد صفر ثبت شده — مشکل بدون تعویض باتری حل شد. 🙌';
    return 'هزینه دقیق بعد از تست در محل مشخص می‌شود و قبل از شروع کار با خودتان هماهنگ می‌شود؛ هیچ هزینه پنهانی نداریم.';
  }
  if (has('باتری', 'شارژ', 'دینام')) return 'امدادگر دستگاه تستر همراه دارد؛ اول باتری و دینام را تست می‌کند و اگر باتری سالم باشد، صادقانه همین را می‌گوید — چیزی که لازم ندارید نمی‌فروشیم.';
  if (has('شکایت', 'ناراضی', 'مشکل داشت', 'بد بود')) return 'متأسفیم از تجربه نامطلوب! پیام شما با اولویت به مدیر پشتیبانی ارجاع شد و حداکثر تا چند ساعت آینده برای پیگیری با شما تماس می‌گیرند. 🙏';
  if (has('ممنون', 'مرسی', 'سپاس', 'لطف')) return 'خواهش می‌کنم! وظیفه‌است. 🌟 اگر رضایت داشتید، نظرتان در صفحه «نظرات» برای ما گران‌بهاست.';
  return 'پیام شما ثبت شد و امدادگر در جریان است. اگر فوری است، تماس مستقیم با امدادگر یا شماره شبانه‌روزی سریع‌تر جواب می‌دهد.';
}

export default function Track() {
  const { code } = useParams();
  const nav = useNavigate();
  const { state, update, toast } = useStore();
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const req = useMemo(
    () => (state.requests || []).find((r) => r.code === (code || '').toUpperCase().trim()),
    [state.requests, code]
  );
  const tech = req && (state.technicians || []).find((t) => t.id === req.technicianId);

  const progress = useMemo(() => {
    if (!req || req.status === 'new' || req.status === 'reviewing') return null;
    if (RANK[req.status] >= 4) return 1;
    if (!req.enrouteAt) return 0;
    return clamp((Date.now() - req.enrouteAt) / ((req.travel || 180) * 1000), 0, 1);
  }, [req, state, tick]);

  const etaMin = useMemo(() => {
    if (!req) return null;
    if (RANK[req.status] >= 4) return 0;
    if (!req.enrouteAt) return null;
    return Math.max(1, Math.ceil(((req.travel || 180) * 1000 - (Date.now() - req.enrouteAt)) / 60000));
  }, [req, state, tick]);

  const payments = useMemo(() => req ? (state.payments || []).filter((p) => p.refId === req.code) : [], [state.payments, req]);
  const dep = state.settings.deposit || { amount: 0 };
  const depPayment = payments.find((p) => p.kind === 'deposit');
  const depApproved = req && (req.deposit?.status === 'approved' || req.deposit?.status === 'waived' || depPayment?.status === 'approved');
  const depPending = req && req.deposit?.status === 'pending';
  const invoicePayment = payments.find((p) => p.kind === 'service');
  const invoicePaid = req && (req.invoicePaid || req.paid || req.status === 'approved' || invoicePayment?.status === 'approved');
  const rawInvoice = req?.report ? (req.report.price || 0) : 0;
  const invoiceRemaining = rawInvoice > 0 && (req.deposit?.status === 'approved' || req.deposit?.paid || depPayment?.status === 'approved')
    ? Math.max(0, rawInvoice - (dep.amount || 80000))
    : rawInvoice;

  const sendMsg = () => {
    if (!navigator.onLine) {
      toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error');
      return;
    }
    if (!msg.trim() || !req) return;
    const text = msg.trim();
    update((s) => ({
      ...s,
      requests: s.requests.map((r) => r.id === req.id ? { ...r, chat: [...(r.chat || []), { id: uid(), from: 'customer', text, at: Date.now() }] } : r)
    }));
    setMsg('');
    const hasAgent = (req.chat || []).some((m) => m.from === 'agent');
    if (!hasAgent) {
      setTyping(true);
      const reply = botReply(req, text, tech?.name);
      setTimeout(() => {
        update((s) => ({
          ...s,
          requests: s.requests.map((r) => r.id === req.id ? { ...r, chat: [...(r.chat || []), { id: uid(), from: 'bot', text: reply, at: Date.now() }] } : r)
        }));
        setTyping(false);
      }, 1500);
    }
  };

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [req?.chat?.length, typing, chatOpen]);

  if (!code || !req) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="page-head" style={{ textAlign: 'center' }}>
            <span className="kicker">رهگیری زنده</span>
            <h1>پیگیری درخواست امداد</h1>
            <p style={{ marginInline: 'auto' }}>کد پیگیری که هنگام ثبت درخواست دریافت کردید را وارد کنید.</p>
          </div>
          <div className="wiz-card">
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" style={{ direction: 'ltr', textAlign: 'left', letterSpacing: 2, fontWeight: 700 }}
                value={q} onChange={(e) => setQ(e.target.value)} placeholder="CHB-123456"
                onKeyDown={(e) => e.key === 'Enter' && q.trim() && nav(`/track/${q.trim().toUpperCase()}`)} />
              <Btn variant="dark" icon="search" onClick={() => q.trim() && nav(`/track/${q.trim().toUpperCase()}`)}>پیگیری</Btn>
            </div>
            {code && !req && (
              <div className="note-box" style={{ marginTop: 16 }}>
                <Icon name="alert" size={17} /> درخواستی با کد <b>{toFa(code)}</b> پیدا نشد. کد را دوباره چک کنید یا با امداد تماس بگیرید.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const rank = RANK[req.status];
  const chat = req.chat || [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <span className="kicker">رهگیری زنده</span>
            <h1>وضعیت درخواست شما</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="copy-code">{req.code}
                <button className="icon-btn" style={{ color: '#ffd23f', width: 28, height: 28 }} aria-label="کپی کد"
                  onClick={() => { navigator.clipboard?.writeText(req.code); toast('کد پیگیری کپی شد'); }}>
                  <Icon name="copy" size={15} />
                </button>
              </span>
              <StatusBadge status={req.status} />
              {req.deposit?.status === 'approved' && <Badge tone="green" dot>ودیعه تایید شد</Badge>}
              {req.deposit?.status === 'waived' && <Badge tone="blue" dot>معاف از ودیعه</Badge>}
              {invoicePaid && <Badge tone="green">فاکتور پرداخت شد</Badge>}
              {rank === 5 && invoiceRemaining > 0 && !invoicePaid && <Badge tone="amber">فاکتور پرداخت‌نشده</Badge>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {rank === 5 && invoiceRemaining > 0 && !invoicePaid && (
              <Btn to={`/pay?req=${req.code}`} variant="yellow" icon="banknote">پرداخت فاکتور — {toFa(invoiceRemaining.toLocaleString('en-US'))} تومان</Btn>
            )}
            <Btn to="/emergency" variant="red" icon="bolt">درخواست جدید</Btn>
          </div>
        </div>

        <div className="track-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* ودیعه حضور */}
            {depPending && rank < 5 && (
              <div className="deposit-card">
                <span className="dc-ring"><Icon name="shield" size={26} /></span>
                <div style={{ flex: 1 }}>
                  <b>برای فعال‌سازی اعزام، ودیعه حضور را پرداخت کنید</b>
                  <div className="deposit-note">
                    مبلغ ودیعه: <b>{toFa((dep.amount || 0).toLocaleString('en-US'))} تومان</b> — اگر امدادگر به محل برسد و کسی نباشد، این مبلغ به‌عنوان هزینه وقت امدادگر برقرار می‌ماند؛ در غیر این صورت کامل از فاکتور شما کسر می‌شود.
                  </div>
                </div>
                <Btn to={`/pay?req=${req.code}&kind=deposit`} variant="yellow" icon="banknote">پرداخت ودیعه</Btn>
              </div>
            )}

            {/* ETA */}
            {rank < 5 && (
              <div className="eta-card">
                <span className="eta-ring"><Icon name="truck" size={30} /></span>
                <div style={{ flex: 1 }}>
                  {rank <= 1 && <><b style={{ fontSize: '1.15rem', color: '#ffd23f' }}>{depPending ? 'در انتظار تایید ودیعه…' : 'در حال بررسی…'}</b><span>{depPending ? 'پس از تایید فیش ودیعه، امدادگر بلافاصله به‌سمت شما اعزام می‌شود.' : 'چند لحظه دیگر امدادگر تعیین می‌شود و به‌سمت شما حرکت می‌کند.'}</span></>}
                  {rank === 2 && <><b style={{ fontSize: '1.15rem', color: '#ffd23f' }}>امدادگر تعیین شد</b><span>{tech ? `${tech.name} آماده حرکت است.` : 'در حال آماده‌سازی نیرو…'}</span></>}
                  {rank === 3 && <><b>حدود {toFa(etaMin)} دقیقه</b><span>خودروی امدادی در مسیر شماست — موقعیتش را روی نقشه ببینید.</span></>}
                </div>
              </div>
            )}
            {rank >= 5 && (
              <div className="eta-card" style={{ background: 'linear-gradient(135deg,#0c2d1e,#123c2a)' }}>
                <span className="eta-ring" style={{ borderColor: 'rgba(23,178,106,.6)', color: '#4ae39a' }}><Icon name="check" size={30} /></span>
                <div><b style={{ fontSize: '1.2rem', color: '#4ae39a' }}>عملیات انجام شد ✅</b><span>خودروی شما راه افتاد. از اعتمادتان سپاسگزاریم — فاکتور و گارانتی تحویل شد.</span></div>
              </div>
            )}
            {rank === 5 && (
              <div className="note-box" style={{ background: 'rgba(30,107,255,.07)', borderColor: 'rgba(30,107,255,.35)', color: 'var(--brand)' }}>
                <Icon name="sparkle" size={18} />
                <span>🎉 <b>+۱۵ امتیاز</b> باشگاه مشتریان به حساب شما اضافه شد — امتیازها در سفارش بعدی باتری، تخفیف می‌شوند.</span>
              </div>
            )}

            {/* Map */}
            <div className="admin-panel" style={{ padding: 18 }}>
              <ChabaharMap theme="dark" areas={state.areas.filter((a) => a.active)}
                userPoint={{ x: req.location.x, y: req.location.y }}
                route={rank >= 2} progress={rank >= 2 ? progress : null} />
              <MapLegend eta={rank === 3 ? `~ ${toFa(etaMin)} دقیقه` : null} />
            </div>

            {/* Technician */}
            {tech && (
              <div className="card" style={{ display: 'flex', gap: 15, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="avatar" style={{ width: 54, height: 54, background: tech.color, fontSize: '1.3rem' }}>{tech.name[0]}</span>
                <div style={{ flex: 1 }}>
                  <b>{tech.name}</b>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Stars n={tech.rating} /> <small style={{ color: 'var(--muted)' }}>{toFa(tech.rating)} — {tech.zone}</small>
                  </div>
                </div>
                <Btn href={`tel:${tech.phone.replace(/\s/g, '')}`} variant="green" icon="phone" size="sm">تماس با امدادگر</Btn>
              </div>
            )}

            {/* Details */}
            <div className="card">
              <h3 style={{ marginBottom: 12 }}><Icon name="info" size={18} /> مشخصات درخواست</h3>
              <div className="summary-box">
                <div className="sum-row"><span>نوع مشکل</span><b>{req.problem}</b></div>
                <div className="sum-row"><span>خودرو</span><b>{req.vehicle.brand} {req.vehicle.model} {req.vehicle.year && `— ${toFa(req.vehicle.year)}`}</b></div>
                <div className="sum-row"><span>موقعیت</span><b style={{ textAlign: 'left' }}>{req.location.desc}</b></div>
                <div className="sum-row"><span>زمان ثبت</span><b>{dt(req.createdAt)}</b></div>
                {req.declaration && <div className="sum-row"><span>بیانیه شما</span><b style={{ textAlign: 'left' }}>{req.declaration}</b></div>}
                {req.aiCheck && (
                  <div className="sum-row"><span>بررسی هوشمند آدرس</span><b>{req.aiCheck.area ? `نزدیک ${req.aiCheck.area} — ` : ''}دقت {toFa(req.aiCheck.confidence)}٪</b></div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.1rem', marginBottom: 6 }}>مسیر پیشرفت درخواست</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.86rem' }}>وضعیت به‌صورت زنده به‌روزرسانی می‌شود.</p>
            <div className="timeline">
              {ORDER.map((st) => {
                const ev = (req.timeline || []).find((t) => t.status === st);
                const done = rank > RANK[st] || (ev && rank >= RANK[st]);
                const current = rank === RANK[st] && st !== 'done';
                return (
                  <div key={st} className={cn('tl-item', (done || (ev && rank === RANK[st])) && 'done', current && 'current')}>
                    <span className="tl-dot">
                      <Icon name={st === 'done' ? 'check' : st === 'enroute' ? 'truck' : st === 'arrived' ? 'pin' : st === 'assigned' ? 'users' : st === 'reviewing' ? 'search' : 'bolt'} size={15} />
                    </span>
                    <div className="tl-body">
                      <b>{LABEL[st]}</b>
                      <span>{ev ? dt(ev.at) : 'در انتظار…'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {req.report && (
              <div className="card" style={{ background: 'var(--surface-2)', marginTop: 16 }}>
                <h3 style={{ fontSize: '.95rem', marginBottom: 10 }}><Icon name="wrench" size={15} /> گزارش عملیات و صورت‌حساب</h3>
                <div className="summary-box" style={{ background: '#fff' }}>
                  <div className="sum-row"><span>باتری تعویضی</span><b>{req.report.battery}</b></div>
                  <div className="sum-row"><span>وضعیت باتری قبلی</span><b>{req.report.oldState}</b></div>
                  {rawInvoice > 0 && <div className="sum-row"><span>مبلغ سرویس</span><b>{toFa(rawInvoice.toLocaleString('en-US'))} تومان</b></div>}
                  {(req.deposit?.status === 'approved' || depPayment?.status === 'approved') && rawInvoice > 0 && (
                    <div className="sum-row"><span>کسر ودیعه حضور</span><b style={{ color: 'var(--green)' }}>− {toFa((dep.amount || 0).toLocaleString('en-US'))} تومان</b></div>
                  )}
                  <div className="sum-row"><span>مانده قابل پرداخت</span><b style={{ color: invoiceRemaining > 0 ? 'var(--brand)' : 'var(--green)' }}>{invoiceRemaining > 0 ? `${toFa(invoiceRemaining.toLocaleString('en-US'))} تومان` : 'تسویه شد ✔'}</b></div>
                  {invoicePayment && <div className="sum-row"><span>وضعیت فیش فاکتور</span><b>{invoicePayment.status === 'approved' ? 'تایید شد ✔' : invoicePayment.status === 'rejected' ? 'رد شد' : 'در انتظار تایید حسابداری'}</b></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- چت زنده با پشتیبانی و دستیار هوشمند ---------- */}
      {chatOpen && (
        <div className="chat-panel" role="dialog" aria-label="گفتگوی پشتیبانی">
          <div className="chat-head">
            <span className="chat-ava"><Icon name="headset" size={18} /></span>
            <div style={{ flex: 1 }}>
              <b>پشتیبانی امداد</b>
              <small>{typing ? 'دستیار هوشمند در حال نوشتن…' : 'آنلاین — معمولاً چند ثانیه‌ای جواب می‌دهد'}</small>
            </div>
            <button className="icon-btn" style={{ color: '#fff' }} onClick={() => setChatOpen(false)} aria-label="بستن گفتگو"><Icon name="x" size={18} /></button>
          </div>
          <div className="chat-body">
            {chat.length === 0 && (
              <div className="chat-msg bot">
                سلام 👋 من دستیار هوشمند امدادم. درباره <b>زمان رسیدن</b>، <b>هزینه‌ها</b> یا هر ابهام دیگری در درخواست‌تان بپرسید؛ همکاران انسانی هم اینجا هستند.
              </div>
            )}
            {chat.map((m) => (
              <div key={m.id} className={cn('chat-msg', m.from)}>
                {m.text}
                <small>{dt(m.at)}</small>
              </div>
            ))}
            {typing && (
              <div className="chat-msg bot typing"><i /><i /><i /></div>
            )}
            <div ref={chatEnd} />
          </div>
          <div className="chat-input">
            <input className="input" value={msg} onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="پیام خود را بنویسید…" />
            <Btn variant="primary" icon="telegram" onClick={sendMsg} aria-label="ارسال" />
          </div>
        </div>
      )}
      {!chatOpen && (
        <button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="گفتگو با پشتیبانی">
          <Icon name="headset" size={23} />
          <i className="chat-fab-badge">۱</i>
        </button>
      )}
    </div>
  );
}
