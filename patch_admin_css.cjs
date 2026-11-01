const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

css = css.replace('.upload-box { border: 2px dashed var(--line-2); border-radius: 14px; padding: 18px; text-align: center; color: var(--muted); font-size: 0.88rem; transition: 0.15s; cursor: pointer; }',
'.upload-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 2px dashed var(--line-2); border-radius: 14px; padding: 24px; text-align: center; color: var(--muted); font-size: 0.88rem; transition: 0.15s; cursor: pointer; word-break: break-word; line-height: 1.5; }');

css = css.replace('.img-preview { width: 100%; height: 120px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; }',
'.img-preview { width: 100%; height: auto; max-height: 200px; object-fit: contain; border-radius: 10px; margin-bottom: 12px; border: 1px solid var(--line); background: #fafafa; }');

fs.writeFileSync('src/styles.css', css);
