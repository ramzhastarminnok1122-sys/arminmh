const fs = require('fs');

let pay = fs.readFileSync('src/pages/Pay.jsx', 'utf8');

const updatedUpdate = `
          // Update local state
          update((s) => {
            const ns = { ...s };
            let title = '';
            let body = '';
            
            if (vKind === 'order' && orderId) {
              ns.orders = ns.orders.map(o => {
                if(o.id === orderId) {
                  title = '💰 پرداخت سفارش باتری';
                  body = 'سفارش ' + (o.battery?.brand || '') + ' پرداخت شد.\\nمبلغ: ' + fmMoney(res.data.amount/10) + ' تومان\\nمشتری: ' + o.name + ' (' + o.phone + ')';
                  return { ...o, status: 'paid', paymentRef: trackId, paidAt: Date.now() };
                }
                return o;
              });
            } else if (vKind === 'deposit' && orderId) {
              ns.requests = ns.requests.map(r => {
                if(r.code === orderId) {
                  title = '🛡 ودیعه امداد پرداخت شد';
                  body = 'مشتری: ' + r.name + ' (' + r.phone + ')\\nکد پیگیری: ' + r.code + '\\nماشین: ' + (r.vehicle?.brand || '') + ' ' + (r.vehicle?.model || '') + '\\nمبلغ: ' + fmMoney(res.data.amount/10) + ' تومان';
                  return { ...r, deposit: { ...r.deposit, status: 'paid', amount: res.data.amount/10, ref: trackId } };
                }
                return r;
              });
            } else if (vKind === 'service' && orderId) {
              ns.requests = ns.requests.map(r => {
                if(r.code === orderId) {
                  title = '⚡ تسویه فاکتور امداد';
                  body = 'مشتری: ' + r.name + ' (' + r.phone + ')\\nکد: ' + r.code + '\\nمبلغ: ' + fmMoney(res.data.amount/10) + ' تومان';
                  return { ...r, invoicePaid: true, paymentRef: trackId, paidAt: Date.now() };
                }
                return r;
              });
            }
            
            if(title) {
              notifyOwner(ns, { title, body });
            }
            
            return ns;
          });
`;

pay = pay.replace(/\/\/ Update local state[\s\S]*?return ns;\n          \}\);/, updatedUpdate);

fs.writeFileSync('src/pages/Pay.jsx', pay);
