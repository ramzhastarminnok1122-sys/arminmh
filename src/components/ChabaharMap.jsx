import React, { useMemo } from 'react';
import { cn, toFa } from '../lib/utils';
import { Icon } from './ui';

/* نقشه شماتیک و استایل‌شده چابهار — کاملاً آفلاین و بدون وابستگی به سرویس خارجی */

export const DEPOT = { x: 452, y: 268 }; // دفتر/فروشگاه

function bez(a, c, b, t) {
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y
  };
}

export function makeRoute(a, b, n = 60) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const c = { x: a.x + dx / 2 - dy * 0.22, y: a.y + dy / 2 + dx * 0.22 };
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(bez(a, c, b, i / n));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return { pts, d };
}

export default function ChabaharMap({
  theme = 'light',            // light | dark
  areas = [],
  userPoint = null,           // {x,y}
  progress = null,            // 0..1 حرکت امدادگر
  route = false,
  pick = false,
  onPick,
  className
}) {
  const W = 800, Hh = 520;
  const routeData = useMemo(
    () => (route && userPoint ? makeRoute(DEPOT, userPoint) : null),
    [route, userPoint]
  );
  const van = useMemo(() => {
    if (!routeData || progress == null) return null;
    const i = Math.round(progress * (routeData.pts.length - 1));
    return routeData.pts[Math.max(0, Math.min(routeData.pts.length - 1, i))];
  }, [routeData, progress]);

  const light = theme === 'light';
  const c = {
    land: light ? '#e9eef7' : '#0d1730',
    land2: light ? '#dfe7f3' : '#101c3c',
    road: light ? '#ffffff' : '#1b2a52',
    roadEdge: light ? '#d4dcec' : '#16234a',
    sea1: light ? '#bcd7f0' : '#0a1f45',
    sea2: light ? '#a9cbec' : '#081832',
    line: light ? 'rgba(20,40,80,.14)' : 'rgba(120,160,230,.14)',
    text: light ? '#3a4a66' : '#8fa4cc'
  };

  const handleClick = (e) => {
    if (!pick || !onPick) return;
    const svg = e.currentTarget.closest('svg');
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    onPick({ x: Math.round(loc.x), y: Math.round(loc.y) });
  };

  return (
    <svg viewBox="-160 0 960 540" className={cn('chmap', light ? 'chmap-light' : 'chmap-dark', className)} onClick={handleClick} role="img" aria-label="نقشه چابهار و کنارک">
      <defs>
        <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.sea1} /><stop offset="1" stopColor={c.sea2} />
        </linearGradient>
        <radialGradient id="glowG">
          <stop offset="0" stopColor="#ffb800" stopOpacity=".55" /><stop offset="1" stopColor="#ffb800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pinG">
          <stop offset="0" stopColor="#1e6bff" stopOpacity=".4" /><stop offset="1" stopColor="#1e6bff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* خشکی */}
      <rect x="-160" y="0" width="960" height={Hh} fill={c.land} />
      <rect x="-160" y="0" width="960" height={Hh} fill={c.land2} opacity=".5" />

      {/* تپه‌ها و ارتفاعات شرق */}
      <g opacity={light ? 0.5 : 0.4}>
        <ellipse cx="745" cy="70" rx="90" ry="34" fill={light ? '#dfe3d8' : '#12203c'} />
        <ellipse cx="700" cy="105" rx="60" ry="22" fill={light ? '#e4e8dd' : '#132244'} />
        <path d="M690 60 l14 -18 12 18 M735 80 l12 -15 11 15" stroke={light ? '#b9bfae' : '#25365c'} strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="778" y="120" fontSize="10" fill={c.text}>کوه‌های بشگرد</text>
      </g>

      {/* شبکه شهر */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={'v' + i} x1={70 + i * 85} y1="30" x2={90 + i * 85} y2="340" stroke={c.line} strokeWidth="1" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={'h' + i} x1="20" y1={55 + i * 62} x2={W - 20} y2={45 + i * 64} stroke={c.line} strokeWidth="1" />
      ))}

      {/* جاده‌های اصلی */}
      <g fill="none" strokeLinecap="round">
        <path d="M20 340 C 180 300, 300 330, 440 296 S 700 250, 790 285" stroke={c.roadEdge} strokeWidth="14" />
        <path d="M20 340 C 180 300, 300 330, 440 296 S 700 250, 790 285" stroke={c.road} strokeWidth="9" />
        <path d="M240 40 C 280 130, 300 220, 320 330" stroke={c.roadEdge} strokeWidth="9" />
        <path d="M240 40 C 280 130, 300 220, 320 330" stroke={c.road} strokeWidth="5.5" />
        <path d="M560 40 C 560 140, 590 220, 640 320" stroke={c.roadEdge} strokeWidth="9" />
        <path d="M560 40 C 560 140, 590 220, 640 320" stroke={c.road} strokeWidth="5.5" />
        {/* جاده اصلی چابهار - کنارک (غرب) */}
        <path d="M20 340 C -30 350, -70 355, -120 345 S -150 330, -160 325" stroke={c.roadEdge} strokeWidth="12" />
        <path d="M20 340 C -30 350, -70 355, -120 345 S -150 330, -160 325" stroke={c.road} strokeWidth="7.5" />
        {/* کمربندی کنارک */}
        <path d="M-140 310 C -100 300, -50 302, -20 318" stroke={c.roadEdge} strokeWidth="8" strokeDasharray="1 0" />
        <path d="M-140 310 C -100 300, -50 302, -20 318" stroke={c.road} strokeWidth="4.5" />
        {/* جاده ساحلی ناو */}
        <path d="M620 190 C 560 230, 500 260, 440 296" stroke={c.road} strokeWidth="3.5" strokeDasharray="7 6" opacity=".8" />
        {/* جاده فرعی تیس */}
        <path d="M300 230 C 290 260, 280 290, 268 330" stroke={c.road} strokeWidth="3" strokeDasharray="6 6" opacity=".7" />
      </g>

      {/* شهر کنارک (غرب نقشه) */}
      <g opacity=".95">
        <path d="M-150 370 h 105 M-150 396 h 105 M-128 350 v 66 M-96 350 v 66 M-64 350 v 66" stroke={light ? '#fff' : '#1b2a52'} strokeWidth="4" strokeLinecap="round" />
        <path d="M-150 370 h 105 M-150 396 h 105" stroke={light ? '#d8dfec' : '#16234a'} strokeWidth="7" strokeLinecap="round" opacity=".5" />
        <text x="-96" y="425" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={c.text}>کنارک</text>
        {/* مناطق مسکونی کنارک */}
        <rect x="-145" y="356" width="16" height="10" rx="2" fill={light ? '#dfe7f3' : '#182648'} />
        <rect x="-114" y="356" width="16" height="10" rx="2" fill={light ? '#dfe7f3' : '#182648'} />
        <rect x="-82" y="382" width="16" height="10" rx="2" fill={light ? '#dfe7f3' : '#182648'} />
      </g>

      {/* نقاط مهم (POI) */}
      {[
        { x: 318, y: 228, label: 'پمپ بنزین تیس' },
        { x: 392, y: 318, label: 'بازار روز' },
        { x: 508, y: 288, label: 'بیمارستان' },
        { x: 26, y: 242, label: 'پمپ گاز فرودگاه' },
        { x: -60, y: 380, label: 'پمپ بنزین کنارک' },
        { x: 655, y: 398, label: 'اسکله صیادی' },
        { x: 240, y: 55, label: 'مجتمع مسکونی' }
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r="5.5" fill="#fff" stroke="#1e6bff" strokeWidth="2.5" />
          <circle r="1.6" fill="#1e6bff" />
          <text y="-9" textAnchor="middle" fontSize="9" fill={light ? '#54607a' : '#7d90b6'}>{p.label}</text>
        </g>
      ))}

      {/* نخل‌های ساحلی */}
      <g stroke={light ? '#7fae86' : '#2a5c46'} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".85">
        {[175, 205, 470, 505].map((px, i) => {
          const py = 448 + (i % 2) * 26;
          return (<g key={i} transform={`translate(${px} ${py})`}>
            <path d="M0 12 V 0 M0 0 q -7 -6 -12 -4 M0 0 q 7 -6 12 -4 M0 0 q -4 -9 -2 -11 M0 0 q 4 -9 2 -11" />
          </g>);
        })}
      </g>

      {/* فرودگاه کنارک */}
      <g transform="rotate(-8 140 265)">
        <rect x="60" y="258" width="165" height="13" rx="6" fill={light ? '#c3cfe4' : '#182648'} />
        <path d="M75 264h14M100 264h14M125 264h14M150 264h14M175 264h14M200 264h14" stroke={light ? '#eef2fa' : '#233459'} strokeWidth="3" />
      </g>

      {/* دریا */}
      <path d="M-160 405 C -60 385, 60 402, 200 395 S 480 370, 640 362 S 780 366, 800 372 L 800 520 L -160 520 Z" fill="url(#seaG)" />
      <path d="M-160 405 C -60 385, 60 402, 200 395 S 480 370, 640 362 S 780 366, 800 372" fill="none" stroke={light ? '#8fb8de' : '#274b86'} strokeWidth="2.5" />
      <g stroke={light ? 'rgba(70,120,180,.4)' : 'rgba(110,160,220,.3)'} strokeWidth="1.6" fill="none">
        <path d="M60 440 q 14 -7 28 0 t 28 0 t 28 0" />
        <path d="M420 462 q 14 -7 28 0 t 28 0 t 28 0" />
        <path d="M640 425 q 14 -7 28 0 t 28 0" />
        <path d="M230 480 q 14 -7 28 0 t 28 0" />
        <path d="M-120 455 q 14 -7 28 0 t 28 0" />
        <path d="M330 495 q 14 -7 28 0 t 28 0" />
      </g>

      {/* قایق‌های صیادی */}
      <g fill={light ? '#e8e2cf' : '#243a63'} stroke={light ? '#9aa4b8' : '#3a5382'} strokeWidth="1.5">
        <path d="M-40 470 q 12 10 24 0 z M-29 470 v -8 l6 4 -6 4" />
        <path d="M540 445 q 10 8 20 0 z M549 445 v -7 l5 3.5 -5 3.5" />
      </g>

      {/* اسکله */}
      <g stroke={light ? '#9fb6d6' : '#2a3f6e'} strokeWidth="7" strokeLinecap="round">
        <path d="M560 380 v 52 M 596 376 v 64 M 632 372 v 74" />
      </g>
      <text x="690" y="470" fill={light ? '#4a7ab5' : '#5b83c7'} fontSize="15" fontStyle="italic" opacity=".85">دریای عمان</text>
      <text x="60" y="300" fill={c.text} fontSize="10.5">فرودگاه کنارک</text>
      <text x="-152" y="340" fill={c.text} fontSize="10.5">جاده چابهار — کنارک</text>

      {/* برچسب مناطق */}
      {areas.map((a) => (
        <text key={a.id} x={a.map?.x} y={a.map?.y} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={c.text} className="chmap-label">{a.name}</text>
      ))}

      {/* مسیر امدادگر */}
      {routeData && (
        <g>
          <path d={routeData.d} fill="none" stroke={light ? 'rgba(30,107,255,.25)' : 'rgba(60,130,255,.3)'} strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" />
          {progress != null && (
            <path d={routeData.d} fill="none" stroke="#1e6bff" strokeWidth="4.5" strokeLinecap="round"
              pathLength="1" strokeDasharray={`${Math.max(0.001, progress)} 1`} style={{ transition: 'stroke-dasharray 1s linear' }} />
          )}
        </g>
      )}

      {/* دفتر ما */}
      <g transform={`translate(${DEPOT.x} ${DEPOT.y})`}>
        <circle r="26" fill="url(#glowG)" />
        <circle r="9" fill="#ffb800" stroke="#0a1226" strokeWidth="2.5" />
        <path d="M1.5 -3.5 -2 1.5h2.4l-.7 3 3.5-4.7H2.3l.7-3z" fill="#0a1226" transform="scale(1.15)" />
        <text y="-16" textAnchor="middle" fontSize="11" fontWeight="700" fill={light ? '#7a5800' : '#ffcf5c'}>دفتر ما</text>
      </g>

      {/* پین موقعیت مشتری */}
      {userPoint && (
        <g transform={`translate(${userPoint.x} ${userPoint.y})`}>
          <circle r="22" fill="url(#pinG)" className="pin-pulse" />
          <g transform="translate(0 -14)">
            <path d="M0 14 C -7 5, -8.5 1, -8.5 -2 a 8.5 8.5 0 1 1 17 0 c 0 3 -1.5 7 -8.5 16Z" transform="translate(0 0)" fill="#1e6bff" stroke="#0a1226" strokeWidth="2" />
            <circle cy="-2" r="3" fill="#fff" />
          </g>
        </g>
      )}

      {/* خودروی امدادی متحرک */}
      {van && (
        <g transform={`translate(${van.x} ${van.y})`} style={{ transition: 'transform 1s linear' }}>
          <circle r="30" fill="url(#glowG)" opacity=".7" />
          <g className="van-bob">
            <rect x="-13" y="-9" width="26" height="15" rx="4" fill="#fff" stroke="#0a1226" strokeWidth="2" />
            <rect x="-9" y="-5.5" width="7" height="5" rx="1.2" fill="#1e6bff" />
            <rect x="0" y="-5.5" width="6" height="5" rx="1.2" fill="#dfe7f3" />
            <circle cx="-3" cy="-10.5" r="2" fill="#ffb800" className="beacon" />
          </g>
          <circle r="3" fill="#0a1226" />
        </g>
      )}

      {pick && <text x={W - 18} y="30" textAnchor="end" fontSize="12" fill={light ? '#5b6478' : '#8fa4cc'}>برای انتخاب موقعیت، روی نقشه بزنید</text>}
    </svg>
  );
}

export function MapLegend({ eta }) {
  return (
    <div className="map-legend">
      <span><i className="lg lg-depot" /> دفتر ما</span>
      {eta && <span className="lg-eta"><Icon name="clock" size={14} /> زمان تقریبی رسیدن: <b>{eta}</b></span>}
    </div>
  );
}
