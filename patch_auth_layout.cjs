const fs = require('fs');

// 1. Fix SiteLayout AccountBtn and useCustomer
let layout = fs.readFileSync('src/components/SiteLayout.jsx', 'utf8');
layout = layout.replace(
  'to="/auth?next=/emergency" className="acct-btn"',
  'to="/auth" className="acct-btn"'
);

const useCustomerStr = `export function useCustomer() {
  const [cust, setCust] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUST_KEY)) || null; } catch { return null; }
  });
  useEffect(() => {
    const handle = () => {
      try { setCust(JSON.parse(localStorage.getItem(CUST_KEY)) || null); } catch { setCust(null); }
    };
    window.addEventListener('storage', handle);
    window.addEventListener('customer_changed', handle);
    return () => {
      window.removeEventListener('storage', handle);
      window.removeEventListener('customer_changed', handle);
    };
  }, []);
  return [cust, setCust];
}`;
layout = layout.replace(/export function useCustomer\(\) \{[\s\S]*?return \[cust, setCust\];\n\}/, useCustomerStr);

// 2. Fix Speed Dial Icon in SiteLayout
layout = layout.replace(
  /<Icon name=\{open \? 'x' : 'bolt'\} size=\{24\} \/>/,
  `{open ? <Icon name="x" size={24} /> : (state.settings?.speedDialIcon ? <img src={state.settings.speedDialIcon} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} alt="" /> : <Icon name="bolt" size={24} />)}`
);

fs.writeFileSync('src/components/SiteLayout.jsx', layout);

// 3. Fix Auth.jsx to dispatch event
let auth = fs.readFileSync('src/pages/Auth.jsx', 'utf8');
auth = auth.replace(
  /localStorage\.setItem\([\s\S]*?CUST_KEY,[\s\S]*?JSON\.stringify\([\s\S]*?\)\n    \);/,
  `localStorage.setItem(\n      CUST_KEY,\n      JSON.stringify({ id: userObj.id, name: userObj.name, phone: userObj.phone })\n    );\n    window.dispatchEvent(new Event('customer_changed'));`
);
fs.writeFileSync('src/pages/Auth.jsx', auth);
