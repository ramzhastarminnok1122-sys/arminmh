import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, RANK } from '../../lib/store';
import { Icon, StatusBadge } from '../../components/ui';
import { toFa, dt, dOnly, isToday, dayLabel } from '../../lib/utils';

export default function Dashboard() {
  const { state } = useStore();
  const nav = useNavigate();
  const reqs = state.requests || [];
  const techs = state.technicians || [];
  const msgs = state.messages || [];

  const today = reqs.filter((r) => isToday(r.createdAt)).length;
  const active = reqs.filter((r) => RANK[r.status] < 5).length;
  const pendingPays = (state.payments || []).filter((p) => p.status === 'pending').length;
  const online = techs.filter((t) => t.online).length;
  const customersCount = (state.users || []).length;

  const week = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const ts = Date.now() - i * 86400000;
      days.push({
        label: dayLabel(ts),
        n: reqs.filter((r) => dOnly(r.createdAt) === dOnly(ts)).length,
        today: i === 0
      });
    }
    return days;
  }, [reqs]);
  const max = Math.max(3, ...week.map((d) => d.n));

  const quick = [
    { to: '/admin/offers?new=1', label: 'آفر جدید', icon: 'tag', bg: 'var(--brand-soft)', c: 'var(--brand)' },
    { to: '/admin/banners?new=1', label: 'بنر جدید', icon: 'image', bg: 'var(--yellow-soft)', c: '#9a6b00' },
    { to: '/admin/pricing?new=1', label: 'افزودن باتری', icon: 'battery', bg: 'rgba(23,178,106,.12)', c: 'var(--green)' },
    { to: '/admin/technicians?new=1', label: 'افزودن امدادگر', icon: 'users', bg: 'rgba(139,92,246,.12)', c: 'var(--violet)' }
  ];

  return (
    <>
      <div className="stat-cards">
        <div className="stat-card"><span className="stat-ic" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><Icon name="bolt" size={24} /></span><div><b>{toFa(today)}</b><span>درخواست امروز</span></div></div>
        <div className="stat-card"><span className="stat-ic" style={{ background: 'var(--yellow-soft)', color: '#9a6b00' }}><Icon name="truck" size={24} /></span><div><b>{toFa(active)}</b><span>درخواست فعال</span></div></div>
        <div className="stat-card"><span className="stat-ic" style={{ background: 'rgba(23,178,106,.12)', color: 'var(--green)' }}><Icon name="users" size={24} /></span><div><b>{toFa(customersCount)}</b><span>مشتری ثبت‌نامی</span></div></div>
        <div className="stat-card"><span className="stat-ic" style={{ background: 'rgba(139,92,246,.12)', color: 'var(--violet)' }}><Icon name="users" size={24} /></span><div><b>{toFa(online)} / {toFa(techs.length)}</b><span>امدادگران آنلاین</span></div></div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.15fr 0.85fr' }}>
        <div className="admin-panel">
          <div className="panel-head">
            <div><h2>روند درخواست‌های ۷ روز گذشته</h2><p>جمع کل هفته: {toFa(week.reduce((a, d) => a + d.n, 0))} درخواست</p></div>
          </div>
          <div className="bar-chart">
            {week.map((d, i) => (
              <div key={i} className={`bar-col${d.today ? ' today' : ''}`}>
                <div className="bar" style={{ height: `${(d.n / max) * 100}%` }}><b>{toFa(d.n)}</b></div>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <div className="panel-head"><div><h2>دسترسی سریع</h2><p>پرکاربردترین کارها</p></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {quick.map((q) => (
              <Link key={q.to} to={q.to} className="card" style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none' }}>
                <span className="stat-ic" style={{ background: q.bg, color: q.c, width: 42, height: 42, borderRadius: 12 }}><Icon name={q.icon} size={20} /></span>
                <b style={{ fontSize: '.92rem' }}>{q.label}</b>
              </Link>
            ))}
          </div>
          {msgs.filter((m) => !m.read).length > 0 && (
            <div className="note-box" style={{ marginTop: 16 }}>
              <Icon name="headset" size={17} /> {toFa(msgs.filter((m) => !m.read).length)} پیام خوانده‌نشده از «تماس با ما» دارید.
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <div><h2>آخرین درخواست‌ها</h2><p>۶ درخواست اخیر</p></div>
          <Link to="/admin/dispatch" className="btn btn-ghost btn-sm">همه درخواست‌ها</Link>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>کد</th><th>مشتری</th><th>مشکل</th><th>وضعیت</th><th>زمان</th><th></th></tr></thead>
            <tbody>
              {reqs.slice(0, 6).map((r) => (
                <tr key={r.id}>
                  <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 800, fontSize: '.84rem' }}>{r.code}</td>
                  <td><b>{r.name}</b><br /><small style={{ color: 'var(--muted-2)' }}>{toFa(r.phone)}</small></td>
                  <td>{r.problem}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.82rem' }}>{dt(r.createdAt)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => nav(`/admin/dispatch?open=${r.id}`)}>مشاهده</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
