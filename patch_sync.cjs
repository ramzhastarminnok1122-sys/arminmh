const fs = require('fs');
let code = fs.readFileSync('src/lib/store.jsx', 'utf8');

const backgroundSync = `
  // Background polling to sync across devices (every 10 seconds)
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      fetch('/api/db')
        .then(r => r.json())
        .then(remoteState => {
          if (remoteState && remoteState.__v) {
            setState(prev => {
              // Only update if remote is materially different (very basic check)
              const prevStr = JSON.stringify(prev);
              const remoteStr = JSON.stringify(remoteState);
              return prevStr !== remoteStr ? migrate(remoteState) : prev;
            });
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [isLoaded]);
`;

code = code.replace('  // همگام‌سازی زنده بین تب‌های همان مرورگر', backgroundSync + '\n  // همگام‌سازی زنده بین تب‌های همان مرورگر');

fs.writeFileSync('src/lib/store.jsx', code);
