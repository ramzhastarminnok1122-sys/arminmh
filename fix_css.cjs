const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

// Fix bottom-nav jumping issue
css = css.replace('.bottom-nav {\n  display: none;\n  position: fixed;\n  bottom: 0;', 
'.bottom-nav {\n  display: none;\n  position: fixed;\n  bottom: 0;\n  transform: translateZ(0);\n  will-change: transform;');

// Fix emergency button text alignment
css = css.replace(".bn-em-btn::after { content: 'امداد'; position: absolute; bottom: -19px; font-size: 0.68rem; font-weight: 800; color: #ff8d84; }",
".bn-em-btn::after { content: 'امداد'; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 0.72rem; font-weight: 800; color: #ff8d84; }");

// Add checkout button full width
css += `\n/* Fix checkout button overflow */\n.btn.w-full { width: 100%; box-sizing: border-box; }`;

fs.writeFileSync('src/styles.css', css);
