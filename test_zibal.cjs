const https = require('https');

const data = JSON.stringify({
  merchant: '6ae7394c75be4d13465c9a09',
  amount: 10000,
  callbackUrl: 'http://localhost:3000/pay?verify=1',
  description: 'تست اتصال'
});

const options = {
  hostname: 'gateway.zibal.ir',
  path: '/v1/request',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', responseData);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.write(data);
req.end();
