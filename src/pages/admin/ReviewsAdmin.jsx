import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Modal, Confirm, Field, Badge, Stars, Empty, Switch } from '../../components/ui';
import { dt, uid, dOnly } from '../../lib/utils';

export default function ReviewsAdmin() {
  const { state, upsert, remove, patch, toast } = useStore();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mediaEditing, setMediaEditing] = useState(null);
  const [mediaDeleting, setMediaDeleting] = useState(null);

  const reviews = state.reviews || [];
  const media = state.media || [];
  const pending = reviews.filter((r) => !r.approved);

  return (
    <>
      {/* نظرات در انتظار تأیید */}
      {pending.length > 0 && (
        <div className="admin-panel" style={{ borderColor: 'rgba(255,184,0,.5)' }}>
          <div className="panel-head"><div><h2>در انتظار تأیید</h2><p>{pending.length} نظر جدید — تأیید یا رد کنید</p></div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map((r) => (
              <div key={r.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="avatar" style={{ background: 'var(--brand)' }}>{r.name[0]}</span>
                    <div><b>{r.name}</b><Stars n={r.rating} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="green" size="sm" icon="check" onClick={() => { patch('reviews', r.id, { approved: true }); toast('نظر تأیید و منتشر شد.'); }}>تأیید</Btn>
                    <Btn variant="ghost" size="sm" icon="edit" onClick={() => setEditing({ ...r })}>ویرایش</Btn>
                    <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => setDeleting(r)} aria-label="حذف"><Icon name="trash" size={16} /></button>
                  </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: 10 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* همه نظرات */}
      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>نظرات مشتریان</h2><p>نظرهای برگزیده در صفحه اصلی نمایش داده می‌شوند</p></div>
          <Btn variant="primary" icon="plus" onClick={() => setEditing({ name: '', text: '', rating: 5, approved: true, featured: false, at: Date.now() })}>افزودن نظر</Btn>
        </div>
        {reviews.length === 0 ? <Empty icon="star" title="نظری ثبت نشده" /> : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>مشتری</th><th>نظر</th><th>امتیاز</th><th>تأیید</th><th>برگزیده</th><th>تاریخ</th><th></th></tr></thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.name}</td>
                    <td style={{ maxWidth: 300, fontSize: '.85rem', color: 'var(--muted)' }}>{r.text.length > 70 ? r.text.slice(0, 70) + '…' : r.text}</td>
                    <td><Stars n={r.rating} /></td>
                    <td><Switch checked={!!r.approved} onChange={(v) => patch('reviews', r.id, { approved: v })} label="" /></td>
                    <td><Switch checked={!!r.featured} onChange={(v) => patch('reviews', r.id, { featured: v })} label="" /></td>
                    <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{dOnly(r.at)}</td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn" onClick={() => setEditing({ ...r })} aria-label="ویرایش"><Icon name="edit" size={16} /></button>
                        <button className="icon-btn danger" onClick={() => setDeleting(r)} aria-label="حذف"><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* رسانه */}
      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>رسانه (عکس و ویدیو)</h2><p>در صفحه «نظرات و رسانه‌ها» نمایش داده می‌شود</p></div>
          <Btn variant="primary" icon="plus" onClick={() => setMediaEditing({ type: 'image', url: '', title: '', at: Date.now() })}>افزودن رسانه</Btn>
        </div>
        {media.length === 0 ? <Empty icon="image" title="رسانه‌ای ثبت نشده" /> : (
          <div className="cards-grid">
            {media.map((m) => (
              <div key={m.id} className="card" style={{ padding: 12 }}>
                {m.type === 'image'
                  ? <img src={m.url} alt="" style={{ borderRadius: 10, height: 120, width: '100%', objectFit: 'cover' }} />
                  : <video src={m.url} style={{ borderRadius: 10, height: 120, width: '100%', objectFit: 'cover' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px 4px' }}>
                  <div style={{ fontSize: '.85rem' }}>{m.title}</div>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => setMediaEditing({ ...m })} aria-label="ویرایش"><Icon name="edit" size={15} /></button>
                    <button className="icon-btn danger" onClick={() => setMediaDeleting(m)} aria-label="حذف"><Icon name="trash" size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'ویرایش نظر' : 'افزودن نظر'}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={() => { if (editing.name.trim() && editing.text.trim()) { upsert('reviews', editing); setEditing(null); toast('ذخیره شد.'); } }}>ذخیره</Btn></>}>
        {editing && (
          <div className="form-grid">
            <Field label="نام مشتری"><input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="امتیاز (۱ تا ۵)"><input className="input" type="number" min="1" max="5" value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></Field>
            <Field label="متن نظر" className="span2"><textarea className="input" rows={3} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} /></Field>
            <div style={{ display: 'flex', gap: 20 }}>
              <Switch checked={!!editing.approved} onChange={(v) => setEditing({ ...editing, approved: v })} label="تأیید شده" />
              <Switch checked={!!editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="برگزیده صفحه اصلی" />
            </div>
          </div>
        )}
      </Modal>

      {/* Media modal */}
      <Modal open={!!mediaEditing} onClose={() => setMediaEditing(null)} title={mediaEditing?.id ? 'ویرایش رسانه' : 'افزودن رسانه'}
        footer={<><Btn variant="ghost" onClick={() => setMediaEditing(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={() => { if (mediaEditing.url) { upsert('media', mediaEditing); setMediaEditing(null); toast('ذخیره شد.'); } else { toast('فایل یا آدرس رسانه را وارد کنید', 'error'); } }}>ذخیره</Btn></>}>
        {mediaEditing && (
          <div className="form-grid">
            <Field label="نوع">
              <select className="input" value={mediaEditing.type} onChange={(e) => setMediaEditing({ ...mediaEditing, type: e.target.value })}>
                <option value="image">تصویر</option><option value="video">ویدیو</option>
              </select>
            </Field>
            <Field label="عنوان"><input className="input" value={mediaEditing.title} onChange={(e) => setMediaEditing({ ...mediaEditing, title: e.target.value })} /></Field>
            <Field label="فایل" className="span2">
              <label className="upload-box">
                {mediaEditing.url && (mediaEditing.type === 'image'
                  ? <img src={mediaEditing.url} alt="" className="img-preview" />
                  : <video src={mediaEditing.url} className="img-preview" />)}
                <Icon name="image" size={22} />
                <div>انتخاب فایل (تا ۹۰۰ کیلوبایت)</div>
                <input type="file" accept={mediaEditing.type === 'image' ? 'image/*' : 'video/*'} style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 900 * 1024) { alert('حجم فایل را کمتر از ۹۰۰ کیلوبایت انتخاب کنید.'); return; }
                    const r = new FileReader();
                    r.onload = () => setMediaEditing((p) => ({ ...p, url: r.result }));
                    r.readAsDataURL(file);
                  }} />
              </label>
            </Field>
          </div>
        )}
      </Modal>

      <Confirm open={!!deleting} onClose={() => setDeleting(null)} onConfirm={() => { remove('reviews', deleting.id); toast('نظر حذف شد.'); }} text="این نظر حذف شود؟" />
      <Confirm open={!!mediaDeleting} onClose={() => setMediaDeleting(null)} onConfirm={() => { remove('media', mediaDeleting.id); toast('رسانه حذف شد.'); }} text="این رسانه حذف شود؟" />
    </>
  );
}
