import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Icon, Badge, Empty, Confirm, Modal, Btn, Field } from '../../components/ui';
import { toFa, dt, dOnly, loyaltyOf } from '../../lib/utils';

export default function Customers() {
  const { state, patch, remove, toast } = useStore();
  const users = state.users || [];
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [bonusFor, setBonusFor] = useState(null); // {user, val}

  const statsOf = (u) => ({
    reqs: (state.requests || []).filter((r) => r.phone === u.phone).length,
    orders: (state.orders || []).filter((o) => o.phone === u.phone).length,
    pays: (state.payments || []).filter((p) => p.phone === u.phone).length
  });

  const saveBonus = () => {
    const v = Number(bonusFor.val) || 0;
    patch('users', bonusFor.user.id, { bonusPoints: (bonusFor.user.bonusPoints || 0) + v });
    toast(`${v > 0 ? '+' : ''}${toFa(v)} امتیاز دستی ثبت شد.`);
    setBonusFor(null);
  };

  return (
    <div className="admin-panel">
      <div className="panel-head">
        <div><h2>مشتریان ثبت‌نام‌شده</h2><p>{toFa(users.length)} حساب احراز‌شده — مسدودسازی برای کنترل سوءاستفاده</p></div>
      </div>
      {users.length === 0 ? <Empty icon="users" title="هنوز مشتری ثبت‌نام نکرده" desc="با اولین ثبت‌نام در سایت، اینجا لیست می‌شود." /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>مشتری</th><th>موبایل</th><th>عضویت</th><th>فعالیت</th><th>باشگاه مشتریان</th><th>وضعیت</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => {
                const st = statsOf(u);
                const loy = loyaltyOf(state, u.phone);
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{toFa(u.phone)}</td>
                    <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{dOnly(u.createdAt)}</td>
                    <td style={{ fontSize: '.82rem' }}>{toFa(st.reqs)} درخواست • {toFa(st.orders)} سفارش • {toFa(st.pays)} پرداخت</td>
                    <td>
                      <span className="tier-badge" style={{ background: loy.tier.bg, color: '#5c4a10', border: `1px solid ${loy.tier.color}`, fontSize: '.75rem' }}>
                        {loy.tier.name} — {toFa(loy.points)} امتیاز
                      </span>
                    </td>
                    <td>{u.blocked ? <Badge tone="red" dot>مسدود</Badge> : <Badge tone="green" dot>فعال</Badge>}</td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn" onClick={() => setViewing(u)} aria-label="مشاهده"><Icon name="eye" size={16} /></button>
                        <button className="icon-btn" onClick={() => setBonusFor({ user: u, val: 10 })} aria-label="امتیاز دستی" title="ثبت امتیاز دستی"><Icon name="sparkle" size={16} /></button>
                        <button className="icon-btn" onClick={() => { patch('users', u.id, { blocked: !u.blocked }); toast(u.blocked ? 'حساب آزاد شد.' : 'حساب مسدود شد.'); }} aria-label="مسدود/آزاد">
                          <Icon name={u.blocked ? 'check' : 'alert'} size={16} />
                        </button>
                        <button className="icon-btn danger" onClick={() => setDeleting(u)} aria-label="حذف"><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="پرونده مشتری" width={440}>
        {viewing && (() => {
          const st = statsOf(viewing);
          return (
            <div className="summary-box">
              <div className="sum-row"><span>نام</span><b>{viewing.name}</b></div>
              <div className="sum-row"><span>موبایل</span><b>{toFa(viewing.phone)}</b></div>
              <div className="sum-row"><span>عضویت</span><b>{dOnly(viewing.createdAt)}</b></div>
              <div className="sum-row"><span>درخواست‌های امداد</span><b>{toFa(st.reqs)}</b></div>
              <div className="sum-row"><span>سفارش‌ها</span><b>{toFa(st.orders)}</b></div>
              <div className="sum-row"><span>پرداخت‌ها</span><b>{toFa(st.pays)}</b></div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!bonusFor} onClose={() => setBonusFor(null)} title="ثبت امتیاز دستی" width={400}
        footer={<><Btn variant="ghost" onClick={() => setBonusFor(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={saveBonus}>ثبت امتیاز</Btn></>}>
        {bonusFor && (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: 12 }}>
              امتیاز دستی برای <b>{bonusFor.user.name}</b> — فعلاً {toFa(loyaltyOf(state, bonusFor.user.phone).points)} امتیاز دارد. (عدد منفی = کسر امتیاز)
            </p>
            <Field label="امتیاز (مثلاً ۲۰ یا ۱۰-)">
              <input className="input" type="number" autoFocus value={bonusFor.val} onChange={(e) => setBonusFor({ ...bonusFor, val: e.target.value })} />
            </Field>
          </>
        )}
      </Modal>

      <Confirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => { remove('users', deleting.id); toast('حساب حذف شد.'); }}
        text={`حساب «${deleting?.name}» حذف شود؟ درخواست‌های قبلی او باقی می‌ماند.`} />
    </div>
  );
}
