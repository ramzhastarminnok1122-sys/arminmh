const fs = require('fs');
let em = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');

const smsCode = `    update((st) => {
      // خودرو در گاراژ حساب سیو شود (بدون تکرار)
      const exists = (st.garage || []).some((x) => x.phone === acct.phone && x.brand === vehicle.brand && x.model === vehicle.model);
      const garage = exists ? st.garage : [...(st.garage || []), { id: uid(), phone: acct.phone, brand: vehicle.brand, model: vehicle.model, year: '' }];
      return { ...st, requests: [req, ...st.requests], garage };
    });

    if (defaultTech && defaultTech.phone) {
      fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: defaultTech.phone,
          template: 'tech-alert',
          token: acct.phone,
          token2: (vehicle.brand + '-' + vehicle.model).replace(/\\s+/g, '_'),
          token3: code.replace(/-/g, '')
        })
      }).catch(() => {});
    }`;

em = em.replace(/    update\(\(st\) => \{[\s\S]*?\}\);/, smsCode);
fs.writeFileSync('src/pages/Emergency.jsx', em);
