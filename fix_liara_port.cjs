const fs = require('fs');
let code = fs.readFileSync('build_liara.sh', 'utf8');

code = code.replace(/app\.listen\(PORT, \(\) => \{/, "app.listen(PORT, '0.0.0.0', () => {");
fs.writeFileSync('build_liara.sh', code);
