const fs = require('fs');
let em = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');

// replace defaultTech definition
em = em.replace(
  "const defaultTech = (state.technicians || []).find((t) => t.online) || (state.technicians || [])[0];",
  "const defaultTech = getBestTech(state);"
);

// make sure getBestTech is imported
if (!em.includes('getBestTech')) {
    em = em.replace(
        "import { cn, toFa, toEn, isMobile, uid, reqCode } from '../lib/utils';",
        "import { cn, toFa, toEn, isMobile, uid, reqCode, getBestTech } from '../lib/utils';"
    );
    // fallback if different import string
    em = em.replace(
        "import { cn, toFa, fmtToman, uid, reqCode, isMobile, toEn } from '../lib/utils';",
        "import { cn, toFa, fmtToman, uid, reqCode, isMobile, toEn, getBestTech } from '../lib/utils';"
    );
}

fs.writeFileSync('src/pages/Emergency.jsx', em);
