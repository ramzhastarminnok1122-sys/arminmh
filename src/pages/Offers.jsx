import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Btn, Icon, Badge, Reveal, Empty, useFakeLoad, Skeleton } from '../components/ui';
import { toFa, countdown, dt } from '../lib/utils';

function Countdown({ end }) {
  const [ms, setMs] = useState(end - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setMs(end - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [end]);
  const c = countdown(ms);
  if (!c) return <span className="expired">مهلت تمام شد</span>;
  return (
    <span className="countdown" aria-label="زمان باقی‌مانده">
      {c.d > 0 && <b>{toFa(c.d)} روز</b>}
      <b>{toFa(String(c.h).padStart(2, '0'))}</b>
      <b>{toFa(String(c.m).padStart(2, '0'))}</b>
      <b>{toFa(String(c.s).padStart(2, '0'))}</b>
    </span>
  );
}

export default function Offers() {
  const { state } = useStore();
  const loading = useFakeLoad();
  const now = Date.now();
  const banners = (state.banners || []).filter((b) => b.active).sort((a, b) => a.order - b.order);
  const offers = (state.offers || []).filter((o) => o.active && o.start <= now);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">تخفیف‌های واقعی، مهلت مشخص</span>
          <h1>آفرها و تخفیف‌های ویژه</h1>
          <p style={{ marginInline: 'auto' }}>این پیشنهادها برای رانندگان چابهار است — تا وقتی مهلت و موجودی اجازه می‌دهد.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Skeleton h={280} r={22} />
            <div className="cards-grid g3"><Skeleton h={260} r={18} /><Skeleton h={260} r={18} /><Skeleton h={260} r={18} /></div>
          </div>
        ) : (
          <>
            {banners.map((b, i) => (
              <Reveal key={b.id} delay={i * 60} style={{ marginBottom: 20 }}>
                <div className="banner-hero">
                  <img src={b.imageDesktop} alt={b.title} />
                  <span className="discount-chip">{b.discount}</span>
                  <div className="banner-ov">
                    <div><h3>{b.title}</h3><p>{b.subtitle}</p></div>
                    <Btn to={b.link || '/offers'} variant="yellow" iconEnd="chevron">مشاهده و شروع</Btn>
                  </div>
                </div>
              </Reveal>
            ))}

            {offers.length === 0 ? (
              <Empty icon="tag" title="فعلاً آفر فعالی نداریم" desc="به‌زودی با پیشنهادهای تازه برمی‌گردیم؛ صفحه را چک کنید." />
            ) : (
              <div className="cards-grid g3" style={{ marginTop: 30 }}>
                {offers.map((o, i) => (
                  <Reveal key={o.id} delay={i * 80}>
                    <div className="card offer-card" style={{ height: '100%' }}>
                      <span className="offer-thumb">{o.image ? <img src={o.image} alt={o.title} /> : <Icon name="tag" size={40} />}</span>
                      <h3>{o.title}</h3>
                      <p>{o.desc}</p>
                      {o.oldPrice && o.newPrice && (
                        <span className="price price-lg"><b>{toFa(o.newPrice.toLocaleString('en-US'))} تومان</b><s>{toFa(o.oldPrice.toLocaleString('en-US'))} تومان</s></span>
                      )}
                      <div className="offer-dates" style={{ marginTop: 'auto' }}>
                        <span><Icon name="clock" size={13} /> پایان: {dt(o.end)}</span>
                        <Countdown end={o.end} />
                      </div>
                      <Btn to="/emergency" variant="dark" size="sm" style={{ justifyContent: 'center' }} icon="bolt">استفاده کنم</Btn>
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
