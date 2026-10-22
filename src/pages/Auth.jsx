import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Field, PhoneInput } from '../components/ui';
import { cn, isMobile, normPhone, nameError, toEn, toFa, uid } from '../lib/utils';

const CUST_KEY = 'chb_customer';
const MOCK_OTP_CODE = '12345';

export default function Auth() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/account';

  const [step, setStep] = useState(1); // 1: phone (& optional name), 2: otp verification
  const [f, setF] = useState({ phone: '', otp: '', name: '' });
  const [err, setErr] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [sending, setSending] = useState(false);

  const set = (p) => setF((prev) => ({ ...prev, ...p }));

  const existingUser = React.useMemo(() => {
    const p = normPhone(f.phone);
    if (!isMobile(p)) return null;
    return (state.users || []).find((x) => x.phone === p) || null;
  }, [f.phone, state.users]);

  /* ============================================================================
   * [MOCK OTP SENDER — ISOLATED FOR CLIENT-SIDE QA TESTING]
   * Backend Integration Note (For Future Backend Agent):
   * Replace the 3000ms mock timeout below with a real POST request to Kavenegar
   * proxy (/api/sms) و ذخیره توکن OTP در دیتابیس Liara PostgreSQL/MongoDB:
   *   const res = await fetch('/api/auth/send-otp', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ phone: normPhone(f.phone) })
   *   });
   * ============================================================================ */
  const sendOtp = async () => {
    if (!navigator.onLine) {
      const offlineMsg = 'شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.';
      toast(offlineMsg, 'error');
      setErr(offlineMsg);
      return;
    }
    if (!isMobile(f.phone)) {
      setErr('شماره موبایل معتبر (با پیش‌شماره اپراتورهای ایران، مانند 09153467788) وارد کنید.');
      return;
    }
    const p = normPhone(f.phone);
    const u = (state.users || []).find((x) => x.phone === p);
    if (u && u.blocked) {
      setErr('دسترسی این حساب مسدود شده است. لطفاً با پشتیبانی تماس بگیرید.');
      return;
    }

    setErr('');
    setSending(true);

    // [ISOLATED KAVENEGAR API CALL — DO NOT UNCOMMENT UNTIL PRODUCTION]
    // await fetch('/api/sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to: p, message: `کد تایید امداد باتری چابهار: ${MOCK_OTP_CODE}` })
    // });

    // شبیه‌سازی ۳ ثانیه انتظار ارسال پیامک (Mock Loading State)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setSending(false);
    setSentOtp(MOCK_OTP_CODE);
    if (u && u.name && !f.name) {
      set({ name: u.name });
    }
    toast('کد تستی شما: 12345', 'success');
    setStep(2);
  };

  /* ============================================================================
   * [MOCK OTP VERIFICATION & USER REGISTRATION — ISOLATED FOR CLIENT-SIDE QA]
   * Backend Integration Note (For Future Backend Agent):
   * Replace local OTP check & store.jsx mutation with Liara Backend API call:
   *   const res = await fetch('/api/auth/verify-otp', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ phone: normPhone(f.phone), otp: toEn(f.otp), name: f.name })
   *   });
   * ============================================================================ */
  const verifyOtp = () => {
    if (!navigator.onLine) {
      const offlineMsg = 'شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.';
      toast(offlineMsg, 'error');
      setErr(offlineMsg);
      return;
    }

    const enteredOtp = toEn(f.otp).trim();
    if (enteredOtp !== MOCK_OTP_CODE && enteredOtp !== sentOtp) {
      setErr('کد وارد شده اشتباه است. کد تستی صحیح: 12345');
      return;
    }

    const p = normPhone(f.phone);
    const existing = (state.users || []).find((x) => x.phone === p);
    const cleanName = (f.name || '').trim().replace(/\s+/g, ' ');

    if (!existing && cleanName && nameError(cleanName)) {
      setErr(nameError(cleanName));
      return;
    }

    setErr('');
    const finalName = existing?.name || cleanName || 'مشتری امداد چابهار';
    const userObj = existing
      ? { ...existing, name: cleanName || existing.name, verified: true, lastLoginAt: Date.now() }
      : {
          id: uid(),
          name: finalName,
          phone: p,
          verified: true,
          createdAt: Date.now(),
          blocked: false,
          bonusPoints: 15
        };

    // ذخیره کاربر در Mock DB (store.jsx -> LocalStorage 'chb_store_v1')
    update((s) => {
      const list = [...(s.users || [])];
      const idx = list.findIndex((x) => x.phone === p);
      if (idx >= 0) list[idx] = userObj;
      else list.unshift(userObj);
      return { ...s, users: list };
    });

    // ذخیره نشست کاربر جاری در LocalStorage ('chb_customer')
    localStorage.setItem(
      CUST_KEY,
      JSON.stringify({ id: userObj.id, name: userObj.name, phone: userObj.phone })
    );

    toast(`ورود موفق! خوش آمدید ${userObj.name} 🎉`, 'success');
    nav(next, { replace: true });
  };

  return (
    <div className="page auth-page">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">احراز هویت سریع و امن</span>
          <h1>ورود و ثبت‌نام با پیامک</h1>
          <p style={{ marginInline: 'auto' }}>
            با ورود به حساب کاربری، درخواست امداد فوری ثبت می‌کنید، فاکتورها را آنلاین پرداخت می‌کنید و از تخفیف باشگاه مشتریان بهره‌مند می‌شوید.
          </p>
        </div>

        <div className="wiz-card auth-card">
          {step === 1 && (
            <>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
                <Field label="شماره موبایل" hint="کد تایید ۵ رقمی به این شماره ارسال می‌شود">
                  <PhoneInput value={f.phone} onChange={(v) => set({ phone: v })} autoFocus />
                </Field>

                {!existingUser && (
                  <Field
                    label="نام و نام خانوادگی (اختیاری — جهت درج در فاکتور و گارانتی)"
                    hint="مثال: علی بلوچ‌زایی"
                  >
                    <input
                      className="input"
                      value={f.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="مثلاً: علی بلوچ‌زایی"
                      onKeyDown={(e) => e.key === 'Enter' && !sending && sendOtp()}
                    />
                  </Field>
                )}

                {existingUser && (
                  <div className="note-box" style={{ background: 'rgba(23, 178, 106, 0.08)', borderColor: 'rgba(23, 178, 106, 0.3)', color: '#0e7a48' }}>
                    <Icon name="check" size={16} />
                    <span>حساب کاربری <b>{existingUser.name}</b> شناسایی شد. برای ورود، کد تایید را دریافت کنید.</span>
                  </div>
                )}
              </div>

              {err && (
                <p className="field-error" style={{ marginTop: 12 }}>
                  <Icon name="alert" size={14} /> {err}
                </p>
              )}

              <Btn
                variant="primary"
                icon={sending ? 'clock' : 'send'}
                disabled={sending}
                onClick={sendOtp}
                style={{ width: '100%', justifyContent: 'center', marginTop: 18, minHeight: 52 }}
              >
                {sending ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <i className="btn-spinner" /> در حال ارسال پیامک تایید (۳ ثانیه)...
                  </span>
                ) : (
                  'دریافت کد تایید پیامکی'
                )}
              </Btn>
            </>
          )}

          {step === 2 && (
            <>
              {/* حباب پیامک شبیه‌سازی‌شده برای تست سریع */}
              <div className="sms-bubble">
                <div className="sms-head">
                  <Icon name="phone" size={14} />
                  <span>پیامک شبیه‌ساز (Mock SMS)</span>
                  <small>هم‌اکنون</small>
                </div>
                <p style={{ marginBottom: 8 }}>
                  کد تستی شما: <b style={{ fontSize: '1.1rem', color: 'var(--brand)', letterSpacing: 2 }}>12345</b>
                </p>
                <button
                  type="button"
                  className="chip"
                  style={{ fontSize: '0.78rem', padding: '5px 12px', background: '#fff' }}
                  onClick={() => set({ otp: '12345' })}
                >
                  <Icon name="check" size={13} /> درج خودکار کد ۱۲۳۴۵
                </button>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                <Field
                  label={`کد ۵ رقمی ارسال‌شده به ${toFa(f.phone)}`}
                  hint="برای تست، عدد 12345 را وارد نمایید"
                >
                  <input
                    className="input otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    autoFocus
                    value={f.otp}
                    onChange={(e) => set({ otp: toEn(e.target.value).replace(/\D/g, '') })}
                    placeholder="1 2 3 4 5"
                    onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  />
                </Field>

                {!existingUser && (
                  <Field
                    label="نام و نام خانوادگی (جهت ثبت در گارانتی)"
                    hint="در صورت تمایل نام خود را کامل بنویسید"
                  >
                    <input
                      className="input"
                      value={f.name}
                      onChange={(e) => set({ name: e.target.value })}
                      placeholder="مثلاً: عبدالله زهی"
                      onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                    />
                  </Field>
                )}
              </div>

              {err && (
                <p className="field-error" style={{ marginTop: 10 }}>
                  <Icon name="alert" size={14} /> {err}
                </p>
              )}

              <Btn
                variant="primary"
                icon="check"
                onClick={verifyOtp}
                style={{ width: '100%', justifyContent: 'center', marginTop: 16, minHeight: 52 }}
              >
                تایید کد و ورود به حساب
              </Btn>

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setStep(1);
                    setErr('');
                    set({ otp: '' });
                  }}
                >
                  اصلاح شماره موبایل
                </button>
              </div>
            </>
          )}

          <div className="note-box" style={{ marginTop: 22, fontSize: '.82rem', background: '#f8fafc', borderColor: '#e2e8f0', color: 'var(--muted)' }}>
            <Icon name="shield" size={16} />
            <span>
              ورود شما از طریق رمز یکبارمصرف (OTP) انجام می‌شود و کاملاً امن است. (حالت شبیه‌ساز فعال است — کد تستی: <b>12345</b>)
            </span>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: '.88rem', color: 'var(--muted)' }}>
          <Link to="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>← بازگشت به صفحه اصلی</Link>
        </p>
      </div>
    </div>
  );
}
