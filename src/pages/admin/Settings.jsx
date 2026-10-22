import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Field, Modal, Badge } from '../../components/ui';
import { toFa, cn } from '../../lib/utils';
import { notifyOwner } from '../../lib/notify';

export default function Settings() {
  const { state, update, toast } = useStore();
  const s = state.settings;
  const [resetOpen, setResetOpen] = useState(false);
  const [pw, setPw] = useState({ a: '', b: '' });

  const set = (k, v) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));

  const savePw = () => {
    if (pw.a.length < 4) { toast('رمز حداقل ۴ کاراکتر باشد', 'error'); return; }
    if (pw.a !== pw.b) { toast('تکرار رمز مطابقت ندارد', 'error'); return; }
    set('adminPassword', pw.a);
    setPw({ a: '', b: '' });
    toast('رمز مدیریتی تغییر کرد.');
  };

  const STATUS = [
    { k: 'active', label: 'فعال — پذیرش کامل درخواست‌ها', tone: 'green' },
    { k: 'limited', label: 'محدود — پذیرش با ظرفیت کمتر', tone: 'amber' },
    { k: 'offline', label: 'آفلاین — توقف موقت پذیرش آنلاین', tone: 'red' }
  ];

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head"><div><h2>هویت کسب‌وکار</h2><p>نام‌ها و معرفی برند در سراسر سایت</p></div></div>
        <div className="form-grid">
          <Field label="نام کامل برند"><input className="input" value={s.brandName} onChange={(e) => set('brandName', e.target.value)} /></Field>
          <Field label="نام کوتاه (لوگو)"><input className="input" value={s.brandShort} onChange={(e) => set('brandShort', e.target.value)} /></Field>
          <Field label="شعار (زیر لوگو)"><input className="input" value={s.tagline} onChange={(e) => set('tagline', e.target.value)} /></Field>
          <Field label="معرفی کوتاه (فوتر و درباره ما)" className="span2">
            <textarea className="input" rows={3} value={s.aboutShort} onChange={(e) => set('aboutShort', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>آدرس و ساعات کاری</h2></div></div>
        <div className="form-grid">
          <Field label="آدرس دفتر / فروشگاه" className="span2"><input className="input" value={s.address} onChange={(e) => set('address', e.target.value)} /></Field>
          <Field label="ساعات کاری" className="span2"><input className="input" value={s.hours} onChange={(e) => set('hours', e.target.value)} /></Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>درگاه پرداخت دستی</h2><p>این کارت در صفحه پرداخت مشتری نمایش داده می‌شود</p></div></div>
        <div className="form-grid">
          <Field label="شماره کارت" className="span2">
            <input className="input" style={{ direction: 'ltr', textAlign: 'left', letterSpacing: 1 }} value={s.payCard?.number || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, payCard: { ...st.settings.payCard, number: e.target.value } } }))} placeholder="6037 9917 0000 0000" />
          </Field>
          <Field label="به نام">
            <input className="input" value={s.payCard?.holder || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, payCard: { ...st.settings.payCard, holder: e.target.value } } }))} />
          </Field>
          <Field label="بانک">
            <input className="input" value={s.payCard?.bank || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, payCard: { ...st.settings.payCard, bank: e.target.value } } }))} />
          </Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>ودیعه حضور</h2><p>مبلغ پیش‌پرداخت برای جلوگیری از اعزام‌های الکی — از فاکتور مشتریِ حاضر کسر می‌شود</p></div></div>
        <div className="form-grid">
          <Field label="وضعیت ودیعه">
            <button className={cn('chip', s.deposit?.enabled && 'on')} onClick={() => update((st) => ({ ...st, settings: { ...st.settings, deposit: { ...st.settings.deposit, enabled: !st.settings.deposit?.enabled } } }))}>
              <Icon name="shield" size={16} /> {s.deposit?.enabled ? 'ودیعه فعال است' : 'ودیعه غیرفعال است'}
            </button>
          </Field>
          <Field label="مبلغ ودیعه (تومان)">
            <input className="input" type="number" min="0" step="5000" value={s.deposit?.amount ?? 0} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, deposit: { ...st.settings.deposit, amount: Number(e.target.value) || 0 } } }))} />
          </Field>
          <Field label="توضیح برای مشتری" className="span2">
            <textarea className="input" rows={2} value={s.deposit?.note || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, deposit: { ...st.settings.deposit, note: e.target.value } } }))} />
          </Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>پنل صاحب‌کار و اعلان‌ها</h2><p>یک پنل ساده و جدا فقط برای دیدن سفارش‌ها، امدادها و فیش‌ها — به‌همراه زنگ خوردن گوشی</p></div></div>
        <div className="form-grid">
          <Field label="رمز ورود پنل مدیر" hint="آدرس پنل: آدرس-سایت/owner">
            <input className="input" value={s.ownerPw || '123654'} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, ownerPw: e.target.value } }))} />
          </Field>
          <Field label="شناسه اعلان رایگان (ntfy)" hint="با دکمه بسازید و در اپ ntfy روی گوشی صاحب‌کار عضو همین شوید">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ direction: 'ltr', textAlign: 'left' }} value={s.notify?.ntfyTopic || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, notify: { ...st.settings.notify, ntfyTopic: e.target.value.replace(/[^a-zA-Z0-9-]/g, '') } } }))} placeholder="chb-owner-xxxx" />
              <Btn variant="ghost" size="sm" icon="sparkle" onClick={() => {
                const t = 'chb-owner-' + Math.random().toString(36).slice(2, 8);
                update((st) => ({ ...st, settings: { ...st.settings, notify: { ...st.settings.notify, ntfyTopic: t } } }));
                toast('شناسه ساخته شد: ' + t);
              }}>ساخت</Btn>
            </div>
          </Field>
          <Field label="تست اعلان" hint="یک اعلان آزمایشی به ntfy می‌فرستد تا مطمئن شوید گوشی صاحب‌کار وصل است">
            <Btn variant="ghost" size="sm" icon="bell" onClick={() => { notifyOwner(state, { title: '🔔 اعلان آزمایشی', body: 'اگر این را روی گوشی دیدید، اتصال ntfy درست است!' }); toast('اعلان آزمایشی ارسال شد؛ گوشی را چک کنید.'); }}>ارسال اعلان آزمایشی</Btn>
          </Field>
          <Field label="شماره موبایل صاحب‌کار (برای پیامک)">
            <input className="input" style={{ direction: 'ltr', textAlign: 'left' }} value={s.notify?.ownerPhone || ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, notify: { ...st.settings.notify, ownerPhone: e.target.value } } }))} placeholder="0912..." />
          </Field>
          <Field label="پیامک خودکار به صاحب‌کار" hint="نیازمند اتصال کاوه‌نگار طبق راهنمای «اعلان صاحب‌کار»">
            <button className={cn('chip', s.notify?.smsEnabled && 'on')} onClick={() => update((st) => ({ ...st, settings: { ...st.settings, notify: { ...st.settings.notify, smsEnabled: !st.settings.notify?.smsEnabled } } }))}>
              <Icon name="bell" size={16} /> {s.notify?.smsEnabled ? 'پیامک فعال است' : 'پیامک خاموش است'}
            </button>
          </Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>سقف‌های ضد سوءاستفاده</h2><p>برای جلوگیری از ثبت درخواست‌های ساختگی</p></div></div>
        <div className="form-grid">
          <Field label="حداکثر درخواست فعال همزمان به ازای هر مشتری">
            <input className="input" type="number" min="1" value={s.limits?.maxActive ?? 1} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, limits: { ...st.settings.limits, maxActive: Number(e.target.value) || 1 } } }))} />
          </Field>
          <Field label="حداکثر درخواست در روز به ازای هر مشتری">
            <input className="input" type="number" min="1" value={s.limits?.maxDaily ?? 3} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, limits: { ...st.settings.limits, maxDaily: Number(e.target.value) || 1 } } }))} />
          </Field>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>وضعیت کسب‌وکار</h2><p>روی همه صفحات سایت به‌صورت نوار اطلاع‌رسانی نمایش داده می‌شود</p></div></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {STATUS.map((st) => (
            <button key={st.k} onClick={() => set('status', st.k)}
              style={{ borderRadius: 13, border: `2px solid ${s.status === st.k ? 'var(--brand)' : 'var(--line-2)'}`, padding: '10px 16px', background: s.status === st.k ? 'var(--brand-soft)' : '#fff', fontWeight: 700, fontSize: '.88rem' }}>
              <Badge tone={st.tone} dot>{st.label}</Badge>
            </button>
          ))}
        </div>
        <Field label="پیام سفارشی وضعیت" hint="مثلاً دلیل محدودیت یا تشکر از صبر مشتریان">
          <input className="input" value={s.statusMessage} onChange={(e) => set('statusMessage', e.target.value)} />
        </Field>
      </div>

      <div className="admin-panel">
        <div className="panel-head"><div><h2>رمز عبور مدیریتی</h2><p>برای ورود به همین پنل استفاده می‌شود</p></div></div>
        <div className="form-grid">
          <Field label="رمز جدید"><input className="input" type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} placeholder="••••••" /></Field>
          <Field label="تکرار رمز جدید"><input className="input" type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} placeholder="••••••" /></Field>
        </div>
        <Btn variant="dark" icon="check" onClick={savePw}>تغییر رمز</Btn>
      </div>

      <div className="admin-panel" style={{ borderColor: 'rgba(238,58,44,.4)' }}>
        <div className="panel-head">
          <div><h2 style={{ color: 'var(--red)' }}>بازنشانی داده‌ها</h2><p>برگرداندن همه اطلاعات سایت به وضعیت اولیه</p></div>
          <Btn variant="red" icon="trash" onClick={() => setResetOpen(true)}>بازنشانی کامل</Btn>
        </div>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="بازنشانی داده‌های سایت" width={440}
        footer={<>
          <Btn variant="ghost" onClick={() => setResetOpen(false)}>انصراف</Btn>
          <Btn variant="red" icon="alert" onClick={() => { localStorage.clear(); location.reload(); }}>بله، همه‌چیز بازنشانی شود</Btn>
        </>}>
        <p className="confirm-text">همه درخواست‌ها، آفرها، قیمت‌ها و تنظیمات به وضعیت اولیه برمی‌گردند. این کار قابل بازگشت نیست.</p>
      </Modal>
    </>
  );
}
