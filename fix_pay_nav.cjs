const fs = require('fs');
let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

const navLogic = `
            if(title) {
              notifyOwner(ns, { title, body });
            }
            
            return ns;
          });
          
          setTimeout(() => {
            if (vKind === 'order' && orderId) nav('/account');
            else if (orderId) nav('/track/' + orderId);
          }, 2000);
`;

pay = pay.replace(/            if\(title\) \{[\s\S]*?notifyOwner\(ns, \{ title, body \}\);\n            \}\n            \n            return ns;\n          \}\);/, navLogic);

if(!pay.includes('useNavigate')) {
  pay = pay.replace(/import \{ useSearchParams, Link \} from 'react-router-dom';/, "import { useSearchParams, Link, useNavigate } from 'react-router-dom';");
  pay = pay.replace(/const \[sp, setSp\] = useSearchParams\(\);/, "const [sp, setSp] = useSearchParams();\n  const nav = useNavigate();");
}

fs.writeFileSync('src/pages/Pay.jsx', pay);
