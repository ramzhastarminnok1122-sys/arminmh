import React from 'react';
import { useStore } from '../lib/store';
import { Icon, Reveal, Badge } from '../components/ui';
import ChabaharMap from '../components/ChabaharMap';
import { DEPOT } from '../components/ChabaharMap';

export default function Areas() {
  const { state } = useStore();
  const areas = (state.areas || []).filter((a) => a.active);
  const s = state.settings;

  return (
    <div className="page">
      <div className="container">
        <div className="page-head" style={{ textAlign: 'center' }}>
          <span className="kicker">مسلط به کوچه‌به‌کوچه‌ی چابهار</span>
          <h1>مناطق تحت پوشش</h1>
          <p style={{ marginInline: 'auto' }}>از تیس تا کنارک و اسکله — هرجای این شهر که باشید، ما راه را بلدیم.</p>
        </div>

        <div className="admin-panel" style={{ padding: 18, marginBottom: 28 }}>
          <ChabaharMap theme="light" areas={areas} userPoint={DEPOT} />
          <div className="map-legend"><span><i className="lg" /> دفتر و انبار ما — {s.address}</span></div>
        </div>

        <div className="cards-grid g3">
          {areas.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 70}>
              <div className="card area-card" style={{ height: '100%' }}>
                <span className="area-ic"><Icon name="pin" size={22} /></span>
                <div>
                  <h3>{a.name}</h3>
                  <p>{a.desc}</p>
                  <Badge tone="brand"><Icon name="clock" size={12} /> اعزام: {a.eta}</Badge>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="note-box" style={{ marginTop: 26 }}>
          <Icon name="info" size={18} /> خارج از محدوده‌ها هستید؟ تماس بگیرید؛ بسته به موقعیت و ساعت، اعزام خارج از شهر را هم هماهنگ می‌کنیم: <b style={{ direction: 'ltr' }}>{s.emergencyPhone}</b>
        </div>
      </div>
    </div>
  );
}
