import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Phone, BatteryCharging, Zap, ShieldCheck, ArrowLeft, ArrowUpRight } from 'lucide-react';
import heroFactory from '/hero-factory.jpg';
import heroCar from '/hero-car.jpg';
import heroInd from '/hero-industrial.jpg';

export default function NeginHome() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  
  const [heroIdx, setHeroIdx] = useState(0);
  const heroes = [heroFactory, heroCar, heroInd];

  useEffect(() => {
    const iv = setInterval(() => setHeroIdx(i => (i + 1) % heroes.length), 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ background: '#0a101d', color: '#fff', minHeight: '300vh', fontFamily: 'Vazirmatn, sans-serif' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        
        {/* Animated Backgrounds */}
        {heroes.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: i === heroIdx ? 0.6 : 0, scale: i === heroIdx ? 1 : 1.1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center'
            }}
          />
        ))}

        {/* Gradient Overlay for Text Readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,16,29,0.9) 0%, rgba(10,16,29,0.4) 100%)' }} />

        {/* Hero Content */}
        <motion.div style={{ y: y1, opacity, position: 'relative', zIndex: 10, padding: '0 5%' }}
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          
          <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 30, border: '1px solid rgba(255,255,255,0.2)', marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, background: '#a3e635', borderRadius: '50%', boxShadow: '0 0 10px #a3e635' }} />
            <span style={{ fontSize: 14, color: '#e2e8f0', letterSpacing: 1 }}>فناوری روز دنیا، تولید ملی</span>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 20px', color: '#fff' }}>
            انرژی مـطمئن،<br/>
            <span style={{ color: '#a3e635' }}>حـرکـت بـی‌وقـفـه</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#cbd5e1', maxWidth: 500, lineHeight: 1.8, marginBottom: 40 }}>
            نگین باتری، نماد نوآوری و کیفیت پایدار در صنعت انرژی ایران. راهکارهای پیشرفته ذخیره انرژی برای دنیایی در حرکت.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button style={{ background: '#a3e635', color: '#0a101d', border: 'none', padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              مشاهده محصولات <ArrowLeft size={20} />
            </button>
            <button style={{ background: 'transparent', color: '#fff', border: '1px solid #334155', padding: '16px 32px', borderRadius: 8, fontSize: 16, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              درباره نگین باتری <ArrowUpRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: '#fff', opacity: 0.5 }}>
          <ChevronDown size={32} />
        </motion.div>
      </section>

      {/* 2. SCROLL REVEAL CONTENT (The White Box Effect) */}
      <section style={{ position: 'relative', zIndex: 20, marginTop: '-10vh' }}>
        <motion.div style={{ 
            background: '#fff', color: '#0a101d', borderRadius: '40px 40px 0 0', padding: '100px 5%',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.5)'
          }}>
          
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>راهکارهایی برای نیازهای امروز و فردا</h2>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>محصولات نگین باتری با تکیه بر دانش فنی و نگاه آینده‌محور، برای کاربردهای متنوع در صنعت، حمل‌ونقل و ذخیره‌سازی طراحی شده‌اند.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30, maxWidth: 1200, margin: '0 auto' }}>
            
            {[
              { title: 'باتری خودرویی', desc: 'قدرت، دوام و آغاز مطمئن هر مسیر', icon: <BatteryCharging size={40} color="#a3e635" />, img: heroCar },
              { title: 'راهکارهای صنعتی', desc: 'انرژی قابل اعتماد برای صنایع پویا', icon: <Zap size={40} color="#a3e635" />, img: heroInd },
              { title: 'ذخیره‌ساز انرژی', desc: 'راهکارهای پایدار برای فردایی مطمئن', icon: <ShieldCheck size={40} color="#a3e635" />, img: heroFactory }
            ].map((item, i) => (
              <motion.div key={i} 
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: i * 0.2 }}
                style={{ background: '#f8fafc', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                <div style={{ height: 200, background: '#000', overflow: 'hidden' }}>
                  <motion.img whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
                <div style={{ padding: 30 }}>
                  {item.icon}
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: '20px 0 10px' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}

          </div>
        </motion.div>
      </section>

    </div>
  );
}
