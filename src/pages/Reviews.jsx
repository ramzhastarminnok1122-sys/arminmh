import React from 'react';
import { useStore } from '../lib/store';
import { Icon, Reveal, Stars, Badge, Empty } from '../components/ui';
import { toFa, dOnly } from '../lib/utils';

const AV = ['#1e6bff', '#17b26a', '#ffb800', '#8b5cf6', '#ee3a2c', '#0a94c8'];

export default function ReviewsPage() {
  const { state } = useStore();
  const reviews = (state.reviews || []).filter((r) => r.approved).sort((a, b) => b.at - a.at);
  const media = (state.media || []);
  const featured = reviews.filter((r) => r.featured);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '5';

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">حرف‌های مشتریان ما</span>
          <h1>نظرات و رسانه‌ها</h1>
          <p style={{ marginInline: 'auto' }}>میانگین امتیاز مشتریان: <b style={{ color: 'var(--ink)' }}>{toFa(avg)} از ۵</b> — از {toFa(reviews.length)} نظر ثبت‌شده.</p>
        </div>

        {featured.length > 0 && (
          <div className="cards-grid g3" style={{ marginBottom: 40 }}>
            {featured.map((r, i) => (
              <Reveal key={r.id} delay={i * 80}>
                <div className="card review-card" style={{ height: '100%' }}>
                  <span className="quote-ic">”</span>
                  <Badge tone="amber" className="featured-flag"><Icon name="star" size={12} /> برگزیده</Badge>
                  <div className="review-head" style={{ marginTop: 16 }}>
                    <span className="avatar" style={{ background: AV[i % AV.length] }}>{r.name[0]}</span>
                    <div><b>{r.name}</b><span>{dOnly(r.at)}</span></div>
                  </div>
                  <Stars n={r.rating} />
                  <p className="review-text">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '1.2rem', margin: '10px 0 18px' }}>همه نظرات</h2>
        {reviews.length === 0 ? <Empty icon="star" title="هنوز نظری تأیید نشده" /> : (
          <div className="cards-grid g3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 60}>
                <div className="card review-card" style={{ height: '100%' }}>
                  <div className="review-head">
                    <span className="avatar" style={{ background: AV[i % AV.length] }}>{r.name[0]}</span>
                    <div><b>{r.name}</b><span>{dOnly(r.at)}</span></div>
                  </div>
                  <Stars n={r.rating} />
                  <p className="review-text">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {media.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.2rem', margin: '44px 0 18px' }}>گالری عملیات</h2>
            <div className="cards-grid g3">
              {media.map((m, i) => (
                <Reveal key={m.id} delay={(i % 3) * 70}>
                  <div className="card" style={{ padding: 12 }}>
                    {m.type === 'image'
                      ? <img src={m.url} alt={m.title} style={{ borderRadius: 12, height: 190, width: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <video src={m.url} controls style={{ borderRadius: 12, height: 190, width: '100%', objectFit: 'cover' }} />}
                    <p style={{ fontSize: '.86rem', color: 'var(--muted)', padding: '10px 6px 4px' }}>{m.title}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
