import React from 'react';
import { useStore } from '../lib/store';
import { Btn, Icon, Badge, Reveal, Empty, useFakeLoad, Skeleton, LiveCountdown } from '../components/ui';
import { toFa, dt, fmtToman } from '../lib/utils';

export default function Offers() {
  const { state, toast } = useStore();
  const loading = useFakeLoad();
  const now = Date.now();
  const banners = (state.banners || []).filter((b) => b.active).sort((a, b) => a.order - b.order);
  const offers = (state.offers || []).filter((o) => o.active && (!o.start || o.start <= now));

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    toast(`کد تخفیف ${code} کپی شد! در فروشگاه یا صفحه پرداخت وارد کنید. 🎉`);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">تخفیف‌های واقعی با تایمر معکوس زنده</span>
          <h1>آفرها و کدهای تخفیف ویژه</h1>
          <p style={{ marginInline: 'auto' }}>
            این پیشنهادها ویژه رانندگان چابهار و کنارک است — کد تخفیف را کپی کنید و در سفارش باتری یا فاکتور امداد استفاده نمایید.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Skeleton h={280} r={22} />
            <div className="cards-grid g3">
              <Skeleton h={260} r={18} />
              <Skeleton h={260} r={18} />
              <Skeleton h={260} r={18} />
            </div>
          </div>
        ) : (
          <>
            {banners.map((b, i) => (
              <Reveal key={b.id} delay={i * 60} style={{ marginBottom: 22 }}>
                <div className="banner-hero">
                  <img src={b.imageDesktop} alt={b.title} />
                  <span className="discount-chip">{b.discount}</span>
                  <div className="banner-ov">
                    <div>
                      <h3>{b.title}</h3>
                      <p>{b.subtitle}</p>
                    </div>
                    <Btn to={b.link || '/batteries'} variant="yellow" iconEnd="chevron">مشاهده و خرید</Btn>
                  </div>
                </div>
              </Reveal>
            ))}

            {offers.length === 0 ? (
              <Empty icon="tag" title="فعلاً آفر فعالی نداریم" desc="به‌زودی با پیشنهادهای تازه برمی‌گردیم؛ صفحه را چک کنید." />
            ) : (
              <div className="cards-grid g3" style={{ marginTop: 28 }}>
                {offers.map((o, i) => (
                  <Reveal key={o.id} delay={i * 80}>
                    <div className="card offer-card" style={{ height: '100%' }}>
                      <span className="offer-thumb" style={{ position: 'relative' }}>
                        {o.image ? <img src={o.image} alt={o.title} /> : <Icon name="tag" size={40} />}
                        {o.discountPercent > 0 && (
                          <span className="off-tag" style={{ top: 12, insetInlineStart: 12 }}>
                            {toFa(o.discountPercent)}٪ تخفیف
                          </span>
                        )}
                      </span>

                      <h3>{o.title}</h3>
                      <p style={{ marginBottom: 8 }}>{o.desc}</p>

                      {/* نمایش کد تخفیف قابل کپی */}
                      {o.code && (
                        <div className="offer-coupon-row">
                          <span><Icon name="tag" size={14} /> کد تخفیف:</span>
                          <button
                            type="button"
                            className="copy-coupon-btn"
                            onClick={() => copyCode(o.code)}
                            title="کپی کد تخفیف"
                          >
                            <b>{o.code}</b>
                            <Icon name="copy" size={14} />
                          </button>
                        </div>
                      )}

                      {/* نمایش قیمت دوحالته: قیمت قبل خط‌خورده + قیمت جدید رنگ برند */}
                      {(o.oldPrice != null || o.newPrice != null) && (
                        <div className="dual-price-box" style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 12 }}>
                          {o.oldPrice != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                              <span style={{ color: 'var(--muted)' }}>قیمت اصلی:</span>
                              <s style={{ textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>
                                {fmtToman(o.oldPrice)}
                              </s>
                            </div>
                          )}
                          {o.newPrice != null && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                              <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>قیمت جشنواره:</span>
                              <b style={{ color: 'var(--brand)', fontSize: '1.25rem', fontWeight: 900 }}>
                                {o.newPrice === 0 ? 'رایگان!' : fmtToman(o.newPrice)}
                              </b>
                            </div>
                          )}
                        </div>
                      )}

                      {/* تایمر معکوس زنده (روز : ساعت : دقیقه : ثانیه) */}
                      <div className="offer-timer-wrap" style={{ marginTop: 'auto', paddingTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>
                          <span><Icon name="clock" size={13} /> زمان باقی‌مانده:</span>
                          <span>پایان: {dt(o.end)}</span>
                        </div>
                        <LiveCountdown end={o.end} />
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <Btn to="/batteries" variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }} icon="battery">
                          خرید از فروشگاه
                        </Btn>
                        <Btn to="/emergency" variant="ghost" size="sm" icon="bolt">
                          درخواست امداد
                        </Btn>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
