const net = require('net');
const client = net.createConnection(43, 'whois.nic.ir', () => {
  client.write('emdadbatteryiranian.ir\r\n');
});
client.on('data', (data) => console.log(data.toString()));
client.on('end', () => console.log('disconnected'));
client.on('error', (err) => console.error(err));
