const fs = require('fs');

let em = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');
em = em.replace(
  "nav(`/track/${code}`);",
  "nav(`/track/${code}`, { replace: true });"
);
fs.writeFileSync('src/pages/Emergency.jsx', em);

let bat = fs.readFileSync('src/pages/Batteries.jsx', 'utf8');
bat = bat.replace(
  "nav(`/pay?order=${order.id}`);",
  "nav(`/pay?order=${order.id}`, { replace: true });"
);
fs.writeFileSync('src/pages/Batteries.jsx', bat);
