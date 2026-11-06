const fs = require('fs');
let dash = fs.readFileSync('src/pages/tech/TechDashboard.jsx', 'utf8');

const myOrdersMemo = `  const myOrders = useMemo(
    () =>
      (state.orders || [])
        .filter((o) => o.technicianId === me.id && (o.status === 'پرداخت شد — در حال آماده‌سازی' || o.status === 'ارسال شد' || o.status === 'تحویل و نصب شد'))
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.orders, me.id]
  );
  
  const orderTasks = myOrders.filter(o => o.status !== 'تحویل و نصب شد');
  const todayDoneOrders = myOrders.filter(o => o.status === 'تحویل و نصب شد' && o.paidAt && isToday(o.paidAt)); // or use some done date
`;

dash = dash.replace(/  const tasks = myReqs\.filter\(\(r\) => RANK\[r\.status\] < 5\);/, myOrdersMemo + "  const tasks = myReqs.filter((r) => RANK[r.status] < 5);");

dash = dash.replace("const todayDone = myReqs.filter((r) => r.doneAt && isToday(r.doneAt));", 
"const todayDone = myReqs.filter((r) => r.doneAt && isToday(r.doneAt));\n  const allDoneCount = todayDone.length + todayDoneOrders.length;");

dash = dash.replace(
    `            <div className="stat-box"><b>{todayDone.length}</b><span>انجام‌شده امروز</span></div>`,
    `            <div className="stat-box"><b>{allDoneCount}</b><span>انجام‌شده امروز</span></div>`
);

dash = dash.replace(
    `          <button className={cn('tab', tab === 'tasks' && 'active')} onClick={() => setTab('tasks')}>درخواست‌های فعال {tasks.length > 0 && <span className="badge-count">{tasks.length}</span>}</button>`,
    `          <button className={cn('tab', tab === 'tasks' && 'active')} onClick={() => setTab('tasks')}>ماموریت‌های فعال {(tasks.length + orderTasks.length) > 0 && <span className="badge-count">{tasks.length + orderTasks.length}</span>}</button>`
);

// We need to render the orders in the 'tasks' tab.
const orderRender = `
            {orderTasks.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '.9rem', color: 'var(--brand)', marginBottom: 12 }}>🛒 سفارش‌های خرید باتری</h3>
                {orderTasks.map(o => (
                  <div key={o.id} className="req-card">
                    <div className="req-head">
                      <div className="req-code">
                        <Icon name="battery" size={16} /> سفارش {o.id.substring(0,6)}
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="req-body">
                      <div className="req-line"><Icon name="user" size={15} /> <b>{o.name}</b> — <a href={'tel:'+o.phone}>{toFa(o.phone)}</a></div>
                      <div className="req-line"><Icon name="battery" size={15} /> <b>{o.batteryLabel}</b></div>
                      <div className="req-line"><Icon name="pin" size={15} /> {o.address}</div>
                    </div>
                    <div className="req-foot">
                      <select className="input" style={{ width: 'auto', padding: '6px 12px' }} value={o.status} onChange={(e) => {
                        update(s => ({ ...s, orders: s.orders.map(x => x.id === o.id ? { ...x, status: e.target.value } : x) }));
                        toast('وضعیت سفارش تغییر کرد');
                      }}>
                        <option value="پرداخت شد — در حال آماده‌سازی">در حال آماده‌سازی</option>
                        <option value="ارسال شد">در مسیر ارسال</option>
                        <option value="تحویل و نصب شد">تحویل و نصب شد (پایان)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
`;

dash = dash.replace(/            \{tasks\.length === 0 \? \(/, orderRender + '            {(tasks.length === 0 && orderTasks.length === 0) ? (');

fs.writeFileSync('src/pages/tech/TechDashboard.jsx', dash);
