const https = require('https');

const key = '44394E62627566762F6B444833635067596C44633466772B415A3852352F376F7633556B656A43646534593D';
const sender = '0018018949161';
const to = '09378905454';
const message = 'تست ارتباط با کاوه نگار';

// Test 1: With Sender
const url1 = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}&sender=${encodeURIComponent(sender)}`;

console.log('--- Test 1 (With Sender) ---');
https.get(url1, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
    
    // Test 2: Without Sender
    console.log('\n--- Test 2 (Without Sender) ---');
    const url2 = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(to)}&message=${encodeURIComponent(message)}`;
    https.get(url2, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => console.log(data2));
    });
  });
});
