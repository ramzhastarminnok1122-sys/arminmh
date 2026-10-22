import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Modal, Badge, Empty } from '../../components/ui';
import { toFa, fmtToman, dt } from '../../lib/utils';

export default function Payments() {
  const { state, patch, update, toast } = useStore();
  const [tab, setTab] = useState('pays');
  const [viewing, setViewing] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const pays = state.payments || [];
  const orders = state.orders || [];

  const approve = (p) => {
    patch('payments', p.id, { status: 'approved', note: '' });
    if (p.kind === 'order') update((s) => ({ ...s, orders: s.orders.map((o) => o.id === p.refId ? { ...o, status: 'پرداخت شد — در حال آماده‌سازی' } : o) }));
    else if (p.kind === 'deposit') update((s) => ({ ...s, requests: s.requests.map((r) => r.code === p.refId ? { ...r, deposit: { ...(r.deposit || {}), status: 'approved' } } : r) }));
    else update((s) => ({ ...s, requests: s.requests.map((r) => r.code === p.refId ? { ...r, invoicePaid: true } : r) }));
    toast(p.kind === 'deposit' ? 'ودیعه تایید شد؛ اعزام فعال شد.' : 'پرداخت تایید شد و به مشتری منعکس شد.');
    setViewing(null);
  };
  const reject = (p) => {
    patch('payments', p.id, { status: 'rejected', note: rejectNote.trim() });
    if (p.kind === 'order') update((s) => ({ ...s, orders: s.orders.map((o) => o.id === p.refId ? { ...o, status: 'رد شد — بازآپلود رسید' } : o) }));
    else if (p.kind === 'deposit') update((s) => ({ ...s, requests: s.requests.map((r) => r.code === p.refId ? { ...r, deposit: { ...(r.deposit || {}), status: 'rejected' } } : r) }));
    else update((s) => ({ ...s, requests: s.requests.map((r) => r.code === p.refId ? { ...r, invoicePaid: false, invoiceRejected: true } : r) }));
    setRejectNote('');
    toast('فیش رد شد؛ مشتری می‌تواند مجدد آپلود کند.');
    setViewing(null);
  };

  const KIND_LABEL = { order: '🛒 سفارش باتری', deposit: '🛡 ودیعه حضور', service: '⚡ فاکتور امداد' };

  const chip = (st) => st === 'approved' ? <Badge tone="green" dot>تایید شده</Badge> : st === 'rejected' ? <Badge tone="red" dot>رد شده</Badge> : <Badge tone="amber" dot>در انتظار تایید</Badge>;

  return (
    <>
      <div className="tabs">
        <button className={`tab ${tab === 'pays' && 'active'}`} onClick={() => setTab('pays')}>فیش‌های پرداخت ({toFa(pays.length)})</button>
        <button className={`tab ${tab === 'orders' && 'active'}`} onClick={() => setTab('orders')}>سفارش‌های فروشگاه ({toFa(orders.length)})</button>
      </div>

      {tab === 'pays' && (
        <div className="admin-panel">
          <div className="panel-head"><div><h2>فیش‌های در انتظار بررسی</h2><p>تایید یا رد فیش — وضعیت برای مشتری بلافاصله به‌روز می‌شود</p></div></div>
          {pays.length === 0 ? <Empty icon="banknote" title="فیشی ثبت نشده" desc="وقتی مشتری فیش واریز آپلود کند، اینجا می‌بینید." /> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>فیش</th><th>بابت</th><th>پرداخت‌کننده</th><th>مبلغ</th><th>وضعیت</th><th>زمان</th><th></th></tr></thead>
                <tbody>
                  {pays.map((p) => (
                    <tr key={p.id}>
                      <td>{p.receipt && <button onClick={() => setViewing(p)}><img src={p.receipt} alt="فیش" style={{ width: 64, height: 46, objectFit: 'cover', borderRadius: 8 }} /></button>}</td>
                      <td style={{ fontSize: '.84rem' }}>{KIND_LABEL[p.kind] || 'پرداخت'}<br /><small style={{ color: 'var(--muted-2)' }}>{p.label}</small></td>
                      <td><b>{p.name}</b><br /><small style={{ color: 'var(--muted-2)' }}>{toFa(p.phone)}</small></td>
                      <td><b>{fmtToman(p.amount)}</b></td>
                      <td>{chip(p.status)}</td>
                      <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{dt(p.at)}</td>
                      <td>
                        <div className="actions">
                          <button className="icon-btn" onClick={() => { setViewing(p); setRejectNote(''); }} aria-label="مشاهده"><Icon name="eye" size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-panel">
          <div className="panel-head"><div><h2>سفارش‌های فروشگاه باتری</h2><p>تغییر وضعیت سفارش‌ها — مشتری در حسابش می‌بیند</p></div></div>
          {orders.length === 0 ? <Empty icon="battery" title="سفارشی ثبت نشده" /> : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>مشتری</th><th>باتری</th><th>آدرس</th><th>مبلغ</th><th>وضعیت</th><th>زمان</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><b>{o.name}</b><br /><small style={{ color: 'var(--muted-2)' }}>{toFa(o.phone)}</small></td>
                      <td>{o.batteryLabel}</td>
                      <td style={{ fontSize: '.82rem', maxWidth: 180 }}>{o.address}</td>
                      <td><b>{fmtToman(o.price)}</b></td>
                      <td>
                        <select className="input" style={{ width: 'auto', padding: '6px 10px', fontSize: '.82rem' }} value={o.status}
                          onChange={(e) => { patch('orders', o.id, { status: e.target.value }); toast('وضعیت سفارش به‌روز شد.'); }}>
                          {['در انتظار پرداخت', 'در انتظار تایید پرداخت', 'رد شد — بازآپلود رسید', 'پرداخت شد — در حال آماده‌سازی', 'ارسال شد', 'تحویل و نصب شد'].map((st) => <option key={st}>{st}</option>)}
                        </select>
                      </td>
                      <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{dt(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* مودال مشاهده فیش */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} width={520} title="بررسی فیش واریز"
        footer={viewing && <>
          {viewing.status !== 'rejected' && <Btn variant="ghost" onClick={() => { setRejectNote(''); setViewing(null); }}>بستن</Btn>}
          <Btn variant="green" icon="check" onClick={() => approve(viewing)}>تایید پرداخت</Btn>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input" style={{ width: 170 }} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="دلیل رد (اختیاری)" />
            <Btn variant="red" icon="x" onClick={() => reject(viewing)}>رد</Btn>
          </span>
        </>}>
        {viewing && (
          <>
            <div className="summary-box" style={{ marginBottom: 14 }}>
              <div className="sum-row"><span>بابت</span><b>{viewing.label}</b></div>
              <div className="sum-row"><span>پرداخت‌کننده</span><b>{viewing.name} — {toFa(viewing.phone)}</b></div>
              <div className="sum-row"><span>مبلغ</span><b>{fmtToman(viewing.amount)}</b></div>
              <div className="sum-row"><span>زمان ثبت</span><b>{dt(viewing.at)}</b></div>
            </div>
            <img src={viewing.receipt} alt="فیش واریز" style={{ width: '100%', borderRadius: 14, border: '1px solid var(--line)' }} />
          </>
        )}
      </Modal>
    </>
  );
}
