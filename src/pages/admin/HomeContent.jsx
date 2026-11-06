import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Field, Switch } from '../../components/ui';
import { ICON_CHOICES } from '../../lib/seed';

export default function HomeContent() {
  const { state, update, toast } = useStore();
  const [hc, setHc] = useState(JSON.parse(JSON.stringify(state.homeContent)));

  // Update local state if global state changes (only on mount ideally to avoid wiping edits)
  useEffect(() => {
    if(!hc.hero.overlayColor) {
      setHc(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          bgDesktop: prev.hero.bgDesktop || '',
          bgMobile: prev.hero.bgMobile || '',
          overlayColor: prev.hero.overlayColor || '#0a1226',
          overlayOpacity: prev.hero.overlayOpacity !== undefined ? prev.hero.overlayOpacity : 85,
          overlayBlur: prev.hero.overlayBlur !== undefined ? prev.hero.overlayBlur : 0
        }
      }));
    }
  }, []);

  const save = () => {
    update(s => ({ ...s, homeContent: hc }));
    toast('تغییرات صفحه اصلی با موفقیت ذخیره شد.', 'success');
  };

  const setHero = (k, v) => setHc(s => ({ ...s, hero: { ...s.hero, [k]: v } }));
  const setSec = (sec, part) => setHc(s => ({ ...s, [sec]: { ...s[sec], ...part } }));

  const addTrust = () => setHc(s => ({
    ...s, trust: { ...s.trust, items: [...s.trust.items, { icon: 'check', title: 'عنوان جدید', desc: 'توضیح کوتاه' }] }
  }));
  const editTrust = (i, part) => setHc(s => ({
    ...s, trust: { ...s.trust, items: s.trust.items.map((x, j) => j === i ? { ...x, ...part } : x) }
  }));
  const delTrust = (i) => setHc(s => ({
    ...s, trust: { ...s.trust, items: s.trust.items.filter((_, j) => j !== i) }
  }));
  const moveTrust = (i, dir) => setHc(s => {
    const arr = [...s.trust.items];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return s;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...s, trust: { ...s.trust, items: arr } };
  });

  const uploadImage = (key) => (e) => {
    const f = e.target.files?.[0];
    if(!f) return;
    if(f.size > 800 * 1024) { alert('حجم تصویر باید کمتر از 800 کیلوبایت باشد'); return; }
    const r = new FileReader();
    r.onload = () => setHero(key, r.result);
    r.readAsDataURL(f);
  };

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface)', padding: '10px 0', borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
          <div><h2>بخش Hero (بالای صفحه اصلی)</h2><p>پس از اتمام تغییرات، روی دکمه ذخیره کلیک کنید</p></div>
          <Btn onClick={save} icon="check">ذخیره نهایی تغییرات</Btn>
        </div>
        
        <h3 style={{ marginBottom: 16 }}>متن‌ها و دکمه‌ها</h3>
        <div className="form-grid">
          <Field label="نشان بالای تیتر"><input className="input" value={hc.hero.badge} onChange={(e) => setHero('badge', e.target.value)} /></Field>
          <Field label="تیتر اصلی"><input className="input" value={hc.hero.title} onChange={(e) => setHero('title', e.target.value)} /></Field>
          <Field label="زیرتیتر" className="span2"><textarea className="input" rows={2} value={hc.hero.subtitle} onChange={(e) => setHero('subtitle', e.target.value)} /></Field>
          <Field label="متن دکمه اصلی (قرمز)"><input className="input" value={hc.hero.cta1} onChange={(e) => setHero('cta1', e.target.value)} /></Field>
          <Field label="متن دکمه دوم"><input className="input" value={hc.hero.cta2} onChange={(e) => setHero('cta2', e.target.value)} /></Field>
        </div>

        <h3 style={{ marginTop: 32, marginBottom: 16 }}>تصویر پس‌زمینه و فیلتر تاریکی</h3>
        <div className="form-grid">
          <Field label="تصویر پس‌زمینه کامپیوتر (Landscape)" hint="ابعاد پیشنهادی: 1920x1080">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {hc.hero.bgDesktop && <img src={hc.hero.bgDesktop} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} alt="" />}
              <label className="btn btn-outline-brand btn-sm" style={{ cursor: 'pointer' }}>
                <Icon name="image" /> انتخاب عکس
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadImage('bgDesktop')} />
              </label>
              {hc.hero.bgDesktop && <button className="btn btn-outline-red btn-sm" onClick={() => setHero('bgDesktop', '')}>حذف</button>}
            </div>
          </Field>
          
          <Field label="تصویر پس‌زمینه موبایل (Portrait)" hint="ابعاد پیشنهادی: 1080x1920 (اگر خالی باشد از همان عکس کامپیوتر استفاده می‌شود)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {hc.hero.bgMobile && <img src={hc.hero.bgMobile} style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} alt="" />}
              <label className="btn btn-outline-brand btn-sm" style={{ cursor: 'pointer' }}>
                <Icon name="image" /> انتخاب عکس
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadImage('bgMobile')} />
              </label>
              {hc.hero.bgMobile && <button className="btn btn-outline-red btn-sm" onClick={() => setHero('bgMobile', '')}>حذف</button>}
            </div>
          </Field>

          <Field label="رنگ فیلتر روی عکس">
            <input type="color" className="input" style={{ padding: 4, height: 44 }} value={hc.hero.overlayColor || '#0a1226'} onChange={(e) => setHero('overlayColor', e.target.value)} />
          </Field>
          <Field label={`میزان تاریکی: ${hc.hero.overlayOpacity}%`}>
            <input type="range" min="0" max="100" value={hc.hero.overlayOpacity || 85} onChange={(e) => setHero('overlayOpacity', Number(e.target.value))} />
          </Field>
          <Field label={`میزان تار شدن (Blur): ${hc.hero.overlayBlur}px`}>
            <input type="range" min="0" max="20" value={hc.hero.overlayBlur || 0} onChange={(e) => setHero('overlayBlur', Number(e.target.value))} />
          </Field>
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
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 10 }}>
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
      
      <div style={{ position: 'sticky', bottom: 16, background: 'var(--surface)', padding: 16, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
        <div><b>تغییرات را اعمال کنید</b><p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>تغییرات تا ذخیره نشوند به کاربران نمایش داده نمی‌شوند</p></div>
        <Btn onClick={save} icon="check" size="lg">ذخیره نهایی</Btn>
      </div>
    </>
  );
}
