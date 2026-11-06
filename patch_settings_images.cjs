const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Settings.jsx', 'utf8');

const uploadUI = `
        <div className="card">
          <h3>ظاهر و برند</h3>
          <div className="form-grid">
            <Field label="لینک یا آپلود لوگوی اصلی">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {s.logoUrl && <img src={s.logoUrl} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }} />}
                <label className="btn btn-outline-brand btn-sm" style={{ cursor: 'pointer' }}>
                  <Icon name="image" /> آپلود از سیستم
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(!f) return;
                    if(f.size > 500*1024) return alert('حجم کمتر از ۵۰۰ کیلوبایت باشد');
                    const r = new FileReader(); r.onload = () => set('logoUrl', r.result); r.readAsDataURL(f);
                  }} />
                </label>
                {s.logoUrl && <button type="button" className="btn btn-outline-red btn-sm" onClick={() => set('logoUrl', '')}>حذف</button>}
              </div>
            </Field>
            
            <Field label="آیکون دسترسی سریع (گوشه پایین)">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {s.speedDialIcon && <img src={s.speedDialIcon} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />}
                <label className="btn btn-outline-brand btn-sm" style={{ cursor: 'pointer' }}>
                  <Icon name="image" /> آپلود از سیستم
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if(!f) return;
                    if(f.size > 500*1024) return alert('حجم کمتر از ۵۰۰ کیلوبایت باشد');
                    const r = new FileReader(); r.onload = () => set('speedDialIcon', r.result); r.readAsDataURL(f);
                  }} />
                </label>
                {s.speedDialIcon && <button type="button" className="btn btn-outline-red btn-sm" onClick={() => set('speedDialIcon', '')}>حذف</button>}
              </div>
            </Field>
          </div>
        </div>
`;

code = code.replace(/<div className="card">\s*<h3>تغییر رمز مدیریت<\/h3>/, uploadUI + '\n        <div className="card">\n          <h3>تغییر رمز مدیریت</h3>');
fs.writeFileSync('src/pages/admin/Settings.jsx', code);
