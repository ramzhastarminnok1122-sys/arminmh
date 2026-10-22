import heroVan from '../../assets/images/hero-van.jpg';
import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Btn, Icon, Field } from '../../components/ui';
import { cn } from '../../lib/utils';

export default function AdminLogin() {
  const { state, toast } = useStore();
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);

  if (localStorage.getItem('chb_admin') === '1') {
    return <Navigate to="/admin" replace />;
  }

  const submit = (e) => {
    e.preventDefault();
    if (pw === state.settings.adminPassword) {
      localStorage.setItem('chb_admin', '1');
      toast('خوش آمدید! ورود موفق بود.');
      nav('/admin', { replace: true });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      toast('رمز عبور نادرست است.', 'error');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-visual">
        <img src={heroVan} alt="" />
        <div>
          <span className="hero-badge"><i className="dot" /> سامانه مدیریت عملیات</span>
          <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>مرکز فرماندهی امداد</h1>
          <p style={{ color: 'rgba(255,255,255,.75)', maxWidth: 420 }}>
            از اینجا، نبض کسب‌وکار در دست شماست: درخواست‌ها، امدادگران، آفرها، قیمت‌ها و محتوای سایت.
          </p>
        </div>
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <Link to="/" className="logo" style={{ color: 'var(--navy)' }}>
            <span className="logo-mark"><Icon name="bolt" size={20} /></span>
            <span className="logo-text"><b>{state.settings.brandShort}</b><small>پنل مدیریت</small></span>
          </Link>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>ورود مدیر</h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 22 }}>برای دسترسی به داشبورد، رمز مدیریتی را وارد کنید.</p>
          <div className={cn('pw-field', shake && 'shake')}>
            <Field label="رمز عبور مدیریتی">
              <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)}
                placeholder="••••••" autoFocus autoComplete="current-password" />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="نمایش رمز">
                <Icon name="eye" size={17} />
              </button>
            </Field>
          </div>
          <Btn variant="dark" size="lg" icon="logout" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
            ورود به داشبورد
          </Btn>
          <p style={{ marginTop: 18, fontSize: '.82rem', color: 'var(--muted-2)', textAlign: 'center', display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Link to="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>← بازگشت به سایت</Link>
            <Link to="/tech/login" style={{ color: 'var(--muted)', fontWeight: 700 }}>ورود امدادگر ←</Link>
            <Link to="/owner" style={{ color: 'var(--brand)', fontWeight: 700 }}>پنل مدیر ←</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
