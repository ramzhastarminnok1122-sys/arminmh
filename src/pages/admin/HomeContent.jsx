import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Field, Switch } from '../../components/ui';
import { ICON_CHOICES } from '../../lib/seed';
import { uid } from '../../lib/utils';

export default function HomeContent() {
  const { state, update, toast } = useStore();
  const hc = state.homeContent;

  const setHero = (k, v) => update((s) => ({ ...s, homeContent: { ...s.homeContent, hero: { ...s.homeContent.hero, [k]: v } } }));
  const setSec = (sec, part) => update((s) => ({ ...s, homeContent: { ...s.homeContent, [sec]: { ...s.homeContent[sec], ...part } } }));

  const addTrust = () => update((s) => ({
    ...s, homeContent: { ...s.homeContent, trust: { ...s.homeContent.trust, items: [...s.homeContent.trust.items, { icon: 'check', title: 'عنوان جدید', desc: 'توضیح کوتاه' }] } }
  }));
  const editTrust = (i, part) => update((s) => ({
    ...s, homeContent: { ...s.homeContent, trust: { ...s.homeContent.trust, items: s.homeContent.trust.items.map((x, j) => j === i ? { ...x, ...part } : x) } }
  }));
  const delTrust = (i) => update((s) => ({
    ...s, homeContent: { ...s.homeContent, trust: { ...s.homeContent.trust, items: s.homeContent.trust.items.filter((_, j) => j !== i) } }
  }));

  const moveTrust = (i, dir) => update((s) => {
    const arr = [...s.homeContent.trust.items];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return s;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...s, homeContent: { ...s.homeContent, trust: { ...s.homeContent.trust, items: arr } } };
  });

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>بخش Hero (بالای صفحه اصلی)</h2><p>تغییرات بلافاصله روی سایت اعمال می‌شود</p></div>
          <Link2 />
        </div>
        <div className="form-grid">
          <Field label="نشان بالای تیتر"><input className="input" value={hc.hero.badge} onChange={(e) => setHero('badge', e.target.value)} /></Field>
          <Field label="تیتر اصلی"><input className="input" value={hc.hero.title} onChange={(e) => setHero('title', e.target.value)} /></Field>
          <Field label="زیرتیتر" className="span2"><textarea className="input" rows={2} value={hc.hero.subtitle} onChange={(e) => setHero('subtitle', e.target.value)} /></Field>
          <Field label="متن دکمه اصلی (قرمز)"><input className="input" value={hc.hero.cta1} onChange={(e) => setHero('cta1', e.target.value)} /></Field>
          <Field label="متن دکمه دوم"><input className="input" value={hc.hero.cta2} onChange={(e) => setHero('cta2', e.target.value)} /></Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>آمار برجسته</h2></div>
          <Switch checked={hc.stats.enabled} onChange={(v) => setSec('stats', { enabled: v })} label="نمایش بخش" />
        </div>
        <div className="form-grid">
          {hc.stats.items.map((it, i) => (
            <React.Fragment key={i}>
              <Field label={`عدد ${i + 1}`}><input className="input" value={it.n} onChange={(e) => setSec('stats', { items: hc.stats.items.map((x, j) => j === i ? { ...x, n: e.target.value } : x) })} /></Field>
              <Field label={`برچسب ${i + 1}`}><input className="input" value={it.l} onChange={(e) => setSec('stats', { items: hc.stats.items.map((x, j) => j === i ? { ...x, l: e.target.value } : x) })} /></Field>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>نوار اعتماد</h2><p>چهار مزیت زیر Hero</p></div>
          <Switch checked={hc.trust.enabled} onChange={(v) => setSec('trust', { enabled: v })} label="نمایش بخش" />
        </div>
        {hc.trust.items.map((t, i) => (
          <div key={i} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div className="form-grid" style={{ alignItems: 'end' }}>
              <Field label="آیکون">
                <select className="input" value={t.icon} onChange={(e) => editTrust(i, { icon: e.target.value })}>
                  {ICON_CHOICES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </Field>
              <Field label="عنوان"><input className="input" value={t.title} onChange={(e) => editTrust(i, { title: e.target.value })} /></Field>
              <Field label="توضیح" className="span2"><input className="input" value={t.desc} onChange={(e) => editTrust(i, { desc: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button className="icon-btn" onClick={() => moveTrust(i, -1)} aria-label="بالا"><Icon name="chevron" size={16} style={{ transform: 'rotate(-90deg)' }} /></button>
              <button className="icon-btn" onClick={() => moveTrust(i, 1)} aria-label="پایین"><Icon name="chevron" size={16} style={{ transform: 'rotate(90deg)' }} /></button>
              <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => delTrust(i)} aria-label="حذف"><Icon name="trash" size={16} /></button>
            </div>
          </div>
        ))}
        <Btn variant="ghost" icon="plus" onClick={addTrust}>افزودن مورد اعتماد</Btn>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>تیتر بخش‌های صفحه اصلی</h2></div></div>
        <div className="form-grid">
          {[['services', 'خدمات'], ['offers', 'آفرها'], ['reviews', 'نظرات'], ['cta', 'دعوت به اقدام']].map(([sec, label]) => (
            <React.Fragment key={sec}>
              <Field label={`تیتر «${label}»`}>
                <input className="input" value={hc[sec].title} onChange={(e) => setSec(sec, { title: e.target.value })} />
              </Field>
              <Field label={`توضیح «${label}»`}>
                <input className="input" value={hc[sec].desc || ''} onChange={(e) => setSec(sec, { desc: e.target.value })} />
              </Field>
            </React.Fragment>
          ))}
        </div>
        <div className="panel-head" style={{ marginTop: 14 }}>
          <Switch checked={hc.services.enabled} onChange={(v) => setSec('services', { enabled: v })} label="بخش خدمات" />
          <Switch checked={hc.offers.enabled} onChange={(v) => setSec('offers', { enabled: v })} label="بخش آفرها" />
          <Switch checked={hc.reviews.enabled} onChange={(v) => setSec('reviews', { enabled: v })} label="بخش نظرات" />
          <Switch checked={hc.cta.enabled} onChange={(v) => setSec('cta', { enabled: v })} label="بخش دعوت پایانی" />
        </div>
        <div className="form-grid">
          <Field label="تیتر بخش دعوت"><input className="input" value={hc.cta.title} onChange={(e) => setSec('cta', { title: e.target.value })} /></Field>
          <Field label="متن دکمه دعوت"><input className="input" value={hc.cta.btn} onChange={(e) => setSec('cta', { btn: e.target.value })} /></Field>
          <Field label="توضیح دعوت" className="span2"><input className="input" value={hc.cta.desc} onChange={(e) => setSec('cta', { desc: e.target.value })} /></Field>
        </div>
      </div>
    </>
  );
}

function Link2() {
  const { toast } = useStore();
  return <span style={{ fontSize: '.82rem', color: 'var(--muted-2)', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="info" size={14} /> ذخیره خودکار</span>;
}
