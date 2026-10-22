import aboutTeam from '../assets/images/about-team.jpg';
import React from 'react';
import { useStore } from '../lib/store';
import { Btn, Icon, Reveal, SectionHead } from '../components/ui';
import { toFa } from '../lib/utils';

const VALUES = [
  { icon: 'bolt', title: 'سرعت، بدون بهانه', desc: 'برای ما «الان می‌آیم» یک تعهد است، نه تعارف. آمار اعزام ما حرف می‌زند.' },
  { icon: 'shield', title: 'صداقت در تشخیص', desc: 'اگر باتری‌تان سالم است، همین را می‌گوییم. چیزی که لازم ندارید نمی‌فروشیم.' },
  { icon: 'users', title: 'تیمی از همین شهر', desc: 'همه ما اهل چابهاریم؛ خیابان‌هایش را مثل خانه‌مان می‌شناسیم.' },
  { icon: 'clock', title: 'شبانه‌روزیِ واقعی', desc: 'شیفت بامداد ۳ برای ما مثل ظهر مهم است. خودرو ساعتش را انتخاب نمی‌کند.' }
];

export default function About() {
  const { state } = useStore();
  const s = state.settings;
  const techs = (state.technicians || []).filter((t) => t.online);

  return (
    <div className="page">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'center', marginBottom: 54 }}>
          <Reveal>
            <span className="kicker">داستان ما</span>
            <h1 style={{ marginBottom: 14 }}>ما هم راننده‌ایم؛<br />دردمندِ جاده را می‌فهمیم</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
              {s.aboutShort}
            </p>
            <p style={{ color: 'var(--muted)' }}>
              از یک وانت و یک جعبه‌ابزار شروع شد؛ امروز چند تیم امداد، انبار پر از باتری همه برندها و دستگاه‌های تست دیجیتال داریم. اما چیزی که عوض نشده، همان قول اول است: <b>هر ساعتی از شبانه‌روز، هر آدرسی در چابهار.</b>
            </p>
            <div className="hero-cta" style={{ marginTop: 22 }}>
              <Btn to="/emergency" variant="red" icon="bolt">درخواست امداد</Btn>
              <Btn to="/contact" variant="ghost" iconEnd="chevron">تماس با ما</Btn>
            </div>
          </Reveal>
          <Reveal delay={120} className="banner-hero" style={{ minHeight: 340 }}>
            <img src={aboutTeam} alt="تیم امداد باتری چابهار" />
          </Reveal>
        </div>

        <SectionHead center kicker="ارزش‌های ما" title="چهار قولی که به شما می‌دهیم" />
        <div className="cards-grid" style={{ marginBottom: 54 }}>
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <div className="card" style={{ height: '100%' }}>
                <span className="svc-ic"><Icon name={v.icon} size={24} /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="cta-band">
          <div>
            <h2>تیم آماده — همین حالا آنلاین‌اند</h2>
            <p style={{ marginTop: 8 }}>
              {techs.map((t) => t.name).join(' • ')} و بقیه همکاران، در شیفت شبانه‌روز آماده اعزام هستند.
            </p>
          </div>
          <div className="cta-band-actions">
            <div className="cta-phone">
              <small>خط امداد مستقیم</small>
              <b>{toFa(s.emergencyPhone)}</b>
            </div>
            <Btn href={`tel:${s.emergencyPhone.replace(/\s/g, '')}`} variant="yellow" size="lg" icon="phone">تماس فوری</Btn>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
