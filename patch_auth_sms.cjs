const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.jsx', 'utf8');

const replacement = `body: JSON.stringify({ 
          to: p, 
          message: \`کد تایید ورود به امداد باتری چابهار:\\n\${generatedCode}\`,
          template: 'chabahar-auth',
          token: generatedCode
        })`;

code = code.replace(/body: JSON\.stringify\(\{ \n          to: p, \n          message: `کد تایید ورود به امداد باتری چابهار:\\n\$\{generatedCode\}` \n        \}\)/, replacement);
fs.writeFileSync('src/pages/Auth.jsx', code);
