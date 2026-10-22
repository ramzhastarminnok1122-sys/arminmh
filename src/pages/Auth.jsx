import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Field, PhoneInput } from '../components/ui';
import { cn, isMobile, normPhone, nameError, uid } from '../lib/utils';

const CUST_KEY = 'chb_customer';

export default function Auth() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/account';
  
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: name (for new user)
  const [f, setF] = useState({ phone: '', otp: '', name: '' });
  const [err, setErr] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const set = (p) => setF((prev) => ({ ...prev, ...p }));

  const sendOtp = async () => {
    if (!navigator.onLine) {
      setErr('شما به اینترنت متصل نیستید. لطفا اتصال خود را بررسی کنید.');
      return;
    }
    if (!isMobile(f.phone)) {
      setErr('شماره موبایل معتبر (با پیش‌شماره اپراتورهای ایران) وارد کنید');
      return;
    }
    setErr('');
    const p = normPhone(f.phone);
    const u = (state.users || []).find((x) => x.phone === p);
    
    if (u && u.blocked) {
      setErr('دسترسی این حساب مسدود شده است. تماس بگیرید.');
      return;
    }

    setIsNewUser(!u);
    
    // Generate a random 5 digit OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setSentOtp(code);
    
    // In a real app, you would call an API like /api/sms here
    // fetch('/api/sms', { method: 'POST', body: JSON.stringify({ to: p, message: `کد ورود شما: ${code}` }) })
    
    toast(`کد تایید ارسال شد (کد تستی: ${code})`);
    setStep(2);
  };

  const verifyOtp = () => {
    if (f.otp !== sentOtp) {
      setErr('کد وارد شده اشتباه است');
      return;
    }
    setErr('');
    
    if (isNewUser) {
      setStep(3); // Go to name entry
    } else {
      // Login existing user
      const p = normPhone(f.phone);
      const u = (state.users || []).find((x) => x.phone === p);
      if (u) {
        localStorage.setItem(CUST_KEY, JSON.stringify({ id: u.id, name: u.name, phone: u.phone }));
        toast(`خوش آمدید، ${u.name}!`);
        nav(next, { replace: true });
      }
    }
  };

  const completeRegistration = () => {
    const e1 = nameError(f.name);
    if (e1) { setErr(e1); return; }
    
    const p = normPhone(f.phone);
    const u = { 
      id: uid(), 
      name: f.name.trim().replace(/\s+/g, ' '), 
      phone: p, 
      verified: true, 
      createdAt: Date.now(), 
      blocked: false, 
      bonusPoints: 0 
    };
    
    update((s) => ({ ...s, users: [...(s.users || []), u] }));
    localStorage.setItem(CUST_KEY, JSON.stringify({ id: u.id, name: u.name, phone: u.phone }));
    toast(`حساب شما ساخته شد؛ خوش آمدید ${u.name}! 🎉`);
    nav(next, { replace: true });
  };

  return (
    <div className="page auth-page">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">حساب کاربری امن</span>
          <h1>ورود / ثبت‌نام با پیامک</h1>
          <p style={{ marginInline: 'auto' }}>
            با ورود به حساب، درخواست امداد ثبت می‌کنید، ودیعه و فاکتورها را پرداخت می‌کنید و امتیاز باشگاه مشتریان می‌گیرید.
          </p>
        </div>

        <div className="wiz-card">
          {step === 1 && (
            <>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Field label="شماره موبایل">
                  <PhoneInput value={f.phone} onChange={(v) => set({ phone: v })} />
                </Field>
              </div>
              {err && <p className="field-error" style={{ marginTop: 8 }}><Icon name="alert" size={14} /> {err}</p>}
              <Btn variant="dark" icon="send" onClick={sendOtp} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>دریافت کد تایید</Btn>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Field label="کد تایید پیامک شده">
                  <input 
                    className="input" 
                    type="text" 
                    maxLength={5} 
                    style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }}
                    value={f.otp} 
                    onChange={(e) => set({ otp: e.target.value.replace(/\D/g, '') })} 
                    placeholder="- - - - -" 
                    onKeyDown={(e) => e.key === 'Enter' && verifyOtp()} 
                  />
                </Field>
              </div>
              {err && <p className="field-error" style={{ marginTop: 8 }}><Icon name="alert" size={14} /> {err}</p>}
              <Btn variant="dark" icon="check" onClick={verifyOtp} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>بررسی کد</Btn>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setStep(1); setErr(''); set({otp: ''}); }}>اصلاح شماره موبایل</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p style={{ textAlign: 'center', marginBottom: 16, fontSize: '0.9rem', color: 'var(--brand)' }}>
                شماره شما تایید شد! برای تکمیل ثبت‌نام نام خود را وارد کنید.
              </p>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Field label="نام و نام خانوادگی" hint="همان نامی که روی فاکتور و گارانتی می‌خواهید">
                  <input className={cn('input', nameError(f.name) && f.name.length > 0 && 'err')} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="مثلاً: عبدالله زهی" onKeyDown={(e) => e.key === 'Enter' && completeRegistration()} />
                </Field>
              </div>
              {err && <p className="field-error" style={{ marginTop: 8 }}><Icon name="alert" size={14} /> {err}</p>}
              <Btn variant="dark" icon="user" onClick={completeRegistration} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>تکمیل ثبت‌نام و ورود</Btn>
            </>
          )}

          <div className="note-box" style={{ marginTop: 24, fontSize: '.82rem' }}>
            <Icon name="shield" size={15} /> ورود شما از طریق رمز یکبارمصرف (OTP) انجام می‌شود و کاملاً امن است. دیگر نیازی به حفظ رمز عبور ندارید.
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '.85rem', color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>← بازگشت به سایت</Link>
        </p>
      </div>
    </div>
  );
}
