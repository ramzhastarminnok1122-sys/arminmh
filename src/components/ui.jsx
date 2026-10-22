import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn, toFa, phoneError, fmtToman, countdown } from '../lib/utils';
import { useStore, LABEL } from '../lib/store';

/* ---------------- Icons (stroke, consistent set) ---------------- */
const P = {
  bolt: <path d="M13.2 2.2 5.4 13.4h4.9l-1.1 8.4 7.8-11.2h-4.9l1.1-8.4Z" fill="currentColor" stroke="none" />,
  bell: <><path d="M18 8.6a6 6 0 0 0-12 0c0 6.2-2.4 7.4-2.4 7.4h16.8S18 14.8 18 8.6" /><path d="M10.2 19.6a2.1 2.1 0 0 0 3.6 0" /></>,
  briefcase: <><rect x="2.8" y="7.2" width="18.4" height="13" rx="2.2" /><path d="M8.6 7.2V5.4a2 2 0 0 1 2-2h2.8a2 2 0 0 1 2 2v1.8M2.8 12.6h18.4" /></>,
  battery: <><rect x="2.2" y="7.6" width="15.6" height="8.8" rx="2.2" /><path d="M20.6 10.6v2.8M6.3 10.8v2.4M9.6 10.8v2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.6V12l3.1 2" /></>,
  pin: <><path d="M12 21.2s-6.6-5.3-6.6-10.1a6.6 6.6 0 1 1 13.2 0c0 4.8-6.6 10.1-6.6 10.1Z" /><circle cx="12" cy="10.8" r="2.3" /></>,
  phone: <path d="M5.4 3.6h3.2l1.7 4.1-2.1 1.6a12.8 12.8 0 0 0 6.5 6.5l1.6-2.1 4.1 1.7v3.2a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 3.4 5.8a2 2 0 0 1 2-2.2Z" />,
  shield: <path d="m12 2.8 7.2 2.7v5.6c0 4.7-3.1 8.4-7.2 10.1-4.1-1.7-7.2-5.4-7.2-10.1V5.5L12 2.8Z" />,
  truck: <><rect x="1.8" y="6.4" width="11.4" height="9.2" rx="1.4" /><path d="M13.2 9.6h4.3l3 3.4v2.6h-7.3" /><circle cx="6.4" cy="18" r="1.9" /><circle cx="16.8" cy="18" r="1.9" /></>,
  wrench: <path d="M14.7 6.3a4.2 4.2 0 0 0-5.8 5L3.4 16.8a2.05 2.05 0 1 0 2.9 2.9l5.5-5.5a4.2 4.2 0 0 0 5-5.8l-2.9 1.7-2-2 2.8-1.8Z" />,
  gauge: <><path d="M4.2 14.5a7.9 7.9 0 1 1 15.6 0" /><path d="m12 14.2 3.6-3.6" /><circle cx="12" cy="14.4" r="1.3" /></>,
  anchor: <><circle cx="12" cy="5.4" r="2.1" /><path d="M12 7.5V20M5.2 12.4H3.6a8.4 8.4 0 0 0 16.8 0h-1.6M8.6 10.2h6.8" /></>,
  search: <><circle cx="11" cy="11" r="6.6" /><path d="m20.3 20.3-3.9-3.9" /></>,
  star: <path d="m12 3 2.7 5.7 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.5 19.8l1.2-6.1L3.2 9.5l6.1-.8L12 3Z" fill="currentColor" stroke="none" />,
  check: <path d="m5 12.6 4.6 4.6L19 7.4" />,
  chevron: <path d="m9.4 5.8 6.2 6.2-6.2 6.2" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h10" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" /><path d="m14.5 6.5 3 3" /></>,
  trash: <><path d="M4.5 6.5h15M9.5 3.5h5M7 6.5l.8 13h8.4l.8-13M10 10v6M14 10v6" /></>,
  eye: <><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  dashboard: <><rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.6" /><rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.6" /><rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.6" /><rect x="13.3" y="13.3" width="7.2" height="7.2" rx="1.6" /></>,
  tag: <><path d="m12.6 3.4 7.6 7.6a2 2 0 0 1 0 2.8l-6.4 6.4a2 2 0 0 1-2.8 0l-7.6-7.6V5.4a2 2 0 0 1 2-2h7.2Z" /><circle cx="8.4" cy="8.4" r="1.5" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  users: <><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16.2 4.9a3.4 3.4 0 0 1 0 6.3M17.8 14.2a6.2 6.2 0 0 1 3.9 5.8" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0" /></>,
  settings: <><circle cx="12" cy="12" r="3.1" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" /></>,
  headset: <><path d="M4.5 13v-1.5a7.5 7.5 0 0 1 15 0V13" /><rect x="2.8" y="12.6" width="4" height="5.6" rx="1.8" /><rect x="17.2" y="12.6" width="4" height="5.6" rx="1.8" /><path d="M19.5 18.2a4.5 4.5 0 0 1-4.5 3.3h-1.5" /></>,
  image: <><rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2.2" /><circle cx="9" cy="9.6" r="1.7" /><path d="m4.5 17.5 4.6-4.6 3.2 3.2 3.1-3.1 4.4 4.4" /></>,
  map: <><path d="m9.2 4.4 5.6 2 5-2v13.2l-5 2-5.6-2-5 2V6.4l5-2ZM9.2 4.4v13.2M14.8 6.4v13.2" /></>,
  car: <><path d="m4.2 15.5 1.5-4.9A2.2 2.2 0 0 1 7.8 9h8.4a2.2 2.2 0 0 1 2.1 1.6l1.5 4.9" /><rect x="2.8" y="15" width="18.4" height="4.4" rx="1.6" /><path d="M6.4 17.2h.02M17.6 17.2h.02" /></>,
  whatsapp: <><path d="M12 3.6a8.4 8.4 0 0 0-7.2 12.7L3.6 20.4l4.2-1.1A8.4 8.4 0 1 0 12 3.6Z" /><path d="M9.2 8.6c-.5.6-.8 1.7.3 3.4a9.4 9.4 0 0 0 3.3 3c1.5.7 2.3.4 2.9-.1l.4-.9-2-1.2-.9.7a5.5 5.5 0 0 1-2.1-2.1l.7-.9-1.2-2-.9.2Z" /></>,
  instagram: <><rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.6" /><circle cx="12" cy="12" r="4" /><path d="M17.2 6.8h.01" /></>,
  telegram: <path d="m20.7 4.2-17 6.5c-.9.3-.9 1.5 0 1.8l4.3 1.4 1.6 4.9c.3.8 1.3 1 1.9.3l2.3-2.5 4.4 3.2c.7.5 1.7.1 1.9-.7L22.2 5.2c.2-.8-.7-1.3-1.5-1Zm-11 9.1 8.6-5.9-6.9 6.7-.3 3-1.4-3.8Z" />,
  send: <><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></>,
  logout: <><path d="M9.5 4.5H5.8a1.8 1.8 0 0 0-1.8 1.8v11.4a1.8 1.8 0 0 0 1.8 1.8h3.7M15.5 16.5 20 12l-4.5-4.5M20 12H9.5" /></>,
  home: <path d="m3.8 10.4 8.2-6.8 8.2 6.8V20a1.4 1.4 0 0 1-1.4 1.4h-4v-6.2h-5.6v6.2h-4A1.4 1.4 0 0 1 3.8 20v-9.6Z" />,
  grid: <><rect x="3.4" y="3.4" width="7" height="7" rx="1.5" /><rect x="13.6" y="3.4" width="7" height="7" rx="1.5" /><rect x="3.4" y="13.6" width="7" height="7" rx="1.5" /><rect x="13.6" y="13.6" width="7" height="7" rx="1.5" /></>,
  copy: <><rect x="8.6" y="8.6" width="12" height="12" rx="2" /><path d="M5.4 15.4h-.6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v.6" /></>,
  info: <><circle cx="12" cy="12" r="8.6" /><path d="M12 11v5.2M12 7.8h.01" /></>,
  alert: <><path d="M12 3.6 22 20.4H2L12 3.6Z" /><path d="M12 10v4.4M12 17.3h.01" /></>,
  banknote: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 9.5v.01M18 14.5v.01" /></>,
  sparkle: <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5ZM19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
};

export function Icon({ name, size = 20, className, strokeWidth = 1.8, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={cn('icon', className)} style={style}
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] || P.info}
    </svg>
  );
}

/* ---------------- Logo ---------------- */
export function Logo({ dark = false, small = false, brand }) {
  const s = brand || {};
  return (
    <span className={cn('logo', dark && 'logo-dark', small && 'logo-sm')}>
      <span className="logo-mark">
        <Icon name="bolt" size={small ? 16 : 20} />
      </span>
      <span className="logo-text">
        <b>{s.brandShort || 'امداد باتری چابهار'}</b>
        {!small && <small>{s.tagline || 'شبانه‌روزی، در محل شما'}</small>}
      </span>
    </span>
  );
}

/* ---------------- Buttons ---------------- */
export function Btn({ to, href, variant = 'primary', size = '', icon, iconEnd, children, className, ...p }) {
  const cls = cn('btn', `btn-${variant}`, size && `btn-${size}`, className);
  const inner = (<>{icon && <Icon name={icon} size={size === 'sm' ? 15 : 18} />}{children}{iconEnd && <Icon name={iconEnd} size={size === 'sm' ? 15 : 18} />}</>);
  if (to) return <Link to={to} className={cls} {...p}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...p}>{inner}</a>;
  return <button type="button" className={cls} {...p}>{inner}</button>;
}

/* ---------------- Badges / misc ---------------- */
export function Badge({ tone = 'gray', children, className, dot }) {
  return <span className={cn('badge', `badge-${tone}`, className)}>{dot && <i className="badge-dot" />}{children}</span>;
}

const STATUS_TONE = { new: 'blue', reviewing: 'amber', assigned: 'violet', enroute: 'brand', arrived: 'green', done: 'gray', approved: 'green' };
export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONE[status] || 'gray'} dot>{LABEL[status] || status}</Badge>;
}

export function Stars({ n = 5, size = 14 }) {
  return (
    <span className="stars" aria-label={`امتیاز ${n} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={size} className={i <= Math.round(n) ? 'star-on' : 'star-off'} />)}
    </span>
  );
}

/* ---------------- Dual-state Price (قیمت خط‌خورده + قیمت نهایی رنگ برند) ---------------- */
export function Price({ value, old, size = '' }) {
  return (
    <span className={cn('price', size && `price-${size}`)}>
      {old && Number(old) > Number(value || 0) ? (
        <s className="price-old" style={{ textDecoration: 'line-through', color: 'var(--muted-2)' }}>{fmtToman(old)}</s>
      ) : null}
      {value != null ? (
        <b className="price-new" style={{ color: 'var(--brand)' }}>{fmtToman(value)}</b>
      ) : (
        <b>تماس بگیرید</b>
      )}
    </span>
  );
}

/* ---------------- Live Countdown Timer (روز : ساعت : دقیقه : ثانیه) ---------------- */
export function LiveCountdown({ end, compact = false }) {
  const [ms, setMs] = useState(() => Number(end || 0) - Date.now());
  useEffect(() => {
    setMs(Number(end || 0) - Date.now());
    const iv = setInterval(() => setMs(Number(end || 0) - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [end]);

  const c = countdown(ms);
  if (!c) return <span className="expired">مهلت تمام شد</span>;

  const pad = (n) => toFa(String(n).padStart(2, '0'));

  if (compact) {
    return (
      <span className="countdown" aria-label="زمان باقی‌مانده">
        <b>{pad(c.d)}<small>روز</small></b>
        <span className="cd-sep">:</span>
        <b>{pad(c.h)}<small>ساعت</small></b>
        <span className="cd-sep">:</span>
        <b>{pad(c.m)}<small>دقیقه</small></b>
        <span className="cd-sep">:</span>
        <b>{pad(c.s)}<small>ثانیه</small></b>
      </span>
    );
  }

  return (
    <div className="countdown-live" aria-label="تایمر معکوس زنده">
      <div className="cd-unit">
        <b>{pad(c.d)}</b>
        <span>روز</span>
      </div>
      <span className="cd-colon">:</span>
      <div className="cd-unit">
        <b>{pad(c.h)}</b>
        <span>ساعت</span>
      </div>
      <span className="cd-colon">:</span>
      <div className="cd-unit">
        <b>{pad(c.m)}</b>
        <span>دقیقه</span>
      </div>
      <span className="cd-colon">:</span>
      <div className="cd-unit cd-sec">
        <b>{pad(c.s)}</b>
        <span>ثانیه</span>
      </div>
    </div>
  );
}

export function SectionHead({ kicker, title, desc, center, action }) {
  return (
    <div className={cn('sec-head', center && 'sec-center')}>
      <div>
        {kicker && <span className="kicker">{kicker}</span>}
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon = 'search', title, desc, action }) {
  return (
    <div className="empty">
      <span className="empty-ic"><Icon name={icon} size={26} /></span>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ w = '100%', h = 16, r = 10, className, style }) {
  return <span className={cn('sk', className)} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({ children, delay = 0, className, style, as: Tag = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={cn('reveal', className)} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</Tag>;
}

/* ---------------- فیلد شماره موبایل با بررسی زنده ---------------- */
export function PhoneInput({ value, onChange, placeholder = '0912 345 6789', autoFocus }) {
  const err = value ? phoneError(value) : null;
  const good = value && !err;
  return (
    <div className="phone-wrap">
      <div className="phone-box">
        <input
          className={cn('input', err && 'err', good && 'ok')}
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} inputMode="tel" dir="ltr" autoFocus={autoFocus}
          autoComplete="tel"
        />
        {value && (
          <span className={cn('phone-mark', err && 'bad', good && 'good')} title={err || 'شماره معتبر است'}>
            <Icon name={err ? 'alert' : 'check'} size={17} />
          </span>
        )}
      </div>
      {err && <span className="field-error"><Icon name="alert" size={13} /> {err}</span>}
      {good && <span className="field-hint" style={{ color: 'var(--green)', fontWeight: 700 }}>شماره معتبر است ✔</span>}
    </div>
  );
}

/* ---------------- Fields ---------------- */
export function Field({ label, error, hint, children, className }) {
  return (
    <label className={cn('field', className)}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error"><Icon name="alert" size={13} /> {error}</span>}
    </label>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" className={cn('switch', checked && 'on')} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
      <i /><span>{label}</span>
    </button>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, footer, width = 560 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-ov" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          {onClose && <button className="icon-btn" onClick={onClose} aria-label="بستن"><Icon name="x" size={18} /></button>}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, onConfirm, title = 'تأیید حذف', text }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={430}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
        <Btn variant="red" icon="trash" onClick={() => { onConfirm(); onClose(); }}>حذف کن</Btn>
      </>}>
      <p className="confirm-text">{text || 'این مورد برای همیشه حذف می‌شود. مطمئنید؟'}</p>
    </Modal>
  );
}

/* ---------------- Toasts ---------------- */
export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={cn('toast', `toast-${t.type}`)}>
          <Icon name={t.type === 'error' ? 'alert' : 'check'} size={17} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- fake loading hook (skeletons) ---------------- */
export function useFakeLoad(ms = 320) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t); }, [ms]);
  return loading;
}
