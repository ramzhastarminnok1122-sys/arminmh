const fs = require('fs');
let code = fs.readFileSync('src/components/ui.jsx', 'utf8');

const newLogo = `export function Logo({ dark = false, small = false, brand }) {
  const s = brand || {};
  return (
    <span className={cn('logo', dark && 'logo-dark', small && 'logo-sm')}>
      {s.logoUrl ? (
        <img src={s.logoUrl} alt={s.brandShort || 'لوگو'} style={{ width: small ? 32 : 42, height: small ? 32 : 42, borderRadius: 10, objectFit: 'cover' }} />
      ) : (
        <span className="logo-mark">
          <Icon name="bolt" size={small ? 16 : 20} />
        </span>
      )}
      <span className="logo-text">
        <b>{s.brandShort || 'امداد باتری چابهار'}</b>
        {!small && <small>{s.tagline || 'شبانه‌روزی، در محل شما'}</small>}
      </span>
    </span>
  );
}`;

code = code.replace(/export function Logo\([\s\S]*?<\/\s*span>\s*\);\s*\}/, newLogo);
fs.writeFileSync('src/components/ui.jsx', code);
