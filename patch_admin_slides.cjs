const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Crud.jsx', 'utf8');

code = code.replace(
  /\{ key: 'subtitle', label: 'زیرتیتر', type: 'text' \}/,
  "{ key: 'subtitle', label: 'زیرتیتر', type: 'text', hint: 'متن توضیحی، مثلاً: کد تخفیف CHB15' }"
);

fs.writeFileSync('src/pages/admin/Crud.jsx', code);
