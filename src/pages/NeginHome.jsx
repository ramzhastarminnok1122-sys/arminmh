import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ArrowLeft, Cpu, ShieldCheck, Layers, ArrowUpRight, Grid, MapPin } from 'lucide-react';

// --- 1. THE 0-100 LOADER ---
function PageLoader({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let start = null;
    const duration = 1300;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      
      setProgress(Math.round(ease(t) * 100));

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => onReady(), 800);
        }, 300);
      }
    };
    requestAnimationFrame(animate);
  }, [onReady]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: '#0a0a0a', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '2rem', borderRadius: '0 0 2rem 2rem'
          }}
        >
          <motion.div exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a3e635', marginBottom: '0.5rem' }}>نگین باتری</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>انرژی پایدار، با نهایت دقت.</p>
          </motion.div>

          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ width: 'min(22rem, 72vw)' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', background: '#a3e635', width: `${progress}%`, transition: 'width 0.1s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>در حال بارگذاری سیستم</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#fff' }}>{progress.toString().padStart(3, '0')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- HEADER (OVERLAY) ---
function Header({ ready }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '1.5rem', height: '1.5rem', background: '#a3e635', borderRadius: '4px' }}></div>
        نگین باتری
      </div>

      <nav style={{ display: 'flex', gap: '2rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
        <a href="#products" style={{ cursor: 'pointer' }}>محصولات</a>
        <a href="#agencies" style={{ cursor: 'pointer' }}>نمایندگان</a>
        <a href="#about" style={{ cursor: 'pointer' }}>درباره ما</a>
        <a href="#contact" style={{ cursor: 'pointer' }}>تماس با ما</a>
      </nav>

      <button style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Grid size={16} /> پنل کاربری B2B
      </button>
    </motion.header>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function NeginHome() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Parallax the hero background
  const yBg = useTransform(scrollYProgress, [0, 0.3], ['0%', '20%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({ smoothWheel: true, duration: 1.2 });
    
    if (!ready) lenis.stop();
    else lenis.start();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [ready]);

  return (
    <>
      {!ready && <PageLoader onReady={() => setReady(true)} />}
      
      <div ref={containerRef} style={{ background: '#0a0a0a', minHeight: '200vh' }}>
        <Header ready={ready} />

        {/* 1. CINEMATIC HERO */}
        <section style={{ height: '110vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4rem' }}>
          {/* Background Image */}
          <motion.div 
            style={{ 
              position: 'absolute', inset: -50, zIndex: 0, y: yBg,
              backgroundImage: 'url(/negin-battery-master.png)', backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(0.35) contrast(1.2)'
            }} 
          />
          {/* Bottom Gradient Fade to White Section */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30vh', background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)', zIndex: 1 }} />

          <motion.div style={{ position: 'relative', zIndex: 10, maxWidth: '88rem', margin: '0 auto', width: '100%', opacity: opacityHero }}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.8 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#a3e635', marginBottom: '1.5rem', background: 'rgba(163,230,53,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(163,230,53,0.2)' }}
            >
              <Sparkles size={16} /> نسل جدید ذخیره‌سازهای صنعتی
            </motion.div>
            
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
              ایده‌های بزرگ،<br/>
              ساخته شده با <span style={{ color: '#a3e635' }}>دقت بی‌صدا.</span>
            </h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 0.8 }}
              style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}
            >
              <button style={{ background: '#a3e635', color: '#0a0a0a', padding: '1rem 2rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 700 }}>درخواست همکاری B2B</button>
              <button style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', padding: '1rem 2rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>مشاهده محصولات</button>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. CORPORATE BODY (WHITE) - PRODUCTS & FEATURES */}
        <section id="products" style={{ position: 'relative', zIndex: 20, background: '#ffffff', borderRadius: '2.5rem 2.5rem 0 0', marginTop: '-15vh', padding: '8rem 2rem' }}>
          <div style={{ maxWidth: '88rem', margin: '0 auto' }}>
            
            {/* SEPAHAN STYLE: Horizontal Feature Menu (About / Tech / News) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '8rem', borderBottom: '1px solid #e6e5e2', paddingBottom: '4rem' }}>
              {[
                { title: 'درباره نگین باتری', desc: 'آشنایی با خط تولید و استانداردهای جهانی', icon: <Layers size={24} color="#a3e635" /> },
                { title: 'محصولات در یک نگاه', desc: 'دسترسی سریع به کاتالوگ جامع باتری‌ها', icon: <Cpu size={24} color="#a3e635" /> },
                { title: 'اخبار و مقالات', desc: 'آخرین رویدادها و دستاوردهای صنعتی', icon: <Globe2 size={24} color="#a3e635" /> },
                { title: 'خدمات پس از فروش', desc: 'استعلام گارانتی و درخواست امداد', icon: <ShieldCheck size={24} color="#a3e635" /> }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}>
                  <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0a0a0a', marginBottom: '0.25rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* PRODUCT SHOWCASE (Dark Cards) */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0a0a0a', marginBottom: '1rem' }}>تأمین انرژی؛ از خودرو تا صنعت</h2>
              <p style={{ fontSize: '1.125rem', color: '#64748b' }}>سبد محصولات متنوع نگین باتری برای کاربردهای مختلف</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'باتری خودرو سبک', tags: ['سواری', 'شاسی‌بلند'] },
                { title: 'باتری خودرو سنگین', tags: ['کامیون', 'اتوبوس'] },
                { title: 'باتری یو‌پی‌اس', tags: ['دیتاسنتر', 'صنعتی'] },
                { title: 'باتری خورشیدی', tags: ['نیروگاه', 'تجدیدپذیر'] }
              ].map((card, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  style={{ position: 'relative', height: '24rem', borderRadius: '2rem', background: '#0a0a0a', padding: '2rem', color: '#fff', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                    <span>نگین باتری</span>
                    <ArrowUpRight size={20} />
                  </div>
                  
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: '150%', height: '150%', background: 'radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 60%)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

                  <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', left: '2rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>{card.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {card.tags.map(tag => (
                        <span key={tag} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.75rem' }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* SEPAHAN MAP / AGENCY BANNER REPLACEMENT */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
              style={{ marginTop: '8rem', background: '#f8fafc', borderRadius: '2rem', padding: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}
            >
              <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(163,230,53,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 10, maxWidth: '35rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', background: 'rgba(5, 150, 105, 0.1)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                  <MapPin size={16} /> شبکه توزیع سراسری
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0a0a0a', marginBottom: '1rem', lineHeight: 1.2 }}>پوشش قدرتمند در تمامی استان‌های ایران</h2>
                <p style={{ color: '#64748b', fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  با داشتن بیش از ۳۰۰ نماینده فعال در سراسر کشور، محصولات نگین باتری در کوتاه‌ترین زمان ممکن و با ضمانت اصالت کالا به دست شما می‌رسد.
                </p>
                <button style={{ background: '#0a0a0a', color: '#fff', padding: '1rem 2rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  مشاهده نقشه نمایندگان <ArrowLeft size={18} />
                </button>
              </div>
              
              {/* Placeholder for Interactive Iran Map (Next Step) */}
              <div style={{ width: '400px', height: '400px', background: '#e2e8f0', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.25rem', fontWeight: 600, border: '2px dashed #cbd5e1' }}>
                محل قرارگیری نقشه تعاملی ایران
              </div>
            </motion.div>

          </div>
        </section>
      </div>
    </>
  );
}
