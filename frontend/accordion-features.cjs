const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const accordionCSS = `
/* ==========================================================================
   INTERACTIVE PREMIUM ACCORDION (ADVANTAGES)
   ========================================================================== */
.accordion-container {
  display: flex;
  width: 100%;
  height: 650px;
  gap: 15px;
  margin-bottom: 80px;
}
.accordion-item {
  position: relative;
  flex: 1;
  border-radius: 24px;
  overflow: hidden;
  transition: flex 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease;
  cursor: pointer;
  background: var(--bg-dark);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.accordion-item:hover {
  flex: 3;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}
.accordion-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease;
  filter: grayscale(80%) brightness(0.5);
}
.accordion-item:hover .accordion-bg {
  transform: scale(1.05);
  filter: grayscale(0%) brightness(0.9);
}
.accordion-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(3,5,9,0.9) 0%, rgba(3,5,9,0.3) 40%, rgba(3,5,9,0) 100%);
  transition: background 0.6s ease, opacity 0.6s ease;
}
.accordion-item:hover .accordion-overlay {
  background: linear-gradient(to right, rgba(3,5,9,0.95) 0%, rgba(3,5,9,0.6) 50%, rgba(3,5,9,0) 100%);
}

.accordion-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
}

.accordion-title-vertical {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  font-size: 1.8rem;
  font-weight: 800;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 1;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.accordion-item:hover .accordion-title-vertical {
  opacity: 0;
  transform: translateX(-50%) rotate(180deg) translateY(20px);
  pointer-events: none;
}

.accordion-details {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: 0s;
  pointer-events: none;
  max-width: 550px;
}
.accordion-item:hover .accordion-details {
  opacity: 1;
  transform: translateX(0);
  transition-delay: 0.2s;
  pointer-events: auto;
}

.accordion-details h3 {
  font-size: 2.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 15px;
  line-height: 1.1;
  text-shadow: 0 5px 15px rgba(0,0,0,0.5);
}
.accordion-details p {
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 25px;
  text-shadow: 0 2px 5px rgba(0,0,0,0.5);
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
  font-size: 1.1rem;
  font-weight: 500;
  text-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

/* Light Theme Overrides */
[data-theme="white"] .accordion-item {
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: #f8fafc;
}
[data-theme="white"] .accordion-item:hover {
  box-shadow: 0 30px 60px rgba(0,0,0,0.2);
  border: 1px solid rgba(0,0,0,0.05);
}
[data-theme="white"] .accordion-overlay {
  background: linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
}
[data-theme="white"] .accordion-item:hover .accordion-overlay {
  background: linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
}
[data-theme="white"] .accordion-title-vertical {
  color: rgba(15, 23, 42, 0.8);
}
[data-theme="white"] .accordion-details h3 {
  color: #0f172a;
  text-shadow: none;
}
[data-theme="white"] .accordion-details p {
  color: #334155;
  text-shadow: none;
}
[data-theme="white"] .accordion-details li {
  color: #1e293b;
  text-shadow: none;
}

@media (max-width: 1024px) {
  .accordion-container {
    flex-direction: column;
    height: 1000px;
  }
  .accordion-title-vertical {
    writing-mode: horizontal-tb;
    transform: translateX(-50%);
    bottom: 30px;
  }
  .accordion-item:hover .accordion-title-vertical {
    transform: translateX(-50%) translateY(20px);
  }
  .accordion-item:hover .accordion-overlay {
    background: linear-gradient(to top, rgba(3,5,9,0.95) 0%, rgba(3,5,9,0.7) 70%, rgba(3,5,9,0) 100%);
  }
  [data-theme="white"] .accordion-item:hover .accordion-overlay {
    background: linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 70%, rgba(255,255,255,0) 100%);
  }
  .accordion-details {
    max-width: 100%;
  }
}
`;

// Remove the old CINEMATIC SLANTED CSS and inject the new one
if (css.includes('CINEMATIC SLANTED GLASS FEATURE BLOCKS')) {
  css = css.replace(/\/\* ==========================================================================\s*CINEMATIC SLANTED GLASS FEATURE BLOCKS[\s\S]*?(?=\/\* =|$)/, '');
}
if (!css.includes('INTERACTIVE PREMIUM ACCORDION')) {
  css += '\n' + accordionCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 2.7 Cinematic Slanted Glass Features Section */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
            {/* 2.7 Interactive Premium Accordion Features Section */}
            <section style={{ marginBottom: '50px' }}>
              <div className="accordion-container">
                
                {/* Block 1: Heavy Equipment */}
                <div className="accordion-item">
                  <div className="accordion-bg" style={{ backgroundImage: "url('/images/rig.png')" }}></div>
                  <div className="accordion-overlay"></div>
                  
                  <div className="accordion-title-vertical">Буровая техника</div>
                  
                  <div className="accordion-content">
                    <div className="accordion-details">
                      <EditableText id="b1_label" defaultText="МАТЕРИАЛЬНАЯ БАЗА" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                      <EditableText as="h3" id="b1_title" defaultText="Мощный парк техники" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b1_desc" defaultText="Мы не зависим от арендодателей. В нашем распоряжении находятся тяжелые установки класса Bauer BG20/BG28 для устройства свай в сложнейших скальных породах, а также маневренные ПБУ-2 на базе вездеходных шасси УРАЛ и КАМАЗ." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b1_li1" defaultText="Бурение до 80 метров в глубину" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b1_li2" defaultText="Выезд на объект за 24 часа по РК" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 2: Laboratory */}
                <div className="accordion-item">
                  <div className="accordion-bg" style={{ backgroundImage: "url('/images/lab.png')" }}></div>
                  <div className="accordion-overlay"></div>
                  
                  <div className="accordion-title-vertical">Лаборатория грунтов</div>
                  
                  <div className="accordion-content">
                    <div className="accordion-details">
                      <EditableText id="b2_label" defaultText="ТОЧНОСТЬ ДАННЫХ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                      <EditableText as="h3" id="b2_title" defaultText="Грунтовая лаборатория" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b2_desc" defaultText="Ни одна полевая работа не имеет смысла без качественных лабораторных тестов. Наш комплекс оснащен современными компрессионными и сдвиговыми приборами с автоматической фиксацией деформаций." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={20} color="var(--color-accent)" style={{ marginRight: '12px' }}/> <EditableText id="b2_li1" defaultText="Аттестат СТ РК ИСО/МЭК 17025" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={20} color="var(--color-accent)" style={{ marginRight: '12px' }}/> <EditableText id="b2_li2" defaultText="Химический анализ воды и грунтов" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 3: Geodesy */}
                <div className="accordion-item">
                  <div className="accordion-bg" style={{ backgroundImage: "url('/images/geodesy.png')" }}></div>
                  <div className="accordion-overlay"></div>
                  
                  <div className="accordion-title-vertical">Инженерная геодезия</div>
                  
                  <div className="accordion-content">
                    <div className="accordion-details">
                      <EditableText id="b3_label" defaultText="ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                      <EditableText as="h3" id="b3_title" defaultText="Точность съемки" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b3_desc" defaultText="Используем роботизированные тахеометры и высокоточные GNSS-приемники для создания опорных сетей, мониторинга осадков фундаментов и топографической съемки M1:500 для самых сложных проектов." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b3_li1" defaultText="3D-моделирование рельефа" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={20} color="var(--color-cyan)" style={{ marginRight: '12px' }}/> <EditableText id="b3_li2" defaultText="Вынос осей зданий в натуру" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx features block updated to accordion.');
