const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

if (!index.includes('name="enamad"')) {
    index = index.replace('<head>', '<head>\n    <meta name="enamad" content="48183196" />');
    fs.writeFileSync('index.html', index);
}
