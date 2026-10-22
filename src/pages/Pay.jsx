import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Field, Badge, Empty } from '../components/ui';
import { cn, toFa, fmtToman, normPhone, uid, compressImage } from '../lib/utils';
import { notifyOwner, fmMoney } from '../lib/notify';

export default function Pay() {
  const { state, update, toast } = useStore();
  const [sp] = useSearchParams();
  const order = (state.orders || []).find((o) => o.id === sp.get('order'));
  const req = (state.requests || []).find((r) => r.code === (sp.get('req') || '').toUpperCase());
  const kind = order ? 'order' : sp.get('kind') === 'deposit' && req ? 'deposit' : req ? 'service' : null;

  const [gotPic, setGotPic] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);

  const existing = useMemo(() => {
    if (order) return (state.payments || []).find((p) => p.kind === 'order' && p.refId === order.id);
    if (req) return (state.payments || []).find((p) => p.kind === kind && p.refId === req.code);
    return null;
  }, [state.payments, order, req, kind]);

  if (!kind) {
    return <div className="page"><div className="container"><Empty icon="banknote" title="صورتحسابی پیدا نشد" desc="از حساب کاربری یا صفحه پیگیری، موردنظر را انتخاب کنید."
      action={<Btn to="/account" variant="dark" icon="user">حساب کاربری من</Btn>} /></div></div>;
  }

  const card = state.settings.payCard || {};
  const dep = state.settings.deposit || { amount: 0 };
  const depApproved = req?.deposit?.status === 'approved' || (state.payments || []).some((p) => p.kind === 'deposit' && p.refId === req?.code && p.status === 'approved');

  let amount = 0, label = '', name = '', phone = '';
  if (kind === 'order') { amount = order.price; label = `سفارش باتری — ${order.batteryLabel}`; name = order.name; phone = order.phone; }
  if (kind === 'deposit') { amount = dep.amount || 0; label = `ودیعه حضور — ${req.code}`; name = req.name; phone = req.phone; }
  if (kind === 'service') {
    const raw = req?.report?.price ?? 0;
    amount = Math.max(0, raw - (depApproved ? (dep.amount || 0) : 0));
    label = `فاکتور امداد — ${req.code}`; name = req.name; phone = req.phone;
  }

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { setReceipt(await compressImage(file, 1100, 0.75)); }
    catch { toast('خواندن فایل ممکن نشد؛ عکس دیگری انتخاب کنید.', 'error'); }
    setBusy(false);
  };

  const submit = () => {
    if (!gotPic) { toast('قبل از پرداخت، حتماً از رسید عکس بگیرید و تیک آن را بزنید.', 'error'); return; }
    if (!receipt) { toast('عکس فیش واریز را آپلود کنید.', 'error'); return; }
    const pay = {
      id: uid(), kind, refId: order ? order.id : req.code, label,
      name, phone: normPhone(phone), amount, receipt,
      status: 'pending', at: Date.now(), note: ''
    };
    update((s) => {
      let next = { ...s, payments: [pay, ...(s.payments || [])] };
      if (kind === 'order') next.orders = s.orders.map((o) => o.id === order.id ? { ...o, status: 'در انتظار تایید پرداخت' } : o);
      if (kind === 'deposit') next.requests = s.requests.map((r) => r.code === req.code ? { ...r, deposit: { ...(r.deposit || {}), status: 'pending', paid: true } } : r);
      if (kind === 'service') next.requests = s.requests.map((r) => r.code === req.code ? { ...r, invoiceSubmitted: true } : r);
      return next;
    });
    toast(kind === 'deposit' ? 'فیش ودیعه ثبت شد؛ پس از تایید، امدادگر اعزام می‌شود.' : 'فیش شما ثبت شد؛ حداکثر تا چند دقیقه تایید می‌شود.');
    notifyOwner(state, {
      title: `🧾 فیش جدید (${kind === 'deposit' ? 'ودیعه' : kind === 'service' ? 'فاکتور امداد' : 'سفارش باتری'})`,
      body: `${name} — ${toFa(phone)}\nمبلغ: ${fmMoney(amount)} تومان\nبرای تایید، پنل صاحب‌کار را ببینید.`
    });
  };

  const kindChip = { order: '🛒 سفارش باتری', deposit: '🛡 ودیعه حضور', service: '⚡ فاکتور امداد' }[kind];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">{kindChip} — درگاه امن بانکی</span>
          <h1>درگاه پرداخت زرین‌پال</h1>
          <p style={{ marginInline: 'auto' }}>{label}</p>
        </div>

        {existing ? (
          <div className="wiz-card" style={{ textAlign: 'center' }}>
            <Badge tone={existing.status === 'approved' ? 'green' : existing.status === 'rejected' ? 'red' : 'amber'} dot>
              {existing.status === 'approved' ? 'تایید شد' : existing.status === 'rejected' ? 'رد شد' : 'در انتظار تایید'}
            </Badge>
            <h2 style={{ margin: '12px 0 6px' }}>
              {existing.status === 'approved' ? 'پرداخت شما تایید شد ✅' : existing.status === 'rejected' ? 'فیش تایید نشد' : 'در حال اتصال به درگاه'}
            </h2>
            <div style={{ marginTop: 14, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {req && <Link to={`/track/${req.code}`} className="card-link">بازگشت به پیگیری ←</Link>}
              <Link to="/account" className="card-link">حساب کاربری ←</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="note-box" style={{ marginBottom: 18, background: '#f5f8ff', borderColor: '#cfe0ff', color: '#1e6bff' }}>
              <Icon name="shield" size={18} />
              <span><b>توجه (نسخه تستی):</b> به دلیل اینکه درگاه شما در زرین‌پال در حال بررسی است، این دکمه فعلاً حالت نمایشی (تستی) دارد تا صاحب‌کار بتواند روال پرداخت را ببیند. به‌محض تایید زرین‌پال، این دکمه به درگاه واقعی متصل می‌شود.</span>
            </div>

            {kind === 'deposit' && (
              <div className="note-box" style={{ marginBottom: 18, background: 'rgba(255,184,0,.1)', borderColor: 'rgba(255,184,0,.5)', color: '#7a5800' }}>
                <Icon name="shield" size={18} />
                <span><b>وديعه حضور چیست؟</b> {dep.note}</span>
              </div>
            )}

            <div className="grid-1">
              <div className="admin-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="summary-box" style={{ marginTop: 14, marginBottom: 24, textAlign: 'right' }}>
                  <div className="sum-row"><span>مبلغ نهایی پرداخت</span><b style={{ color: 'var(--brand)', fontSize: '1.25rem' }}>{fmtToman(amount)}</b></div>
                  {kind === 'service' && depApproved && dep.amount > 0 && (
                    <div className="sum-row"><span>کسر ودیعه پرداختی</span><b style={{ color: 'var(--green)' }}>− {fmtToman(dep.amount)}</b></div>
                  )}
                  <div className="sum-row"><span>پرداخت‌کننده</span><b>{name} — {toFa(phone)}</b></div>
                </div>

                <Btn variant="primary" icon="check" onClick={submit} style={{ width: '100%', maxWidth: '300px', margin: '0 auto', justifyContent: 'center', height: '54px', fontSize: '1.1rem' }}>
                  پرداخت از طریق زرین‌پال
                </Btn>
                <p className="field-hint" style={{ marginTop: 16, textAlign: 'center' }}>با کلیک روی دکمه بالا، به درگاه امن زرین‌پال منتقل می‌شوید.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
