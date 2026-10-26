import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Icon } from './ui';
import { cn, toFa } from '../lib/utils';

// پاسخ هوشمند پشتیبان در صورت عدم دسترسی به کلید Groq در محیط ایزوله تست
function buildSmartFallbackReply(text, s) {
  const q = String(text || '').toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));
  const phone = s.emergencyPhone || '0915 346 7788';

  if (has('دینام', 'برق', 'استارت', 'فیوز', 'سیم', 'کابل', 'ECU', 'ecu', 'آمپر', 'ولتاژ', 'سولفاته', 'تعمیر', 'فنی', 'موتور', 'چراغ', 'تق', 'جوش', 'سنگین', 'اسید', 'شارژ نمیشه', 'خاموش')) {
    return 'برای مباحث تخصصی‌تر و بررسی فنی ماشین، بهتره با خود امدادگر (حمید آقا) تماس بگیرید. شماره تماس: ' + phone + ' 📞\nهمچنین می‌تونید همین الان از بخش «درخواست امداد» موقعیتتون رو ثبت کنید تا حمید آقا سریع برسه پیشتون! ⚡';
  }
  if (has('چقدر طول', 'کی میرس', 'چند دقیقه', 'زمان', 'کجایید', 'مسیر')) {
    return 'در محدوده چابهار میانگین زمان رسیدن امدادگر ما (حمید آقا) بین ۱۵ تا ۳۰ دقیقه است 🚀. همین حالا از دکمه «درخواست امداد فوری» سفارشتون رو ثبت کنید تا نزدیک‌ترین واحد اعزام بشه!';
  }
  if (has('قیمت', 'هزینه', 'چند توم', 'باتری چند', 'تعرفه', 'تخفیف')) {
    return 'قیمت روز انواع باتری‌های سپاهان، نیرو، دلکور و سولایت با تخفیف ویژه (کد تخفیف CHB15) در بخش «فروشگاه باتری» درج شده است 🔋. نصب و تست دینام هم با خرید باتری نو رایگان انجام می‌شود!';
  }
  if (has('گارانتی', 'ضمانت')) {
    return 'تمام باتری‌های ما آکبند و دارای ۱۲ تا ۲۴ ماه گارانتی معتبر شرکتی هستند 🛡️ و فاکتور رسمی موقع نصب تقدیم شما می‌شود.';
  }
  if (has('ثبت نام', 'ورود', 'کد', 'پیامک', 'چطور درخواست')) {
    return 'خیلی ساده‌ست! 😊 وارد بخش «درخواست امداد» بشید، شماره موبایلتون رو بزنید (کد تستی: 12345) و در ۳ کلیک ساده موقعیت و نوع خودرو رو مشخص کنید.';
  }
  return 'من دستیار هوشمند امداد باتری چابهار هستم 🤖. برای ثبت اعزام فوری می‌تونید فرم «درخواست امداد» سایت رو پر کنید. ضمناً برای مباحث تخصصی‌تر و بررسی فنی ماشین، بهتره با خود امدادگر (حمید آقا) تماس بگیرید. شماره تماس: ' + phone;
}

export default function Chatbot() {
  const { state, toast } = useStore();
  const s = state.settings || {};
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([
    {
      role: 'assistant',
      content: 'سلام! 👋 من دستیار هوشمند امداد باتری چابهار هستم. سوالی درباره قیمت باتری‌ها، کد تخفیف، زمان اعزام یا ثبت درخواست دارید؟ در خدمتم!'
    }
  ]);

  const bodyRef = useRef(null);
  const endRef = useRef(null);

  // اسکرول اتوماتیک و روان به پایین پس از هر پیام جدید یا تغییر وضعیت تایپ
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (endRef.current) {
        endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    }, 40);
    return () => clearTimeout(timer);
  }, [msgs, open, loading]);

  const send = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text || loading) return;

    if (!navigator.onLine) {
      toast('شما آفلاین هستید. لطفاً اینترنت خود را بررسی کنید.', 'error');
      return;
    }

    const newMsgs = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    const emergencyPhone = s.emergencyPhone || '0915 346 7788';
    const systemPrompt =
      'شما دستیار هوشمند و مودب وب‌اپلیکیشن «امداد باتری شبانه‌روزی چابهار» هستید.\n' +
      'اطلاعات کلیدی کسب‌وکار:\n' +
      '- نام برند: ' + (s.brandName || 'امداد باتری شبانه‌روزی چابهار') + '\n' +
      '- شماره تماس مستقیم امدادگر (حمید آقا): ' + emergencyPhone + '\n' +
      '- آدرس: ' + (s.address || 'چابهار، بلوار ملت، جنب میدان چابهار، پلاک ۲۴') + '\n' +
      '- ساعات کاری: شبانه‌روزی ۲۴ ساعته در ۷ روز هفته\n' +
      '- ودیعه حضور: ' + (s.deposit?.amount || 80000) + ' تومان که به صورت کامل از فاکتور نهایی کسر می‌شود.\n\n' +
      'قوانین بسیار مهم:\n' +
      '1. کوتاه، صمیمی، محترمانه و با ایموجی مناسب به زبان فارسی پاسخ دهید.\n' +
      '2. هرگز خودتان را تعمیرکار یا مکانیک جا نزنید! اگر کاربر سوالات فنی یا تخصصی درباره خودرو، برق ماشین، دینام، استارت یا عیب‌یابی پرسید، محترمانه بگویید: "برای مباحث تخصصی‌تر و بررسی فنی ماشین، بهتره با خود امدادگر (حمید آقا) تماس بگیرید. شماره تماس: ' + emergencyPhone + '"\n' +
      '3. برای ثبت سفارش یا اعزام، کاربر را به فرم آنلاین «درخواست امداد» یا «فروشگاه باتری» راهنمایی کنید.';

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey || apiKey === 'your_groq_api_key_here') {
        await new Promise((r) => setTimeout(r, 900));
        const fallback = buildSmartFallbackReply(text, s);
        setMsgs((prev) => [...prev, { role: 'assistant', content: fallback }]);
        setLoading(false);
        return;
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMsgs.slice(-10)
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      });

      if (!res.ok) throw new Error('Groq API HTTP ' + res.status);

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content || buildSmartFallbackReply(text, s);
      setMsgs((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const fallback = buildSmartFallbackReply(text, s);
      setMsgs((prev) => [...prev, { role: 'assistant', content: fallback }]);
    }

    setLoading(false);
  };

  const quickQuestions = [
    'امدادگر چقدر طول میکشه برسه؟',
    'مشکل فنی دینام و استارت دارم',
    'قیمت باتری‌ها و کد تخفیف چنده؟'
  ];

  return (
    <div className="chatbot-wrapper">
      {/* پنجره چت */}
      <div className={cn('chatbot-window', open && 'open')} aria-hidden={!open}>
        {/* هدر چت */}
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span className="chatbot-avatar">
              <Icon name="sparkle" size={18} />
            </span>
            <div>
              <b style={{ display: 'block', fontSize: '0.96rem', lineHeight: 1.3 }}>دستیار هوشمند چابهار باتری</b>
              <small style={{ opacity: 0.88, fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="chatbot-online-dot" /> آنلاین • پاسخگویی آنی (Groq AI)
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="chatbot-close-btn"
            aria-label="بستن چت‌بات"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* ناحیه پیام‌ها */}
        <div ref={bodyRef} className="chatbot-messages">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={cn('chatbot-bubble', m.role === 'user' ? 'user' : 'assistant')}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chatbot-bubble assistant typing-bubble" aria-label="در حال نوشتن">
              <span className="dot-flashing">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
          <div ref={endRef} style={{ height: 2 }} />
        </div>

        {/* سوالات پرتکرار سریع */}
        {!loading && (
          <div className="chatbot-quick-bar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbot-quick-chip"
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ورودی متن */}
        <div className="chatbot-input-row">
          <input
            className="chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="سوال خود را بنویسید..."
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className={cn('chatbot-send-btn', input.trim() && !loading && 'ready')}
            aria-label="ارسال پیام"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>

      {/* دکمه شناور باز/بسته کردن چت‌بات */}
      

      <style dangerouslySetInnerHTML={{ __html: '@keyframes chatbotDotBounce { 0%, 80%, 100% { opacity: 0.28; transform: translateY(0) scale(0.85); } 40% { opacity: 1; transform: translateY(-4px) scale(1.15); } } .dot-flashing { display: inline-flex; align-items: center; gap: 5px; height: 18px; padding: 0 4px; } .dot-flashing i { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); display: inline-block; animation: chatbotDotBounce 1.25s infinite ease-in-out both; } .dot-flashing i:nth-child(1) { animation-delay: 0s; } .dot-flashing i:nth-child(2) { animation-delay: 0.18s; } .dot-flashing i:nth-child(3) { animation-delay: 0.36s; }' }} />
    </div>
  );
}
