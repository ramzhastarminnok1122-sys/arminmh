const fs = require('fs');

// Fix tech login
let techLogin = fs.readFileSync('src/pages/tech/TechLogin.jsx', 'utf8');
if (!techLogin.includes('setShow')) {
    techLogin = techLogin.replace(
        "const [pw, setPw] = useState('');",
        "const [pw, setPw] = useState('');\n  const [show, setShow] = useState(false);"
    );
    techLogin = techLogin.replace(
        /<div className=\{cn\('pw-field', shake && 'shake'\)\}>\s*<Field label="رمز عبور">\s*<input className="input" type="password" value=\{pw\} onChange=\{\(e\) => setPw\(e\.target\.value\)\} placeholder="123" autoFocus autoComplete="current-password" \/>\s*<\/Field>\s*<\/div>/,
        `<Field label="رمز عبور">
            <div className={cn('pw-box', shake && 'shake')}>
              <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="123" autoFocus autoComplete="current-password" />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="نمایش رمز"><Icon name="eye" size={17} /></button>
            </div>
          </Field>`
    );
    fs.writeFileSync('src/pages/tech/TechLogin.jsx', techLogin);
}

// Fix admin login
let adminLogin = fs.readFileSync('src/pages/admin/Login.jsx', 'utf8');
adminLogin = adminLogin.replace(
    /<div className=\{cn\('pw-field', shake && 'shake'\)\}>\s*<Field label="رمز عبور مدیریتی">\s*<input className="input" type=\{show \? 'text' : 'password'\} value=\{pw\} onChange=\{\(e\) => setPw\(e\.target\.value\)\}\s*placeholder="••••••" autoFocus autoComplete="current-password" \/>\s*<button type="button" className="icon-btn" onClick=\{\(\) => setShow\(!show\)\} aria-label="نمایش رمز">\s*<Icon name="eye" size=\{17\} \/>\s*<\/button>\s*<\/Field>\s*<\/div>/,
    `<Field label="رمز عبور مدیریتی">
            <div className={cn('pw-box', shake && 'shake')}>
              <input className="input" type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" autoFocus autoComplete="current-password" />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="نمایش رمز"><Icon name="eye" size={17} /></button>
            </div>
          </Field>`
);
fs.writeFileSync('src/pages/admin/Login.jsx', adminLogin);

// Fix owner login
let owner = fs.readFileSync('src/pages/owner/OwnerPanel.jsx', 'utf8');
if (!owner.includes('setShow')) {
    owner = owner.replace(
        "const [pw, setPw] = useState('');",
        "const [pw, setPw] = useState('');\n  const [show, setShow] = useState(false);"
    );
    owner = owner.replace(
        /<div className="phone-box" style=\{\{ maxWidth: 280, margin: '18px auto 6px' \}\}>\s*<input className=\{cn\('input', pwErr && 'err'\)\} type="password" value=\{pw\} autoFocus\s*onChange=\{\(e\) => setPw\(e\.target\.value\)\} onKeyDown=\{\(e\) => e\.key === 'Enter' && login\(\)\} placeholder="رمز پنل مدیر" \/>\s*<\/div>/,
        `<div className={cn('pw-box', pwErr && 'shake')} style={{ maxWidth: 280, margin: '18px auto 6px' }}>
            <input className={cn('input', pwErr && 'err')} type={show ? 'text' : 'password'} value={pw} autoFocus
              onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="رمز پنل مدیر" />
            <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="نمایش رمز"><Icon name="eye" size={17} /></button>
          </div>`
    );
    fs.writeFileSync('src/pages/owner/OwnerPanel.jsx', owner);
}

// Fix settings passwords
let settings = fs.readFileSync('src/pages/admin/Settings.jsx', 'utf8');
if (!settings.includes('pw-box')) {
    settings = settings.replace(
        /<Field label="رمز جدید"><input className="input" type="password" value=\{pw\.a\} onChange=\{\(e\) => setPw\(\{ \.\.\.pw, a: e\.target\.value \}\)\} placeholder="••••••" \/><\/Field>/,
        `<Field label="رمز جدید"><div className="pw-box"><input className="input" type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} placeholder="••••••" /></div></Field>`
    );
    settings = settings.replace(
        /<Field label="تکرار رمز جدید"><input className="input" type="password" value=\{pw\.b\} onChange=\{\(e\) => setPw\(\{ \.\.\.pw, b: e\.target\.value \}\)\} placeholder="••••••" \/><\/Field>/,
        `<Field label="تکرار رمز جدید"><div className="pw-box"><input className="input" type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} placeholder="••••••" /></div></Field>`
    );
    fs.writeFileSync('src/pages/admin/Settings.jsx', settings);
}

// Fix CSS
let css = fs.readFileSync('src/styles.css', 'utf8');
css = css.replace(
    /\.pw-field \{ position: relative; \}\n\.pw-field \.input \{ padding-inline-end: 46px; direction: ltr; text-align: end; letter-spacing: 3px; font-weight: 700; \}\n\.pw-field \.icon-btn \{ position: absolute; inset-inline-end: 6px; top: 50%; transform: translateY\(-58%\); \}/,
    `.pw-box { position: relative; width: 100%; }\n.pw-box .input { padding-inline-end: 46px; direction: ltr; text-align: left; font-family: monospace; letter-spacing: 3px; font-weight: 700; font-size: 1.1rem; }\n.pw-box .icon-btn { position: absolute; inset-inline-end: 6px; top: 50%; transform: translateY(-50%); }`
);
// Make sure .tbl-wrap doesn't overflow .admin-panel
css = css.replace('.admin-main { padding: 20px 16px 80px; }', '.admin-main { padding: 20px 16px 80px; max-width: 100vw; overflow-x: hidden; }');
css = css.replace('.admin-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 24px; }', '.admin-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 20px; padding: 24px; max-width: 100%; overflow: hidden; box-sizing: border-box; }');
fs.writeFileSync('src/styles.css', css);

