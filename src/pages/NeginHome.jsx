import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowLeft, Globe2, Layers, Cpu, ShieldCheck } from 'lucide-react';

// --- 1. THE 0-100 LOADER ---
function PageLoader({ onReady }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let start = null;
    const duration = 1300;

    // easeInOutCubic
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
          setTimeout(() => onReady(), 800); // Wait for exit animation
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
            position: 'fixed', inset: 0, zIndex: 9999, background: '#050b14', color: '#fff',
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
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#a3e635', width: `${progress}%`, transition: 'width 0.1s ease-out' }} />
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

// --- 2. LIQUID REVEAL HERO CANVAS ---
function LiquidHero({ isReady }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let w, h;
    let points = [];
    let isDrawing = false;
    let idleFrames = 0;

    // Load Images
    const beforeImg = new Image(); // The dark version (CSS filter applied to base)
    const afterImg = new Image();  // The bright/neon version
    
    // We'll simulate the before/after by drawing the same image but the canvas will hold the "bright" version
    // while the CSS background holds the "dark" version.
    afterImg.src = '/negin-battery-master.png';

    const resize = () => {
      w = containerRef.current.offsetWidth;
      h = containerRef.current.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Brush Settings
    const radius = 150;
    const decay = 0.015;

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      points.push({ x, y });
      isDrawing = true;
    };

    window.addEventListener('pointermove', onPointerMove);

    const render = () => {
      if (points.length > 0) {
        idleFrames = 0;
      } else {
        idleFrames++;
      }

      // Decay existing canvas
      const fade = isDrawing ? decay : Math.min(decay + idleFrames * 0.005, 0.5);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, w, h);

      // Draw new brush strokes
      if (points.length > 0) {
        ctx.globalCompositeOperation = 'source-over';
        
        points.forEach((p) => {
          // 1. Create a radial gradient for soft brush
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          grad.addColorStop(0, 'rgba(255,255,255,1)');
          grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          
          // 2. Draw the gradient mask
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // 3. Composite the brightly lit image INTO the brush mask
          ctx.globalCompositeOperation = 'source-in';
          if (afterImg.complete) {
            // Draw image covering the whole canvas, but it only appears inside the brush stroke
            // Scale to cover
            const imgRatio = afterImg.width / afterImg.height;
            const canvasRatio = w / h;
            let drawW = w;
            let drawH = h;
            let offsetX = 0;
            let offsetY = 0;

            if (imgRatio > canvasRatio) {
              drawW = h * imgRatio;
              offsetX = (w - drawW) / 2;
            } else {
              drawH = w / imgRatio;
              offsetY = (h - drawH) / 2;
            }
            
            ctx.drawImage(afterImg, offsetX, offsetY, drawW, drawH);
          }
          
          // Reset to standard over for next points
          ctx.globalCompositeOperation = 'source-over';
        });
        
        points = [];
        isDrawing = false;
      }

      // Hard clear to save GPU when totally idle
      if (idleFrames === 120) {
        ctx.clearRect(0, 0, w, h);
      }

      requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* 1. Base Image (Darkened via CSS) */}
      <div 
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/negin-battery-master.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.2) contrast(1.2) grayscale(0.2)', // Make it night-time cinematic
          zIndex: 1
        }}
      />
      {/* 2. Liquid Brush Canvas (Reveals the bright original image) */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }} />
      
      {/* 3. Shadow Gradient for text legibility */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'linear-gradient(to top, #050b14 0%, transparent 60%)' }} />
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function NeginHome() {
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Parallax the hero header text
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({ smoothWheel: true, duration: 1.2 });
    
    // Lock scroll until ready
    if (!ready) {
      lenis.stop();
    } else {
      lenis.start();
    }

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Adaptive Grid logic
    const applyAdaptiveGrid = () => {
      const w = window.innerWidth;
      const base = 1920;
      if (w > base) {
        const reduction = ((base - w) / base) * 100;
        const size = 16 - (16 * (reduction * 0.6666)) / 100;
        document.documentElement.style.fontSize = size + 'px';
      }
    };
    applyAdaptiveGrid();
    window.addEventListener('resize', applyAdaptiveGrid);

    return () => {
      lenis.destroy();
      window.removeEventListener('resize', applyAdaptiveGrid);
    };
  }, [ready]);

  return (
    <>
      {/* LOADER */}
      {!ready && <PageLoader onReady={() => setReady(true)} />}

      <main style={{ background: '#050b14' }}>
        {/* HERO SECTION */}
        <section style={{ height: '110vh', position: 'relative' }}>
          {/* Background Liquid Engine */}
          <LiquidHero isReady={ready} />

          {/* Hero Content Overlays */}
          <motion.div 
            style={{ 
              position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', 
              justifyContent: 'center', padding: '0 4rem',
              y: heroY, opacity: heroOpacity
            }}
          >
            <div style={{ maxWidth: '88rem', margin: '0 auto', width: '100%' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.8 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#a3e635', marginBottom: '1.5rem', background: 'rgba(163,230,53,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(163,230,53,0.2)' }}
              >
                <Sparkles size={16} /> نسل جدید ذخیره‌سازهای صنعتی
              </motion.div>
              
              <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
                <motion.span initial={{ opacity: 0, y: 40 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }} style={{ display: 'block' }}>
                  ایده‌های بزرگ،
                </motion.span>
                <motion.span initial={{ opacity: 0, y: 40 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }} style={{ display: 'block' }}>
                  ساخته شده با <span style={{ color: '#a3e635' }}>دقت بی‌صدا.</span>
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
                style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', maxWidth: '35rem', marginTop: '2rem', lineHeight: 1.8 }}
              >
                نگین باتری، طراح و سازنده پیشرفته‌ترین سیستم‌های ذخیره انرژی در ایران. با تضمین طول عمر و تاب‌آوری در سخت‌ترین شرایط آب و هوایی.
              </motion.p>
            </div>
          </motion.div>

          {/* Huge background watermark text */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={ready ? { opacity: 0.03, y: 0 } : {}} transition={{ delay: 0.5, duration: 1.5 }}
            style={{ position: 'absolute', bottom: '-4rem', left: 0, right: 0, textAlign: 'center', fontSize: '18vw', fontWeight: 900, color: '#fff', zIndex: 5, pointerEvents: 'none', userSelect: 'none' }}
          >
            NEGIN
          </motion.div>
        </section>

        {/* BRIGHT CORPORATE BODY SECTION */}
        <section style={{ 
          position: 'relative', zIndex: 20, background: '#ffffff', color: '#111',
          borderRadius: '2.5rem 2.5rem 0 0', marginTop: '-10vh',
          padding: '8rem 2rem', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{ maxWidth: '88rem', margin: '0 auto' }}>
            
            {/* Value Proposition Band */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
              {[
                { icon: <Cpu size={32} />, title: "تکنولوژی روز دنیا", desc: "استفاده از صفحات کلسیم-کلسیم اکسپندد برای کاهش افت ولتاژ." },
                { icon: <ShieldCheck size={32} />, title: "گارانتی شرکتی بی‌قید", desc: "ضمانت تعویض سریع در بیش از ۳۰۰ نماینده فعال در سراسر کشور." },
                { icon: <Layers size={32} />, title: "تنوع آمپراژ", desc: "از ۳۵ آمپر تا ۲۲۰ آمپر، مناسب برای خودروهای سبک و سنگین." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  style={{ background: '#f8fafc', padding: '3rem 2rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}
                >
                  <div style={{ color: '#00E676', marginBottom: '1.5rem' }}>{item.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Title for Products */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div style={{ display: 'inline-block', border: '1px solid #e2e8f0', borderRadius: '9999px', padding: '0.5rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '1rem' }}>
                دسته‌بندی محصولات
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#0a0a0a' }}>تأمین انرژی؛ از خودرو تا صنعت</h2>
            </motion.div>

            {/* Dark Ink Product Cards (Lumora Style) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'باتری خودرو سبک', tags: ['سواری', 'شاسی‌بلند'] },
                { title: 'باتری خودرو سنگین', tags: ['کامیون', 'اتوبوس', 'کشاورزی'] },
                { title: 'باتری یو‌پی‌اس', tags: ['دیتاسنتر', 'صنعتی'] },
                { title: 'باتری خورشیدی', tags: ['نیروگاه', 'تجدیدپذیر'] }
              ].map((card, i) => (
                <motion.article 
                  key={i}
                  initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  style={{ 
                    position: 'relative', height: '24rem', borderRadius: '2rem', background: '#0a0a0a', 
                    padding: '2rem', color: '#fff', overflow: 'hidden', cursor: 'pointer',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                    <span>نگین باتری</span>
                    <ArrowLeft size={20} style={{ transform: 'rotate(45deg)' }} />
                  </div>
                  
                  {/* Subtle Background Glow */}
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

          </div>
        </section>

      </main>
    </>
  );
}
