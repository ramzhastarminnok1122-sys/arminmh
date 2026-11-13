import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const DUST_PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 5 + 3,
  delay: Math.random() * 2
}));

export default function NeginHome() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Parallax effect on background
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div ref={containerRef} style={{ background: '#f8fafc', color: '#0f172a', fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', overflowX: 'hidden' }}>
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section style={{ position: 'relative', height: '110vh', overflow: 'hidden', background: '#050b14' }}>
        <motion.div style={{ y: yBg, opacity: opacityHero, scale: scaleHero, position: 'absolute', inset: -50, background: 'radial-gradient(circle at 70% 60%, rgba(163, 230, 53, 0.15) 0%, transparent 40%), radial-gradient(circle at 30% 40%, rgba(30, 58, 138, 0.4) 0%, transparent 50%)' }}>
          
          {/* Dynamic Dust Particles */}
          {DUST_PARTICLES.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: `${p.y}vh`, x: `${p.x}vw` }}
              animate={{ opacity: [0, 0.8, 0], y: [`${p.y}vh`, `${p.y - 10}vh`], x: [`${p.x}vw`, `${p.x + (Math.random() > 0.5 ? 5 : -5)}vw`] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: '50%', background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
            />
          ))}

          {/* Placeholder for Video/Car Image */}
          <div style={{ position: 'absolute', inset: 0, background: 'url(/hero-car.jpg) center/cover no-repeat', opacity: 0.6, mixBlendMode: 'overlay' }} />
          
          {/* Subtle Headlight Beams */}
          <div style={{ position: 'absolute', top: '50%', right: '20%', width: '40vw', height: '100vh', background: 'linear-gradient(270deg, rgba(255,255,255,0.1) 0%, transparent 100%)', transform: 'rotate(-15deg)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        </motion.div>

        {/* Hero Content (Floating) */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%', zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, color: '#fff', margin: '0 0 20px', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              انرژی پایدار<br/>
              برای <span style={{ color: '#a3e635' }}>خودروی شما</span>
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#cbd5e1', maxWidth: 600, lineHeight: 1.8 }}>
              باتری‌های پیشرفته نگین؛ نهایت اطمینان و عملکرد در تمامی شرایط آب‌وهوایی ایران. 
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. THE OVERLAPPING WHITE CONTENT (Scroll Reveal) */}
      <section style={{ position: 'relative', zIndex: 20, marginTop: '-15vh', minHeight: '100vh', background: '#fff', borderRadius: '40px 40px 0 0', boxShadow: '0 -20px 60px rgba(0,0,0,0.4)', padding: '100px 5%' }}>
        
        {/* Animated Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, maxWidth: 1400, margin: '0 auto 120px' }}>
          {[
            { t: 'تکنولوژی روز', d: 'طراحی مدرن و مطابق با استانداردهای جهانی', icon: '⚡' },
            { t: 'طول عمر بالا', d: 'متریال درجه یک برای افزایش چشمگیر دوام', icon: '🛡️' },
            { t: 'گارانتی معتبر', d: 'پشتیبانی و ضمانت تعویض در سراسر کشور', icon: '🥇' }
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 24, padding: 40, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(163, 230, 53, 0.15) 0%, transparent 70%)' }} />
              <div style={{ fontSize: 40, marginBottom: 20 }}>{item.icon}</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 15px' }}>{item.t}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.7, margin: 0 }}>{item.d}</p>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Battery Types (No Buy Buttons) */}
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#1e293b', marginBottom: 15 }}>تأمین انرژی؛ از خودرو تا صنعت</h2>
            <p style={{ color: '#64748b', fontSize: 18 }}>تنوع بی‌نظیر محصولات نگین باتری برای کاربردهای مختلف</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {[
              { t: 'باتری خودرو سبک', img: '/hero-car.jpg' },
              { t: 'باتری خودرو سنگین', img: '/hero-industrial.jpg' },
              { t: 'باتری یو‌پی‌اس', img: '/hero-factory.jpg' }
            ].map((cat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div whileHover={{ y: -10 }} transition={{ type: 'spring', stiffness: 300 }} style={{ height: 280, borderRadius: 30, overflow: 'hidden', marginBottom: 25, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
                  <img src={cat.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,23,42,0.8) 0%, transparent 100%)' }} />
                </motion.div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{cat.t}</h3>
                <button style={{ background: 'transparent', border: '2px solid #e2e8f0', color: '#0f172a', padding: '12px 30px', borderRadius: 50, fontSize: 15, fontWeight: 700, marginTop: 15, cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => { e.target.style.borderColor = '#1e293b'; e.target.style.background = '#1e293b'; e.target.style.color = '#fff'; }} onMouseOut={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = 'transparent'; e.target.style.color = '#0f172a'; }}>
                  مشاهده جزئیات
                </button>
              </motion.div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
