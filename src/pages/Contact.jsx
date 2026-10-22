import shopImg from '../assets/images/shop.jpg';
import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Btn, Icon, Field, Reveal } from '../components/ui';
import ChabaharMap, { DEPOT } from '../components/ChabaharMap';
import { cn, isMobile, normPhone, toFa, uid } from '../lib/utils';

export default function Contact() {
  const { state, update, toast } = useStore();
  const s = state.settings;
  const [form, setForm] = useState({ name: '', phone: '', text: '' });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim().length >= 3 && isMobile(form.phone) && form.text.trim().length >= 10;

  const send = () => {
    if (!valid) { setTouched(true); return; }
    update((st) => ({
      ...st,
      messages: [{ id: uid(), name: form.name.trim(), phone: normPhone(form.phone), text: form.text.trim(), at: Date.now(), read: false }, ...st.messages]
    }));
    setForm({ name: '', phone: '', text: '' }); setTouched(false);
    toast('پیام شما ثبت شد؛ در اولین فرصت تماس می‌گیریم.');
  };

  const wa = `https://wa.me/98${s.whatsapp.replace(/\D/g, '').replace(/^0/, '')}`;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">هر ساعتی، هر سوالی</span>
          <h1>تماس با ما</h1>
          <p style={{ marginInline: 'auto' }}>برای امداد فوری حتماً تماس بگیرید؛ برای بقیه موارد، پیام بگذارید.</p>
        </div>

        <div className="cards-grid" style={{ marginBottom: 40 }}>
          <Reveal><a className="card contact-card" href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} style={{ height: '100%' }}>
            <span className="svc-ic" style={{ background: 'linear-gradient(140deg,#2a0d0a,#571a14)', color: '#ff8d84' }}><Icon name="phone" size={23} /></span>
            <div><span>خط امداد شبانه‌روزی</span><b>{toFa(s.emergencyPhone)}</b></div>
          </a></Reveal>
          <Reveal delay={70}><a className="card contact-card" href={wa} target="_blank" rel="noreferrer" style={{ height: '100%' }}>
            <span className="svc-ic" style={{ background: 'rgba(23,178,106,.12)', color: 'var(--green)' }}><Icon name="whatsapp" size={23} /></span>
            <div><span>واتساپ (ارسال عکس و موقعیت)</span><b>{toFa(s.whatsapp)}</b></div>
          </a></Reveal>
          <Reveal delay={140}><a className="card contact-card" href={`tel:${s.officePhone.replace(/\s/g, '')}`} style={{ height: '100%' }}>
            <span className="svc-ic"><Icon name="headset" size={23} /></span>
            <div><span>دفتر (ساعات اداری)</span><b>{toFa(s.officePhone)}</b></div>
          </a></Reveal>
          <Reveal delay={210}><a className="card contact-card" href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" style={{ height: '100%' }}>
            <span className="svc-ic" style={{ background: 'rgba(139,92,246,.12)', color: 'var(--violet)' }}><Icon name="instagram" size={23} /></span>
            <div><span>اینستاگرام</span><b style={{ direction: 'ltr' }}>@{s.instagram}</b></div>
          </a></Reveal>
        </div>

        <div className="grid-2">
          <Reveal className="admin-panel">
            <h2 style={{ fontSize: '1.15rem', marginBottom: 6 }}>پیام بگذارید</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', marginBottom: 18 }}>سؤال، پیشنهاد یا انتقاد — همه خوانده می‌شود.</p>
            <div className="form-grid">
              <Field label="نام شما" error={touched && form.name.trim().length < 3 && 'نام را کامل بنویسید'}>
                <input className={cn('input', touched && form.name.trim().length < 3 && 'err')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="شماره موبایل" error={touched && !isMobile(form.phone) && 'شماره معتبر وارد کنید'}>
                <input className={cn('input', touched && !isMobile(form.phone) && 'err')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 6789" />
              </Field>
              <Field label="پیام شما" className="span2" error={touched && form.text.trim().length < 10 && 'پیام را کامل‌تر بنویسید'}>
                <textarea className={cn('input', touched && form.text.trim().length < 10 && 'err')} rows={4} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              </Field>
            </div>
            <Btn variant="primary" icon="check" onClick={send} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>ارسال پیام</Btn>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Reveal delay={80} className="admin-panel" style={{ padding: 18 }}>
              <ChabaharMap theme="light" areas={state.areas.filter((a) => a.active)} userPoint={DEPOT} />
              <div className="map-legend"><span><i className="lg" /> دفتر و انبار ما — {s.address}</span></div>
            </Reveal>
            <Reveal delay={140} className="card" style={{ display: 'flex', gap: 16 }}>
              <img src={shopImg} alt="فروشگاه امداد باتری چابهار" style={{ width: 150, height: 110, objectFit: 'cover', borderRadius: 14, flex: 'none' }} />
              <div>
                <h3 style={{ fontSize: '1rem' }}>فروشگاه و انبار</h3>
                <p style={{ fontSize: '.86rem', color: 'var(--muted)', margin: '6px 0' }}>{s.address}</p>
                <span style={{ fontSize: '.84rem', color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="clock" size={14} /> {s.hours}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
