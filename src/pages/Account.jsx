import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Field, Badge, StatusBadge, Empty } from '../components/ui';
import { cn, toFa, fmtToman, dt, uid, loyaltyOf } from '../lib/utils';

const ACCT_KEY = 'chb_customer';

export default function Account() {
  const { state, update, toast } = useStore();
  const [acct, setAcct] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ACCT_KEY)) || null; } catch { return null; }
  });
  const [tab, setTab] = useState('profile');
  const [veh, setVeh] = useState({ brand: '', model: '', year: '' });

  const logout = () => { localStorage.removeItem(ACCT_KEY); setAcct(null); toast('از حساب خارج شدید.'); };

  if (!acct) {
    return <Navigate to="/auth" replace />;
  }

  const myReqs = (state.requests || []).filter((r) => r.phone === acct.phone);
  const myOrders = (state.orders || []).filter((o) => o.phone === acct.phone);
  const myPays = (state.payments || []).filter((p) => p.phone === acct.phone);
  const garage = (state.garage || []).filter((g) => g.phone === acct.phone);
  const loy = loyaltyOf(state, acct.phone);
  const [mcFlip, setMcFlip] = useState(false);
  const memCode = 'CHB-' + (acct.phone || '').replace(/\D/g, '').slice(-4) + '-' + String((acct.id || 'x').replace(/\D/g, '').padStart(4, '7').slice(0, 4));

  const addVeh = () => {
    if (!veh.brand.trim() || !veh.model.trim()) { toast('برند و مدل را وارد کنید', 'error'); return; }
    update((s) => ({ ...s, garage: [...(s.garage || []), { id: uid(), phone: acct.phone, ...veh }] }));
    setVeh({ brand: '', model: '', year: '' });
    toast('خودرو به گاراژ شما اضافه شد.');
  };

  const payStatus = (o) => (state.payments || []).find((p) => p.refId === o.id);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 920 }}>
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <span className="avatar" style={{ width: 64, height: 64, background: 'var(--brand)', fontSize: '1.5rem', boxShadow: '0 10px 26px -8px rgba(30,107,255,.6)' }}>{acct.name[0]}</span>
            <div>
              <h1 style={{ fontSize: '1.55rem' }}>{acct.name} <Badge tone="green">✔ احراز شده</Badge></h1>
              <p style={{ color: 'var(--muted)', direction: 'ltr', textAlign: 'right' }}>{toFa(acct.phone)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn to="/emergency" variant="red" icon="bolt">درخواست امداد</Btn>
            <Btn variant="ghost" icon="logout" size="sm" onClick={logout}>خروج</Btn>
          </div>
        </div>

        {/* سورپرایز: کارت عضویت باشگاه مشتریان — لمس کنید تا بچرخد */}
        <div className="mc-scene">
          <div className={cn('member-card', mcFlip && 'flip')} onClick={() => setMcFlip(!mcFlip)}>
            <div className="mc-face mc-front">
              <span className="mc-shine" />
              <div className="mc-brand">
                <span>باشگاه مشتریان — امداد باتری چابهار</span>
                <span className="tier-badge" style={{ background: loy.tier.bg, border: `1.5px solid ${loy.tier.color}` }}><Icon name="star" size={13} /> {loy.tier.name}</span>
              </div>
              <div className="mc-chip" />
              <div>
                <div className="mc-name">{acct.name}</div>
                <div className="mc-code">{memCode}</div>
              </div>
            </div>
            <div className="mc-face mc-back">
              <span className="mc-shine" />
              <div className="mc-brand"><span>امتیاز و تخفیف شما</span><Icon name="battery" size={20} /></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                  <span style={{ fontSize: '.85rem', opacity: .85 }}>امتیاز شما</span>
                  <b style={{ fontSize: '1.6rem', color: '#ffd23f' }}>{toFa(loy.points)}</b>
                </div>
                <div className="mc-bar"><i style={{ width: `${loy.progress}%` }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', marginTop: 6, opacity: .85 }}>
                  <span>{loy.next ? `تا ${loy.next.name}: ${toFa(loy.next.min - loy.points)} امتیاز` : 'بالاترین سطح! 🏆'}</span>
                  <span>تخفیف فعلی: {toFa(loy.discount)}٪</span>
                </div>
              </div>
            </div>
          </div>
          <p className="mc-hint">👆 کارت را لمس کنید تا بچرخد — کد عضویت شما: {memCode}</p>
        </div>

        <div className="tabs">
          {[['profile', 'پروفایل'], ['garage', 'گاراژ من'], ['requests', `درخواست‌ها (${toFa(myReqs.length)})`], ['orders', `سفارش‌ها (${toFa(myOrders.length)})`], ['payments', `پرداخت‌ها (${toFa(myPays.length)})`]].map(([k, l]) => (
            <button key={k} className={cn('tab', tab === k && 'active')} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>اطلاعات من</h2>
            <div className="summary-box">
              <div className="sum-row"><span>نام</span><b>{acct.name}</b></div>
              <div className="sum-row"><span>موبایل</span><b>{toFa(acct.phone)}</b></div>
              <div className="sum-row"><span>وضعیت احراز</span><b style={{ color: 'var(--green)' }}>شماره با کد پیامکی تایید شده</b></div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginTop: 14 }}>
              در فرم <Link to="/emergency" style={{ color: 'var(--brand)', fontWeight: 700 }}>درخواست امداد</Link> خودروهای گاراژ شما خودکار پیشنهاد می‌شود و همه درخواست‌ها به نام شما ثبت می‌گردد.
            </p>
          </div>
        )}

        {tab === 'garage' && (
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 14 }}>خودروهای من</h2>
            {garage.length === 0 && <Empty icon="car" title="گاراژ خالی است" desc="خودروهایتان را اضافه کنید تا هنگام درخواست امداد سریع انتخاب شوند." />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {garage.map((g) => (
                <div key={g.id} className="card veh-card" style={{ padding: 16 }}>
                  <div className="veh-info">
                    <span className="svc-ic"><Icon name="car" size={20} /></span>
                    <div><b>{g.brand} {g.model}</b><br /><small style={{ color: 'var(--muted)' }}>{g.year ? `سال ${toFa(g.year)}` : ''}</small></div>
                  </div>
                  <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => { update((s) => ({ ...s, garage: s.garage.filter((x) => x.id !== g.id) })); toast('خودرو حذف شد'); }} aria-label="حذف">
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              ))}
            </div>
            <div className="form-grid" style={{ marginTop: 18 }}>
              <Field label="برند"><input className="input" value={veh.brand} onChange={(e) => setVeh({ ...veh, brand: e.target.value })} placeholder="مثلاً: پژو" list="brands-list" /></Field>
              <Field label="مدل"><input className="input" value={veh.model} onChange={(e) => setVeh({ ...veh, model: e.target.value })} placeholder="مثلاً: 206" /></Field>
              <Field label="سال (اختیاری)"><input className="input" value={veh.year} onChange={(e) => setVeh({ ...veh, year: e.target.value })} placeholder="۱۴۰۰" /></Field>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><Btn variant="dark" icon="plus" onClick={addVeh} style={{ width: '100%', justifyContent: 'center' }}>افزودن به گاراژ</Btn></div>
            </div>
            <datalist id="brands-list">{['پراید', 'تیبا', 'کوییک', 'پژو', 'سمند', 'رانا', 'دنا', 'شاهین', 'هیوندای', 'کیا', 'تویوتا', 'نیسان'].map((b) => <option key={b} value={b} />)}</datalist>
          </div>
        )}

        {tab === 'requests' && (
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 8 }}>درخواست‌های امداد من</h2>
            {myReqs.length === 0 ? <Empty icon="bolt" title="هنوز درخواستی ندارید" desc="وقتی امداد بخواهید، وضعیت زنده‌اش اینجا دیده می‌شود."
              action={<Btn to="/emergency" variant="red" icon="bolt">ثبت درخواست</Btn>} /> : (
              myReqs.map((r) => (
                <div key={r.id} className="req-row">
                  <div>
                    <b>{r.problem}</b>
                    <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{dt(r.createdAt)} — {r.location.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {r.report && r.report.price > 0 && !r.invoicePaid && <Badge tone="amber">فاکتور پرداخت‌نشده</Badge>}
                    <StatusBadge status={r.status} />
                    <Link className="btn btn-ghost btn-sm" to={`/track/${r.code}`}>پیگیری</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 8 }}>سفارش‌های باتری من</h2>
            {myOrders.length === 0 ? <Empty icon="battery" title="سفارشی ثبت نشده" desc="از فروشگاه باتری، سفارش نصب در محل بدهید."
              action={<Btn to="/batteries" variant="dark" icon="battery">مشاهده فروشگاه</Btn>} /> : (
              myOrders.map((o) => {
                const p = payStatus(o);
                return (
                  <div key={o.id} className="req-row">
                    <div>
                      <b>{o.batteryLabel}</b>
                      <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{dt(o.createdAt)} — {o.address}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <b style={{ fontSize: '.95rem' }}>{fmtToman(o.price)}</b>
                      {o.status === 'در انتظار پرداخت' && <Link to={`/pay?order=${o.id}`} className="btn btn-yellow btn-sm">پرداخت فاکتور</Link>}
                      {o.status === 'در انتظار تایید پرداخت' && <Badge tone="amber" dot>فیش در صف بررسی</Badge>}
                      {p?.status === 'approved' && <Badge tone="green" dot>پرداخت تایید شد</Badge>}
                      <Badge tone={o.status.includes('تحویل') || o.status.includes('آماده') ? 'green' : 'gray'}>{o.status}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'payments' && (
          <div className="admin-panel">
            <h2 style={{ fontSize: '1.05rem', marginBottom: 8 }}>فاکتورها و پرداخت‌های من</h2>
            {myPays.length === 0 ? <Empty icon="banknote" title="پرداختی ثبت نشده" desc="بعد از سفارش یا فاکتور امداد، فیش واریز را در درگاه پرداخت آپلود کنید." /> : (
              myPays.map((p) => (
                <div key={p.id} className="req-row">
                  <div>
                    <b>{p.label}</b>
                    <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{dt(p.at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <b>{fmtToman(p.amount)}</b>
                    <Badge tone={p.status === 'approved' ? 'green' : p.status === 'rejected' ? 'red' : 'amber'} dot>
                      {p.status === 'approved' ? 'تایید شد' : p.status === 'rejected' ? 'رد شد' : 'در انتظار تایید'}
                    </Badge>
                    {p.receipt && <img src={p.receipt} alt="فیش" style={{ width: 52, height: 38, objectFit: 'cover', borderRadius: 8 }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
