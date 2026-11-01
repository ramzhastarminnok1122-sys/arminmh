const fs = require('fs');

let server = fs.readFileSync('server.js', 'utf8');
server = server.replace(
  "return res.status(r.ok ? 200 : 502).json({ ok: r.ok, data });",
  "return res.status(r.ok ? 200 : (data.return && data.return.status === 412 ? 412 : 502)).json({ ok: r.ok, data });"
);
fs.writeFileSync('server.js', server);

let build = fs.readFileSync('build_liara.sh', 'utf8');
build = build.replace(
  "res.status(apiRes.statusCode === 200 ? 200 : 502).json({ ok: apiRes.statusCode === 200, data: parsed });",
  "res.status(apiRes.statusCode === 200 ? 200 : (parsed.return && parsed.return.status === 412 ? 412 : 502)).json({ ok: apiRes.statusCode === 200, data: parsed });"
);
fs.writeFileSync('build_liara.sh', build);

