const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const premiumFeatureCSS = `
/* ==========================================================================
   PREMIUM OVERLAPPING FEATURE BLOCKS
   ========================================================================== */
.feature-block-premium {
  display: flex;
  align-items: center;
  position: relative;
  min-height: 480px;
  margin-bottom: 80px;
}
.feature-block-premium.reverse {
  flex-direction: row-reverse;
}
.feature-image-wrapper {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 60%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0% 100%);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.feature-block-premium.reverse .feature-image-wrapper {
  left: auto; right: 0;
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 0% 100%);
}
.feature-block-premium:hover .feature-image-wrapper {
  transform: scale(1.02);
}
.feature-image-wrapper img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 1s ease;
}
.feature-block-premium:hover .feature-image-wrapper img {
  transform: scale(1.08);
}
.feature-image-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(3,5,9,0) 40%, rgba(3,5,9,0.9) 100%);
  z-index: 1;
}
.feature-block-premium.reverse .feature-image-overlay {
  background: linear-gradient(-90deg, rgba(3,5,9,0) 40%, rgba(3,5,9,0.9) 100%);
}
.feature-content-glass {
  position: relative;
  z-index: 2;
  width: 55%;
  margin-left: 45%;
  background: rgba(10, 15, 25, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 60px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  transform: translateY(0);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
}
.feature-block-premium.reverse .feature-content-glass {
  margin-left: 0;
  margin-right: 45%;
}
.feature-block-premium:hover .feature-content-glass {
  transform: translateY(-10px);
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(234, 179, 8, 0.3);
}

/* Light theme overrides */
[data-theme="white"] .feature-image-overlay {
  background: linear-gradient(90deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.9) 100%);
}
[data-theme="white"] .feature-block-premium.reverse .feature-image-overlay {
  background: linear-gradient(-90deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.9) 100%);
}
[data-theme="white"] .feature-content-glass {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 25px 50px rgba(0,0,0,0.05);
}
[data-theme="white"] .feature-block-premium:hover .feature-content-glass {
  box-shadow: 0 35px 70px rgba(0,0,0,0.1), inset 0 1px 0 rgba(239, 68, 68, 0.3);
}

@media (max-width: 992px) {
  .feature-block-premium {
    flex-direction: column !important;
    min-height: auto;
  }
  .feature-image-wrapper {
    position: relative;
    width: 100%;
    height: 350px;
    clip-path: none !important;
  }
  .feature-image-overlay {
    background: linear-gradient(0deg, rgba(3,5,9,1) 0%, rgba(3,5,9,0) 50%) !important;
  }
  [data-theme="white"] .feature-image-overlay {
    background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%) !important;
  }
  .feature-content-glass {
    width: 95%;
    margin: -80px auto 0 auto !important;
    padding: 40px;
  }
}
`;

if (!css.includes('PREMIUM OVERLAPPING FEATURE BLOCKS')) {
  css += '\n' + premiumFeatureCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 2.7 Alternating Features Section */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

const newSection = `
            {/* 2.7 Premium Overlapping Features Section */}
            <section style={{ marginBottom: '50px' }}>
              
              {/* Block 1: Heavy Equipment */}
              <div className="feature-block-premium">
                <div className="feature-image-wrapper">
                  <div className="feature-image-overlay"></div>
                  <img src="/images/rig.png" alt="Буровая техника" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="feature-content-glass">
                  <EditableText id="b1_label" defaultText="МАТЕРИАЛЬНАЯ БАЗА" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                  <EditableText as="h3" id="b1_title" defaultText="Мощный парк буровой техники" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2, fontWeight: '800' }} />
                  <EditableText as="p" id="b1_desc" defaultText="Мы не зависим от арендодателей. В нашем распоряжении находятся тяжелые установки класса Bauer BG20/BG28 для устройства свай в сложнейших скальных породах, а также маневренные ПБУ-2 на базе вездеходных шасси УРАЛ и КАМАЗ." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }} />
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b1_li1" defaultText="Бурение до 80 метров в глубину" isVisualBuilder={isVisualBuilder} /></li>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b1_li2" defaultText="Выезд на объект за 24 часа по РК" isVisualBuilder={isVisualBuilder} /></li>
                  </ul>
                </div>
              </div>

              {/* Block 2: Laboratory (Reversed) */}
              <div className="feature-block-premium reverse">
                <div className="feature-image-wrapper">
                  <div className="feature-image-overlay"></div>
                  <img src="/images/lab.png" alt="Грунтовая лаборатория" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="feature-content-glass">
                  <EditableText id="b2_label" defaultText="ТОЧНОСТЬ ДАННЫХ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                  <EditableText as="h3" id="b2_title" defaultText="Собственная грунтовая лаборатория" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2, fontWeight: '800' }} />
                  <EditableText as="p" id="b2_desc" defaultText="Ни одна полевая работа не имеет смысла без качественных лабораторных тестов. Наш комплекс оснащен современными компрессионными и сдвиговыми приборами с автоматической фиксацией деформаций." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }} />
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-accent)" style={{ marginRight: '12px' }}/> <EditableText id="b2_li1" defaultText="Аттестат СТ РК ИСО/МЭК 17025" isVisualBuilder={isVisualBuilder} /></li>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-accent)" style={{ marginRight: '12px' }}/> <EditableText id="b2_li2" defaultText="Химический анализ воды и грунтов" isVisualBuilder={isVisualBuilder} /></li>
                  </ul>
                </div>
              </div>

              {/* Block 3: Geodesy */}
              <div className="feature-block-premium">
                <div className="feature-image-wrapper">
                  <div className="feature-image-overlay"></div>
                  <img src="/images/geodesy.png" alt="Геодезия и топосъемка" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="feature-content-glass">
                  <EditableText id="b3_label" defaultText="ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                  <EditableText as="h3" id="b3_title" defaultText="Миллиметровая точность съемки" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2, fontWeight: '800' }} />
                  <EditableText as="p" id="b3_desc" defaultText="Используем роботизированные тахеометры и высокоточные GNSS-приемники для создания опорных сетей, мониторинга осадков фундаментов и топографической съемки M1:500 для самых сложных проектов." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }} />
                  <ul style={{ listStyle: 'none', padding: 0, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b3_li1" defaultText="3D-моделирование рельефа" isVisualBuilder={isVisualBuilder} /></li>
                    <li style={{ display: 'flex', alignItems: 'center' }}><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b3_li2" defaultText="Вынос осей зданий в натуру" isVisualBuilder={isVisualBuilder} /></li>
                  </ul>
                </div>
              </div>

            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx features block updated.');
