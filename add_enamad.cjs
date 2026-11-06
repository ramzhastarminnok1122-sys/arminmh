const fs = require('fs');
let code = fs.readFileSync('src/components/SiteLayout.jsx', 'utf8');

const enamadCode = `
          <div className="enamad-box">
            <h4>مجوزها و نمادها</h4>
            <div className="enamad-symbol" dangerouslySetInnerHTML={{ __html: \`<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=8560450&Code=GFZWngMPan65FVht1pkZ8nHYxGC85Cd2'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=8560450&Code=GFZWngMPan65FVht1pkZ8nHYxGC85Cd2' alt='' style='cursor:pointer' code='GFZWngMPan65FVht1pkZ8nHYxGC85Cd2'></a>\` }} />
          </div>
`;

code = code.replace(/<div className="footer-bar">/, enamadCode + '        <div className="footer-bar">');
fs.writeFileSync('src/components/SiteLayout.jsx', code);

let css = fs.readFileSync('src/styles.css', 'utf8');
css += `
.enamad-box { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.enamad-box h4 { font-size: .95rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.enamad-symbol { background: #fff; border-radius: 12px; padding: 8px; width: fit-content; display: inline-block; }
.enamad-symbol img { max-width: 80px; height: auto; display: block; }
`;
fs.writeFileSync('src/styles.css', css);
