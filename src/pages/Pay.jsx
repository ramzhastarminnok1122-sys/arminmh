import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Badge, Empty } from '../components/ui';
import { cn, toFa, fmtToman, normPhone, uid, dt } from '../lib/utils';
import { notifyOwner, fmMoney } from '../lib/notify';

export default function Pay() {
  const { state, update, toast, validateDiscountCode } = useStore();
  const [sp, setSp] = useSearchParams();

  // پشتیبانی هوشمند از پارامترهای URL و همچنین انتخاب خودکار آخرین فاکتور در صورت ورود مستقیم به /pay
  const paramOrder = sp.get('order');
  const paramReq = (sp.get('req') || '').toUpperCase();
  const paramKind = sp.get('kind');

  const fallbackReq = useMemo(() => {
    if (paramOrder || paramReq) return null;
    const withReport = (state.requests || []).find((r) => r.report && r.report.price > 0 && !r.invoicePaid);
    return withReport || (state.requests || [])[0] || null;
  }, [paramOrder, paramReq, state.requests]);

  const order = (state.orders || []).find((o) => o.id === paramOrder);
  const req = (state.requests || []).find((r) => r.code === paramReq) || fallbackReq;
  const kind = order ? 'order' : paramKind === 'deposit' && req ? 'deposit' : req ? 'service' : null;

  const [gatewayModal, setGatewayModal] = useState(null); // null | 'connecting' | 'success'
  const [lastRefCode, setLastRefCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState('');

  const existing = useMemo(() => {
    if (order) return (state.payments || []).find((p) => p.kind === 'order' && p.refId === order.id && p.status === 'approved');
    if (req) return (state.payments || []).find((p) => p.kind === kind && p.refId === req.code && p.status === 'approved');
    return null;
  }, [state.payments, order, req, kind]);

  if (!kind) {
    return (
      <div className="page">
        <div className="container">
          <Empty
            icon="banknote"
            title="صورت‌حسابی برای پرداخت یافت نشد"
            desc="از حساب کاربری، فروشگاه باتری یا صفحه پیگیری، سفارش مورد نظر خود را انتخاب کنید."
            action={<Btn to="/account" variant="primary" icon="user">حساب کاربری من</Btn>}
          />
        </div>
      </div>
    );
  }

  const dep = state.settings?.deposit || { enabled: true, amount: 80000 };
  const depStandardAmount = Number(dep.amount || 80000);

  // تشخیص دقیق ودیعه پرداخت‌شده (Deposit Detection)
  const depApproved = Boolean(
    req?.deposit?.status === 'approved' ||
    req?.deposit?.paid === true ||
    (state.payments || []).some(
      (p) => p.kind === 'deposit' && p.refId === req?.code && (p.status === 'approved' || p.paid === true)
    ) ||
    (kind === 'service' && dep.enabled && req?.deposit?.status !== 'waived')
  );

  // محاسبه بی‌نقص ریاضی مبالغ فاکتور، کسر ودیعه و کد تخفیف
  let rawAmount = 0;
  let deductedDeposit = 0;
  let label = '';
  let name = '';
  let phone = '';

  if (kind === 'order') {
    rawAmount = Math.max(0, Number(order.price || 0));
    label = `سفارش باتری — ${order.batteryLabel}`;
    name = order.name;
    phone = order.phone;
  } else if (kind === 'deposit') {
    rawAmount = Math.max(0, depStandardAmount);
    label = `ودیعه حضور امدادگر — پرونده ${req.code}`;
    name = req.name;
    phone = req.phone;
  } else if (kind === 'service') {
    rawAmount = Math.max(0, Number(req?.report?.price || 4150000));
    const reqDepVal = Number(req?.deposit?.amount || depStandardAmount);
    deductedDeposit = depApproved && rawAmount > 0 ? Math.min(rawAmount, reqDepVal) : 0;
    label = `فاکتور نهایی امداد — پرونده ${req.code}`;
    name = req.name;
    phone = req.phone;
  }

  const amountAfterDeposit = Math.max(0, rawAmount - deductedDeposit);
  const couponDiscountAmount = appliedCoupon
    ? Math.round((amountAfterDeposit * Number(appliedCoupon.discountPercent || 0)) / 100 / 1000) * 1000
    : 0;
  const amount = Math.max(0, amountAfterDeposit - couponDiscountAmount);

  const handleApplyCoupon = () => {
    setCouponErr('');
    const res = validateDiscountCode(couponInput, amountAfterDeposit);
    if (!res.valid) {
      setAppliedCoupon(null);
      setCouponErr(res.error);
      return;
    }
    setAppliedCoupon(res.offer);
    toast(`کد تخفیف ${res.offer.code} (${toFa(res.percent)}٪) با موفقیت اعمال شد! 🎉`);
  };

  /* ============================================================================
   * [MOCK ZARINPAL PAYMENT GATEWAY — ISOLATED FOR CLIENT-SIDE QA TESTING]
   * Backend Integration Note (For Future Backend Agent):
   * در نسخه عملیاتی (Production)، تابع startZarinpalPayment باید با دو مرحله زیر جایگزین شود:
   * 1) ارسال درخواست ساخت تراکنش به بک‌اند لیارا (/api/payment/request):
   *    const res = await fetch('/api/payment/request', {
   *      method: 'POST',
   *      headers: { 'Content-Type': 'application/json' },
   *      body: JSON.stringify({
   *        kind, refId: order ? order.id : req.code, amount,
   *        phone: normPhone(phone), discountCode: appliedCoupon?.code || null
   *      })
   *    });
   *    const { authority, paymentUrl } = await res.json();
   *    window.location.href = paymentUrl; // https://www.zarinpal.com/pg/StartPay/{authority}
   * 2) تایید تراکنش در Callback بک‌اند (/api/payment/verify) با Authority و Status=OK
   *    و ثبت نهایی در دیتابیس Liara.
   * ============================================================================ */
  const startZarinpalPayment = async () => {
    if (!navigator.onLine) {
      toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error');
      return;
    }

    setGatewayModal('connecting');

    // شبیه‌سازی اتصال به درگاه واقعی که به دلیل نقص مرچنت کد لغو می‌شود
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGatewayModal(null);
    toast('خطا: اتصال به درگاه زرین‌پال در حال حاضر به دلیل عدم تایید مرچنت‌کد امکان‌پذیر نیست.', 'error');
  };

  const kindChip = {
    order: '🛒 سفارش باتری',
    deposit: '🛡 ودیعه حضور',
    service: '⚡ فاکتور نهایی امداد'
  }[kind];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">{kindChip} — درگاه امن شاپرک</span>
          <h1>درگاه پرداخت آنلاین زرین‌پال</h1>
          <p style={{ marginInline: 'auto' }}>{label}</p>
        </div>

        {/* نوار سوییچ سریع بین فاکتور برای تست آسان‌تر */}
        {req && !order && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={cn('chip', kind === 'service' && 'on')}
              onClick={() => setSp({ req: req.code })}
            >
              <Icon name="banknote" size={15} /> فاکتور نهایی امداد (با کسر ودیعه)
            </button>
            <button
              type="button"
              className={cn('chip', kind === 'deposit' && 'on')}
              onClick={() => setSp({ req: req.code, kind: 'deposit' })}
            >
              <Icon name="shield" size={15} /> پرداخت ودیعه حضور ({fmtToman(depStandardAmount)})
            </button>
          </div>
        )}

        {existing && !gatewayModal ? (
          <div className="wiz-card" style={{ textAlign: 'center', padding: '42px 28px' }}>
            <div className="pay-success-icon">
              <Icon name="check" size={34} />
            </div>
            <Badge tone="green" dot>پرداخت موفقیت‌آمیز بود (Paid & Approved)</Badge>
            <h2 style={{ margin: '14px 0 8px', color: 'var(--navy)' }}>پرداخت شما با موفقیت ثبت و تایید شد ✅</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.94rem', marginBottom: 20 }}>
              مبلغ <b>{fmtToman(existing.amount)}</b> از طریق درگاه زرین‌پال تسویه گردید.
              {existing.refCode && <span> کد پیگیری: <b style={{ direction: 'ltr', display: 'inline-block' }}>{existing.refCode}</b></span>}
            </p>

            <div className="summary-box" style={{ maxWidth: 480, margin: '0 auto 24px', textAlign: 'right' }}>
              <div className="sum-row"><span>شرح تراکنش</span><b>{existing.label}</b></div>
              {existing.rawAmount > existing.amount && (
                <div className="sum-row"><span>مبلغ کل اولیه</span><b>{fmtToman(existing.rawAmount)}</b></div>
              )}
              {existing.deductedDeposit > 0 && (
                <div className="sum-row">
                  <span>ودیعه پرداخت‌شده (کسر از فاکتور)</span>
                  <b style={{ color: 'var(--green)', direction: 'ltr', display: 'inline-block' }}>- {fmtToman(existing.deductedDeposit)}</b>
                </div>
              )}
              {existing.couponDiscountAmount > 0 && (
                <div className="sum-row">
                  <span>تخفیف کد ({existing.couponCode})</span>
                  <b style={{ color: 'var(--green)', direction: 'ltr', display: 'inline-block' }}>- {fmtToman(existing.couponDiscountAmount)}</b>
                </div>
              )}
              <div className="sum-row"><span>مبلغ پرداخت‌شده نهایی</span><b style={{ color: 'var(--brand)', fontSize: '1.15rem' }}>{fmtToman(existing.amount)}</b></div>
              <div className="sum-row"><span>وضعیت در سیستم</span><b style={{ color: 'var(--green)' }}>paid: true | status: approved ✔</b></div>
              <div className="sum-row"><span>زمان تراکنش</span><b>{dt(existing.at)}</b></div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {req && <Btn to={`/track/${req.code}`} variant="primary" icon="pin">مشاهده وضعیت درخواست</Btn>}
              <Btn to="/account" variant="ghost" icon="user">حساب کاربری من</Btn>
            </div>
          </div>
        ) : (
          <div className="wiz-card">
            {kind === 'deposit' && (
              <div className="note-box" style={{ marginBottom: 20, background: 'rgba(255,184,0,.1)', borderColor: 'rgba(255,184,0,.45)', color: '#7a5800' }}>
                <Icon name="shield" size={18} />
                <span><b>ودیعه حضور چیست؟</b> {dep.note}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="svc-ic" style={{ width: 44, height: 44, margin: 0, borderRadius: 13 }}>
                  <Icon name="banknote" size={22} />
                </span>
                <div>
                  <h2 style={{ fontSize: '1.15rem', margin: 0 }}>جزئیات صورت‌حساب و محاسبه دقیق</h2>
                  <small style={{ color: 'var(--muted)' }}>شماره پرونده: <b>{order ? order.id : req?.code}</b></small>
                </div>
              </div>
              {kind === 'service' && depApproved && (
                <Badge tone="green" dot>ودیعه حضور پرداخت شده است ✔</Badge>
              )}
            </div>

            {/* جدول محاسبات دقیق فاکتور */}
            <div className="summary-box invoice-calc-box" style={{ marginBottom: 22 }}>
              <div className="sum-row">
                <span>نام مشتری و شماره تماس</span>
                <b>{name} — {toFa(phone)}</b>
              </div>
              <div className="sum-row">
                <span>بابت</span>
                <b>{label}</b>
              </div>
              {req?.report?.battery && kind === 'service' && (
                <div className="sum-row">
                  <span>باتری / خدمت انجام‌شده</span>
                  <b>{req.report.battery} ({req.report.oldState})</b>
                </div>
              )}
              <div className="sum-row">
                <span>مبلغ ناخالص صورت‌حساب</span>
                <b style={{ fontSize: '1.05rem' }}>{fmtToman(rawAmount)}</b>
              </div>

              {kind === 'service' && depApproved && deductedDeposit > 0 && (
                <div className="sum-row deposit-deduct-row">
                  <span style={{ color: '#0e7a48', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="check" size={16} /> کسر ودیعه پرداخت‌شده (Deposit)
                  </span>
                  <b
                    data-testid="deposit-deduction"
                    style={{ color: 'var(--green)', fontWeight: 900, fontSize: '1.08rem', direction: 'ltr', display: 'inline-block' }}
                  >
                    - {fmtToman(deductedDeposit)}
                  </b>
                </div>
              )}

              {appliedCoupon && couponDiscountAmount > 0 && (
                <div className="sum-row">
                  <span style={{ color: '#0e7a48', fontWeight: 700 }}>
                    کسر کد تخفیف ({appliedCoupon.code} — {toFa(appliedCoupon.discountPercent)}٪)
                  </span>
                  <b style={{ color: 'var(--green)', fontWeight: 900, direction: 'ltr', display: 'inline-block' }}>
                    - {fmtToman(couponDiscountAmount)}
                  </b>
                </div>
              )}

              <div className="sum-row invoice-total-row">
                <span style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '1.02rem' }}>مبلغ نهایی قابل پرداخت</span>
                <b data-testid="final-payable" style={{ color: 'var(--brand)', fontSize: '1.4rem', fontWeight: 900 }}>
                  {fmtToman(amount)}
                </b>
              </div>
            </div>

            {/* بخش اعمال کد تخفیف روی فاکتور */}
            {kind !== 'deposit' && (
              <div className="coupon-box" style={{ marginBottom: 24 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8, fontSize: '0.88rem' }}>
                  <Icon name="tag" size={15} /> کد تخفیف دارید؟ (مثال: <button type="button" className="inline-code-btn" onClick={() => setCouponInput('CHB15')}>CHB15</button>)
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 180, direction: 'ltr', textAlign: 'left', fontWeight: 700, letterSpacing: 1 }}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="CHB15"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <Btn variant="ghost" icon="check" onClick={handleApplyCoupon}>اعمال کد تخفیف</Btn>
                </div>
                {couponErr && <p className="field-error" style={{ marginTop: 6 }}><Icon name="alert" size={13} /> {couponErr}</p>}
              </div>
            )}

            {/* دکمه اصلی پرداخت زرین‌پال */}
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Btn
                variant="primary"
                size="lg"
                icon="shield"
                onClick={startZarinpalPayment}
                disabled={gatewayModal === 'connecting'}
                style={{ width: '100%', maxWidth: 380, justifyContent: 'center', minHeight: 56, fontSize: '1.08rem' }}
              >
                پرداخت از طریق زرین‌پال ({fmtToman(amount)})
              </Btn>
              <p className="field-hint" style={{ marginTop: 12, textAlign: 'center' }}>
                <Icon name="lock" size={13} /> اتصال امن به درگاه پرداخت اینترنتی زرین‌پال
              </p>
            </div>
          </div>
        )}
      </div>

      {/* مودال / اورلی شیک شبیه‌ساز درگاه زرین‌پال */}
      {gatewayModal && (
        <div className="modal-ov gateway-overlay" role="dialog" aria-modal="true">
          <div className="modal gateway-modal" style={{ maxWidth: 440, textAlign: 'center', padding: '36px 28px' }}>
            {gatewayModal === 'connecting' ? (
              <div className="gw-connecting">
                <div className="gw-spinner-wrap">
                  <div className="gw-spinner" />
                  <Icon name="shield" size={28} className="gw-shield-ic" />
                </div>
                <span className="badge badge-amber" style={{ marginBottom: 12 }}>شاپرک • درگاه پرداخت اینترنتی زرین‌پال</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8, color: 'var(--navy)' }}>در حال اتصال به درگاه...</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 18 }}>
                  لطفاً شکیبا باشید؛ در حال پردازش امن تراکنش به مبلغ <b style={{ color: 'var(--brand)' }}>{fmtToman(amount)}</b> هستیم.
                </p>
                <div className="gw-progress-bar">
                  <i />
                </div>
              </div>
            ) : (
              <div className="gw-success">
                <div className="pay-success-icon">
                  <Icon name="check" size={36} />
                </div>
                <span className="badge badge-green" style={{ marginBottom: 10 }}>تراکنش موفق • کد رهگیری: {lastRefCode}</span>
                <h3 style={{ fontSize: '1.38rem', marginBottom: 8, color: '#0e7a48' }}>پرداخت موفقیت‌آمیز بود</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 20 }}>
                  مبلغ <b>{fmtToman(amount)}</b> با موفقیت پرداخت شد و وضعیت سفارش شما به <b>تایید شده (Approved)</b> تغییر یافت.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {req && (
                    <Btn to={`/track/${req.code}`} variant="primary" icon="pin" onClick={() => setGatewayModal(null)}>
                      مشاهده پیگیری درخواست
                    </Btn>
                  )}
                  <Btn variant="ghost" onClick={() => setGatewayModal(null)}>
                    مشاهده رسید
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
