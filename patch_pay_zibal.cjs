const fs = require('fs');

let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

const realZibal = `
  const startZibalPayment = async () => {
    if (!navigator.onLine) {
      toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error');
      return;
    }

    setGatewayModal('connecting');

    try {
      const orderId = (order ? order.id : req.code) || 'REQ-' + Date.now();
      const callbackUrl = window.location.origin + '/pay?verify=1&kind=' + kind + '&orderId=' + orderId;
      const res = await fetch('/api/zibal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 10, // Toman to Rial
          callbackUrl,
          description: 'پرداخت ' + (kind === 'deposit' ? 'ودیعه امداد' : kind === 'order' ? 'سفارش باتری' : 'فاکتور'),
          orderId
        })
      });
      const data = await res.json();
      if (data.ok && data.data && data.data.trackId) {
        window.location.href = 'https://gateway.zibal.ir/start/' + data.data.trackId;
      } else {
        setGatewayModal(null);
        toast('خطا در اتصال به زیبال: ' + (data.data?.message || data.error || 'نامشخص'), 'error');
      }
    } catch (e) {
      setGatewayModal(null);
      toast('خطا در برقراری ارتباط با سرور پرداخت.', 'error');
    }
  };
`;

pay = pay.replace(/const startZibalPayment = async \(\) => \{[\s\S]*?toast\('خطا: اتصال به درگاه زیبال در حال حاضر به دلیل عدم تایید مرچنت‌کد امکان‌پذیر نیست\.', 'error'\);\s*\};/, realZibal);

fs.writeFileSync('src/pages/Pay.jsx', pay);
