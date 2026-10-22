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
  const [rep, setRep] = useState({ batteryId: '', oldState: OLD_STATES[1], price: 0, note: '' });
  const [drafts, setDrafts] = useState({});

  const techId = localStorage.getItem(TECH_KEY);
  const me = (state.technicians || []).find((t) => t.id === techId);
  if (!me) return <Navigate to="/tech/login" replace />;

  const myReqs = useMemo(() => (state.requests || [])
    .filter((r) => r.technicianId === me.id)
    .sort((a, b) => RANK[a.status] - RANK[b.status] || b.createdAt - a.createdAt), [state.requests, me.id]);
  const tasks = myReqs.filter((r) => RANK[r.status] < 5);
  const todayDone = myReqs.filter((r) => r.doneAt && isToday(r.doneAt));

  const logout = () => { localStorage.removeItem(TECH_KEY); nav('/tech/login', { replace: true }); };

  const setStatus = (r, st) => {
    update((s) => ({
      ...s,
      requests: s.requests.map((x) => x.id === r.id ? {
        ...x, status: st, manualHold: true,
        enrouteAt: st === 'enroute' ? Date.now() : x.enrouteAt,
        arrivedAt: st === 'arrived' ? Date.now() : x.arrivedAt,
        timeline: [...(x.timeline || []).filter((t) => t.status !== st), { status: st, at: Date.now() }]
      } : x)
    }));
    toast(`وضعیت «${LABEL[st]}» ثبت شد.`);
  };

  const sendChat = (r) => {
    const text = (drafts[r.id] || '').trim();
    if (!text) return;
    update((s) => ({
      ...s,
      requests: s.requests.map((x) => x.id === r.id ? { ...x, chat: [...(x.chat || []), { id: uid(), from: 'agent', text, at: Date.now(), by: me.name }] } : x)
    }));
    setDrafts((d) => ({ ...d, [r.id]: '' }));
    toast('پاسخ شما برای مشتری ارسال شد.');
  };

  const submitReport = () => {
    const r = reportFor;
    const bat = (state.batteries || []).find((b) => b.id === rep.batteryId);
    update((s) => ({
      ...s,
      requests: s.requests.map((x) => x.id === r.id ? {
        ...x, status: 'done', doneAt: Date.now(), manualHold: true,
        timeline: [...(x.timeline || []).filter((t) => t.status !== 'done'), { status: 'done', at: Date.now() }],
        report: { battery: bat ? `${bat.brand} ${bat.model}` : '—', oldState: rep.oldState, price: Number(rep.price) || 0, note: rep.note.trim(), at: Date.now() }
      } : x),
      technicians: s.technicians.map((t) => t.id === me.id ? { ...t, completed: (t.completed || 0) + 1 } : t),
      batteries: bat && bat.stock !== 'out' ? s.batteries.map((b) => b.id === bat.id ? { ...b, stock: b.stock === 'low' ? 'out' : 'low' } : b) : s.batteries
    }));
    setReportFor(null); setRep({ batteryId: '', oldState: OLD_STATES[1], price: 0, note: '' });
    toast('گزارش عملیات ثبت شد. دست مریزاد! 🙌');
  };

  const unread = (r) => (r.chat || []).filter((m) => m.from === 'customer').length;
  const depChip = (r) => {
    const st = r.deposit?.status;
    if (st === 'approved') return <Badge tone="green" dot>ودیعه ✔</Badge>;
    if (st === 'waived') return <Badge tone="blue" dot>معاف از ودیعه</Badge>;
    if (st === 'pending') return <Badge tone="amber" dot>ودیعه هنوز پرداخت نشده</Badge>;
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
            <b>{me.name}</b>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Stars n={me.rating} size={12} />
              <small style={{ color: 'var(--muted)' }}>{toFa(me.rating)} — {toFa(todayDone.length)} سرویس امروز</small>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className={cn('chip', me.online && 'on')} onClick={() => update((s) => ({ ...s, technicians: s.technicians.map((t) => t.id === me.id ? { ...t, online: !t.online } : t) }))}>
            <i style={{ width: 9, height: 9, borderRadius: 99, background: me.online ? '#4ae39a' : '#aab', display: 'inline-block' }} />
            {me.online ? 'آنلاینم' : 'آفلاینم'}
          </button>
          <Link to="/" className="btn btn-ghost btn-sm">سایت</Link>
          <Btn variant="ghost" size="sm" icon="logout" onClick={logout}>خروج</Btn>
        </div>
      </header>

      <div className="tech-tabs">
        {[['tasks', `ماموریت‌های من (${toFa(tasks.length)})`], ['today', `امروز (${toFa(todayDone.length)})`], ['all', 'آرشیو']].map(([k, l]) => (
          <button key={k} className={cn('tab', tab === k && 'active')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {list.map((r) => (
        <div key={r.id} className="card tech-task">
          <div className="tech-task-head">
            <div>
              <b>{r.code}</b> <StatusBadge status={r.status} /> {depChip(r)}
              <div style={{ fontSize: '.86rem', color: 'var(--muted)', marginTop: 2 }}>{r.name} — {toFa(r.phone)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn href={`tel:${(r.phone || '').replace(/\s/g, '')}`} variant="green" size="sm" icon="phone">تماس</Btn>
              {RANK[r.status] < 4 && <Btn variant="dark" size="sm" icon="truck" onClick={() => setStatus(r, ORDER[Math.min(4, RANK[r.status] + 1)])}>مرحله بعد: {LABEL[ORDER[Math.min(4, RANK[r.status] + 1)]]}</Btn>}
              {RANK[r.status] >= 3 && RANK[r.status] < 5 && <Btn variant="red" size="sm" icon="check" onClick={() => { setReportFor(r); setRep({ batteryId: '', oldState: OLD_STATES[1], price: 0, note: '' }); }}>پایان کار + گزارش</Btn>}
              {r.report && <Badge tone="green">گزارش ثبت شده</Badge>}
            </div>
          </div>
          <div className="summary-box" style={{ marginTop: 12 }}>
            <div className="sum-row"><span>مشکل</span><b>{r.problem}</b></div>
            <div className="sum-row"><span>خودرو</span><b>{r.vehicle.brand} {r.vehicle.model} {r.vehicle.year && `— ${toFa(r.vehicle.year)}`}</b></div>
            <div className="sum-row"><span>موقعیت</span><b style={{ textAlign: 'left' }}>{r.location.desc}</b></div>
            {r.declaration && <div className="sum-row"><span>شرح مشتری</span><b style={{ textAlign: 'left' }}>{r.declaration}</b></div>}
            {r.aiCheck && <div className="sum-row"><span>بررسی هوشمند</span><b>{r.aiCheck.area ? `نزدیک ${r.aiCheck.area}` : '—'} — دقت {toFa(r.aiCheck.confidence)}٪</b></div>}
          </div>

          {r.deposit?.status === 'pending' && RANK[r.status] < 3 && (
            <div className="note-box" style={{ marginTop: 12 }}>
              <Icon name="alert" size={16} /> ودیعه حضور این مشتری هنوز تایید نشده — تا تایید حسابداری، آماده حرکت باشید ولی اعزام نهایی با مرکز است.
            </div>
          )}

          {RANK[r.status] >= 1 && (
            <div style={{ marginTop: 12 }}>
              <ChabaharMap theme="light" areas={state.areas.filter((a) => a.active)} userPoint={{ x: r.location.x, y: r.location.y }} />
            </div>
          )}

          {/* چت با مشتری */}
          <div className="mini-chat">
            {(r.chat || []).length === 0 && <small style={{ color: 'var(--muted-2)' }}>مشتری هنوز پیامی نفرستاده؛ پیام‌های او همین‌جا می‌آید.</small>}
            {(r.chat || []).map((m) => (
              <div key={m.id} className={cn('chat-msg', m.from)}>{m.text}<small>{m.from === 'agent' ? `${m.by || me.name} — ` : ''}{dt(m.at)}</small></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input className="input" value={drafts[r.id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && sendChat(r)} placeholder={`پاسخ به ${r.name.split(' ')[0]}…`} />
            <Btn variant="dark" icon="telegram" onClick={() => sendChat(r)}>ارسال</Btn>
          </div>
        </div>
      ))}
      {list.length === 0 && (
        <div className="empty" style={{ background: '#fff', borderRadius: 18 }}>
          <span className="empty-ic"><Icon name="truck" size={26} /></span>
          <h3>فعلاً ماموریتی اینجا نیست</h3>
          <p>ماموریت جدید که مرکز تخصیص بدهد، همین‌جا می‌آید.</p>
        </div>
      )}

      {reportFor && (
        <div className="modal-ov" onMouseDown={(e) => e.target === e.currentTarget && setReportFor(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-head"><h3>گزارش عملیات — {reportFor.code}</h3><button className="icon-btn" onClick={() => setReportFor(null)} aria-label="بستن"><Icon name="x" size={18} /></button></div>
            <div className="modal-body">
              <div className="note-box" style={{ marginBottom: 16 }}><Icon name="info" size={17} /> اگر ودیعه مشتری تایید شده باشد، مبلغش از صورت‌حساب مشتری به‌صورت خودکار کسر می‌شود.</div>
              <div className="form-grid">
                <Field label="باتری تعویض‌شده (از انبار)">
                  <select className="input" value={rep.batteryId} onChange={(e) => setRep({ ...rep, batteryId: e.target.value })}>
                    <option value="">بدون تعویض (فقط سرویس)</option>
                    {(state.batteries || []).filter((b) => b.active).map((b) => <option key={b.id} value={b.id}>{b.brand} {b.model} — {fmtToman(b.price)}</option>)}
                  </select>
                </Field>
                <Field label="وضعیت باتری قبلی">
                  <select className="input" value={rep.oldState} onChange={(e) => setRep({ ...rep, oldState: e.target.value })}>
                    {OLD_STATES.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="مبلغ نهایی (تومان)">
                  <input className="input" type="number" value={rep.price} onChange={(e) => setRep({ ...rep, price: e.target.value })} />
                </Field>
                <Field label="یادداشت" className="span2">
                  <textarea className="input" rows={2} value={rep.note} onChange={(e) => setRep({ ...rep, note: e.target.value })} placeholder="مثلاً: دینام تست شد، سالم بود." />
                </Field>
              </div>
            </div>
            <div className="modal-foot">
              <Btn variant="ghost" onClick={() => setReportFor(null)}>انصراف</Btn>
              <Btn variant="green" icon="check" onClick={submitReport}>ثبت نهایی و بستن پرونده</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
