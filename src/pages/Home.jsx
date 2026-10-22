import heroVan from '../assets/images/hero-van.jpg';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, RANK } from '../lib/store';
import { Btn, Icon, Reveal, SectionHead, Stars, Badge } from '../components/ui';
import { toFa, fmtToman, cn } from '../lib/utils';

/* نبض زنده امداد — آمار واقعی همین لحظه، خودکار به‌روز می‌شود */
function LivePulse() {
  const { state } = useStore();
  const online = (state.technicians || []).filter((t) => t.online);
  const active = (state.requests || []).filter((r) => RANK[r.status] >= 2 && RANK[r.status] < 5);
  const todayDone = (state.requests || []).filter((r) => r.doneAt && new Date(r.doneAt).toDateString() === new Date().toDateString());
  const avg = online.length ? Math.max(12, Math.round(online.reduce((t, x) => t + (x.travel || 25), 0) / online.length / 6)) : 25;
  return (
    <div className="container" style={{ position: 'relative', zIndex: 5 }}>
      <div className="live-pulse">
        <span className="lp-dot" />
        <span><b>همین حالا:</b> {toFa(online.length)} امدادگر آنلاین</span>
        <span className="lp-sep" />
        <span>{toFa(active.length)} ماموریت در خیابان</span>
        <span className="lp-sep" />
        <span>امروز {toFa(todayDone.length)} خودرو راه افتاد</span>
        <span className="lp-sep" />
        <span>میانگین رسیدن ~{toFa(avg)} دقیقه</span>
      </div>
    </div>
  );
}

/* اسلایدشو اتوماتیک با نوار پیشرفت — محتوا کاملاً از پنل ادمین */
function SlidesCarousel({ slides }) {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0); // ری‌استارت نوار پیشرفت
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  React.useEffect(() => {
    if (paused || n <= 1) return;
    const t = setTimeout(() => { setIdx((i) => (i + 1) % n); setKey((k) => k + 1); }, 6000);
    return () => clearTimeout(t);
  }, [idx, paused, n, key]);

  const go = (i) => { setIdx(((i % n) + n) % n); setKey((k) => k + 1); };
  const sl = slides[idx];

  return (
    <section className="section tight">
      <div className="container">
        <div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
          {slides.map((s, i) => (
            <div key={s.id} className={cn('slide', i === idx && 'on')} aria-hidden={i !== idx}>
              <img src={s.image} alt={s.title} loading={i === 0 ? 'eager' : 'lazy'} />
              <div className="slide-ov">
                {s.badge && <span className="slide-badge">{s.badge}</span>}
                <h3>{s.title}</h3>
                <p>{s.subtitle}</p>
                {s.link && <Link to={s.link} className="btn btn-yellow btn-sm">مشاهده</Link>}
              </div>
            </div>
          ))}
          {n > 1 && <>
            <button className="car-btn car-next" onClick={() => go(idx - 1)} aria-label="قبلی"><Icon name="chevron" size={20} /></button>
            <button className="car-btn car-prev" onClick={() => go(idx + 1)} aria-label="بعدی"><Icon name="chevron" size={20} style={{ transform: 'scaleX(-1)' }} /></button>
          </>}
        </div>
        {/* نوار آلبوم: هر خانه پر می‌شود و می‌رود عکس بعد */}
        <div className="album-strip" role="tablist" aria-label="اسلایدها">
          {slides.map((s, i) => (
            <button key={s.id} className={cn('album-cell', i === idx && 'on')} onClick={() => go(i)} aria-label={s.title}>
              <i className="album-fill" key={i === idx ? key : 'idle'} style={i === idx && !paused ? { animation: 'albumFill 6s linear forwards' } : { width: i < idx ? '100%' : 0 }} />
              <img src={s.image} alt="" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { state } = useStore();
  const hc = state.homeContent;
  const s = state.settings;
  const slides = (state.slides || []).filter((x) => x.active).sort((a, b) => a.order - b.order);
  const services = (state.services || []).filter((x) => x.active).sort((a, b) => a.order - b.order).slice(0, 4);
  const offers = (state.offers || []).filter((o) => o.active && o.end > Date.now()).slice(0, 2);
  const banner = (state.banners || []).filter((b) => b.active).sort((a, b) => a.order - b.order)[0];
  const reviews = (state.reviews || []).filter((r) => r.approved && r.featured).slice(0, 3);
  const galleryTop = (state.galleryItems || []).slice(0, 5);
  const AV = ['#1e6bff', '#17b26a', '#ffb800', '#8b5cf6', '#ee3a2c', '#0a94c8'];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-bg"><img src={heroVan} alt="امداد باتری در شب" /></div>
        <div className="hero-glow g1" /><div className="hero-glow g2" />
        <div className="container hero-in">
          <div>
            <span className="hero-badge"><i className="dot" /> {hc.hero.badge}</span>
            <h1>{hc.hero.title}</h1>
            <p className="hero-sub">{hc.hero.subtitle}</p>
            <div className="hero-cta">
              <Btn to="/emergency" variant="red" size="lg" icon="bolt">{hc.hero.cta1}</Btn>
              <Btn to="/batteries" variant="outline-light" size="lg" iconEnd="chevron">{hc.hero.cta2}</Btn>
            </div>
          </div>
          <div className="hero-visual">
            <div className="battery-hero">
              <Icon name="battery" size={92} strokeWidth={1.1} />
            </div>
            <div className="hero-card hc1"><Icon name="clock" size={18} /> اعزام در کمتر از <b>۳۰ دقیقه</b></div>
            <div className="hero-card hc2"><Icon name="shield" size={18} /> گارانتی <b>۱۲ ماهه</b> باتری نو</div>
          </div>
        </div>
      </section>

      {/* ---------- سورپرایز: نبض زنده امداد — همین لحظه چه خبر است ---------- */}
      <LivePulse />

      {/* ---------- Trust strip ---------- */}
      {hc.trust.enabled !== false && (
        <div className="container trust-strip">
          <div className="trust-grid">
            {hc.trust.items.map((t, i) => (
              <Reveal key={i} delay={i * 80} className="trust-item">
                <span className="trust-ic"><Icon name={t.icon} size={22} /></span>
                <span><b>{t.title}</b><span>{t.desc}</span></span>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Stats ---------- */}
      {hc.stats?.enabled !== false && (
        <section className="section tight">
          <div className="container">
            <div className="stats-row">
              {hc.stats.items.map((it, i) => (
                <Reveal key={i} delay={i * 70} className="stat-cell"><b>{it.n}</b><span>{it.l}</span></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- اسلایدشو تبلیغاتی ---------- */}
      {slides.length > 0 && <SlidesCarousel slides={slides} />}

      {/* ---------- Services ---------- */}
      {hc.services.enabled !== false && (
        <section className="section">
          <div className="container">
            <SectionHead kicker="سرپایی و در محل" title={hc.services.title} desc={hc.services.desc}
              action={<Btn to="/services" variant="ghost" iconEnd="chevron">مشاهده همه خدمات</Btn>} />
            <div className="cards-grid">
              {services.map((sv, i) => (
                <Reveal key={sv.id} delay={i * 80}>
                  <div className="card" style={{ height: '100%' }}>
                    <span className="svc-ic"><Icon name={sv.icon} size={25} /></span>
                    <h3>{sv.title}</h3>
                    <p>{sv.desc}</p>
                    <div className="card-meta">
                      <span className="svc-duration"><Icon name="clock" size={14} /> {sv.duration}</span>
                      <Link className="card-link" to={`/emergency?problem=${encodeURIComponent(sv.title)}`}>درخواست <Icon name="chevron" size={15} style={{ transform: 'rotate(180deg)' }} /></Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Offers ---------- */}
      {hc.offers.enabled !== false && (
        <section className="section section-alt">
          <div className="container">
            <SectionHead kicker="فرصت‌های محدود" title={hc.offers.title} desc={hc.offers.desc}
              action={<Btn to="/offers" variant="ghost" iconEnd="chevron">مشاهده همه آفرها</Btn>} />
            {banner && (
              <Reveal className="banner-hero" style={{ marginBottom: 22 }}>
                <img src={banner.imageDesktop} alt={banner.title} />
                <span className="discount-chip">{banner.discount}</span>
                <div className="banner-ov">
                  <div><h3>{banner.title}</h3><p>{banner.subtitle}</p></div>
                  <Btn to={banner.link} variant="yellow" iconEnd="chevron">شروع کنید</Btn>
                </div>
              </Reveal>
            )}
            <div className="cards-grid g3">
              {offers.map((o, i) => (
                <Reveal key={o.id} delay={i * 90}>
                  <div className="card offer-card" style={{ height: '100%' }}>
                    <span className="offer-thumb">{o.image ? <img src={o.image} alt={o.title} /> : <Icon name="tag" size={40} />}</span>
                    <h3>{o.title}</h3>
                    <p>{o.desc}</p>
                    <div className="offer-dates">
                      <span>تا {toFa(new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(o.end))}</span>
                      <Link to="/offers" className="card-link">جزئیات <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} /></Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Reviews ---------- */}
      {hc.reviews.enabled !== false && (
        <section className="section">
          <div className="container">
            <SectionHead kicker="اعتماد شما، سرمایه ما" title={hc.reviews.title} desc={hc.reviews.desc}
              action={<Btn to="/reviews" variant="ghost" iconEnd="chevron">مشاهده همه نظرات و رسانه‌ها</Btn>} />
            <div className="cards-grid g3">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={i * 90}>
                  <div className="card review-card" style={{ height: '100%' }}>
                    <span className="quote-ic">”</span>
                    <Badge tone="amber" className="featured-flag"><Icon name="star" size={12} /> نظر برگزیده</Badge>
                    <div className="review-head" style={{ marginTop: 18 }}>
                      <span className="avatar" style={{ background: AV[i % AV.length] }}>{r.name[0]}</span>
                      <div><b>{r.name}</b><span>{toFa(new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(r.at))}</span></div>
                    </div>
                    <Stars n={r.rating} />
                    <p className="review-text">{r.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- گالری (تیزر) ---------- */}
      {galleryTop.length > 0 && (
        <section className="section tight">
          <div className="container">
            <SectionHead kicker="به روایت تصویر" title="گالری عملیات" desc="گوشه‌ای از ماموریت‌های واقعی تیم ما در شهر و جاده."
              action={<Btn to="/gallery" variant="ghost" iconEnd="chevron">مشاهده گالری کامل</Btn>} />
            <div className="gallery-strip">
              {galleryTop.map((g, i) => (
                <Reveal key={g.id} delay={i * 60} className="gallery-strip-item">
                  <img src={g.image} alt={g.title} loading="lazy" />
                  <span>{g.title}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      {hc.cta.enabled !== false && (
        <section className="section tight">
          <div className="container">
            <Reveal className="cta-band">
              <div>
                <h2>{hc.cta.title}</h2>
                <p>{hc.cta.desc}</p>
                <a className="cta-phone" href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} style={{ marginTop: 14 }}>
                  <small>خط مستقیم امداد — {s.hours}</small>
                  <b>{toFa(s.emergencyPhone)} <Icon name="phone" size={19} /></b>
                </a>
              </div>
              <div className="cta-band-actions">
                <Btn to="/emergency" variant="red" size="lg" icon="bolt">{hc.cta.btn}</Btn>
                <Btn to="/track" variant="outline-light" size="lg" iconEnd="chevron">پیگیری درخواست قبلی</Btn>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
