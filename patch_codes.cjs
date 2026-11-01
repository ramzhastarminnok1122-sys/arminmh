const fs = require('fs');

function patchPay() {
  let p = fs.readFileSync('src/pages/Pay.jsx', 'utf8');
  // find first active offer
  p = p.replace(
    /کد تخفیف دارید\؟ \(مثال: <button type="button" className="inline-code-btn" onClick=\{\(\) => setCouponInput\('CHB15'\)\}>CHB15<\/button>\)/,
    "کد تخفیف دارید؟"
  );
  p = p.replace(
    /placeholder="CHB15"/,
    "placeholder=\"مثلاً CHB15\""
  );
  fs.writeFileSync('src/pages/Pay.jsx', p);
}

function patchBat() {
  let p = fs.readFileSync('src/pages/Batteries.jsx', 'utf8');
  p = p.replace(
    /کد تخفیف دارید\؟ \(کد فعال: <b>CHB15<\/b>\)/,
    "کد تخفیف دارید؟"
  );
  p = p.replace(
    /placeholder="CHB15"/,
    "placeholder=\"مثلاً CHB15\""
  );
  fs.writeFileSync('src/pages/Batteries.jsx', p);
}

patchPay();
patchBat();
