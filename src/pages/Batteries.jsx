import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Modal, Field, Badge, useFakeLoad, Skeleton, Reveal, Empty } from '../components/ui';
import { cn, isMobile, normPhone, toFa, fmtToman, uid, loyaltyOf } from '../lib/utils';
import { notifyOwner, fmMoney } from '../lib/notify';

const CUST_KEY = 'chb_customer';

export default function Batteries() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [acct] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUST_KEY)) || null; } catch { return null; }
  });
  const loy = acct ? loyaltyOf(state, acct.phone) : null;
  const disc = loy?.discount || 0;
  const loading = useFakeLoad();
  const [brand, setBrand] = useState('');
  const [cap, setCap] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('pop');
  const [orderFor, setOrderFor] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', address: '' });
  const [touched, setTouched] = useState(false);

  const all = (state.batteries || []).filter((b) => b.active);
  const brands = [...new Set(all.map((b) => b.brand))];
  const caps = [...new Set(all.map((b) => b.capacity))].sort((a, b) => a - b);

  const list = useMemo(() => {
    let l = all.filter((b) =>
      (!brand || b.brand === brand) && (!cap || String(b.capacity) === cap) && (!type || b.type === type)
    );
    if (sort === 'cheap') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'exp') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'cap') l = [...l].sort((a, b) => a.capacity - b.capacity);
    return l;
  }, [state.batteries, brand, cap, type, sort]);

  const orderValid = form.name.trim().length >= 3 && isMobile(form.phone) && form.address.trim().length >= 5;

  const submitOrder = () => {
    if (!orderValid) { setTouched(true); return; }
    const finalPrice = Math.round(orderFor.price * (1 - disc / 100) / 1000) * 1000;
    const order = {
      id: uid(), batteryId: orderFor.id, batteryLabel: `${orderFor.brand} ${orderFor.model}`,
      name: form.name.trim(), phone: normPhone(form.phone), vehicle: form.vehicle.trim() || '—',
      address: form.address.trim(), price: finalPrice, listPrice: orderFor.price, discount: disc,
      status: 'در انتظار پرداخت', createdAt: Date.now()
    };
    update((s) => ({ ...s, orders: [order, ...s.orders] }));
    notifyOwner(state, {
      title: '🛒 سفارش باتری جدید',
      body: `${order.name} — ${order.phone}\n${order.batteryLabel} — ${fmMoney(order.price)} تومان${disc > 0 ? ` (تخفیف ${toFa(disc)}٪)` : ''}\n${order.address}`
    });
    setOrderFor(null); setForm({ name: '', phone: '', vehicle: '', address: '' }); setTouched(false);
    toast(disc > 0 ? `سفارش ثبت شد — تخفیف ${toFa(disc)}٪ باشگاه مشتریان اعمال شد!` : 'سفارش ثبت شد؛ حالا فیش پرداخت را در درگاه ثبت کنید.');
    nav(`/pay?order=${order.id}`);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">قیمت‌های روز، بدون واسطه</span>
          <h1>فروشگاه باتری چابهار</h1>
          <p style={{ marginInline: 'auto' }}>باتری نو با گارانتی معتبر، ارسال و نصب در محل شما. باتری قدیمی‌تان را هم از دست می‌دهیم.</p>
        </div>

        {loy && disc > 0 && (
          <div className="loyalty-card" style={{ padding: '16px 20px', marginBottom: 22 }}>
            <span className="tier-badge" style={{ background: loy.tier.bg, color: '#fff', border: `1.5px solid ${loy.tier.color}` }}>
              <Icon name="star" size={15} /> عضویت {loy.tier.name} — {toFa(disc)}٪ تخفیف خودکار
            </span>
            <small style={{ flex: 1, textAlign: 'end' }}>تخفیف شما هنگام ثبت سفارش، خودکار روی قیمت اعمال می‌شود. ✨</small>
          </div>
        )}

        <div className="filters-bar">
          <span style={{ display: 'flex', gap: 7, alignItems: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: '.88rem' }}><Icon name="search" size={16} /> فیلتر:</span>
          <select className="input" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">همه برندها</option>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select className="input" value={cap} onChange={(e) => setCap(e.target.value)}>
            <option value="">همه آمپراژها</option>
            {caps.map((c) => <option key={c} value={c}>{toFa(c)} آمپر</option>)}
          </select>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">همه انواع</option>
            {[...new Set(all.map((b) => b.type))].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} style={{ marginInlineStart: 'auto' }}>
            <option value="pop">پرفروش‌ترین</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="exp">گران‌ترین</option>
            <option value="cap">آمپراژ</option>
          </select>
        </div>

        {loading ? (
          <div className="cards-grid g3">
            {[...Array(6)].map((_, i) => <div key={i} className="card"><Skeleton h={150} r={14} /><Skeleton h={20} w="55%" style={{ marginTop: 12 }} /><Skeleton h={14} w="80%" /></div>)}
          </div>
        ) : list.length === 0 ? (
          <Empty icon="battery" title="باتری با این فیلترها پیدا نشد" desc="فیلترها را تغییر دهید یا برای سفارش اختصاصی تماس بگیرید." />
        ) : (
          <div className="cards-grid g3">
            {list.map((b, i) => {
              const off = b.oldPrice ? Math.round((1 - b.price / b.oldPrice) * 100) : 0;
              return (
                <Reveal key={b.id} delay={(i % 3) * 70}>
                  <div className="card battery-card" style={{ height: '100%' }}>
                    <div className="battery-img">
                      <img src={b.image} alt={`${b.brand} ${b.model}`} loading="lazy" />
                      {off > 0 && <span className="off-tag">{toFa(off)}٪ تخفیف</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <h3>{b.brand} <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '.95rem' }}>{b.model}</span></h3>
                      {b.stock === 'in' && <Badge tone="green">موجود</Badge>}
                      {b.stock === 'low' && <Badge tone="amber">آخرین موجودی</Badge>}
                    </div>
                    <div className="spec-chips" style={{ marginTop: 8 }}>
                      <Badge tone="brand">{toFa(b.capacity)} آمپر</Badge>
                      <Badge tone="gray">CCA {toFa(b.cca)}</Badge>
                      <Badge tone="gray">{b.type}</Badge>
                      <Badge tone="violet">{toFa(b.warranty)} ماه گارانتی</Badge>
                    </div>
                    <p style={{ fontSize: '.84rem', color: 'var(--muted)', margin: 0 }}>مناسب برای: {b.suitable}</p>
                    <div style={{ marginTop: 12 }}>
                      <span className="price price-lg">
                        <b>{fmtToman(b.price)}</b>
                        {b.oldPrice && <s>{fmtToman(b.oldPrice)}</s>}
                      </span>
                    </div>
                    <div className="battery-actions">
                      <Btn variant="dark" icon="car" size="sm" onClick={() => { setOrderFor(b); setTouched(false); }}>سفارش و نصب در محل</Btn>
                      <Btn href={`tel:${state.settings.emergencyPhone.replace(/\s/g, '')}`} variant="ghost" icon="phone" size="sm">مشاوره</Btn>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.86rem', marginTop: 28 }}>
          <Icon name="info" size={14} /> قیمت‌ها روزانه به‌روزرسانی می‌شود؛ قیمت نهایی همان است که موقع سفارش می‌بینید.
        </p>
      </div>

      {/* Order modal */}
      <Modal open={!!orderFor} onClose={() => setOrderFor(null)} title={orderFor ? `سفارش ${orderFor.brand} ${orderFor.model}` : ''}
        footer={<>
          <Btn variant="ghost" onClick={() => setOrderFor(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={submitOrder}>ثبت سفارش — {orderFor ? fmtToman(Math.round(orderFor.price * (1 - disc / 100) / 1000) * 1000) : ''}</Btn>
        </>}>
        {orderFor && (
          <>
            <div className="note-box" style={{ marginBottom: 18 }}><Icon name="banknote" size={17} /> پرداخت در محل، پس از نصب و تست نهایی. باتری مستعمل شما هم خریداری می‌شود.</div>
            {disc > 0 && (
              <div className="note-box" style={{ marginBottom: 14, background: 'rgba(217,165,20,.12)', borderColor: 'rgba(217,165,20,.5)', color: '#8a6a00' }}>
                <Icon name="star" size={17} /> باشگاه مشتریان: با عضویت {loy.tier.name}، قیمت از {fmtToman(orderFor.price)} به <b>{fmtToman(Math.round(orderFor.price * (1 - disc / 100) / 1000) * 1000)}</b> کاهش یافت.
              </div>
            )}
            <div className="form-grid">
              <Field label="نام شما" error={touched && form.name.trim().length < 3 && 'نام را کامل بنویسید'}>
                <input className={cn('input', touched && form.name.trim().length < 3 && 'err')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام و نام خانوادگی" />
              </Field>
              <Field label="شماره موبایل" error={touched && !isMobile(form.phone) && 'شماره معتبر وارد کنید'}>
                <input className={cn('input', touched && !isMobile(form.phone) && 'err')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 6789" />
              </Field>
              <Field label="خودرو (برند و مدل)" className="span2">
                <input className="input" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="مثلاً: پژو پارس ۱۴۰۰" />
              </Field>
              <Field label="آدرس نصب" className="span2" error={touched && form.address.trim().length < 5 && 'آدرس را دقیق‌تر بنویسید'}>
                <textarea className={cn('input', touched && form.address.trim().length < 5 && 'err')} rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="چابهار، بلوار …، کوچه …" />
              </Field>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
