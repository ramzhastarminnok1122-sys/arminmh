const fs = require('fs');
let code = fs.readFileSync('vite.config.js', 'utf8');

const newServer = `  server: { 
    host: '0.0.0.0', 
    port: 5173, 
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  },`;

code = code.replace(/server: \{ host: '0\.0\.0\.0', port: 5173, allowedHosts: true \},/, newServer);
fs.writeFileSync('vite.config.js', code);
