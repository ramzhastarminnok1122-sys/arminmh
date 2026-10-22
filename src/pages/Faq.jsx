import React, { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { Icon, Btn, Empty } from '../components/ui';
import { cn } from '../lib/utils';

export default function Faq() {
  const { state } = useStore();
  const [cat, setCat] = useState('همه');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const faqs = (state.faqs || []).filter((f) => f.active);
  const cats = ['همه', ...new Set(faqs.map((f) => f.category))];
  const list = useMemo(() => faqs
    .filter((f) => (cat === 'همه' || f.category === cat) && (!q.trim() || (f.q + f.a).includes(q.trim())))
    .sort((a, b) => (a.order || 0) - (b.order || 0)), [faqs, cat, q]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">جواب سؤال‌های پرتکرار</span>
          <h1>سؤالات متداول</h1>
          <p style={{ marginInline: 'auto' }}>اگر جواب‌تان اینجا نبود، خط امداد همیشه باز است.</p>
        </div>

        <div style={{ maxWidth: 820, margin: '0 auto 18px' }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در سؤالات…" />
        </div>
        <div className="faq-cats" style={{ justifyContent: 'center' }}>
          {cats.map((c) => (
            <button key={c} className={cn('chip', cat === c && 'on')} onClick={() => { setCat(c); setOpen(null); }}>{c}</button>
          ))}
        </div>

        {list.length === 0 ? (
          <Empty icon="search" title="چیزی پیدا نشد" desc="عبارت دیگری را امتحان کنید یا مستقیم از ما بپرسید."
            action={<Btn to="/contact" variant="dark" icon="headset">پرسیدن سؤال</Btn>} />
        ) : (
          <div className="accordion">
            {list.map((f) => (
              <div key={f.id} className={cn('acc-item', open === f.id && 'open')}>
                <button className="acc-q" onClick={() => setOpen(open === f.id ? null : f.id)} aria-expanded={open === f.id}>
                  <span>{f.q}</span>
                  <Icon name="chevron" size={17} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div className="acc-a" style={{ maxHeight: open === f.id ? 520 : 0 }}>
                  <div className="acc-a-in">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
