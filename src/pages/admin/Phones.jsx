import React from 'react';
import { useStore } from '../../lib/store';
import { Icon, Field } from '../../components/ui';
import { toFa } from '../../lib/utils';

export default function Phones() {
  const { state, update, toast } = useStore();
  const s = state.settings;
  const set = (k, v) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));

  const fields = [
    { k: 'emergencyPhone', label: 'شماره امداد (مهم‌ترین شماره سایت)', hint: 'همه دکمه‌های «تماس امداد» به این شماره وصل است', icon: 'phone' },
    { k: 'whatsapp', label: 'شماره واتساپ', hint: 'دکمه واتساپ در فوتر و تماس با ما', icon: 'whatsapp' },
    { k: 'officePhone', label: 'تلفن دفتر', hint: 'ساعات اداری', icon: 'headset' },
    { k: 'instagram', label: 'آیدی اینستاگرام (بدون @)', icon: 'instagram' },
    { k: 'telegram', label: 'آیدی تلگرام (بدون @)', icon: 'telegram' }
  ];

  return (
    <>
      <div className="note-box" style={{ marginBottom: 20 }}>
        <Icon name="alert" size={18} />
        <span>شماره امداد، هم‌اکنون: <b style={{ direction: 'ltr', display: 'inline-block' }}>{toFa(s.emergencyPhone)}</b> — با تغییر آن، همه دکمه‌های سایت بلافاصله به‌روز می‌شوند.</span>
      </div>
      <div className="admin-panel">
        <div className="panel-head"><div><h2>شماره‌ها و کانال‌های تماس</h2><p>ذخیره خودکار — بدون دکمه</p></div></div>
        <div className="form-grid">
          {fields.map((f) => (
            <Field key={f.k} label={f.label} hint={f.hint} className="span2">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="svc-ic" style={{ width: 44, height: 44, borderRadius: 12, margin: 0 }}><Icon name={f.icon} size={20} /></span>
                <input className="input" value={s[f.k]} onChange={(e) => set(f.k, e.target.value)} />
              </div>
            </Field>
          ))}
        </div>
      </div>
    </>
  );
}
