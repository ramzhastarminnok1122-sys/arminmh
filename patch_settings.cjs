const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Settings.jsx', 'utf8');

const newUpload = `
        <div className="card">
          <h3>ظاهر و برند</h3>
          <div className="form-grid">
            <Field label="لینک یا آپلود لوگو (تصویر)">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {s.logoUrl && <img src={s.logoUrl} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }} />}
                <label className="btn btn-outline-brand btn-sm" style={{ cursor: 'pointer' }}>
                  <Icon name="image" /> آپلود از سیستم
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(!f) return;
                    if(f.size > 500*1024) { alert('حجم کمتر از ۵۰۰ کیلوبایت باشد'); return; }
                    const r = new FileReader();
                    r.onload = () => set('logoUrl', r.result);
                    r.readAsDataURL(f);
                  }} />
                </label>
                <button type="button" className="btn btn-outline-red btn-sm" onClick={() => set('logoUrl', '')}><Icon name="trash" /> حذف</button>
              </div>
              <input className="input" style={{ marginTop: 8 }} placeholder="یا آدرس اینترنتی لوگو را اینجا بگذارید..." value={s.logoUrl || ''} onChange={(e) => set('logoUrl', e.target.value)} />
              <p className="field-hint">بهترین ابعاد: مربع با پس‌زمینه شفاف (مثلاً 100x100).</p>
            </Field>
          </div>
        </div>
`;

code = code.replace(/<div className="card">\s*<h3>تغییر رمز مدیریت<\/h3>/, newUpload + '\n        <div className="card">\n          <h3>تغییر رمز مدیریت</h3>');
fs.writeFileSync('src/pages/admin/Settings.jsx', code);
