import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useStore, RANK, ORDER, LABEL } from '../../lib/store';
import { Btn, Icon, Field, StatusBadge, Stars, Badge } from '../../components/ui';
import ChabaharMap from '../../components/ChabaharMap';
import { cn, toFa, dt, fmtToman, uid, isToday } from '../../lib/utils';

const TECH_KEY = 'chb_tech';
const OLD_STATES = ['سالم — مشکلی نداشت', 'تخلیه کامل — قابل شارژ', 'سلول معیوب', 'کاملاً فرسوده — اسقاطی', 'در حال بررسی'];

export default function TechDashboard() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('tasks');
  const [reportFor, setReportFor] = useState(null);
  const [rep, setRep] = useState({ batteryId: '', oldState: OLD_STATES[1], price: 4150000, note: '' });
  const [drafts, setDrafts] = useState({});

  const techId = localStorage.getItem(TECH_KEY);
  const me = (state.technicians || []).find((t) => t.id === techId) || (state.technicians || [])[0];
  if (!techId || !me) return <Navigate to="/tech/login" replace />;

  // نمایش تمام ماموریت‌های تخصیص‌یافته به حمید و همچنین درخواست‌های جدید بدون تکنسین
  const myReqs = useMemo(
    () =>
      (state.requests || [])
        .filter((r) => !r.technicianId || r.technicianId === me.id)
        .sort((a, b) => RANK[a.status] - RANK[b.status] || b.createdAt - a.createdAt),
    [state.requests, me.id]
  );
  const tasks = myReqs.filter((r) => RANK[r.status] < 5);
  const todayDone = myReqs.filter((r) => r.doneAt && isToday(r.doneAt));

  const logout = () => {
    localStorage.removeItem(TECH_KEY);
    nav('/tech/login', { replace: true });
  };

  const setStatus = (r, st) => {
    const depSetting = state.settings?.deposit || { enabled: true, amount: 80000 };
    update((s) => ({
      ...s,
      requests: s.requests.map((x) =>
        x.id === r.id
          ? {
              ...x,
              technicianId: me.id,
              status: st,
              manualHold: true,
              enrouteAt: st === 'enroute' ? Date.now() : x.enrouteAt,
              arrivedAt: st === 'arrived' ? Date.now() : x.arrivedAt,
              doneAt: st === 'done' ? Date.now() : x.doneAt,
              deposit:
                RANK[st] >= 3 && depSetting.enabled && x.deposit?.status !== 'waived'
                  ? { ...(x.deposit || {}), status: 'approved', paid: true, amount: depSetting.amount || 80000 }
                  : x.deposit,
              timeline: [...(x.timeline || []).filter((t) => t.status !== st), { status: st, at: Date.now() }]
            }
          : x
      )
    }));
    toast(`وضعیت درخواست ${r.code} به «${LABEL[st]}» تغییر کرد.`);
  };

  const sendChat = (r) => {
    const text = (drafts[r.id] || '').trim();
    if (!text) return;
    update((s) => ({
      ...s,
      requests: s.requests.map((x) =>
        x.id === r.id
          ? { ...x, chat: [...(x.chat || []), { id: uid(), from: 'agent', text, at: Date.now(), by: me.name }] }
          : x
      )
    }));
    setDrafts((d) => ({ ...d, [r.id]: '' }));
    toast('پاسخ شما برای مشتری ارسال شد.');
  };

  const submitReport = () => {
    const r = reportFor;
    const bat = (state.batteries || []).find((b) => b.id === rep.batteryId);
    const depSetting = state.settings?.deposit || { enabled: true, amount: 80000 };
    const finalPrice = Number(rep.price) || (bat ? bat.price : 0);

    update((s) => ({
      ...s,
      requests: s.requests.map((x) =>
        x.id === r.id
          ? {
              ...x,
              technicianId: me.id,
              status: 'done',
              doneAt: Date.now(),
              manualHold: true,
              deposit:
                depSetting.enabled && x.deposit?.status !== 'waived'
                  ? { ...(x.deposit || {}), status: 'approved', paid: true, amount: depSetting.amount || 80000 }
                  : x.deposit,
              timeline: [...(x.timeline || []).filter((t) => t.status !== 'done'), { status: 'done', at: Date.now() }],
              report: {
                battery: bat ? `${bat.brand} ${bat.model}` : 'سرویس و تست تخصصی در محل',
                oldState: rep.oldState,
                price: finalPrice,
                note: rep.note.trim() || 'نصب و تست دینام با موفقیت انجام شد.',
                at: Date.now()
              }
            }
          : x
      ),
      technicians: s.technicians.map((t) => (t.id === me.id ? { ...t, completed: (t.completed || 0) + 1 } : t)),
      batteries:
        bat && bat.stock !== 'out'
          ? s.batteries.map((b) => (b.id === bat.id ? { ...b, stock: b.stock === 'low' ? 'out' : 'low' } : b))
          : s.batteries
    }));
    setReportFor(null);
    setRep({ batteryId: '', oldState: OLD_STATES[1], price: 4150000, note: '' });
    toast(`گزارش عملیات و قیمت نهایی (${fmtToman(finalPrice)}) ثبت شد! 🙌`);
  };

  const depChip = (r) => {
    const st = r.deposit?.status;
    if (st === 'approved' || r.deposit?.paid) return <Badge tone="green" dot>ودیعه پرداخت شده ✔</Badge>;
    if (st === 'waived') return <Badge tone="blue" dot>معاف از ودیعه</Badge>;
    if (st === 'pending') return <Badge tone="amber" dot>ودیعه در انتظار</Badge>;
    if (st === 'rejected') return <Badge tone="red" dot>فیش ودیعه رد شد</Badge>;
    return null;
  };

  const list = tab === 'tasks' ? tasks : tab === 'today' ? todayDone : myReqs;

  return (
    <div className="tech-shell">
      <header className="tech-top">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="avatar" style={{ background: me.color, width: 46, height: 46, fontSize: '1.2rem' }}>{me.name[0]}</span>
          <div>
            <b>پنل امدادگر — {me.name}</b>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Stars n={me.rating} size={12} />
              <small style={{ color: 'var(--muted)' }}>{toFa(me.rating)} — {toFa(todayDone.length)} سرویس امروز</small>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={cn('chip', me.online && 'on')}
            onClick={() => update((s) => ({ ...s, technicians: s.technicians.map((t) => (t.id === me.id ? { ...t, online: !t.online } : t)) }))}
          >
            <i style={{ width: 9, height: 9, borderRadius: 99, background: me.online ? '#4ae39a' : '#aab', display: 'inline-block' }} />
            {me.online ? 'آنلاینم' : 'آفلاینم'}
          </button>
          <Link to="/" className="btn btn-outline-light btn-sm">سایت</Link>
          <Btn variant="outline-light" size="sm" icon="logout" onClick={logout}>خروج</Btn>
        </div>
      </header>

      <div className="tech-tabs">
        {[['tasks', `ماموریت‌های فعال (${toFa(tasks.length)})`], ['today', `انجام‌شده امروز (${toFa(todayDone.length)})`], ['all', `همه درخواست‌ها (${toFa(myReqs.length)})`]].map(([k, l]) => (
          <button key={k} className={cn('tab', tab === k && 'active')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {list.map((r) => (
        <div key={r.id} className="card tech-task">
          <div className="tech-task-head">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <b style={{ fontSize: '1.08rem', direction: 'ltr' }}>{r.code}</b>
                <StatusBadge status={r.status} />
                {depChip(r)}
              </div>
              <div style={{ fontSize: '.9rem', color: 'var(--muted)', marginTop: 4 }}>
                <b>{r.name}</b> — {toFa(r.phone)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Btn href={`tel:${(r.phone || '').replace(/\s/g, '')}`} variant="green" size="sm" icon="phone">تماس</Btn>
              {r.status !== 'enroute' && RANK[r.status] < 4 && (
                <Btn variant="primary" size="sm" icon="truck" onClick={() => setStatus(r, 'enroute')}>
                  تغییر وضعیت به «در مسیر»
                </Btn>
              )}
              {r.status === 'enroute' && (
                <Btn variant="dark" size="sm" icon="pin" onClick={() => setStatus(r, 'arrived')}>
                  رسیدم به محل
                </Btn>
              )}
              {RANK[r.status] < 5 && (
                <Btn
                  variant="red"
                  size="sm"
                  icon="check"
                  onClick={() => {
                    setReportFor(r);
                    setRep({ batteryId: 'bt1', oldState: OLD_STATES[2], price: 4150000, note: '' });
                  }}
                >
                  ثبت قیمت نهایی و پایان کار
                </Btn>
              )}
              {r.report && (
                <Badge tone="green">
                  قیمت ثبت‌شده: {fmtToman(r.report.price)}
                </Badge>
              )}
            </div>
          </div>

          <div className="summary-box" style={{ marginTop: 14 }}>
            <div className="sum-row"><span>مشکل اعلامی</span><b>{r.problem}</b></div>
            <div className="sum-row"><span>خودرو</span><b>{r.vehicle?.brand} {r.vehicle?.model} {r.vehicle?.year && `— ${toFa(r.vehicle.year)}`}</b></div>
            <div className="sum-row"><span>موقعیت مشتری</span><b style={{ textAlign: 'left' }}>{r.location?.desc}</b></div>
            {r.declaration && <div className="sum-row"><span>شرح مشتری</span><b style={{ textAlign: 'left' }}>{r.declaration}</b></div>}
            {r.report && (
              <div className="sum-row">
                <span>گزارش و صورت‌حساب ثبت‌شده</span>
                <b style={{ color: 'var(--brand)' }}>{r.report.battery} — {fmtToman(r.report.price)}</b>
              </div>
            )}
          </div>

          {RANK[r.status] < 5 && (
            <div style={{ marginTop: 12 }}>
              <ChabaharMap theme="light" areas={state.areas.filter((a) => a.active)} userPoint={{ x: r.location?.x || 445, y: r.location?.y || 300 }} />
            </div>
          )}

          {/* چت با مشتری */}
          <div className="mini-chat">
            {(r.chat || []).length === 0 && <small style={{ color: 'var(--muted-2)' }}>پیام‌های مشتری در اینجا نمایش داده می‌شود.</small>}
            {(r.chat || []).map((m) => (
              <div key={m.id} className={cn('chat-msg', m.from)}>
                {m.text}
                <small>{m.from === 'agent' ? `${m.by || me.name} — ` : ''}{dt(m.at)}</small>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              className="input"
              value={drafts[r.id] || ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && sendChat(r)}
              placeholder={`پاسخ به ${r.name.split(' ')[0]}…`}
            />
            <Btn variant="dark" icon="send" onClick={() => sendChat(r)}>ارسال</Btn>
          </div>
        </div>
      ))}

      {list.length === 0 && (
        <div className="empty" style={{ background: '#fff', borderRadius: 18 }}>
          <span className="empty-ic"><Icon name="truck" size={26} /></span>
          <h3>ماموریتی در این تب وجود ندارد</h3>
          <p>درخواست‌های جدید مشتریان بلافاصله در این لیست نمایان می‌شوند.</p>
        </div>
      )}

      {/* مودال ثبت گزارش عملیات و قیمت نهایی */}
      {reportFor && (
        <div className="modal-ov" onMouseDown={(e) => e.target === e.currentTarget && setReportFor(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-head">
              <h3>ثبت قیمت نهایی و گزارش عملیات — {reportFor.code}</h3>
              <button className="icon-btn" onClick={() => setReportFor(null)} aria-label="بستن"><Icon name="x" size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="note-box" style={{ marginBottom: 16 }}>
                <Icon name="info" size={17} />
                <span>مبلغ ودیعه مشتری (۸۰٬۰۰۰ تومان) در صفحه پرداخت نهایی به صورت خودکار از این فاکتور کسر می‌گردد.</span>
              </div>
              <div className="form-grid">
                <Field label="باتری تعویض‌شده (از انبار)">
                  <select
                    className="input"
                    value={rep.batteryId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      const found = (state.batteries || []).find((x) => x.id === bId);
                      setRep({ ...rep, batteryId: bId, price: found ? found.price : rep.price });
                    }}
                  >
                    <option value="">بدون تعویض (فقط سرویس راه‌اندازی)</option>
                    {(state.batteries || []).filter((b) => b.active).map((b) => (
                      <option key={b.id} value={b.id}>{b.brand} {b.model} — {fmtToman(b.price)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="وضعیت باتری قبلی">
                  <select className="input" value={rep.oldState} onChange={(e) => setRep({ ...rep, oldState: e.target.value })}>
                    {OLD_STATES.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="مبلغ نهایی صورت‌حساب (تومان)" className="span2">
                  <input
                    className="input"
                    type="number"
                    value={rep.price}
                    onChange={(e) => setRep({ ...rep, price: e.target.value })}
                    placeholder="مثلاً: 4150000"
                  />
                </Field>
                <Field label="یادداشت فنی امدادگر" className="span2">
                  <textarea
                    className="input"
                    rows={2}
                    value={rep.note}
                    onChange={(e) => setRep({ ...rep, note: e.target.value })}
                    placeholder="مثلاً: باتری نصب و دینام تست شد، ولتاژ شارژ ۱۴.۲ ولت سالم بود."
                  />
                </Field>
              </div>
            </div>
            <div className="modal-foot">
              <Btn variant="ghost" onClick={() => setReportFor(null)}>انصراف</Btn>
              <Btn variant="green" icon="check" onClick={submitReport}>ثبت نهایی قیمت و بستن پرونده</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
