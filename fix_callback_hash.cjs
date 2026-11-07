const fs = require('fs');
let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

pay = pay.replace(
  "const callbackUrl = window.location.origin + '/pay?verify=1&kind=' + kind + '&orderId=' + orderId;",
  "const callbackUrl = window.location.origin + window.location.pathname + '#/pay?verify=1&kind=' + kind + '&orderId=' + orderId;"
);

fs.writeFileSync('src/pages/Pay.jsx', pay);
