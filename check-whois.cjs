const https = require('https');
https.get('https://rdap.irnic.ir/domain/emdadbatteryiranian.ir', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
}).on('error', console.error);
