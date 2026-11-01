const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

css = css.replace('.chatbot-window {\n  width: 360px;\n  max-width: calc(100vw - 32px);\n  background: #fff;\n  border-radius: 20px;\n  box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  opacity: 0;\n  transform: translateY(20px) scale(0.95);\n  pointer-events: none;\n  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);\n  margin-bottom: 16px;\n  height: 520px;\n  max-height: calc(100vh - 100px);\n}', 
`.chatbot-window {
  width: 360px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  margin-bottom: 16px;
  height: 520px;
  max-height: 80dvh;
}`);

css = css.replace(/@media \(max-width: 480px\) \{[\s\S]*?margin-bottom: 16px;\n  \}\n\}/, 
`@media (max-width: 480px) {
  .chatbot-wrapper {
    bottom: calc(85px + env(safe-area-inset-bottom));
    right: 16px;
    left: 16px;
    align-items: center;
    z-index: 999999;
  }
  .chatbot-window {
    width: 100%;
    max-width: 100%;
    height: 82dvh;
    max-height: 82dvh;
    margin-bottom: 0;
  }
}`);

fs.writeFileSync('src/styles.css', css);
