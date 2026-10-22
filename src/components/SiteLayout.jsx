import React, { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Icon, Logo, Btn } from './ui';
import { toFa, cn } from '../lib/utils';

const NAV = [
  { to: '/', label: 'خانه' },
  { to: '/services', label: 'خدمات' },
  { to: '/batteries', label: 'فروشگاه باتری' },
  { to: '/offers', label: 'آفرها' },
  { to: '/areas', label: 'مناطق تحت پوشش' },
  { to: '/about', label: 'درباره ما' },
  { to: '/faq', label: 'سوالات متداول' },
  { to: '/contact', label: 'تماس با ما' }
];

const MOBILE_NAV = [
  { to: '/', label: 'خانه', icon: 'home' },
  { to: '/batteries', label: 'فروشگاه', icon: 'battery' },
  { to: '/emergency', label: '', icon: 'bolt', em: true },
  { to: '/track', label: 'پیگیری', icon: 'pin' },
  { to: '/account', label: 'حساب من', icon: 'user' }
];

/* سورپرایز موبایل: دکمهٔ شناور هوشمند — با یک لمس به مهم‌ترین کارها */
function SpeedDial({ phone, onMenu }) {
  const [open, setOpen] = React.useState(false);
  const items = [
    { icon: 'phone', label: 'تماس با امداد', href: `tel:${(phone || '').replace(/\s/g, '')}`, cls: 'sd-green' },
    { icon: 'pin', label: 'پیگیری درخواست', to: '/track', cls: 'sd-blue' },
    { icon: 'menu', label: 'فهرست کامل سایت', action: onMenu, cls: 'sd-navy' }
  ];
  return (
    <div className={cn('speed-dial', open && 'open')}>
      {open && <div className="sd-ov" onClick={() => setOpen(false)} />}
      <div className="sd-items">
        {items.map((it, i) => (
          <span key={i} className="sd-item" style={{ transitionDelay: open ? `${i * 45}ms` : '0ms' }}>
            <span className="sd-lbl">{it.label}</span>
            {it.href
              ? <a className={cn('sd-btn', it.cls)} href={it.href} onClick={() => setOpen(false)} aria-label={it.label}><Icon name={it.icon} size={20} /></a>
              : it.to
                ? <Link className={cn('sd-btn', it.cls)} to={it.to} onClick={() => setOpen(false)} aria-label={it.label}><Icon name={it.icon} size={20} /></Link>
                : <button className={cn('sd-btn', it.cls)} onClick={() => { setOpen(false); onMenu(); }} aria-label={it.label}><Icon name={it.icon} size={20} /></button>}
          </span>
        ))}
      </div>
      <button className={cn('sd-main', open && 'open')} onClick={() => setOpen(!open)} aria-label="دسترسی سریع" aria-expanded={open}>
        <Icon name={open ? 'x' : 'bolt'} size={24} />
      </button>
    </div>
  );
}

import Chatbot from './Chatbot';

export default function SiteLayout() {
  const { state } = useStore();
  const s = state.settings;
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  // سورپرایز موبایل: سوایپ از لبهٔ راست = باز شدن منو، سوایپ به راست = بستن
  useEffect(() => {
    let sx = 0, sy = 0, t0 = 0;
    const start = (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; t0 = Date.now(); };
    const end = (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
      if (Date.now() - t0 > 600 || dy > 70) return;
      if (dx < -55 && sx > window.innerWidth - 45) setOpen(true);   // از لبهٔ راست به چپ
      if (dx > 75) setOpen((o) => (o ? false : o));                  // به راست = بستن
    };
    document.addEventListener('touchstart', start, { passive: true });
    document.addEventListener('touchend', end, { passive: true });
    return () => { document.removeEventListener('touchstart', start); document.removeEventListener('touchend', end); };
  }, []);

  return (
    <div className="site-root">
      {s.status !== 'active' && (
        <div className={cn('status-banner', s.status)} role="alert">
          <div className="container">
            <Icon name={s.status === 'offline' ? 'alert' : 'info'} size={15} /> {s.statusMessage}
          </div>
        </div>
      )}

      <header className="site-header">
        <div className="container header-in">
          <Link to="/" aria-label={s.brandName}><Logo brand={s} /></Link>
          <nav className="main-nav" aria-label="ناوبری اصلی">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.to === '/'}>{n.label}</NavLink>)}
          </nav>
          <div className="header-cta">
            <a className="phone-chip" href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} title="تماس مستقیم با امداد">
              <Icon name="phone" size={16} />{toFa(s.emergencyPhone)}
            </a>
            <Link to="/tech/login" className="tech-entry-link" title="ورود امدادگران"><Icon name="truck" size={15} /> ورود امدادگر</Link>
            <AccountBtn />
            <Btn to="/emergency" variant="red" icon="bolt" size="sm">درخواست امداد</Btn>
            <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="منو">
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>
      </header>

      <div className={cn('drawer', open && 'open')}>
        <div className="drawer-ov" onClick={() => setOpen(false)} />
        <div className="drawer-panel">
          <div className="drawer-head">
            <Logo small brand={s} />
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="بستن"><Icon name="x" size={20} /></button>
          </div>
          {NAV.map((n) => <NavLink key={n.to} to={n.to} end={n.to === '/'}>{n.label}</NavLink>)}
          <NavLink to="/track"><Icon name="pin" size={17} /> پیگیری درخواست</NavLink>
          <NavLink to="/account"><Icon name="user" size={17} /> حساب کاربری</NavLink>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 18 }}>
            <a className="phone-chip" style={{ justifyContent: 'center' }} href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`}>
              <Icon name="phone" size={16} />{toFa(s.emergencyPhone)}
            </a>
            <Btn to="/emergency" variant="red" icon="bolt">درخواست امداد فوری</Btn>
            <div style={{ display: 'flex', gap: 8, opacity: 0.85 }}>
              <Link to="/tech/login" className="btn btn-outline-light btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '.72rem' }}>ورود امدادگر</Link>
              <Link to="/owner" className="btn btn-outline-light btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '.72rem' }}>پنل مدیر</Link>
              <Link to="/admin/login" className="btn btn-outline-light btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '.72rem' }}>پنل ادمین</Link>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="route-anim" key={loc.pathname}>
          <Outlet />
        </div>
      </main>

      <Footer />

      <nav className="bottom-nav" aria-label="ناوبری موبایل">
        <div className="container bottom-nav-in">
          {MOBILE_NAV.map((n) =>
            n.em ? (
              <div key="em" className="bn-item bn-em">
                <Link to="/emergency" className="bn-em-btn" aria-label="درخواست امداد فوری"><Icon name="bolt" size={26} /></Link>
              </div>
            ) : (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => cn('bn-item', isActive && 'active')}>
                <Icon name={n.icon} size={21} /><span>{n.label}</span>
              </NavLink>
            )
          )}
        </div>
      </nav>

      {/* سورپرایز موبایل: دکمه شناور چندکاره — تماس، پیگیری، منو */}
      <SpeedDial phone={s.emergencyPhone} onMenu={() => setOpen(true)} />
      
      {/* ربات هوشمند امداد باتری */}
      <Chatbot />
    </div>
  );
}

export const CUST_KEY = 'chb_customer';

export function useCustomer() {
  const [cust, setCust] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CUST_KEY)) || null; } catch { return null; }
  });
  return [cust, setCust];
}

function AccountBtn() {
  const [cust] = useCustomer();
  if (cust) {
    return (
      <Link to="/account" className="acct-btn on" title="حساب کاربری من">
        <Icon name="user" size={18} /><span className="acct-name">{cust.name.split(' ')[0]}</span>
      </Link>
    );
  }
  return (
    <Link to="/auth?next=/emergency" className="acct-btn">
      <Icon name="user" size={18} /><span className="acct-name">ورود | ثبت‌نام</span>
    </Link>
  );
}

function Footer() {
  const { state } = useStore();
  const s = state.settings;
  const svcs = (state.services || []).filter((x) => x.active).slice(0, 5);
  const digits = (num) => toFa(num);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-in">
          <div>
            <Logo brand={s} />
            <p className="footer-about">{s.aboutShort}</p>
            <div className="socials">
              <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" aria-label="اینستاگرام"><Icon name="instagram" size={19} /></a>
              <a href={`https://t.me/${s.telegram}`} target="_blank" rel="noreferrer" aria-label="تلگرام"><Icon name="telegram" size={19} /></a>
              <a href={`https://wa.me/98${s.whatsapp.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer" aria-label="واتساپ"><Icon name="whatsapp" size={19} /></a>
              <a href={`tel:${s.officePhone.replace(/\s/g, '')}`} aria-label="تلفن دفتر"><Icon name="phone" size={19} /></a>
            </div>
          </div>
          <div>
            <h4>دسترسی سریع</h4>
            <div className="footer-links">
              <Link to="/emergency">درخواست امداد فوری</Link>
              <Link to="/track">پیگیری درخواست</Link>
              <Link to="/batteries">فروشگاه باتری</Link>
              <Link to="/offers">آفرها و تخفیف‌ها</Link>
              <Link to="/gallery">گالری عملیات</Link>
              <Link to="/reviews">نظرات مشتریان</Link>
              <Link to="/account">حساب کاربری</Link>
              <Link to="/tech/login">ورود امدادگر</Link>
              <Link to="/owner">پنل مدیر</Link>
              <Link to="/admin/login">ورود مدیر</Link>
            </div>
          </div>
          <div>
            <h4>خدمات پرطرفدار</h4>
            <div className="footer-links">
              {svcs.map((x) => <Link key={x.id} to="/services">{x.title}</Link>)}
            </div>
          </div>
          <div>
            <h4>تماس با ما</h4>
            <ul className="footer-contact">
              <li><Icon name="phone" size={16} /><span>خط امداد شبانه‌روزی: <b style={{ direction: 'ltr', display: 'inline-block' }}>{digits(s.emergencyPhone)}</b></span></li>
              <li><Icon name="headset" size={16} /><span>دفتر: <b style={{ direction: 'ltr', display: 'inline-block' }}>{digits(s.officePhone)}</b></span></li>
              <li><Icon name="pin" size={16} /><span>{s.address}</span></li>
              <li><Icon name="clock" size={16} /><span>{s.hours}</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bar">
          <span>© {digits(1405)} {s.brandName} — تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده با ⚡ برای رانندگان چابهار</span>
        </div>
      </div>
    </footer>
  );
}
