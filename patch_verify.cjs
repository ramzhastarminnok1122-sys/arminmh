const fs = require('fs');

let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

const verifyEffect = `
  useEffect(() => {
    const isVerify = sp.get('verify') === '1';
    const success = sp.get('success') === '1';
    const trackId = sp.get('trackId');
    const orderId = sp.get('orderId');
    const vKind = sp.get('kind');

    if (isVerify && trackId) {
      if (!success) {
        toast('پرداخت توسط کاربر لغو شد یا ناموفق بود.', 'error');
        sp.delete('verify'); sp.delete('success'); sp.delete('trackId'); sp.delete('status');
        setSp(sp);
        return;
      }
      
      setGatewayModal('connecting');
      fetch('/api/zibal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId })
      }).then(r => r.json()).then(res => {
        if (res.ok) {
          setLastRefCode(trackId);
          setGatewayModal('success');
          
          // Update local state
          update((s) => {
            const ns = { ...s };
            if (vKind === 'order' && orderId) {
              ns.orders = ns.orders.map(o => o.id === orderId ? { ...o, status: 'paid', paymentRef: trackId, paidAt: Date.now() } : o);
            } else if (vKind === 'deposit' && orderId) {
              ns.requests = ns.requests.map(r => r.code === orderId ? { ...r, deposit: { ...r.deposit, status: 'paid', amount: res.data.amount/10, ref: trackId } } : r);
            } else if (vKind === 'service' && orderId) {
              ns.requests = ns.requests.map(r => r.code === orderId ? { ...r, invoicePaid: true, paymentRef: trackId, paidAt: Date.now() } : r);
            }
            return ns;
          });
        } else {
          setGatewayModal(null);
          toast('پرداخت تایید نشد (احتمالاً قبلاً تایید شده یا مبلغ مغایرت دارد).', 'error');
        }
      }).catch(() => {
        setGatewayModal(null);
        toast('خطا در ارتباط با سرور هنگام تایید پرداخت.', 'error');
      }).finally(() => {
        sp.delete('verify'); sp.delete('success'); sp.delete('trackId'); sp.delete('status');
        setSp(sp);
      });
    }
  }, []);
`;

pay = pay.replace(/const \[appliedCoupon, setAppliedCoupon\] = useState\(null\);/, 
  "const [appliedCoupon, setAppliedCoupon] = useState(null);\n" + verifyEffect);

fs.writeFileSync('src/pages/Pay.jsx', pay);
