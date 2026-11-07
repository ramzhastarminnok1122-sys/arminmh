const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');
server = server.replace(/const merchant = process\.env\.ZIBAL_MERCHANT \|\| 'zibal';/g, "const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';");
fs.writeFileSync('server.js', server);

let build = fs.readFileSync('build_liara.sh', 'utf8');
build = build.replace(/const merchant = process\.env\.ZIBAL_MERCHANT \|\| 'zibal';/g, "const merchant = process.env.ZIBAL_MERCHANT || '6ae7394c75be4d13465c9a09';");
fs.writeFileSync('build_liara.sh', build);

