const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const cinematicFeatureCSS = `
/* ==========================================================================
   CINEMATIC SLANTED GLASS FEATURE BLOCKS
   ========================================================================== */
.feature-block-cinematic {
  position: relative;
  width: 100%;
  min-height: 480px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 60px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
  display: flex;
  align-items: stretch;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: #030509; /* Fallback */
}
.feature-block-cinematic:hover {
  box-shadow: 0 40px 80px rgba(0,0,0,0.6);
}

/* Background Image that fills the whole block */
.feature-block-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
}
.feature-block-bg img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.feature-block-cinematic:hover .feature-block-bg img {
  transform: scale(1.05);
}

/* The Frosted Glass Panel */
.feature-content-glass {
  position: relative;
  z-index: 1;
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px 60px 60px;
  background: rgba(3, 5, 9, 0.75);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  clip-path: polygon(0 0, 100% 0, 80% 100%, 0% 100%);
  transition: background 0.4s ease;
}
.feature-block-cinematic.reverse .feature-content-glass {
  margin-left: auto;
  padding: 60px 60px 60px 80px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%);
  background: rgba(3, 5, 9, 0.8);
}
.feature-block-cinematic:hover .feature-content-glass {
  background: rgba(3, 5, 9, 0.6);
}

/* Glowing border accent on the slant */
.glass-glow-accent {
  position: absolute;
  top: 0; bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, transparent, var(--color-cyan), transparent);
  right: 10%; /* approximate position of slant */
  transform: skewX(-11deg); /* match the polygon angle roughly */
  z-index: 2;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.feature-block-cinematic.reverse .glass-glow-accent {
  left: 10%;
  right: auto;
  background: linear-gradient(to bottom, transparent, var(--color-accent), transparent);
  transform: skewX(11deg);
}
.feature-block-cinematic:hover .glass-glow-accent {
  opacity: 1;
  box-shadow: 0 0 20px var(--color-cyan);
}
.feature-block-cinematic.reverse:hover .glass-glow-accent {
  box-shadow: 0 0 20px var(--color-accent);
}

/* Light Theme Overrides */
[data-theme="white"] .feature-block-cinematic {
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  background: #f8fafc;
}
[data-theme="white"] .feature-block-cinematic:hover {
  box-shadow: 0 30px 60px rgba(0,0,0,0.15);
}
[data-theme="white"] .feature-content-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
[data-theme="white"] .feature-block-cinematic.reverse .feature-content-glass {
  background: rgba(255, 255, 255, 0.85);
}
[data-theme="white"] .feature-block-cinematic:hover .feature-content-glass {
  background: rgba(255, 255, 255, 0.7);
}

@media (max-width: 900px) {
  .feature-content-glass, .feature-block-cinematic.reverse .feature-content-glass {
    width: 100%;
    margin: 0;
    padding: 40px !important;
    clip-path: polygon(0 0, 100% 0, 100% 95%, 0% 100%) !important;
    background: rgba(3, 5, 9, 0.85);
  }
  [data-theme="white"] .feature-content-glass {
    background: rgba(255, 255, 255, 0.95);
  }
  .glass-glow-accent {
    display: none;
  }
  .feature-block-cinematic {
    min-height: auto;
    flex-direction: column;
  }
  .feature-block-bg {
    position: relative;
    height: 300px;
  }
}
`;

// Remove the old PREMIUM OVERLAPPING CSS and inject the new one
if (css.includes('PREMIUM OVERLAPPING FEATURE BLOCKS')) {
  css = css.replace(/\/\* ==========================================================================\s*PREMIUM OVERLAPPING FEATURE BLOCKS[\s\S]*?(?=\/\* =|$)/, '');
}
if (!css.includes('CINEMATIC SLANTED GLASS FEATURE BLOCKS')) {
  css += '\n' + cinematicFeatureCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 2.7 Premium Overlapping Features Section */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
            {/* 2.7 Cinematic Slanted Glass Features Section */}
            <section style={{ marginBottom: '50px' }}>
              
              {/* Block 1: Heavy Equipment */}
              <div className="feature-block-cinematic">
                <div className="feature-block-bg">
                  <img src="/images/rig.png" alt="Буровая техника" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="glass-glow-accent"></div>
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
              <div className="feature-block-cinematic reverse">
                <div className="feature-block-bg">
                  <img src="/images/lab.png" alt="Грунтовая лаборатория" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="glass-glow-accent"></div>
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
              <div className="feature-block-cinematic">
                <div className="feature-block-bg">
                  <img src="/images/geodesy.png" alt="Геодезия и топосъемка" onError={(e) => { e.target.src='/images/hero.png' }} />
                </div>
                <div className="glass-glow-accent"></div>
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
console.log('App.jsx features block updated to cinematic.');
