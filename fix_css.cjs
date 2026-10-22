const fs = require('fs');
let code = fs.readFileSync('src/components/Chatbot.jsx', 'utf8');

// The backslash escaping inside the JSX dangerouslySetInnerHTML is causing Babel to choke.
// Let's replace the entire style block with a clean, single-line string without backticks.
code = code.replace(
  /<style dangerouslySetInnerHTML=\{{__html: \\\`[\s\S]*?\\\`\}} \/>/g,
  "<style dangerouslySetInnerHTML={{__html: '@keyframes flash { 0% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.2; transform: scale(0.8); } } .chatbot-toggle:hover { transform: scale(1.08); } @media (max-width: 760px) { .chatbot-wrapper { bottom: calc(85px + env(safe-area-inset-bottom)) !important; right: 14px !important; } .chatbot-window { width: calc(100vw - 28px) !important; max-height: 62vh !important; transform-origin: bottom right; } }'}} />"
);

fs.writeFileSync('src/components/Chatbot.jsx', code);
