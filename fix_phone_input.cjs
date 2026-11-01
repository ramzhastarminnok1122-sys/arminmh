const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

css = css.replace('.phone-box .input { padding-inline-end: 44px; }', '.phone-box .input { padding-left: 44px !important; padding-right: 14px !important; text-align: left; }');
css = css.replace('.phone-mark { position: absolute; inset-inline-end: 13px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; }', 
'.phone-mark { position: absolute; left: 13px; right: auto; top: 50%; transform: translateY(-50%); display: grid; place-items: center; }');

fs.writeFileSync('src/styles.css', css);
