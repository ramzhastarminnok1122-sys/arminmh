const fs = require('fs');

function patch(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /const url = ["']https:\/\/api\.kavenegar\.com\/v1\/["'] \+ key \+ ["']\/sms\/send\.json\?receptor=["'] \+ encodeURIComponent\(to\) \+ ["']&message=["'] \+ encodeURIComponent\(message\);/g,
    "const sender = process.env.KAVENEGAR_SENDER || '';\n  let url = 'https://api.kavenegar.com/v1/' + key + '/sms/send.json?receptor=' + encodeURIComponent(to) + '&message=' + encodeURIComponent(message);\n  if (sender) url += '&sender=' + encodeURIComponent(sender);"
  );
  content = content.replace(
    /const url = \`https:\/\/api\.kavenegar\.com\/v1\/\$\{key\}\/sms\/send\.json\?receptor=\$\{encodeURIComponent\(to\)\}&message=\$\{encodeURIComponent\(message\)\}\`;/g,
    "const sender = process.env.KAVENEGAR_SENDER || '';\n    let url = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}`;\n    if (sender) url += `&sender=${encodeURIComponent(sender)}`;"
  );
  fs.writeFileSync(file, content);
}

patch('server.js');
patch('build_liara.sh');
