import imgBatteryDefault from '../../assets/images/battery-product.jpg';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { Btn, Icon, Modal, Confirm, Field, Switch, Badge, Stars, Empty, LiveCountdown } from '../../components/ui';
import { ICON_CHOICES } from '../../lib/seed';
import { cn, toFa, dt, uid, fmtToman } from '../../lib/utils';

/* ---------- تعریف ماژول‌ها ---------- */
const MODULES = {
  services: {
    coll: 'services', title: 'خدمات', desc: 'خدمات نمایش‌داده‌شده در سایت و صفحه اصلی',
    defaults: { icon: 'bolt', title: '', desc: '', priceFrom: 0, duration: '', order: 99, active: true },
    schema: [
      { key: 'title', label: 'عنوان خدمت', type: 'text', required: true },
      { key: 'icon', label: 'آیکون', type: 'select', options: ICON_CHOICES },
      { key: 'desc', label: 'توضیح', type: 'textarea', full: true },
      { key: 'duration', label: 'زمان تقریبی', type: 'text', hint: 'مثلاً: ۲۰ دقیقه' },
      { key: 'priceFrom', label: 'قیمت پایه (تومان — صفر یعنی رایگان/تماس)', type: 'number' },
      { key: 'order', label: 'ترتیب نمایش', type: 'number' },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'icon', type: 'icon' },
      { key: 'title', label: 'عنوان', bold: true },
      { key: 'duration', label: 'زمان' },
      { key: 'order', label: 'ترتیب' },
      { key: 'active', label: 'وضعیت', type: 'active' }
    ]
  },
  offers: {
    coll: 'offers',
    title: 'آفرها، کدهای تخفیف و تایمر معکوس',
    desc: 'تخفیف‌های هوشمند با کد تخفیف اختصاصی و تایمر معکوس زنده تا تاریخ انقضا',
    defaults: {
      title: '',
      desc: '',
      code: 'CHB20',
      discountPercent: 15,
      image: '',
      oldPrice: null,
      newPrice: null,
      start: Date.now(),
      end: Date.now() + 7 * 86400000,
      active: true
    },
    schema: [
      { key: 'title', label: 'عنوان آفر', type: 'text', required: true },
      { key: 'code', label: 'کد تخفیف (مثلاً CHB15)', type: 'text', required: true, hint: 'کاربر با وارد کردن این کد در فروشگاه یا درگاه، تخفیف می‌گیرد' },
      { key: 'discountPercent', label: 'درصد تخفیف (٪)', type: 'number', hint: 'مثلاً: ۱۵' },
      { key: 'desc', label: 'توضیح', type: 'textarea', full: true },
      { key: 'image', label: 'تصویر', type: 'image', full: true },
      { key: 'oldPrice', label: 'قیمت اصلی قبل از تخفیف (خط‌خورده)', type: 'number' },
      { key: 'newPrice', label: 'قیمت پس از تخفیف (تومان)', type: 'number' },
      { key: 'start', label: 'تاریخ شروع', type: 'datetime' },
      { key: 'end', label: 'تاریخ انقضا (تایمر معکوس)', type: 'datetime', required: true },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'title', label: 'عنوان آفر', bold: true },
      { key: 'code', label: 'کد تخفیف', type: 'code' },
      { key: 'end', label: 'تایمر معکوس تا انقضا', type: 'countdown' },
      { key: 'end', label: 'وضعیت زمانی', type: 'expiring' },
      { key: 'active', label: 'فعال', type: 'active' }
    ]
  },
  banners: {
    coll: 'banners', title: 'بنرهای تبلیغاتی', desc: 'بنرهای صفحه آفرها و صفحه اصلی — نسخه موبایل و دسکتاپ جداگانه',
    defaults: { title: '', subtitle: '', discount: '', imageDesktop: '', imageMobile: '', link: '/offers', order: 99, active: true },
    schema: [
      { key: 'title', label: 'عنوان', type: 'text', required: true },
      { key: 'subtitle', label: 'زیرتیتر', type: 'text' },
      { key: 'discount', label: 'درصد/برچسب تخفیف', type: 'text', hint: 'مثلاً: ۱۵٪' },
      { key: 'imageDesktop', label: 'تصویر دسکتاپ', type: 'image', full: true },
      { key: 'imageMobile', label: 'تصویر موبایل', type: 'image', full: true },
      { key: 'link', label: 'لینک مقصد', type: 'text', hint: 'مثلاً: /batteries' },
      { key: 'order', label: 'ترتیب نمایش', type: 'number' },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'imageDesktop', label: 'پیش‌نمایش', type: 'thumb' },
      { key: 'title', label: 'عنوان', bold: true },
      { key: 'discount', label: 'تخفیف' },
      { key: 'order', label: 'ترتیب' },
      { key: 'active', label: 'فعال', type: 'active' }
    ]
  },
  batteries: {
    coll: 'batteries', title: 'فروشگاه و قیمت‌گذاری', desc: 'باتری‌ها و قیمت‌های دوحالته (قیمت اصلی خط‌خورده + قیمت فروش) — تغییر قیمت در «تاریخچه» ثبت می‌شود',
    defaults: { brand: '', model: '', capacity: 60, cca: 500, type: 'سیلد (MF)', warranty: 12, price: 0, oldPrice: null, stock: 'in', suitable: '', image: imgBatteryDefault, active: true },
    schema: [
      { key: 'brand', label: 'برند', type: 'text', required: true },
      { key: 'model', label: 'مدل', type: 'text', required: true },
      { key: 'capacity', label: 'آمپراژ', type: 'number' },
      { key: 'cca', label: 'جریان استارت (CCA)', type: 'number' },
      { key: 'type', label: 'نوع', type: 'select', options: ['اسیدی', 'سیلد (MF)', 'AGM', 'ژل'] },
      { key: 'warranty', label: 'گارانتی (ماه)', type: 'number' },
      { key: 'price', label: 'قیمت فروش پس از تخفیف (تومان)', type: 'number', required: true },
      { key: 'oldPrice', label: 'قیمت اصلی قبل از تخفیف — خط‌خورده (تومان)', type: 'number' },
      { key: 'stock', label: 'موجودی', type: 'select', options: [['in', 'موجود'], ['low', 'آخرین موجودی'], ['out', 'ناموجود']] },
      { key: 'suitable', label: 'مناسب برای', type: 'text', full: true },
      { key: 'image', label: 'تصویر', type: 'image', full: true },
      { key: 'active', label: 'نمایش در فروشگاه', type: 'switch' }
    ],
    columns: [
      { key: 'image', label: '', type: 'thumb' },
      { key: 'brand', label: 'برند / مدل', bold: true, join: 'model' },
      { key: 'capacity', label: 'آمپر', type: 'amp' },
      { key: 'price', label: 'قیمت فروش / قیمت قبل', type: 'price' },
      { key: 'stock', label: 'موجودی', type: 'stock' },
      { key: 'active', label: 'فعال', type: 'active' }
    ],
    history: true
  },
  technicians: {
    coll: 'technicians', title: 'امدادگران فعال', desc: 'تیم اعزام — وضعیت آنلاین بودن، منطقه سرویس، عملکرد و رمز ورود به پنل امدادگر',
    defaults: { name: '', phone: '', zone: '', rating: 5, completed: 0, online: true, color: '#1e6bff', password: '123' },
    schema: [
      { key: 'name', label: 'نام امدادگر', type: 'text', required: true },
      { key: 'phone', label: 'شماره تماس', type: 'text', required: true },
      { key: 'zone', label: 'منطقه سرویس‌دهی', type: 'text', full: true },
      { key: 'password', label: 'رمز ورود به پنل امدادگر', type: 'text', hint: 'با همین رمز، امدادگر وارد /tech/login می‌شود (مثلاً: 123)' },
      { key: 'rating', label: 'امتیاز (از ۵)', type: 'number' },
      { key: 'completed', label: 'سرویس‌های تکمیل‌شده', type: 'number' },
      { key: 'color', label: 'رنگ نشان', type: 'select', options: [['#1e6bff', 'آبی'], ['#17b26a', 'سبز'], ['#ffb800', 'زرد'], ['#ee3a2c', 'قرمز'], ['#8b5cf6', 'بنفش']] },
      { key: 'online', label: 'آنلاین', type: 'switch' }
    ],
    columns: [
      { key: 'name', label: 'نام', bold: true, avatar: true },
      { key: 'phone', label: 'موبایل', type: 'fa' },
      { key: 'zone', label: 'منطقه' },
      { key: 'rating', label: 'امتیاز', type: 'stars' },
      { key: 'completed', label: 'سرویس‌ها', type: 'fa' },
      { key: 'online', label: 'وضعیت', type: 'online' }
    ]
  },
  slides: {
    coll: 'slides', title: 'اسلایدشو صفحه اصلی', desc: 'اسلایدهای کاروسل بزرگ صفحه اصلی — نوار آلبوم زیرش به‌صورت خودکار پر می‌شود',
    defaults: { image: '', title: '', subtitle: '', badge: '', link: '/offers', order: 99, active: true },
    schema: [
      { key: 'title', label: 'عنوان اسلاید', type: 'text', required: true },
      { key: 'subtitle', label: 'زیرتیتر', type: 'text' },
      { key: 'badge', label: 'برچسب کوچک', type: 'text', hint: 'مثلاً: تخفیف هفته' },
      { key: 'link', label: 'لینک مقصد', type: 'text', hint: 'مثلاً: /batteries' },
      { key: 'image', label: 'تصویر اسلاید', type: 'image', full: true },
      { key: 'order', label: 'ترتیب نمایش', type: 'number' },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'image', label: 'پیش‌نمایش', type: 'thumb' },
      { key: 'title', label: 'عنوان', bold: true },
      { key: 'badge', label: 'برچسب' },
      { key: 'order', label: 'ترتیب' },
      { key: 'active', label: 'فعال', type: 'active' }
    ]
  },
  areas: {
    coll: 'areas', title: 'مناطق تحت پوشش', desc: 'مناطق سرویس‌دهی و زمان تقریبی اعزام هر منطقه',
    defaults: { name: '', desc: '', eta: '۱۵ تا ۳۰ دقیقه', map: { x: 400, y: 260 }, active: true },
    schema: [
      { key: 'name', label: 'نام منطقه', type: 'text', required: true },
      { key: 'desc', label: 'توضیح / محدوده', type: 'textarea', full: true },
      { key: 'eta', label: 'زمان اعزام', type: 'text', hint: 'مثلاً: ۲۰ تا ۳۵ دقیقه' },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'name', label: 'منطقه', bold: true },
      { key: 'desc', label: 'محدوده' },
      { key: 'eta', label: 'زمان اعزام' },
      { key: 'active', label: 'فعال', type: 'active' }
    ]
  },
  faqs: {
    coll: 'faqs', title: 'سوالات متداول', desc: 'پرسش و پاسخ‌های صفحه سوالات متداول',
    defaults: { q: '', a: '', category: 'عمومی', order: 99, active: true },
    schema: [
      { key: 'q', label: 'سؤال', type: 'text', required: true, full: true },
      { key: 'a', label: 'پاسخ', type: 'textarea', required: true, full: true },
      { key: 'category', label: 'دسته‌بندی', type: 'select', creatable: true, options: ['عمومی', 'سفارش و اعزام', 'باتری و گارانتی', 'پرداخت'] },
      { key: 'order', label: 'ترتیب نمایش', type: 'number' },
      { key: 'active', label: 'فعال', type: 'switch' }
    ],
    columns: [
      { key: 'q', label: 'سؤال', bold: true },
      { key: 'category', label: 'دسته', type: 'badge' },
      { key: 'order', label: 'ترتیب', type: 'fa' },
      { key: 'active', label: 'فعال', type: 'active' }
    ]
  }
};

export default function Crud({ moduleKey }) {
  const mod = MODULES[moduleKey];
  const { state, upsert, remove, toast } = useStore();
  const [sp, setSp] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [historyOf, setHistoryOf] = useState(null);
  const [touched, setTouched] = useState(false);
  const [priceEdit, setPriceEdit] = useState(null); // {id, val}

  const items = useMemo(() => [...(state[mod.coll] || [])].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)), [state, mod]);

  const savePriceInline = (it) => {
    const val = Number(priceEdit.val);
    if (!val || val === it.price) { setPriceEdit(null); return; }
    upsert('batteries', { ...it, oldPrice: it.price > val ? it.price : it.oldPrice, price: val });
    upsert('priceHistory', { id: uid(), batteryId: it.id, label: `${it.brand} ${it.model}`, at: Date.now(), old: it.price, price: val });
    setPriceEdit(null);
    toast('قیمت تغییر کرد و در تاریخچه ثبت شد.');
  };

  useEffect(() => {
    if (sp.get('new') === '1') { setEditing({ ...mod.defaults }); sp.delete('new'); setSp(sp, { replace: true }); }
  }, [sp]);

  const save = () => {
    const e = { ...editing };
    for (const f of mod.schema) {
      if (f.required && (e[f.key] === '' || e[f.key] == null)) { setTouched(true); return; }
    }
    if (mod.coll === 'offers') {
      e.code = String(e.code || 'CHB15').trim().toUpperCase();
      e.expiresAt = new Date(Number(e.end || Date.now())).toISOString();
    }
    if (mod.coll === 'batteries') {
      const old = (state.batteries || []).find((b) => b.id === e.id);
      if (old && old.price !== e.price) {
        upsert('batteries', e);
        upsert('priceHistory', { id: uid(), batteryId: e.id, label: `${e.brand} ${e.model}`, at: Date.now(), old: old.price, price: e.price });
        toast('ذخیره شد — تغییر قیمت در تاریخچه ثبت شد.');
        setEditing(null); setTouched(false);
        return;
      }
    }
    upsert(mod.coll, e);
    toast('با موفقیت ذخیره شد.');
    setEditing(null); setTouched(false);
  };

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>{mod.title}</h2><p>{mod.desc}</p></div>
          <Btn variant="primary" icon="plus" onClick={() => { setTouched(false); setEditing({ ...mod.defaults }); }}>افزودن مورد جدید</Btn>
        </div>

        {items.length === 0 ? (
          <Empty icon="info" title="موردی ثبت نشده" action={<Btn variant="dark" icon="plus" onClick={() => setEditing({ ...mod.defaults })}>اولین مورد را اضافه کنید</Btn>} />
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {mod.columns.map((c, i) => <th key={i}>{c.label}</th>)}
                  <th style={{ width: 120 }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    {mod.columns.map((c, i) => {
                      if (mod.history && c.type === 'price') {
                        return (
                          <td key={i}>
                            {priceEdit?.id === it.id ? (
                              <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input
                                  className="input"
                                  style={{ width: 130, padding: '5px 10px' }}
                                  type="number"
                                  autoFocus
                                  value={priceEdit.val}
                                  onChange={(e) => setPriceEdit({ id: it.id, val: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && savePriceInline(it)}
                                />
                                <button className="icon-btn" onClick={() => savePriceInline(it)} aria-label="ذخیره"><Icon name="check" size={15} /></button>
                              </span>
                            ) : (
                              <div>
                                <button className="price-quick" onClick={() => setPriceEdit({ id: it.id, val: it.price })} title="کلیک: ویرایش سریع قیمت">
                                  <b style={{ color: 'var(--brand)' }}>{fmtToman(it.price)}</b>
                                  <Icon name="edit" size={13} />
                                </button>
                                {it.oldPrice && (
                                  <div>
                                    <s style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.76rem' }}>{fmtToman(it.oldPrice)}</s>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      }
                      return <Cell key={i} c={c} it={it} />;
                    })}
                    <td>
                      <div className="actions">
                        <button className="icon-btn" onClick={() => { setTouched(false); setEditing({ ...it }); }} aria-label="ویرایش"><Icon name="edit" size={16} /></button>
                        {mod.history && <button className="icon-btn" onClick={() => setHistoryOf(it)} aria-label="تاریخچه قیمت" title="تاریخچه قیمت"><Icon name="chart" size={16} /></button>}
                        <button className="icon-btn danger" onClick={() => setDeleting(it)} aria-label="حذف"><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        width={620}
        title={editing?.id ? `ویرایش — ${mod.title}` : `افزودن — ${mod.title}`}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>انصراف</Btn><Btn variant="primary" icon="check" onClick={save}>ذخیره</Btn></>}
      >
        {editing && (
          <div className="form-grid">
            {mod.schema.map((f) => (
              <FieldWrapper
                key={f.key}
                f={f}
                value={editing[f.key]}
                touched={touched}
                onChange={(v) => setEditing((p) => ({ ...p, [f.key]: v }))}
              />
            ))}
          </div>
        )}
      </Modal>

      {/* Price history */}
      <Modal open={!!historyOf} onClose={() => setHistoryOf(null)} width={480} title={historyOf ? `تاریخچه قیمت — ${historyOf.brand} ${historyOf.model}` : ''}>
        {historyOf && (() => {
          const h = (state.priceHistory || []).filter((p) => p.batteryId === historyOf.id).sort((a, b) => b.at - a.at);
          if (h.length === 0) return <Empty icon="chart" title="تغییری ثبت نشده" desc="با تغییر قیمت در فرم ویرایش، تاریخچه اینجا ساخته می‌شود." />;
          return (
            <>
              {h.map((p) => (
                <div key={p.id} className="history-dot">
                  <span className="when">{dt(p.at)}</span>
                  <span>{fmtToman(p.old)}</span>
                  <Icon name="chevron" size={13} style={{ transform: 'rotate(180deg)', color: 'var(--muted-2)' }} />
                  <span className={p.price > p.old ? 'price-up' : 'price-down'}>{fmtToman(p.price)}</span>
                </div>
              ))}
            </>
          );
        })()}
      </Modal>

      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { remove(mod.coll, deleting.id); toast('حذف شد.'); }}
        text={`«${deleting?.title || deleting?.name || deleting?.q || deleting?.brand || 'این مورد'}» حذف شود؟`}
      />
    </>
  );
}

/* ---------- نمایش سلول‌های جدول ---------- */
function Cell({ c, it }) {
  const v = c.join ? `${it[c.key]} ${it[c.join]}` : it[c.key];
  switch (c.type) {
    case 'icon': return <td><span className="svc-ic" style={{ width: 38, height: 38, borderRadius: 11, margin: 0 }}><Icon name={v} size={18} /></span></td>;
    case 'thumb': return <td>{v ? <img src={v} alt="" style={{ width: 58, height: 40, objectFit: 'cover', borderRadius: 8 }} /> : '—'}</td>;
    case 'date': return <td style={{ fontSize: '.83rem', color: 'var(--muted)' }}>{dt(v)}</td>;
    case 'code': return <td><Badge tone="brand">{v || '—'} {it.discountPercent ? `(${toFa(it.discountPercent)}٪)` : ''}</Badge></td>;
    case 'countdown': return <td><LiveCountdown end={v} compact /></td>;
    case 'expiring': return <td>{v > Date.now() ? <Badge tone="green">در جریان</Badge> : <Badge tone="red">منقضی</Badge>}</td>;
    case 'active': return <td>{v ? <Badge tone="green">فعال</Badge> : <Badge tone="gray">غیرفعال</Badge>}</td>;
    case 'price': return <td><b>{fmtToman(v)}</b></td>;
    case 'amp': return <td>{toFa(v)} آمپر</td>;
    case 'stock': return <td>{v === 'in' ? <Badge tone="green">موجود</Badge> : v === 'low' ? <Badge tone="amber">کم</Badge> : <Badge tone="red">ناموجود</Badge>}</td>;
    case 'stars': return <td><Stars n={v} /></td>;
    case 'online': return <td>{v ? <Badge tone="green" dot>آنلاین</Badge> : <Badge tone="gray">آفلاین</Badge>}</td>;
    case 'badge': return <td><Badge tone="blue">{v}</Badge></td>;
    case 'fa': return <td>{toFa(v)}</td>;
    default: return <td className={cn(c.bold && 'bold-cell')} style={c.bold ? { fontWeight: 700 } : null}>{v == null || v === '' ? '—' : String(v).length > 60 ? v.slice(0, 60) + '…' : v}</td>;
  }
}

/* ---------- فرم داینامیک ---------- */
function FieldWrapper({ f, value, onChange, touched }) {
  const invalid = touched && f.required && (value === '' || value == null);
  const common = { className: cn('input', invalid && 'err'), value: value ?? '', onChange: (e) => onChange(e.target.value) };
  return (
    <Field label={f.label} hint={f.hint} error={invalid && 'این فیلد الزامی است'} className={f.full || f.type === 'switch' ? 'span2' : ''}>
      {f.type === 'textarea' && <textarea {...common} rows={3} />}
      {f.type === 'text' && <input {...common} />}
      {f.type === 'number' && <input {...common} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />}
      {f.type === 'datetime' && <input {...common} type="datetime-local" value={toLocal(value)} onChange={(e) => onChange(new Date(e.target.value).getTime() || Date.now())} />}
      {f.type === 'select' && (() => {
        const opts = f.options || [];
        if (f.creatable) {
          return (
            <>
              <input {...common} list={`list-${f.key}`} />
              <datalist id={`list-${f.key}`}>{opts.map((o) => <option key={o} value={o} />)}</datalist>
            </>
          );
        }
        const isPairs = opts.length > 0 && Array.isArray(opts[0]);
        return (
          <select {...common}>
            <option value="">انتخاب کنید…</option>
            {isPairs
              ? opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)
              : opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      })()}
      {f.type === 'switch' && <div style={{ paddingTop: 6 }}><Switch checked={!!value} onChange={onChange} label={value ? 'روشن' : 'خاموش'} /></div>}
      {f.type === 'image' && <ImageField value={value} onChange={onChange} />}
    </Field>
  );
}

function toLocal(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function ImageField({ value, onChange }) {
  return (
    <div>
      {value && <img src={value} alt="" className="img-preview" />}
      <label className="upload-box">
        <Icon name="image" size={22} />
        <div>برای انتخاب تصویر کلیک کنید (یا آدرس را پایین وارد کنید)</div>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 900 * 1024) { alert('حجم تصویر را کمتر از ۹۰۰ کیلوبایت انتخاب کنید.'); return; }
            const r = new FileReader();
            r.onload = () => onChange(r.result);
            r.readAsDataURL(file);
          }}
        />
      </label>
      <input className="input" style={{ marginTop: 8 }} value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} placeholder="/images/… یا آدرس اینترنتی تصویر" />
    </div>
  );
}
