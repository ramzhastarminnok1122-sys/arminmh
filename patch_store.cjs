const fs = require('fs');
let code = fs.readFileSync('src/lib/store.jsx', 'utf8');

// Replace load() logic to also export loadLocal so we can use it synchronously initially
code = code.replace(/function load\(\) \{/, 'function loadLocal() {');

// In StoreProvider, replace useState(load) with our remote fetching logic
const providerRegex = /export function StoreProvider\(\{ children \}\) \{\s*const \[state, setState\] = useState\(load(Local)?\(\)?\);\s*const \[toasts, setToasts\] = useState\(\[\]\);/g;

const newProvider = `export function StoreProvider({ children }) {
  const [state, setState] = useState(loadLocal());
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Fetch initial state from remote DB
  useEffect(() => {
    fetch('/api/db')
      .then(r => r.json())
      .then(remoteState => {
        if (remoteState && remoteState.__v) {
          setState(migrate(remoteState));
        }
        setIsLoaded(true);
      })
      .catch(e => {
        console.warn('Failed to fetch remote DB, falling back to local', e);
        setIsLoaded(true);
      });
  }, []);

  // Save to remote server whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try { 
      localStorage.setItem(KEY, JSON.stringify(state)); 
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      }).catch(e => console.warn('Failed to save to remote DB', e));
    } catch (e) { /* ignore */ }
  }, [state, isLoaded]);

  // Background polling to sync across devices (every 5 seconds)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      fetch('/api/db')
        .then(r => r.json())
        .then(remoteState => {
          if (remoteState && remoteState.__v) {
            setState(prev => {
              const prevStr = JSON.stringify(prev);
              const remoteStr = JSON.stringify(remoteState);
              return prevStr !== remoteStr ? migrate(remoteState) : prev;
            });
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded]);
`;

code = code.replace(providerRegex, newProvider);

// Remove the old localStorage saving useEffect and tab-sync useEffect
const oldEffectRegex1 = /useEffect\(\(\) => \{\s*try \{ localStorage.setItem\(KEY, JSON.stringify\(state\)\); \} catch \(e\) \{ \/\* ignore \*\/ \}\s*\}, \[state\]\);/g;
code = code.replace(oldEffectRegex1, '');

const oldEffectRegex2 = /\/\/ همگام‌سازی زنده بین تب‌های همان مرورگر[\s\S]*?\}, \[\]\);/g;
code = code.replace(oldEffectRegex2, '');

fs.writeFileSync('src/lib/store.jsx', code);
