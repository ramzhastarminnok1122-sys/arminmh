import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Reveal, SectionHead, useFakeLoad, Skeleton } from '../components/ui';
import { toFa } from '../lib/utils';

export default function Services() {
  const { state } = useStore();
  const loading = useFakeLoad();
  const list = (state.services || []).filter((x) => x.active).sort((a, b) => a.order - b.order);
  const s = state.settings;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">همه‌چیز سرپایی، در محل شما</span>
          <h1>خدمات امداد باتری</h1>
          <p style={{ marginInline: 'auto' }}>از یک راه‌اندازی ساده تا باتری سنگین تاور — تجهیزات کامل همراه امدادگر است.</p>
        </div>

        {loading ? (
          <div className="cards-grid g3">
            {[...Array(6)].map((_, i) => <div key={i} className="card"><Skeleton h={54} w={54} r={16} /><Skeleton h={20} w="60%" /><Skeleton h={14} w="90%" style={{ marginTop: 8 }} /><Skeleton h={14} w="70%" /></div>)}
          </div>
        ) : (
          <div className="cards-grid g3">
            {list.map((sv, i) => (
              <Reveal key={sv.id} delay={(i % 3) * 80}>
                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <span className="svc-ic"><Icon name={sv.icon} size={25} /></span>
                  <h3>{sv.title}</h3>
                  <p>{sv.desc}</p>
                  <div className="card-meta" style={{ marginTop: 'auto' }}>
                    <span className="svc-duration"><Icon name="clock" size={14} /> {sv.duration}</span>
                    {sv.priceFrom > 0 && <b style={{ fontSize: '.92rem' }}>از {toFa(sv.priceFrom.toLocaleString('en-US'))} تومان</b>}
                    {sv.priceFrom === 0 && <b style={{ fontSize: '.88rem', color: 'var(--green)' }}>مشاوره رایگان</b>}
                  </div>
                  <Link to={`/emergency?problem=${encodeURIComponent(sv.title)}`} className="btn btn-ghost btn-sm" style={{ marginTop: 16, justifyContent: 'center' }}>
                    <Icon name="bolt" size={15} /> درخواست این خدمت
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="cta-band" style={{ marginTop: 46 }}>
          <div>
            <h2>مطمئن نیستید مشکل از باتری است؟</h2>
            <p>تلفنی راهنمایی‌تان می‌کنیم؛ اگر لازم بود امداد می‌فرستیم، اگر نه هزینه‌ای نمی‌دهید.</p>
          </div>
          <div className="cta-band-actions">
            <Btn href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} variant="yellow" size="lg" icon="phone">{toFa(s.emergencyPhone)}</Btn>
            <Btn to="/emergency" variant="red" size="lg" icon="bolt">ثبت درخواست</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
