import React, { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { Icon, Empty, Reveal, Btn } from '../components/ui';
import { cn, toFa, dOnly } from '../lib/utils';

export default function Gallery() {
  const { state } = useStore();
  const cats = useMemo(() => [...(state.galleryCats || [])].sort((a, b) => (a.order || 0) - (b.order || 0)), [state.galleryCats]);
  const items = state.galleryItems || [];
  const [cat, setCat] = useState('all');
  const [box, setBox] = useState(null); // index در لیست فیلترشده

  const list = useMemo(() => items
    .filter((i) => cat === 'all' || i.catId === cat)
    .sort((a, b) => b.at - a.at), [items, cat]);

  const catName = (id) => cats.find((c) => c.id === id)?.name || 'عمومی';

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">کارنامه ما به روایت تصویر</span>
          <h1>گالری عملیات</h1>
          <p style={{ marginInline: 'auto' }}>گوشه‌هایی از ماموریت‌های شبانه‌روزی ما در چابهار — از نصب سرپایی تا امداد جاده.</p>
        </div>

        <div className="faq-cats" style={{ justifyContent: 'center' }}>
          <button className={cn('chip', cat === 'all' && 'on')} onClick={() => setCat('all')}>همه ({toFa(items.length)})</button>
          {cats.map((c) => (
            <button key={c.id} className={cn('chip', cat === c.id && 'on')} onClick={() => setCat(c.id)}>
              {c.name} ({toFa(items.filter((i) => i.catId === c.id).length)})
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <Empty icon="image" title="عکسی در این بخش نیست" action={<Btn variant="dark" onClick={() => setCat('all')}>نمایش همه</Btn>} />
        ) : (
          <div className="gallery-grid">
            {list.map((it, i) => (
              <Reveal key={it.id} delay={(i % 4) * 60}>
                <button className="gallery-item" onClick={() => setBox(i)} aria-label={it.title}>
                  <img src={it.image} alt={it.title} loading="lazy" />
                  <span className="gallery-cap"><b>{it.title}</b><small>{catName(it.catId)}</small></span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* لایت‌باکس */}
      {box != null && list[box] && (
        <div className="lightbox" onClick={() => setBox(null)}>
          <button className="lb-btn lb-close" aria-label="بستن"><Icon name="x" size={20} /></button>
          <button className="lb-btn lb-prev" aria-label="قبلی" onClick={(e) => { e.stopPropagation(); setBox((box - 1 + list.length) % list.length); }}><Icon name="chevron" size={22} /></button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={list[box].image} alt={list[box].title} />
            <figcaption>
              <b>{list[box].title}</b>
              <span>{catName(list[box].catId)} — {dOnly(list[box].at)}</span>
            </figcaption>
          </figure>
          <button className="lb-btn lb-next" aria-label="بعدی" onClick={(e) => { e.stopPropagation(); setBox((box + 1) % list.length); }}><Icon name="chevron" size={22} style={{ transform: 'scaleX(-1)' }} /></button>
        </div>
      )}
    </div>
  );
}
