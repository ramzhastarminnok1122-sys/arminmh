const fs = require('fs');
let code = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');

code = code.replace(/location: \{ desc: f\.loc\.desc \|\| 'موقعیت انتخاب‌شده روی نقشه', x: f\.loc\.x \|\| 445, y: f\.loc\.y \|\| 300 \},/,
"location: { desc: f.loc.desc, x: f.loc.x || 445, y: f.loc.y || 300, note: f.note },");

fs.writeFileSync('src/pages/Emergency.jsx', code);
