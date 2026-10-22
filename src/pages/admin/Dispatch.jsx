import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore, ORDER, LABEL, RANK } from '../../lib/store';
import { Btn, Icon, Modal, StatusBadge, Field, Empty, Badge } from '../../components/ui';
import { cn, toFa, dt, ago, uid, normPhone, isToday } from '../../lib/utils';

export default function Dispatch() {
  const { state, update, patch, toast } = useStore();
  const [sp, setSp] = useSearchParams();
  const [statusF, setStatusF] = useState('all');
  const [q, setQ] = useState('');
  const [range, setRange] = useState('all');
  const [note, setNote] = useState('');

  const reqs = state.requests || [];
  const list = useMemo(() => reqs.filter((r) => {
    if (statusF !== 'all' && r.status !== statusF) return false;
    if (range === 'today' && !isToday(r.createdAt)) return false;
    if (q.trim()) {
      const s = q.trim();
      if (!(r.code.includes(s.toUpperCase()) || r.name.includes(s) || normPhone(r.phone).includes(normPhone(s)))) return false;
    }
    return true;
  }), [reqs, statusF, q, range]);

  const openId = sp.get('open');
  const req = reqs.find((r) => r.id === openId);
  const tech = req && (state.technicians || []).find((t) => t.id === req.technicianId);
  const close = () => { sp.delete('open'); setSp(sp, { replace: true }); setNote(''); setChatMsg(''); };

  const [chatMsg, setChatMsg] = useState('');
  const sendChat = () => {
    if (!chatMsg.trim() || !req) return;
    patch('requests', req.id, { chat: [...(req.chat || []), { id: uid(), from: 'agent', text: chatMsg.trim(), at: Date.now(), by: 'پشتیبانی' }] });
    setChatMsg('');
    toast('پیام شما برای مشتری ارسال شد.');
  };

  const waiveDeposit = () => {
    patch('requests', req.id, { deposit: { ...(req.deposit || {}), status: 'waived' } });
    toast('مشتری از ودیعه معاف شد؛ اعزام آزاد است.');
  };
  const approveDeposit = () => {
    const pay = (state.payments || []).find((p) => p.kind === 'deposit' && p.refId === req.code);
    if (pay) patch('payments', pay.id, { status: 'approved' });
    patch('requests', req.id, { deposit: { ...(req.deposit || {}), status: 'approved' } });
    toast('ودیعه تایید شد؛ اعزام فعال شد.');
  };
  const depStatus = req?.deposit?.status;
  const depPay = req ? (state.payments || []).find((p) => p.kind === 'deposit' && p.refId === req.code) : null;

  const setStatus = (st) => {
    patch('requests', req.id, {
      status: st, manualHold: true,
      timeline: [...(req.timeline || []).filter((t) => t.status !== st), { status: st, at: Date.now() }]
    });
    toast(`وضعیت به «${LABEL[st]}» تغییر کرد.`);
  };

  const assign = (techId) => {
    patch('requests', req.id, {
      technicianId: techId || null, manualHold: true,
      status: RANK[req.status] < 2 ? 'assigned' : req.status,
      timeline: RANK[req.status] < 2 ? [...(req.timeline || []), { status: 'assigned', at: Date.now() }] : req.timeline
    });
    toast('امدادگر تخصیص داده شد.');
  };

  /* سورپرایز: نمودار ۷ روز اخیر — واقعی از درخواست‌های ثبت‌شده */
  const DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const n = (state.requests || []).filter((r) => r.createdAt >= d.getTime() && r.createdAt < next.getTime()).length;
    return { n, day: DAYS[(d.getDay() + 1) % 7], today: i === 6 };
  });
  const weekMax = Math.max(1, ...week.map((w) => w.n));
  const weekSum = week.reduce((t, w) => t + w.n, 0);

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head"><div><h2>۷ روز اخیر</h2><p>{toFa(weekSum)} درخواست در یک هفتهٔ گذشته — ستون زرد = امروز</p></div></div>
        <div className="week-chart">
          {week.map((w, i) => (
            <div key={i} className="wc-col">
              <span className="wc-num">{toFa(w.n)}</span>
              <div className={cn('wc-bar', w.today && 'today')} style={{ height: `${Math.max(6, (w.n / weekMax) * 100)}%` }} />
              <span className="wc-day">{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>صندوق درخواست‌ها</h2><p>{toFa(list.length)} درخواست در این نما</p></div>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <input className="input" style={{ width: 210 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی کد / نام / شماره…" />
            <select className="input" style={{ width: 'auto' }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
              <option value="all">همه وضعیت‌ها</option>
              {ORDER.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
            </select>
            <select className="input" style={{ width: 'auto' }} value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="all">همه زمان‌ها</option>
              <option value="today">امروز</option>
            </select>
          </div>
        </div>

        {list.length === 0 ? <Empty icon="truck" title="درخواستی یافت نشد" desc="فیلترها را تغییر دهید." /> : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>کد</th><th>مشتری</th><th>مشکل / خودرو</th><th>امدادگر</th><th>وضعیت</th><th>زمان</th><th></th></tr></thead>
              <tbody>
                {list.map((r) => {
                  const t = (state.technicians || []).find((x) => x.id === r.technicianId);
                  return (
                    <tr key={r.id}>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 800, fontSize: '.84rem' }}>{r.code}</td>
                      <td><b>{r.name}</b><br /><small style={{ color: 'var(--muted-2)' }}>{toFa(r.phone)}</small></td>
                      <td>{r.problem}<br /><small style={{ color: 'var(--muted-2)' }}>{r.vehicle.brand} {r.vehicle.model}</small></td>
                      <td>{t ? <Badge tone="blue">{t.name}</Badge> : <span style={{ color: 'var(--muted-2)' }}>—</span>}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{ago(r.createdAt)}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => setSp({ open: r.id }, { replace: true })}><Icon name="eye" size={15} /> جزئیات</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: 12, fontSize: '.82rem', color: 'var(--muted-2)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icon name="info" size={13} /> امدادگرها هم از <a href="#/tech/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>پنل امدادگر</a> وارد می‌شوند و وضعیت و گزارش را خودشان ثبت می‌کنند.
        </p>
      </div>

      {/* Detail modal */}
      <Modal open={!!req} onClose={close} width={680} title={req ? `درخواست ${req.code}` : ''}
        footer={req && <>
          <Btn variant="ghost" onClick={close}>بستن</Btn>
          {RANK[req.status] < 5 && <Btn variant="dark" icon="check" onClick={() => setStatus(ORDER[Math.min(5, RANK[req.status] + 1)])}>انتقال به مرحله بعد ({LABEL[ORDER[RANK[req.status] + 1]]})</Btn>}
        </>}>
        {req && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge status={req.status} />
              {req.manualHold && <Badge tone="gray"><Icon name="settings" size={12} /> تغییر دستی</Badge>}
              {depStatus === 'approved' && <Badge tone="green" dot>ودیعه تایید شد</Badge>}
              {depStatus === 'waived' && <Badge tone="blue" dot>معاف از ودیعه</Badge>}
              {depStatus === 'pending' && <Badge tone="amber" dot>ودیعه در انتظار</Badge>}
              {depStatus === 'rejected' && <Badge tone="red" dot>فیش ودیعه رد شد</Badge>}
              <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>ثبت: {dt(req.createdAt)}</span>
            </div>

            {depStatus === 'pending' && (
              <div className="note-box" style={{ borderColor: 'rgba(255,184,0,.5)' }}>
                <Icon name="shield" size={18} />
                <span style={{ flex: 1 }}>وديعه این مشتری هنوز تایید نشده{depPay ? ' — فیش آپلود شده:' : '.'}
                  {depPay?.receipt && <img src={depPay.receipt} alt="فیش ودیعه" style={{ maxWidth: 120, borderRadius: 8, marginInlineStart: 8 }} />}
                </span>
                <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {depPay && <Btn variant="green" size="sm" icon="check" onClick={approveDeposit}>تایید ودیعه</Btn>}
                  <Btn variant="ghost" size="sm" onClick={waiveDeposit}>معافیت از ودیعه</Btn>
                </span>
              </div>
            )}

            <div className="summary-box">
              <div className="sum-row"><span>مشتری</span><b>{req.name} — {toFa(req.phone)}</b></div>
              <div className="sum-row"><span>مشکل</span><b>{req.problem}</b></div>
              <div className="sum-row"><span>خودرو</span><b>{req.vehicle.brand} {req.vehicle.model} {req.vehicle.year && `— ${toFa(req.vehicle.year)}`}</b></div>
              <div className="sum-row"><span>موقعیت</span><b style={{ textAlign: 'left' }}>{req.location.desc}</b></div>
              {req.aiCheck && (
                <div className="sum-row"><span>بررسی هوشمند موقعیت</span><b>{req.aiCheck.area ? `نزدیک ${req.aiCheck.area} — ` : ''}دقت {toFa(req.aiCheck.confidence)}٪ {(req.aiCheck.flags || []).length > 0 && '(دارای هشدار)'}</b></div>
              )}
              {req.declaration && <div className="sum-row"><span>بیانیه نیاز مشتری</span><b style={{ textAlign: 'left' }}>{req.declaration}</b></div>}
              {req.notes && <div className="sum-row"><span>توضیح تکمیلی</span><b style={{ textAlign: 'left' }}>{req.notes}</b></div>}
              {(req.aiCheck?.flags || []).length > 0 && (
                <div style={{ fontSize: '.8rem', color: '#9a6b00', background: 'var(--yellow-soft)', borderRadius: 10, padding: '8px 12px' }}>
                  ⚠ {req.aiCheck.flags.join(' • ')}
                </div>
              )}
            </div>

            <div className="form-grid">
              <Field label="تخصیص امدادگر">
                <select className="input" value={req.technicianId || ''} onChange={(e) => assign(e.target.value)}>
                  <option value="">— انتخاب امدادگر —</option>
                  {(state.technicians || []).map((t) => (
                    <option key={t.id} value={t.id}>{t.name} {t.online ? '🟢 آنلاین' : '⚪ آفلاین'} — {t.zone}</option>
                  ))}
                </select>
              </Field>
              <Field label="تغییر وضعیت (دستی)">
                <select className="input" value={req.status} onChange={(e) => setStatus(e.target.value)}>
                  {ORDER.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </Field>
            </div>

            {/* timeline */}
            <div>
              <h3 style={{ fontSize: '.98rem', marginBottom: 8 }}>تاریخچه وضعیت</h3>
              <div className="timeline">
                {(req.timeline || []).map((t, i) => (
                  <div key={i} className={cn('tl-item', 'done')}>
                    <span className="tl-dot"><Icon name="check" size={13} /></span>
                    <div className="tl-body"><b>{LABEL[t.status]}</b><span>{dt(t.at)}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* report */}
            {req.report && (
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <h3 style={{ fontSize: '.98rem', marginBottom: 10 }}><Icon name="wrench" size={16} /> گزارش عملیات امدادگر</h3>
                <div className="summary-box" style={{ background: '#fff' }}>
                  <div className="sum-row"><span>باتری تعویضی</span><b>{req.report.battery}</b></div>
                  <div className="sum-row"><span>وضعیت باتری قبلی</span><b>{req.report.oldState}</b></div>
                  <div className="sum-row"><span>مبلغ نهایی</span><b>{toFa((req.report.price || 0).toLocaleString('en-US'))} تومان</b></div>
                  {req.report.note && <div className="sum-row"><span>یادداشت</span><b style={{ textAlign: 'left' }}>{req.report.note}</b></div>}
                </div>
              </div>
            )}

            {/* چت با مشتری */}
            <div>
              <h3 style={{ fontSize: '.98rem', marginBottom: 8 }}><Icon name="headset" size={16} /> گفتگو با مشتری</h3>
              {(req.chat || []).length === 0 && <p style={{ color: 'var(--muted-2)', fontSize: '.86rem' }}>مشتری هنوز پیامی نفرستاده. دستیار هوشمند موقتاً پاسخ می‌دهد.</p>}
              <div className="chat-body" style={{ maxHeight: 200, border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}>
                {(req.chat || []).map((m) => (
                  <div key={m.id} className={cn('chat-msg', m.from)}>{m.text}<small>{dt(m.at)}</small></div>
                ))}
                {(req.chat || []).length === 0 && <small style={{ color: 'var(--muted-2)' }}>گفتگویی ثبت نشده.</small>}
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 10 }}>
                <input className="input" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="پاسخ شما به مشتری (به‌عنوان پشتیبانی)…" />
                <Btn variant="dark" icon="telegram" onClick={sendChat}>ارسال</Btn>
              </div>
              <p className="field-hint" style={{ marginTop: 6 }}>پیام شما در چت صفحه پیگیری مشتری دیده می‌شود و دستیار هوشمند دیگر خودکار جواب نمی‌دهد.</p>
            </div>

            {/* internal notes */}
            <div>
              <h3 style={{ fontSize: '.98rem', marginBottom: 8 }}>یادداشت‌های داخلی</h3>
              {(req.internalNotes || []).length === 0 && <p style={{ color: 'var(--muted-2)', fontSize: '.86rem' }}>یادداشتی ثبت نشده.</p>}
              {(req.internalNotes || []).map((n, i) => (
                <div key={i} className="history-dot"><span className="when">{dt(n.at)}</span><span>{n.text}</span></div>
              ))}
              <div style={{ display: 'flex', gap: 9, marginTop: 10 }}>
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت داخلی برای همکاران…" />
                <Btn variant="dark" icon="plus" onClick={() => {
                  if (!note.trim()) return;
                  patch('requests', req.id, { internalNotes: [...(req.internalNotes || []), { at: Date.now(), text: note.trim() }] });
                  setNote('');
                  toast('یادداشت ثبت شد.');
                }}>افزودن</Btn>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
