const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const heroSectionRegex = /<section className="hero">[\s\S]*?<div className="hero-glow g1"/;

const newHeroSection = `<section className="hero">
        <style dangerouslySetInnerHTML={{ __html: \`
          .hero-bg img { 
            width: 100%; height: 100%; object-fit: cover; 
            filter: blur(\${hc.hero.overlayBlur || 0}px);
          }
          .hero-overlay {
            position: absolute; inset: 0; z-index: -1;
            background: \${hc.hero.overlayColor || '#0a1226'};
            opacity: \${(hc.hero.overlayOpacity !== undefined ? hc.hero.overlayOpacity : 85) / 100};
          }
          @media (max-width: 768px) {
            .hero-bg img.desktop { display: \${hc.hero.bgMobile ? 'none' : 'block'}; }
            .hero-bg img.mobile { display: \${hc.hero.bgMobile ? 'block' : 'none'}; }
          }
          @media (min-width: 769px) {
            .hero-bg img.mobile { display: none; }
          }
        \`}} />
        <div className="hero-bg">
          <img src={hc.hero.bgDesktop || heroVan} alt="امداد باتری" className="desktop" />
          {hc.hero.bgMobile && <img src={hc.hero.bgMobile} alt="امداد باتری موبایل" className="mobile" />}
        </div>
        <div className="hero-overlay" />
        <div className="hero-glow g1"`;

home = home.replace(heroSectionRegex, newHeroSection);
fs.writeFileSync('src/pages/Home.jsx', home);

let css = fs.readFileSync('src/styles.css', 'utf8');
css = css.replace('.hero-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.42; }', '.hero-bg img { width: 100%; height: 100%; object-fit: cover; }');
css = css.replace('.hero::after { content: \'\'; position: absolute; inset: 0; z-index: -1; background: linear-gradient(105deg, rgba(10, 18, 38, 0.96) 22%, rgba(10, 18, 38, 0.72) 55%, rgba(10, 24, 60, 0.45)); }', '');
fs.writeFileSync('src/styles.css', css);
