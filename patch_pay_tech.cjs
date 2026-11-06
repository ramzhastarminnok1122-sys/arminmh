const fs = require('fs');
let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

if (!pay.includes('getBestTech')) {
    pay = pay.replace(
        "import { cn, toFa, fmtToman, normPhone, uid, dt } from '../lib/utils';",
        "import { cn, toFa, fmtToman, normPhone, uid, dt, getBestTech } from '../lib/utils';"
    );
}

const replacement = `            const bestTech = getBestTech(s);
            
            if (vKind === 'order' && orderId) {
              ns.orders = ns.orders.map(o => {
                if(o.id === orderId) {
                  title = '💰 پرداخت سفارش باتری';
                  body = 'سفارش ' + (o.battery?.brand || '') + ' پرداخت شد.\\nمبلغ: ' + fmMoney(res.data.amount/10) + ' تومان\\nمشتری: ' + o.name + ' (' + o.phone + ')';
                  
                  if (bestTech && bestTech.phone) {
                    fetch('/api/sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        to: bestTech.phone,
                        template: 'tech-order-alert',
                        token: o.phone,
                        token2: o.batteryLabel.replace(/\\s+/g, '_').substring(0,20),
                        token3: String(res.data.amount/10)
                      })
                    }).catch(() => {});
                  }
                  
                  return { ...o, status: 'پرداخت شد — در حال آماده‌سازی', paymentRef: trackId, paidAt: Date.now(), technicianId: bestTech?.id };
                }
                return o;
              });
            } else if (vKind === 'deposit' && orderId) {`;

pay = pay.replace(/            if \(vKind === 'order' && orderId\) \{[\s\S]*?\} else if \(vKind === 'deposit' && orderId\) \{/, replacement);
fs.writeFileSync('src/pages/Pay.jsx', pay);
