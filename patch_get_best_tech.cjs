const fs = require('fs');
let utils = fs.readFileSync('src/lib/utils.js', 'utf8');

const bestTechFn = `
export const getBestTech = (state) => {
  const techs = (state.technicians || []).filter((t) => t.online && t.phone);
  if (techs.length === 0) return (state.technicians || [])[0] || null;
  if (techs.length === 1) return techs[0];

  const counts = {};
  techs.forEach(t => { counts[t.id] = 0; });

  const activeReqs = (state.requests || []).filter(r => r.status && r.status !== 'done' && r.status !== 'canceled');
  activeReqs.forEach(r => {
    if (r.technicianId && counts[r.technicianId] !== undefined) {
      counts[r.technicianId]++;
    }
  });
  
  const activeOrders = (state.orders || []).filter(o => o.status === 'paid' || o.status === 'ارسال شد' || o.status === 'پرداخت شد — در حال آماده‌سازی');
  activeOrders.forEach(o => {
    if (o.technicianId && counts[o.technicianId] !== undefined) {
      counts[o.technicianId]++;
    }
  });

  let best = techs[0];
  for (let i = 1; i < techs.length; i++) {
    if (counts[techs[i].id] < counts[best.id]) {
      best = techs[i];
    }
  }
  return best;
};
`;

if (!utils.includes('getBestTech')) {
    utils = utils + '\n' + bestTechFn;
    fs.writeFileSync('src/lib/utils.js', utils);
}
