import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Icon } from './ui';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const { state } = useStore();
  const s = state.settings || {};
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'assistant', content: 'سلام! 👋 من دستیار هوشمند امداد باتری چابهار هستم. سوالی درباره قیمت‌ها، گارانتی یا ثبت درخواست دارید؟ من اینجام که کمک کنم!' }
  ]);
  
  const endRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    const newMsgs = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    const systemPrompt = `شما دستیار هوشمند و صمیمی سایت "امداد باتری شبانه‌روزی چابهار" هستید.
اطلاعات کلیدی کسب‌وکار:
- نام برند: ${s.brandName}
- شماره تماس فوری: ${s.emergencyPhone}
- آدرس دفتر: ${s.address}
- ساعات کاری: ${s.hours}
- نام تکنسین و امدادگر ارشد مجموعه: "حمید"
- مناطق تحت پوشش: تمامی مناطق چابهار، کنارک، تیس و حومه. صفر تا صد منطقه را پوشش می‌دهیم.
- نحوه ثبت نام و ثبت درخواست: در سایت شماره موبایل را وارد کنید، کد تایید پیامکی (OTP) برای شما ارسال می‌شود. نیازی به تعیین رمز عبور نیست. سپس می‌توانید از روی نقشه یا وارد کردن آدرس، درخواست امداد خود را ثبت کنید.
- پرداخت: درگاه زرین‌پال داریم و پرداخت‌ها کاملا امن است. ودیعه حضور مبلغ ${s.deposit?.amount || 80000} تومان است که از مبلغ نهایی کسر می‌شود.

قوانین شما:
۱. کوتاه، با انرژی و محترمانه (عامیانه ولی حرفه‌ای) پاسخ دهید. از ایموجی‌های مرتبط استفاده کنید.
۲. اگر کاربر در مورد ثبت نام یا ورود سوال پرسید، مرحله به مرحله او را راهنمایی کنید که با وارد کردن شماره موبایل و دریافت پیامک لاگین می‌شود.
۳. در مورد بحث‌های تخصصی‌تر و فنی، اگر جواب قطعی را نمی‌دانید یا مشکل پیچیده به نظر می‌رسد، صادقانه بگویید: "برای بررسی دقیق‌تر و بحث‌های تخصصی‌تر بهتره با خود امدادگر (حمید آقا) تماس بگیرید. شماره تماس مستقیم: ${s.emergencyPhone}".
۴. اگر درباره قیمت باتری پرسیدند، بگویید حدود قیمت‌ها در صفحه فروشگاه هست اما بهتر است درخواست تست دینام و تست باتری ثبت کنند.
۵. هرگز دروغ نگویید و قولی از طرف امدادگر ندهید.
۶. همیشه کاربر را تشویق کنید که از طریق خود سایت فرم امداد را ثبت کند.
۷. فقط به زبان فارسی پاسخ دهید.`;

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error("API KEY missing");

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMsgs.slice(-10) // Send only the last 10 messages to save context
          ],
          temperature: 0.5,
          max_tokens: 500,
        })
      });

      if (!res.ok) throw new Error("API Response Error");
      
      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMsgs([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMsgs([...newMsgs, { role: 'assistant', content: 'ای وای! ارتباط من با سرور قطع شد 😔. لطفاً برای هماهنگی سریع‌تر مستقیم با شماره ' + s.emergencyPhone + ' تماس بگیرید.' }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="chatbot-wrapper" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {/* پنجره چت */}
      <div className={cn('chatbot-window', open && 'open')} style={{
        background: '#fff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        width: 'calc(100vw - 40px)', maxWidth: 380, overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'bottom right',
        transform: open ? 'scale(1)' : 'scale(0)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        marginBottom: 16,
        display: 'flex', flexDirection: 'column',
        height: 480, maxHeight: 'calc(100vh - 100px)'
      }}>
        {/* هدر چت */}
        <div style={{ background: 'var(--brand)', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#fff', color: 'var(--brand)', width: 34, height: 34, borderRadius: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={18} />
            </span>
            <div>
              <b style={{ display: 'block', fontSize: '1rem', lineHeight: 1.2 }}>دستیار هوشمند سایت</b>
              <small style={{ opacity: 0.85, fontSize: '0.8rem' }}>پاسخگوی سریع سوالات شما</small>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8 }}>
            <Icon name="x" size={22} />
          </button>
        </div>

        {/* ناحیه پیام‌ها */}
        <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--brand)' : '#fff',
              color: m.role === 'user' ? '#fff' : 'var(--ink)',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              maxWidth: '85%',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
              border: m.role === 'assistant' ? '1px solid #e1e7f0' : 'none',
              whiteSpace: 'pre-wrap'
            }}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '10px 16px', borderRadius: '14px 14px 14px 2px', border: '1px solid #e1e7f0' }}>
              <span className="dot-flashing" style={{ display: 'flex', gap: 4 }}>
                <i style={{ width: 6, height: 6, background: 'var(--brand)', borderRadius: '50%', animation: 'flash 1.4s infinite linear 0s' }} />
                <i style={{ width: 6, height: 6, background: 'var(--brand)', borderRadius: '50%', animation: 'flash 1.4s infinite linear 0.2s' }} />
                <i style={{ width: 6, height: 6, background: 'var(--brand)', borderRadius: '50%', animation: 'flash 1.4s infinite linear 0.4s' }} />
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* لینک‌های سریع */}
        {!loading && msgs.length < 3 && (
          <div style={{ padding: '0 16px 12px', background: '#f8fafc', display: 'flex', gap: 8, overflowX: 'auto', whiteSpace: 'nowrap' }}>
             <button onClick={() => { setInput('امدادگر چقدر طول میکشه برسه؟'); }} style={{ background: '#fff', border: '1px solid #d4dcec', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', color: 'var(--brand)', cursor: 'pointer', flexShrink: 0 }}>چقدر طول میکشه برسید؟</button>
             <button onClick={() => { setInput('باتری ماشینم خوابیده، باید چیکار کنم؟'); }} style={{ background: '#fff', border: '1px solid #d4dcec', padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', color: 'var(--brand)', cursor: 'pointer', flexShrink: 0 }}>باتری ماشینم خوابیده</button>
          </div>
        )}

        {/* ورودی متن */}
        <div style={{ background: '#fff', padding: 12, borderTop: '1px solid #eef2fa', display: 'flex', gap: 8 }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="پیام خود را بنویسید..." 
            style={{ flex: 1, background: '#f4f6f9', border: 'none', padding: '10px 14px', borderRadius: 20, fontSize: '0.9rem', outline: 'none' }}
          />
          <button 
            onClick={send} 
            disabled={!input.trim() || loading}
            style={{ width: 40, height: 40, background: input.trim() && !loading ? 'var(--brand)' : '#d4dcec', color: '#fff', border: 'none', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', transition: 'background 0.2s' }}>
            <Icon name="telegram" size={20} />
          </button>
        </div>
      </div>

      {/* دکمه شناور */}
      <button 
        className={cn('chatbot-toggle', open && 'open')}
        onClick={() => setOpen(!open)}
        style={{
          width: 58, height: 58, borderRadius: 58, background: 'var(--brand)', color: '#fff', border: 'none', 
          boxShadow: '0 4px 15px rgba(30, 107, 255, 0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s', position: 'relative'
        }}
      >
        <span style={{ position: 'absolute', transition: 'all 0.3s', transform: open ? 'scale(0) rotate(-90deg)' : 'scale(1) rotate(0deg)', opacity: open ? 0 : 1 }}>
          <Icon name="sparkle" size={26} />
        </span>
        <span style={{ position: 'absolute', transition: 'all 0.3s', transform: open ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)', opacity: open ? 1 : 0 }}>
          <Icon name="x" size={28} />
        </span>
      </button>
      
      <style dangerouslySetInnerHTML={{__html: '@keyframes flash { 0% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.2; transform: scale(0.8); } } .chatbot-toggle:hover { transform: scale(1.08); } @media (max-width: 760px) { .chatbot-wrapper { bottom: calc(85px + env(safe-area-inset-bottom)) !important; right: 14px !important; } .chatbot-window { width: calc(100vw - 28px) !important; max-height: 62vh !important; transform-origin: bottom right; } }'}} />
    </div>
  );
}
