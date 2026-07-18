const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const skewedAccordionCSS = `
/* ==========================================================================
   SKEWED GLASS ACCORDION (ADVANTAGES)
   ========================================================================== */
.accordion-wrapper {
  padding: 0 40px;
  margin-bottom: 80px;
  overflow: hidden;
}
.accordion-container {
  display: flex;
  width: 100%;
  height: 600px;
  gap: 20px;
  /* No skew on container to keep bounds normal, skew items instead */
}
.accordion-item {
  position: relative;
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  transition: flex 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, transform 0.3s;
  cursor: pointer;
  background: var(--bg-dark);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transform: skewX(-8deg); /* The magic slant! */
}
.accordion-item:hover {
  flex: 3;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

/* Unskew the inner content so images and text are straight */
.accordion-inner {
  position: absolute;
  top: 0; left: -15%; right: -15%; bottom: 0; /* Wider to prevent empty corners */
  transform: skewX(8deg); /* Reverse the slant */
  overflow: hidden;
  border-radius: 16px; /* inner rounding just in case */
}

.accordion-bg {
  position: absolute;
  top: -10%; left: -10%; right: -10%; bottom: -10%; /* Extra size for hover zoom */
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease;
  filter: grayscale(100%) brightness(0.4);
}
.accordion-item:hover .accordion-bg {
  transform: scale(1.05);
  filter: grayscale(0%) brightness(0.9);
}

/* Overlay gradient for base readability */
.accordion-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(3,5,9,0.95) 0%, rgba(3,5,9,0.2) 50%, rgba(3,5,9,0) 100%);
  transition: opacity 0.6s ease;
}

.accordion-title-vertical {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.4s ease, transform 0.4s ease;
  z-index: 5;
}
.accordion-title-vertical span {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 25px 15px;
  background: rgba(10, 15, 25, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.1);
  white-space: nowrap;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
.accordion-item:hover .accordion-title-vertical {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
  pointer-events: none;
}

/* Glass Details Card */
.accordion-details {
  position: absolute;
  bottom: 40px;
  left: 40px;
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
  max-width: 500px;
  background: rgba(10, 15, 25, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  z-index: 10;
}
.accordion-item:hover .accordion-details {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  transition-delay: 0.2s;
}

.accordion-details h3 {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
  line-height: 1.2;
}
.accordion-details p {
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.5;
  margin-bottom: 20px;
}
.accordion-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.accordion-details li {
  display: flex;
  align-items: center;
  color: #f1f5f9;
  font-size: 1rem;
  font-weight: 500;
}

/* Mobile & Tablet */
@media (max-width: 1024px) {
  .accordion-wrapper {
    padding: 0 20px;
  }
  .accordion-container {
    flex-direction: column;
    height: 900px;
  }
  .accordion-item {
    transform: none; /* Disable skew on mobile */
  }
  .accordion-inner {
    transform: none;
    left: 0; right: 0;
  }
  .accordion-title-vertical span {
    writing-mode: horizontal-tb;
    transform: none;
    padding: 15px 25px;
  }
  .accordion-title-vertical {
    bottom: 30px;
  }
  .accordion-details {
    max-width: calc(100% - 40px);
    left: 20px;
    bottom: 20px;
    padding: 30px;
  }
}
`;

if (css.includes('INTERACTIVE PREMIUM ACCORDION')) {
  css = css.replace(/\/\* ==========================================================================\s*INTERACTIVE PREMIUM ACCORDION[\s\S]*?(?=\/\* =|$)/, '');
}
if (!css.includes('SKEWED GLASS ACCORDION')) {
  css += '\n' + skewedAccordionCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 2.7 Interactive Premium Accordion Features Section */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
            {/* 2.7 Skewed Glass Accordion Section */}
            <section className="accordion-wrapper">
              <div className="accordion-container">
                
                {/* Block 1: Heavy Equipment */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/rig.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Буровая техника</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b1_label" defaultText="МАТЕРИАЛЬНАЯ БАЗА" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b1_title" defaultText="Мощный парк техники" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b1_desc" defaultText="Мы не зависим от арендодателей. В нашем распоряжении находятся тяжелые установки класса Bauer BG20/BG28 для устройства свай в сложнейших скальных породах, а также маневренные ПБУ-2 на базе вездеходных шасси УРАЛ." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li1" defaultText="Бурение до 80 метров в глубину" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li2" defaultText="Выезд на объект за 24 часа по РК" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 2: Laboratory */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/lab.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Лаборатория грунтов</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b2_label" defaultText="ТОЧНОСТЬ ДАННЫХ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b2_title" defaultText="Грунтовая лаборатория" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b2_desc" defaultText="Ни одна полевая работа не имеет смысла без качественных лабораторных тестов. Наш комплекс оснащен современными компрессионными и сдвиговыми приборами с автоматической фиксацией деформаций." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li1" defaultText="Аттестат СТ РК ИСО/МЭК 17025" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li2" defaultText="Химический анализ воды и грунтов" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 3: Geodesy */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/geodesy.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Инженерная геодезия</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b3_label" defaultText="ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b3_title" defaultText="Точность съемки" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b3_desc" defaultText="Используем роботизированные тахеометры и высокоточные GNSS-приемники для создания опорных сетей, мониторинга осадков фундаментов и топографической съемки M1:500 для самых сложных проектов." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li1" defaultText="3D-моделирование рельефа" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li2" defaultText="Вынос осей зданий в натуру" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx features block updated to skewed accordion.');
