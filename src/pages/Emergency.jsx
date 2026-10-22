import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Btn, Icon, Field } from '../components/ui';
import ChabaharMap from '../components/ChabaharMap';
import { cn, normPhone, toFa, uid, reqCode, addrError, declError, aiCheckLocation, aiCheckVehicle, BRAND_GROUPS, VEHICLE_DB } from '../lib/utils';
import { notifyOwner } from '../lib/notify';

const PROBLEMS = [
  { key: 'باتری خوابیده', icon: 'battery', hint: 'استارت نمی‌خورد' },
  { key: 'روشن نمی‌شود', icon: 'car', hint: 'با گاز هم نه' },
  { key: 'نیاز به تعویض', icon: 'wrench', hint: 'باتری نو می‌خواهم' },
  { key: 'تست باتری', icon: 'gauge', hint: 'قبل از سفر' },
  { key: 'سایر', icon: 'info', hint: 'چیز دیگر' }
];
const STEPS = ['مشکل و خودرو', 'کجا هستید', 'تایید'];
const CUST_KEY = 'chb_customer';

export default function Emergency() {
  const { state, update, toast } = useStore();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [ai, setAi] = useState(null);
  const [modelOverride, setModelOverride] = useState(false);
  const [customModel, setCustomModel] = useState(false);
  const [f, setF] = useState(() => ({
    problem: sp.get('problem') || '',
    brand: '', model: '', garageId: null,
    loc: { x: null, y: null, desc: '' },
    decl: ''
  }));
  const set = (part) => setF((p) => ({ ...p, ...part }));

  const acct = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem(CUST_KEY)) || null; } catch { return null; }
  }, []);
  if (!acct) return <Navigate to="/auth?next=/emergency" replace />;
  const myGarage = (state.garage || []).filter((g) => g.phone === acct.phone);
  const lastReq = (state.requests || []).filter((r) => r.phone === acct.phone).sort((a, b) => b.createdAt - a.createdAt)[0];

  const picked = !!(f.loc.x && f.loc.y);
  const locErr = addrError(f.loc.desc, picked);
  const declT = f.decl.trim();
  const declErrV = declT.length > 0 ? declError(declT) : null;

  // دستیار هوشمند خودرو — بدون سال ساخت، فقط برند/مدل
  const veh = useMemo(
    () => (f.brand && f.model) ? aiCheckVehicle({ brand: f.brand, model: f.model, year: '' }) : null,
    [f.brand, f.model]
  );
  const modelUnknown = veh?.modelState === 'unknown';
  const modelBad = veh?.modelState === 'bad';
  const vehOk = !!f.garageId || (!!f.brand && !!f.model && !modelBad && (!modelUnknown || modelOverride));

  const valid = useMemo(() => [
    !!f.problem && vehOk,
    !locErr && (!!picked || f.loc.desc.trim().length >= 10),
    !declErrV
  ], [f, locErr, declErrV, picked, vehOk]);

  const s = state.settings;
  const offline = s.status === 'offline';
  const dep = s.deposit || { amount: 0, enabled: true };

  const myReqs = (state.requests || []).filter((r) => r.phone === acct.phone);
  const activeCount = myReqs.filter((r) => r.status !== 'done').length;
  const todayCount = myReqs.filter((r) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length;
  const lim = s.limits || { maxActive: 1, maxDaily: 3 };
  const limitBlocked = activeCount >= (lim.maxActive || 1) || todayCount >= (lim.maxDaily || 3);

  const next = () => { if (!valid[step]) { setTouched(true); return; } setTouched(false); setStep((x) => Math.min(2, x + 1)); };
  const back = () => { setTouched(false); setStep((x) => Math.max(0, x - 1)); };

  /* --- سورپرایز: «مثل دفعه قبل» — یک لمس، همه‌چیز مثل درخواست آخر --- */
  const likeLast = () => {
    if (!lastReq) return;
    set({
      problem: lastReq.problem || 'باتری خوابیده',
      brand: lastReq.vehicle?.brand || '', model: lastReq.vehicle?.model || '', garageId: null,
      loc: { x: lastReq.location?.x ?? null, y: lastReq.location?.y ?? null, desc: lastReq.location?.desc || '' },
      decl: ''
    });
    setModelOverride(true); setCustomModel(false);
    setStep(2); // مستقیم به تایید!
    toast('همان درخواست قبلی آماده شد — فقط تایید کنید ⚡');
  };

  const runAi = (loc = f.loc) => {
    setAi({ running: true, result: null });
    setTimeout(() => {
      const result = aiCheckLocation({ desc: loc.desc, point: loc.x && loc.y ? { x: loc.x, y: loc.y } : null, areas: state.areas.filter((a) => a.active) });
      setAi({ running: false, result });
    }, 1400);
  };

  const gps = () => {
    if (!navigator.geolocation) { toast('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند؛ روی نقشه انتخاب کنید.', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { ...f.loc, x: 445 + Math.round(Math.random() * 60 - 30), y: 300 + Math.round(Math.random() * 40 - 20) };
        set({ loc }); toast('موقعیت GPS دریافت شد');
        runAi(loc);
      },
      () => toast('دسترسی به موقعیت ممکن نشد؛ روی نقشه انتخاب کنید.', 'error'),
      { timeout: 8000 }
    );
  };

  const submit = () => {
    if (!navigator.onLine) { toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error'); return; }
    if (offline) { toast('در حال حاضر امکان ثبت درخواست نیست؛ با شماره امداد تماس بگیرید.', 'error'); return; }
    if (limitBlocked) { toast('سقف درخواست‌های شما پر است؛ برای موارد فوری با شماره امداد تماس بگیرید.', 'error'); return; }
    if (!valid[0] || !valid[1] || !valid[2]) { setTouched(true); return; }
    const g = (state.garage || []).find((x) => x.id === f.garageId);
    const vehicle = g ? { brand: g.brand, model: g.model, year: g.year || '' } : { brand: f.brand, model: f.model, year: '' };
    const code = reqCode();
    const check = ai?.result || aiCheckLocation({ desc: f.loc.desc, point: picked ? { x: f.loc.x, y: f.loc.y } : null, areas: state.areas.filter((a) => a.active) });
    const defaultTech = (state.technicians || []).find((t) => t.online) || (state.technicians || [])[0];
    const req = {
      id: uid(), code, name: acct.name, phone: acct.phone,
      problem: f.problem, vehicle,
      location: { desc: f.loc.desc || 'موقعیت انتخاب‌شده روی نقشه', x: f.loc.x || 445, y: f.loc.y || 300 },
      declaration: declT,
      aiCheck: { confidence: check.confidence, area: check.area, flags: check.flags },
      vehCheck: veh ? { modelState: veh.modelState, suggestion: veh.suggestion, override: modelOverride } : null,
      deposit: dep.enabled && dep.amount > 0 ? { status: 'pending', amount: dep.amount } : { status: 'waived', amount: 0 },
      status: 'new', createdAt: Date.now(),
      timeline: [{ status: 'new', at: Date.now() }],
      technicianId: defaultTech ? defaultTech.id : 'tc1', travel: 150 + Math.floor(Math.random() * 90),
      manualHold: false, internalNotes: [], report: null, chat: []
    };
    update((st) => {
      // خودرو در گاراژ حساب سیو شود (بدون تکرار)
      const exists = (st.garage || []).some((x) => x.phone === acct.phone && x.brand === vehicle.brand && x.model === vehicle.model);
      const garage = exists ? st.garage : [...(st.garage || []), { id: uid(), phone: acct.phone, brand: vehicle.brand, model: vehicle.model, year: '' }];
      return { ...st, requests: [req, ...st.requests], garage };
    });
    notifyOwner(state, {
      title: '🚨 درخواست امداد جدید — ' + code,
      body: `${acct.name} — ${acct.phone}\n${f.problem} — ${vehicle.brand} ${vehicle.model}\nموقعیت: ${req.location.desc}`
    });
    toast(`درخواست ${toFa(code)} ثبت شد!`);
    nav(`/track/${code}`);
  };

  const err = (ok) => touched && !ok;
  const modelList = VEHICLE_DB[f.brand] || [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">سریع مثل یک تماس تلفنی — فقط با حساب کاربری</span>
          <h1>درخواست امداد فوری</h1>
          <p style={{ marginInline: 'auto' }}>سه لمس بیشتر نیست: مشکل، محل، تایید.</p>
        </div>

        {s.status !== 'active' && (
          <div className="note-box" style={{ marginBottom: 22, justifyContent: 'center' }}>
            <Icon name="alert" size={18} /> {s.statusMessage} — برای هماهنگی: <b style={{ direction: 'ltr' }}>{toFa(s.emergencyPhone)}</b>
          </div>
        )}
        {limitBlocked && (
          <div className="note-box" style={{ marginBottom: 22, justifyContent: 'center', borderColor: 'rgba(238,58,44,.5)', background: 'rgba(238,58,44,.07)', color: 'var(--red)' }}>
            <Icon name="alert" size={18} /> شما {toFa(activeCount)} درخواست فعال و {toFa(todayCount)} درخواست امروز دارید. سقف مجاز: {toFa(lim.maxActive)} فعال و {toFa(lim.maxDaily)} در روز.
          </div>
        )}

        {/* سورپرایز: مثل دفعه قبل */}
        {lastReq && step === 0 && !limitBlocked && (
          <button className="like-last" onClick={likeLast}>
            <span className="ll-ic"><Icon name="bolt" size={22} /></span>
            <span style={{ flex: 1, textAlign: 'start' }}>
              <b>مثل دفعه قبل — یک لمس!</b>
              <small>{lastReq.vehicle?.brand} {lastReq.vehicle?.model} — {lastReq.problem} — {lastReq.location?.desc?.slice(0, 38)}</small>
            </span>
            <span className="ll-go">برو به تایید <Icon name="chevron" size={16} /></span>
          </button>
        )}

        <div className="wizard">
          <div className="progress-steps" aria-label="مراحل درخواست">
            {STEPS.map((label, i) => (
              <div key={label} className={cn('pstep', i === step && 'active', i < step && 'done')}>
                <span className="pstep-dot">{i < step ? <Icon name="check" size={15} /> : toFa(i + 1)}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="wiz-card">
            {/* ===== مرحله ۰: مشکل + خودرو (همه چی دکمه‌ای، بدون تایپ) ===== */}
            {step === 0 && (
              <>
                <div className="wiz-title"><span className="svc-ic"><Icon name="alert" size={22} /></span><div><h2>چه اتفاقی افتاده؟</h2><p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>دو انتخاب: مشکل و ماشین</p></div></div>

                <div className="chip-row" role="radiogroup">
                  {PROBLEMS.map((p) => (
                    <button key={p.key} type="button" className={cn('chip', f.problem === p.key && 'on')} onClick={() => set({ problem: p.key })} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '13px 17px' }}>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name={p.icon} size={18} /> {p.key}</span>
                      <small style={{ fontWeight: 500, fontSize: '.78rem', opacity: 0.75 }}>{p.hint}</small>
                    </button>
                  ))}
                </div>
                {err(!f.problem) && <p className="field-error" style={{ marginTop: 14 }}><Icon name="alert" size={14} /> لطفاً نوع مشکل را انتخاب کنید.</p>}

                <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />
                <div className="wiz-title" style={{ marginBottom: 14 }}><span className="svc-ic"><Icon name="car" size={22} /></span><div><h2>ماشینتان کدام است؟</h2><p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>اول برند، بعد مدل — همه‌چی دکمه‌ای است</p></div></div>

                {myGarage.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 10 }}><Icon name="star" size={15} /> ماشین‌های سیو‌شدهٔ شما:</p>
                    <div className="chip-row">
                      {myGarage.map((g) => (
                        <button key={g.id} className={cn('chip', f.garageId === g.id && 'on')} onClick={() => { set({ garageId: f.garageId === g.id ? null : g.id, brand: f.garageId === g.id ? '' : g.brand, model: f.garageId === g.id ? '' : g.model }); setModelOverride(false); }}>
                          <Icon name="car" size={16} /> {g.brand} {g.model}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {BRAND_GROUPS.map((grp) => (
                  <div key={grp.label} style={{ marginBottom: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: '.84rem', color: 'var(--muted)', marginBottom: 8 }}>{grp.label}:</p>
                    <div className="chip-row">
                      {grp.items.map((b) => (
                        <button key={b} className={cn('chip', f.brand === b && !f.garageId && 'on')} onClick={() => { set({ brand: b, model: '', garageId: null }); setModelOverride(false); setCustomModel(false); }}>{b}</button>
                      ))}
                    </div>
                  </div>
                ))}

                {f.brand && !f.garageId && (
                  <div style={{ marginTop: 6 }}>
                    <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 10 }}><Icon name="chevron" size={15} /> مدل {f.brand}:</p>
                    {modelList.length > 0 ? (
                      <>
                        <div className="chip-row">
                          {modelList.map((mm) => (
                            <button key={mm} className={cn('chip', f.model === mm && !customModel && 'on')} onClick={() => { set({ model: mm }); setModelOverride(false); setCustomModel(false); }}>{mm}</button>
                          ))}
                          <button className={cn('chip', customModel && 'on')} onClick={() => { setCustomModel(true); set({ model: '' }); }}><Icon name="edit" size={15} /> مدل دیگر</button>
                        </div>
                        {customModel && (
                          <Field label="مدل را دقیق بنویسید" className="span2" error={modelBad && 'این متن مثل یک مدل واقعی به نظر نمی‌رسد'}>
                            <input className={cn('input', modelBad && 'err')} value={f.model} onChange={(e) => { set({ model: e.target.value }); setModelOverride(false); }} placeholder="مثلاً: 206 تیپ ۵" autoFocus />
                          </Field>
                        )}
                        {veh && (modelUnknown || modelBad) && !customModel && (
                          <div className={cn('ai-veh', modelBad ? 'err' : 'warn')}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span className="ai-orb" style={{ width: 26, height: 26, animation: 'none' }} />
                              <b style={{ fontSize: '.92rem' }}>{modelBad ? 'دستیار هوشمند: این مدل منطقی نیست' : 'دستیار هوشمند: نیاز به دقت'}</b>
                            </div>
                            {veh.tips.map((t, i) => <p key={i} style={{ fontSize: '.84rem', color: 'var(--muted)', marginTop: 6 }}>{t}</p>)}
                            {modelUnknown && (
                              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                                {veh.suggestion && <button className="chip" onClick={() => { set({ model: veh.suggestion }); setModelOverride(false); }}><Icon name="sparkle" size={15} /> پیشنهاد: {f.brand} {veh.suggestion}</button>}
                                <label style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: '.85rem', fontWeight: 700 }}>
                                  <input type="checkbox" checked={modelOverride} onChange={(e) => setModelOverride(e.target.checked)} />
                                  مدل همین است که انتخاب کردم
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <Field label={`مدل ${f.brand}`} error={err(!f.model) && 'مدل را بنویسید'}>
                        <input className={cn('input', err(!f.model) && 'err', modelBad && 'err')} value={f.model} onChange={(e) => { set({ model: e.target.value }); setModelOverride(false); }} placeholder="مثلاً: جرثقیل، کمبیون…" />
                      </Field>
                    )}
                  </div>
                )}
                {err(f.problem && !vehOk) && <p className="field-error" style={{ marginTop: 12 }}><Icon name="alert" size={14} /> ابتدا مشکل مشخص‌شدهٔ بالا را برطرف کنید.</p>}
              </>
            )}

            {/* ===== مرحله ۱: موقعیت ===== */}
            {step === 1 && (
              <>
                <div className="wiz-title"><span className="svc-ic"><Icon name="pin" size={22} /></span><div><h2>کجا هستید؟</h2><p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>روی نقشه بزنید یا آدرس بنویسید — یا هر دو</p></div></div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <Btn variant="dark" icon="pin" size="sm" onClick={gps}>دریافت موقعیت GPS</Btn>
                  {f.loc.desc.trim().length >= 10 && <Btn variant="ghost" icon="sparkle" size="sm" onClick={() => runAi()}>بررسی هوشمند موقعیت</Btn>}
                </div>
                <ChabaharMap pick theme="light" areas={state.areas.filter((a) => a.active)}
                  userPoint={picked ? { x: f.loc.x, y: f.loc.y } : null}
                  onPick={({ x, y }) => set({ loc: { ...f.loc, x, y } })} />
                <div style={{ marginTop: 14 }}>
                  <Field label="توضیح آدرس" hint="مثلاً: بلوار ملت، نبش کوچه ۱۲، جنب پمپ بنزین"
                    error={(touched && locErr) && locErr}>
                    <textarea className={cn('input', (touched && locErr) && 'err')} rows={2} value={f.loc.desc}
                      onChange={(e) => set({ loc: { ...f.loc, desc: e.target.value } })}
                      placeholder="نزدیک کدام میدان یا بلوار هستید؟" />
                  </Field>
                </div>
                {ai && (
                  <div className="ai-panel">
                    {ai.running ? (
                      <div className="ai-running">
                        <span className="ai-orb" />
                        <div><b>در حال تحلیل موقعیت…</b><small>تطبیق با مناطق تحت پوشش • اعتبارسنجی نقطه نقشه</small></div>
                      </div>
                    ) : (
                      <div className="ai-result">
                        <div className="ai-head">
                          <span className={cn('ai-verdict', ai.result.ok ? 'ok' : 'warn')}>
                            <Icon name={ai.result.ok ? 'check' : 'alert'} size={16} />
                            {ai.result.ok ? 'موقعیت تایید شد' : 'نیاز به دقت بیشتر'}
                          </span>
                          <span className="ai-conf"><i style={{ width: `${ai.result.confidence}%` }} /> دقت تخمین: <b>{toFa(ai.result.confidence)}٪</b></span>
                        </div>
                        {ai.result.area && <div className="ai-line"><Icon name="pin" size={14} /> نزدیک‌ترین منطقه: <b>{ai.result.area}</b></div>}
                        {ai.result.flags.map((fl, i) => <div key={i} className="ai-line warn"><Icon name="info" size={14} /> {fl}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ===== مرحله ۲: تایید نهایی ===== */}
            {step === 2 && (
              <>
                <div className="wiz-title"><span className="svc-ic" style={{ background: 'linear-gradient(140deg,#2a0d0a,#571a14)', color: '#ff8d84' }}><Icon name="bolt" size={22} /></span><div><h2>تایید و اعزام</h2><p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>درست است؟ بزنید و خیالتان راحت</p></div></div>
                <div className="summary-box">
                  <div className="sum-row"><span>درخواست‌دهنده</span><b>{acct.name} — {toFa(acct.phone)} ✔ احراز شده</b></div>
                  <div className="sum-row"><span>نوع مشکل</span><b>{f.problem}</b></div>
                  <div className="sum-row"><span>خودرو</span><b>{f.brand} {f.model} {veh && !modelBad && !modelUnknown && '✔ تایید هوشمند'}</b></div>
                  <div className="sum-row"><span>موقعیت</span><b style={{ textAlign: 'left' }}>{f.loc.desc || 'روی نقشه انتخاب شده'} {ai?.result?.area && `(نزدیک ${ai.result.area})`}</b></div>
                  <div className="sum-row"><span>ودیعه حضور</span><b>{dep.enabled ? `${toFa((dep.amount || 0).toLocaleString('en-US'))} تومان (قابل کسر از فاکتور)` : 'معاف'}</b></div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Field label="توضیح اضافه (اختیاری — اگر عجله دارید رد شوید)"
                    error={(touched && declErrV) && declErrV}>
                    <textarea className={cn('input', (touched && declErrV) && 'err')} rows={2} value={f.decl}
                      onChange={(e) => set({ decl: e.target.value })}
                      placeholder="مثلاً: پشت کامیون پارک شده، دسترسی از کوچه پشتی…" />
                  </Field>
                </div>
                <div className="note-box" style={{ marginTop: 12 }}><Icon name="shield" size={17} /> درخواست به نام و شماره شما ضبط می‌شود؛ پس از تایید ودیعه، امدادگر اعزام می‌شود.</div>
              </>
            )}

            <div className="wiz-nav">
              {step > 0 ? <Btn variant="ghost" icon="chevron" onClick={back}>مرحله قبل</Btn> : <span />}
              {step < 2
                ? <Btn onClick={next} iconEnd="chevron">مرحله بعد</Btn>
                : <Btn variant="red" size="lg" icon="bolt" onClick={submit} disabled={offline || limitBlocked}>تایید و اعزام امداد</Btn>}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: '.88rem', color: 'var(--muted)' }}>
            فوری‌تر از فرم؟ <a href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} style={{ color: 'var(--red)', fontWeight: 800 }}>{toFa(s.emergencyPhone)}</a> را بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
}
