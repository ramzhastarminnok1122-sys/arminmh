const fs = require('fs');
let code = fs.readFileSync('src/pages/Emergency.jsx', 'utf8');

const oldMapRegex = /<ChabaharMap pick theme="light"[\s\S]*?onPick=\{[\s\S]*?\}\s*\/>/;
code = code.replace(oldMapRegex, '');

const oldDescRegex = /<textarea className=\{cn\('input', \(touched && locErr\) && 'err'\)\} rows=\{2\} value=\{f\.loc\.desc\}[\s\S]*?placeholder="نزدیک کدام میدان یا بلوار هستید\؟"\s*\/>/;
const newDesc = `<textarea className={cn('input', (touched && locErr) && 'err')} rows={2} value={f.loc.desc}
                      onChange={(e) => set({ loc: { ...f.loc, desc: e.target.value } })}
                      placeholder="آدرس دقیق: مثلاً بلوار ملت، نبش کوچه ۱۲" />
                  </Field>
                  <Field label="توضیحات تکمیلی (اختیاری)" hint="هر چیزی که امدادگر باید بداند">
                    <textarea className="input" rows={2} value={f.note || ''}
                      onChange={(e) => set({ note: e.target.value })}
                      placeholder="مثلاً: ماشین روبروی سوپرمارکت پارکه، یا زنگ خراب است..." />`;
code = code.replace(oldDescRegex, newDesc);

// Remove "روی نقشه بزنید یا..."
code = code.replace('روی نقشه بزنید یا آدرس بنویسید — یا هر دو', 'آدرس دقیق خود را برای اعزام واحد سیار بنویسید');

// Also add 'note' to initial state if not there
code = code.replace(/f, set\] = useState\(\{[\s\S]*?\}\);/, (match) => match.replace('loc: { x: 50, y: 50, desc: \'\' }', 'loc: { x: 50, y: 50, desc: \'\' }, note: \'\''));

fs.writeFileSync('src/pages/Emergency.jsx', code);
