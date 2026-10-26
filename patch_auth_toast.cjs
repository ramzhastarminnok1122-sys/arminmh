const fs = require('fs');

let auth = fs.readFileSync('src/pages/Auth.jsx', 'utf8');

// Also catch the specific error if possible and show it in toast so the user can literally see the Kavenegar response on their phone screen.
auth = auth.replace(
  /if \(\!res\.ok\) \{\s*console\.warn\('Backend SMS API not fully configured or failed\. Proceeding to step 2 anyway for UI flow\.'\);\s*\}/g,
  `if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn('SMS Failed:', errorData);
        toast('خطا در ارسال پیامک: ' + (errorData?.data?.entries?.[0]?.statustext || errorData?.error || 'نامشخص'), 'error');
        setSending(false);
        return; // DO NOT PROCEED TO STEP 2 IF IT FAILS
      }`
);

fs.writeFileSync('src/pages/Auth.jsx', auth);
