const fs = require('fs');

function fixSyntax(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\}\);\n\}\);\n  \}\);\n\}\);/g, '});\n});');
  code = code.replace(/  \}\)\.on\('error', \(e\) => \{\n    res\.status\(500\)\.json\(\{ ok: false, error: e\.message \}\);\n  \}\);\n\}\);\n  \}\);\n\}\);/g, 
  "  }).on('error', (e) => {\n    res.status(500).json({ ok: false, error: e.message });\n  });\n});");
  fs.writeFileSync(file, code);
}

fixSyntax('build_liara.sh');
