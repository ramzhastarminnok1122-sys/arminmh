import React, { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Icon, Logo, Btn } from '../../components/ui';
import { cn } from '../../lib/utils';

const MENU = [
  { label: 'عملیات', items: [
    { to: '/admin', label: 'داشبورد', icon: 'dashboard', end: true },
    { to: '/admin/dispatch', label: 'درخواست‌های امداد', icon: 'truck' },
    { to: '/admin/payments', label: 'پرداخت‌ها و سفارش‌ها', icon: 'banknote' },
    { to: '/admin/customers', label: 'مشتریان', icon: 'users' }
  ]},
  { label: 'محتوای سایت', items: [
    { to: '/admin/home-content', label: 'محتوای صفحه اصلی', icon: 'edit' },
    { to: '/admin/services', label: 'خدمات', icon: 'wrench' },
    { to: '/admin/offers', label: 'آفرها و تایمرها', icon: 'tag' },
    { to: '/admin/banners', label: 'بنرهای تبلیغاتی', icon: 'image' },
    { to: '/admin/slides', label: 'اسلایدشو صفحه اصلی', icon: 'sparkle' },
    { to: '/admin/pricing', label: 'فروشگاه و قیمت‌ها', icon: 'battery' },
    { to: '/admin/gallery', label: 'گالری', icon: 'grid' },
    { to: '/admin/areas', label: 'مناطق تحت پوشش', icon: 'map' },
    { to: '/admin/reviews', label: 'نظرات و رسانه', icon: 'star' },
    { to: '/admin/faq', label: 'سوالات متداول', icon: 'info' }
  ]},
  { label: 'کسب‌وکار', items: [
    { to: '/admin/technicians', label: 'امدادگران', icon: 'headset' },
    { to: '/admin/phones', label: 'شماره‌های تماس', icon: 'phone' },
    { to: '/admin/settings', label: 'تنظیمات کسب‌وکار', icon: 'settings' }
  ]}
];

export default function AdminLayout() {
  const { state, toast } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (localStorage.getItem('chb_admin') !== '1') nav('/admin/login', { replace: true });
  }, [nav, loc.pathname]);

  const logout = () => {
    localStorage.removeItem('chb_admin');
    toast('از حساب خارج شدید.');
    nav('/admin/login', { replace: true });
  };

  if (localStorage.getItem('chb_admin') !== '1') return null;

  const current = MENU.flatMap((m) => m.items).find((i) => i.to === loc.pathname);

  return (
    <div className="admin-shell">
      <aside className={cn('admin-side', open && 'open')}>
        <Link to="/admin"><Logo small brand={state.settings} /></Link>
        <small style={{ color: 'rgba(255,255,255,.4)', padding: '0 12px 14px', fontSize: '.75rem' }}>پنل مدیریت عملیات</small>
        {MENU.map((g) => (
          <div key={g.label}>
            <div className="side-label">{g.label}</div>
            {g.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => cn('side-link', isActive && 'active')}>
                <Icon name={it.icon} size={18} /> {it.label}
              </NavLink>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: 14 }}>
          <Btn to="/" variant="outline-light" size="sm" style={{ width: '100%', justifyContent: 'center' }} iconEnd="chevron">مشاهده سایت</Btn>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="icon-btn admin-menu-btn" onClick={() => setOpen(true)} aria-label="منوی مدیریت"><Icon name="menu" size={22} /></button>
            <div>
              <h1>{current?.label || 'پنل مدیریت'}</h1>
              <p>{state.settings.brandName}</p>
            </div>
          </div>
          <div className="admin-actions">
            <Btn to="/" variant="ghost" size="sm" iconEnd="chevron">مشاهده سایت</Btn>
            <Btn variant="dark" size="sm" icon="logout" onClick={logout}>خروج</Btn>
          </div>
        </div>
        <div className="route-anim" key={loc.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
