import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { Btn, Icon, Modal, Confirm, Field, Badge, Empty } from '../../components/ui';
import { toFa, uid, dOnly, compressImage } from '../../lib/utils';

export default function GalleryAdmin() {
  const { state, upsert, remove, patch, toast } = useStore();
  const cats = [...(state.galleryCats || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const items = state.galleryItems || [];
  const [itemEditing, setItemEditing] = useState(null);
  const [itemDeleting, setItemDeleting] = useState(null);
  const [catEditing, setCatEditing] = useState(null);
  const [catDeleting, setCatDeleting] = useState(null);
  const [newCat, setNewCat] = useState('');

  const addCat = () => {
    if (!newCat.trim()) return;
    upsert('galleryCats', { id: uid(), name: newCat.trim(), order: cats.length + 1 });
    setNewCat('');
    toast('دسته جدید ساخته شد.');
  };

  return (
    <>
      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>دسته‌بندی‌های گالری</h2><p>مثلاً: نصب خودرو، امداد شبانه…</p></div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {cats.map((c) => (
            <span key={c.id} className="chip on" style={{ gap: 10 }}>
              {c.name}
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setCatEditing({ ...c })} aria-label="ویرایش"><Icon name="edit" size={13} /></button>
              <button className="icon-btn" style={{ width: 26, height: 26, color: 'var(--red)' }} onClick={() => setCatDeleting(c)} aria-label="حذف"><Icon name="trash" size={13} /></button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" style={{ maxWidth: 280 }} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="نام دسته جدید…" />
          <Btn variant="dark" icon="plus" onClick={addCat}>افزودن دسته</Btn>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-head">
          <div><h2>عکس‌های گالری</h2><p>{toFa(items.length)} عکس — در صفحه گالری سایت نمایش داده می‌شوند</p></div>
          <Btn variant="primary" icon="plus" onClick={() => setItemEditing({ catId: cats[0]?.id || '', image: '', title: '', at: Date.now() })}>افزودن عکس</Btn>
        </div>
        {items.length === 0 ? <Empty icon="image" title="عکسی ثبت نشده" /> : (
          <div className="cards-grid">
            {items.map((it) => (
              <div key={it.id} className="card" style={{ padding: 12 }}>
                <img src={it.image} alt="" style={{ borderRadius: 12, height: 130, width: '100%', objectFit: 'cover' }} />
                <div style={{ padding: '10px 4px 4px', fontSize: '.85rem' }}>
                  <b>{it.title}</b>
                  <div style={{ color: 'var(--muted)', fontSize: '.78rem', margin: '4px 0 8px' }}>
                    {cats.find((c) => c.id === it.catId)?.name || '—'} • {dOnly(it.at)}
                  </div>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => setItemEditing({ ...it })} aria-label="ویرایش"><Icon name="edit" size={15} /></button>
                    <button className="icon-btn danger" onClick={() => setItemDeleting(it)} aria-label="حذف"><Icon name="trash" size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال عکس */}
      <Modal open={!!itemEditing} onClose={() => setItemEditing(null)} title={itemEditing?.id ? 'ویرایش عکس' : 'افزودن عکس به گالری'}
        footer={<><Btn variant="ghost" onClick={() => setItemEditing(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={() => { if (itemEditing.image && itemEditing.title.trim()) { upsert('galleryItems', itemEditing); setItemEditing(null); toast('ذخیره شد.'); } else toast('عکس و عنوان الزامی است', 'error'); }}>ذخیره</Btn></>}>
        {itemEditing && (
          <div className="form-grid">
            <Field label="عنوان عکس" className="span2">
              <input className="input" value={itemEditing.title} onChange={(e) => setItemEditing({ ...itemEditing, title: e.target.value })} placeholder="مثلاً: نصب باتری در باران — جاده تیس" />
            </Field>
            <Field label="دسته">
              <select className="input" value={itemEditing.catId} onChange={(e) => setItemEditing({ ...itemEditing, catId: e.target.value })}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="فایل تصویر" className="span2">
              <label className="upload-box">
                {itemEditing.image && <img src={itemEditing.image} alt="" className="img-preview" />}
                <Icon name="image" size={22} />
                <div>انتخاب عکس (به‌صورت خودکار فشرده و ذخیره می‌شود)</div>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try { const d = await compressImage(file, 1100, 0.75); setItemEditing((p) => ({ ...p, image: d })); }
                    catch { toast('خواندن فایل ممکن نشد', 'error'); }
                  }} />
              </label>
            </Field>
          </div>
        )}
      </Modal>

      {/* مودال دسته */}
      <Modal open={!!catEditing} onClose={() => setCatEditing(null)} title="ویرایش دسته" width={380}
        footer={<><Btn variant="ghost" onClick={() => setCatEditing(null)}>انصراف</Btn>
          <Btn variant="primary" icon="check" onClick={() => { patch('galleryCats', catEditing.id, { name: catEditing.name }); setCatEditing(null); toast('ذخیره شد.'); }}>ذخیره</Btn></>}>
        {catEditing && <Field label="نام دسته"><input className="input" value={catEditing.name} onChange={(e) => setCatEditing({ ...catEditing, name: e.target.value })} /></Field>}
      </Modal>

      <Confirm open={!!itemDeleting} onClose={() => setItemDeleting(null)} onConfirm={() => { remove('galleryItems', itemDeleting.id); toast('عکس حذف شد.'); }} text="این عکس از گالری حذف شود؟" />
      <Confirm open={!!catDeleting} onClose={() => setCatDeleting(null)} onConfirm={() => { remove('galleryCats', catDeleting.id); toast('دسته حذف شد.'); }} text={`دسته «${catDeleting?.name}» حذف شود؟ عکس‌های آن حذف نمی‌شوند.`} />
    </>
  );
}
