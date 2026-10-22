import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Modal, Field, Badge, useFakeLoad, Skeleton, Reveal, Empty, LiveCountdown } from '../components/ui';
import { cn, isMobile, normPhone, toFa, fmtToman, uid, loyaltyOf } from '../lib/utils';
import { notifyOwner, fmMoney } from '../lib/notify';

const CUST_KEY = 'chb_customer';

export default function Batteries() {
  const { state, update, toast, validateDiscountCode } = useStore();
  const nav = useNavigate();
  const [acct] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUST_KEY)) || null; } catch { return null; }
  });
  const loy = acct ? loyaltyOf(state, acct.phone) : null;
  const loyDisc = loy?.discount || 0;
  const loading = useFakeLoad();

  const [brand, setBrand] = useState('');
  const [cap, setCap] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('pop');
  const [orderFor, setOrderFor] = useState(null);
  const [form, setForm] = useState(() => ({
    name: acct?.name || '',
    phone: acct?.phone || '',
    vehicle: '',
    address: ''
  }));
  const [couponCode, setCouponCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [touched, setTouched] = useState(false);

  const activeOffers = useMemo(
    () => (state.offers || []).filter((o) => o.active && Number(o.end || 0) > Date.now()),
    [state.offers]
  );
  const topOffer = activeOffers[0] || null;

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

  const applyOfferCode = (codeToApply) => {
    const targetCode = typeof codeToApply === 'string' ? codeToApply : couponCode;
    setCouponMsg('');
    const res = validateDiscountCode(targetCode, orderFor?.price || 4150000);
    if (!res.valid) {
      setAppliedOffer(null);
      setCouponMsg(res.error);
      toast(res.error, 'error');
      return;
    }
    setCouponCode(res.offer.code);
    setAppliedOffer(res.offer);
    setCouponMsg('');
    toast(`کد تخفیف ${res.offer.code} (${toFa(res.percent)}٪) فعال شد! 🎉`);
  };

  const totalDiscPercent = Math.min(50, loyDisc + Number(appliedOffer?.discountPercent || 0));

  const calcFinalBatteryPrice = (basePrice) => {
    const raw = Number(basePrice || 0);
    if (totalDiscPercent <= 0) return raw;
    return Math.round((raw * (1 - totalDiscPercent / 100)) / 1000) * 1000;
  };

  const orderValid = form.name.trim().length >= 3 && isMobile(form.phone) && form.address.trim().length >= 5;

  const submitOrder = () => {
    if (!navigator.onLine) {
      toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error');
      return;
    }
    if (!orderValid) { setTouched(true); return; }
    const finalPrice = calcFinalBatteryPrice(orderFor.price);
    const order = {
      id: uid(),
      batteryId: orderFor.id,
      batteryLabel: `${orderFor.brand} ${orderFor.model}`,
      name: form.name.trim(),
      phone: normPhone(form.phone),
      vehicle: form.vehicle.trim() || '—',
      address: form.address.trim(),
      price: finalPrice,
      listPrice: orderFor.oldPrice || orderFor.price,
      discount: totalDiscPercent,
      discountCode: appliedOffer?.code || null,
      paid: false,
      status: 'در انتظار پرداخت',
      createdAt: Date.now()
    };
    update((s) => ({ ...s, orders: [order, ...(s.orders || [])] }));
    notifyOwner(state, {
      title: '🛒 سفارش باتری جدید',
      body: `${order.name} — ${order.phone}\n${order.batteryLabel} — ${fmMoney(order.price)} تومان${totalDiscPercent > 0 ? ` (تخفیف ${toFa(totalDiscPercent)}٪)` : ''}\n${order.address}`
    });
    setOrderFor(null);
    setTouched(false);
    toast(totalDiscPercent > 0 ? `سفارش ثبت شد — ${toFa(totalDiscPercent)}٪ تخفیف روی فاکتور شما اعمال گردید!` : 'سفارش ثبت شد؛ اکنون به درگاه پرداخت منتقل می‌شوید.');
    nav(`/pay?order=${order.id}`);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">قیمت‌های روز و رقابتی — گارانتی شرکتی</span>
          <h1>فروشگاه باتری چابهار</h1>
          <p style={{ marginInline: 'auto' }}>
            باتری آکبند با گارانتی معتبر، ارسال فوری و نصب رایگان در محل شما. قیمت‌ها با احتساب تحویل باتری فرسوده محاسبه شده‌اند.
          </p>
        </div>

        {/* بنر هوشمند تخفیف و تایمر معکوس زنده در بالای فروشگاه */}
        {topOffer && (
          <div className="shop-offer-banner">
            <div className="sob-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="badge badge-amber"><Icon name="sparkle" size={13} /> جشنواره تخفیف ویژه</span>
                {topOffer.code && (
                  <button
                    type="button"
                    className="offer-code-pill"
                    onClick={() => applyOfferCode(topOffer.code)}
                    title="کلیک برای فعال‌سازی خودکار کد تخفیف"
                  >
                    <Icon name="tag" size={14} /> کد تخفیف: <b>{topOffer.code}</b> ({toFa(topOffer.discountPercent || 15)}٪)
                    <span className="ocp-action">{appliedOffer?.code === topOffer.code ? '✔ فعال شد' : 'اعمال روی قیمت‌ها'}</span>
                  </button>
                )}
              </div>
              <h3>{topOffer.title}</h3>
              <p>{topOffer.desc}</p>
            </div>
            <div className="sob-timer">
              <small>زمان باقی‌مانده تا پایان جشنواره:</small>
              <LiveCountdown end={topOffer.end} />
            </div>
          </div>
        )}

        {loy && loyDisc > 0 && (
          <div className="loyalty-card" style={{ padding: '16px 20px', marginBottom: 22 }}>
            <span className="tier-badge" style={{ background: loy.tier.bg, color: '#fff', border: `1.5px solid ${loy.tier.color}` }}>
              <Icon name="star" size={15} /> عضویت {loy.tier.name} — {toFa(loyDisc)}٪ تخفیف وفاداری
            </span>
            <small style={{ flex: 1, textAlign: 'end' }}>تخفیف باشگاه مشتریان شما به صورت خودکار روی قیمت نهایی اعمال می‌شود. ✨</small>
          </div>
        )}

        <div className="filters-bar">
          <span style={{ display: 'flex', gap: 7, alignItems: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: '.88rem' }}>
            <Icon name="search" size={16} /> فیلتر هوشمند:
          </span>
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
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <Skeleton h={160} r={14} />
                <Skeleton h={22} w="55%" style={{ marginTop: 14 }} />
                <Skeleton h={15} w="80%" style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <Empty icon="battery" title="باتری با این فیلترها پیدا نشد" desc="فیلترها را تغییر دهید یا برای مشاوره رایگان تماس بگیرید." />
        ) : (
          <div className="cards-grid g3">
            {list.map((b, i) => {
              const originalPrice = b.oldPrice && b.oldPrice > b.price
                ? b.oldPrice
                : Math.round((b.price * 1.12) / 10000) * 10000;
              const finalDisplayPrice = calcFinalBatteryPrice(b.price);
              const off = Math.max(1, Math.round((1 - finalDisplayPrice / originalPrice) * 100));

              return (
                <Reveal key={b.id} delay={(i % 3) * 70}>
                  <div className="card battery-card" style={{ height: '100%' }}>
                    <div className="battery-img">
                      <img src={b.image} alt={`${b.brand} ${b.model}`} loading="lazy" />
                      {off > 0 && <span className="off-tag">{toFa(off)}٪ تخفیف</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <h3>
                        {b.brand} <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '.95rem' }}>{b.model}</span>
                      </h3>
                      {b.stock === 'in' && <Badge tone="green">موجود</Badge>}
                      {b.stock === 'low' && <Badge tone="amber">آخرین موجودی</Badge>}
                    </div>
                    <div className="spec-chips" style={{ marginTop: 10 }}>
                      <Badge tone="brand">{toFa(b.capacity)} آمپر</Badge>
                      <Badge tone="gray">CCA {toFa(b.cca)}</Badge>
                      <Badge tone="gray">{b.type}</Badge>
                      <Badge tone="violet">{toFa(b.warranty)} ماه گارانتی</Badge>
                    </div>
                    <p style={{ fontSize: '.86rem', color: 'var(--muted)', margin: '4px 0 14px' }}>مناسب برای: {b.suitable}</p>

                    {/* رندر دوحالته قیمت: قیمت اصلی خط‌خورده خاکستری + قیمت پس از تخفیف درشت و رنگ برند */}
                    <div className="dual-price-box" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px dashed var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>قیمت اصلی:</span>
                        <s className="old-price-strike" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.92rem', fontWeight: 600 }}>
                          {fmtToman(originalPrice)}
                        </s>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>قیمت با تخفیف:</span>
                        <b className="new-price-brand" style={{ color: 'var(--brand)', fontSize: '1.38rem', fontWeight: 900 }}>
                          {fmtToman(finalDisplayPrice)}
                        </b>
                      </div>
                    </div>

                    <div className="battery-actions">
                      <Btn
                        variant="primary"
                        icon="car"
                        size="sm"
                        onClick={() => {
                          setOrderFor(b);
                          setTouched(false);
                        }}
                      >
                        سفارش و نصب در محل
                      </Btn>
                      <Btn href={`tel:${state.settings.emergencyPhone.replace(/\s/g, '')}`} variant="ghost" icon="phone" size="sm">
                        مشاوره
                      </Btn>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.86rem', marginTop: 32 }}>
          <Icon name="info" size={14} /> تمامی قیمت‌ها با احتساب تحویل باتری فرسوده هم‌آمپر و همراه با نصب و تست دینام رایگان در محدوده چابهار است.
        </p>
      </div>

      {/* Order modal */}
      <Modal
        open={!!orderFor}
        onClose={() => setOrderFor(null)}
        title={orderFor ? `سفارش و نصب ${orderFor.brand} ${orderFor.model}` : ''}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setOrderFor(null)}>انصراف</Btn>
            <Btn variant="primary" icon="check" onClick={submitOrder}>
              ثبت سفارش و ادامه به پرداخت — {orderFor ? fmtToman(calcFinalBatteryPrice(orderFor.price)) : ''}
            </Btn>
          </>
        }
      >
        {orderFor && (
          <>
            <div className="summary-box" style={{ marginBottom: 16 }}>
              <div className="sum-row">
                <span>باتری انتخابی</span>
                <b>{orderFor.brand} {orderFor.model} ({toFa(orderFor.capacity)} آمپر)</b>
              </div>
              <div className="sum-row">
                <span>قیمت اصلی</span>
                <s style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                  {fmtToman(orderFor.oldPrice || Math.round((orderFor.price * 1.12) / 10000) * 10000)}
                </s>
              </div>
              {appliedOffer && (
                <div className="sum-row">
                  <span style={{ color: 'var(--green)' }}>کد تخفیف فعال ({appliedOffer.code})</span>
                  <b style={{ color: 'var(--green)' }}>{toFa(appliedOffer.discountPercent)}٪ تخفیف</b>
                </div>
              )}
              <div className="sum-row">
                <span>مبلغ قابل پرداخت</span>
                <b style={{ color: 'var(--brand)', fontSize: '1.2rem' }}>{fmtToman(calcFinalBatteryPrice(orderFor.price))}</b>
              </div>
            </div>

            {/* ورودی کد تخفیف داخل مودال سفارش */}
            <div style={{ marginBottom: 16 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 6, fontSize: '0.86rem' }}>
                کد تخفیف دارید؟ (کد فعال: <b>CHB15</b>)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  style={{ flex: 1, direction: 'ltr', textAlign: 'left', fontWeight: 700 }}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="CHB15"
                />
                <Btn variant="ghost" size="sm" icon="tag" onClick={() => applyOfferCode(couponCode)}>اعمال کد</Btn>
              </div>
              {couponMsg && <span className="field-error" style={{ marginTop: 4 }}>{couponMsg}</span>}
            </div>

            <div className="form-grid">
              <Field label="نام و نام خانوادگی" error={touched && form.name.trim().length < 3 && 'نام را کامل بنویسید'}>
                <input
                  className={cn('input', touched && form.name.trim().length < 3 && 'err')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="نام و نام خانوادگی"
                />
              </Field>
              <Field label="شماره موبایل" error={touched && !isMobile(form.phone) && 'شماره معتبر وارد کنید'}>
                <input
                  className={cn('input', touched && !isMobile(form.phone) && 'err')}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0915 346 7788"
                  dir="ltr"
                />
              </Field>
              <Field label="خودرو (برند و مدل)" className="span2">
                <input
                  className="input"
                  value={form.vehicle}
                  onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                  placeholder="مثلاً: پژو پارس ۱۴۰۰"
                />
              </Field>
              <Field label="آدرس دقیق محل نصب در چابهار" className="span2" error={touched && form.address.trim().length < 5 && 'آدرس را دقیق‌تر بنویسید'}>
                <textarea
                  className={cn('input', touched && form.address.trim().length < 5 && 'err')}
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="چابهار، بلوار ملت، کوچه ۱۲، پلاک ۴"
                />
              </Field>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
