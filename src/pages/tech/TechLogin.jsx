import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Btn, Icon, Field } from '../../components/ui';
import { cn, toFa, hashPw } from '../../lib/utils';
import heroVan from '../../assets/images/hero-van.jpg';

const TECH_KEY = 'chb_tech';

export default function TechLogin() {
  const { state, toast } = useStore();
  const nav = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [shake, setShake] = useState(false);

  if (localStorage.getItem(TECH_KEY)) return <Navigate to="/tech" replace />;

  const submit = (e) => {
    e.preventDefault();
    const t = (state.technicians || []).find((x) => x.id === id);
    if (!t) { toast('امدادگر را انتخاب کنید', 'error'); return; }
    if ((t.password ? hashPw(t.password) : hashPw('1234')) !== hashPw(pw)) {
      setShake(true); setTimeout(() => setShake(false), 450);
      toast('رمز نادرست است.', 'error');
      return;
    }
    localStorage.setItem(TECH_KEY, t.id);
    toast(`${t.name} عزیز، خوش آمدی! شیفتت پربار باشه 💪`);
    nav('/tech', { replace: true });
  };

  return (
    <div className="login-wrap">
      <div className="login-visual">
        <img src={heroVan} alt="" />
        <div>
          <span className="hero-badge"><i className="dot" /> پنل عملیات میدانی</span>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>پنل امدادگر</h1>
          <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: 420 }}>
            ماموریت‌های امروز، مسیریابی، ثبت گزارش عملیات و هماهنگی با مرکز — همه یکجا، حتی با اینترنت ضعیف.
          </p>
        </div>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <Link to="/" className="logo" style={{ color: 'var(--navy)' }}>
            <span className="logo-mark"><Icon name="bolt" size={20} /></span>
            <span className="logo-text"><b>{state.settings.brandShort}</b><small>ورود امدادگر</small></span>
          </Link>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>ورود به پنل امدادگر</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 22 }}>نام خودت را انتخاب و رمز شیفت را وارد کن.</p>
          <Field label="امدادگر">
            <select className="input" value={id} onChange={(e) => setId(e.target.value)}>
              <option value="">انتخاب کنید…</option>
              {(state.technicians || []).map((t) => <option key={t.id} value={t.id}>{t.name} — {toFa(t.zone)}</option>)}
            </select>
          </Field>
          <div className={cn('pw-field', shake)}>
            <Field label="رمز عبور">
              <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••" autoComplete="current-password" />
            </Field>
          </div>
          <Btn variant="dark" size="lg" icon="logout" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            ورود به پنل
          </Btn>
          <p style={{ marginTop: 18, fontSize: '.82rem', color: 'var(--muted-2)', textAlign: 'center', display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Link to="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>← بازگشت به سایت</Link>
            <Link to="/owner" style={{ color: 'var(--brand)', fontWeight: 700 }}>پنل مدیر ←</Link>
            <Link to="/admin/login" style={{ color: 'var(--muted)', fontWeight: 700 }}>ورود مدیر ←</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
