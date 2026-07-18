const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const newServiceCSS = `
/* ==========================================================================
   NEW SERVICE BENTO GRID
   ========================================================================== */
.service-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.service-bento-card {
  background: #111111;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.05);
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.service-bento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(239, 68, 68, 0.5);
}
.service-bento-card.wide {
  grid-column: span 2;
}
.service-bento-card.full {
  grid-column: span 3;
}
.service-bento-bg {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 30%;
  background-size: cover;
  background-position: right center;
  mask-image: linear-gradient(to right, transparent 0%, black 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 100%);
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.5s;
}
.service-bento-card:hover .service-bento-bg {
  opacity: 0.8;
  transform: scale(1.05);
}
.service-bento-content {
  position: relative;
  z-index: 2;
  padding: 35px;
  width: 75%;
}
.service-bento-card.wide .service-bento-content {
  width: 65%;
}
.service-bento-card.full .service-bento-content {
  width: 50%;
}
.service-bento-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 25px;
  letter-spacing: -0.02em;
}
.service-bento-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.service-bento-card.wide .service-bento-list,
.service-bento-card.full .service-bento-list {
  grid-template-columns: 1fr 1fr;
}
.service-bento-list li {
  font-size: 0.95rem;
  color: #cbd5e1;
  position: relative;
  padding-left: 18px;
  line-height: 1.4;
}
.service-bento-list li::before {
  content: '•';
  color: #ef4444;
  position: absolute;
  left: 0;
  font-weight: bold;
  font-size: 1.2rem;
  top: -2px;
}

/* Light theme overrides */
[data-theme="white"] .service-bento-card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
[data-theme="white"] .service-bento-card:hover {
  box-shadow: 0 15px 35px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(239, 68, 68, 0.6);
}
[data-theme="white"] .service-bento-title {
  color: #0f172a;
}
[data-theme="white"] .service-bento-list li {
  color: #334155;
}
[data-theme="white"] .service-bento-bg {
  opacity: 0.3;
}
[data-theme="white"] .service-bento-card:hover .service-bento-bg {
  opacity: 0.5;
}

@media (max-width: 1024px) {
  .service-bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .service-bento-card.full, .service-bento-card.wide {
    grid-column: span 2;
  }
}
@media (max-width: 768px) {
  .service-bento-grid {
    grid-template-columns: 1fr;
  }
  .service-bento-card.full, .service-bento-card.wide {
    grid-column: span 1;
  }
  .service-bento-content {
    width: 100% !important;
  }
  .service-bento-list {
    grid-template-columns: 1fr !important;
  }
  .service-bento-bg {
    left: 0;
    -webkit-mask-image: linear-gradient(to top, transparent 0%, black 100%);
    mask-image: linear-gradient(to top, transparent 0%, black 100%);
  }
}
`;

if (!css.includes('NEW SERVICE BENTO GRID')) {
  css += '\n' + newServiceCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
}

// --- 2. App.jsx Replacement ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const oldSectionStart = appJsx.indexOf('<div className="bento-grid">');
const oldSectionEnd = appJsx.indexOf('</section>', oldSectionStart);

if (oldSectionStart === -1 || oldSectionEnd === -1) {
  console.log('Could not find the old bento grid to replace.');
  process.exit(1);
}

const customServicesGrid = `
<div className="service-bento-grid">
  {/* 1. Geology - Wide */}
  <div className="service-bento-card wide" onClick={() => {setActiveServiceTab('geology'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/geology.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Инженерно-геологические изыскания</h3>
      <ul className="service-bento-list">
        <li>Бурение изыскательских скважин</li>
        <li>Отбор монолитов и проб вод</li>
        <li>Описание грунтового массива</li>
        <li>Изучение опасных процессов</li>
      </ul>
    </div>
  </div>

  {/* 2. Geodesy - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('geodesy'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/geodesy.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Геодезия и топосъемка</h3>
      <ul className="service-bento-list">
        <li>Топосъемка масштабов 1:500</li>
        <li>Съемка коммуникаций</li>
        <li>Вынос осей в натуру</li>
      </ul>
    </div>
  </div>

  {/* 3. CPT - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('cpt'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/cpt.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">CPT Зондирование</h3>
      <ul className="service-bento-list">
        <li>Вдавливание конуса</li>
        <li>Измерение сопротивления</li>
        <li>Расчленение разреза</li>
      </ul>
    </div>
  </div>

  {/* 4. Piles - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('piles'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/piles.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Испытания свай</h3>
      <ul className="service-bento-list">
        <li>Статическая нагрузка</li>
        <li>Выдергивающая нагрузка</li>
        <li>Динамические испытания</li>
      </ul>
    </div>
  </div>

  {/* 5. Plates - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('plates'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/plates.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Штамповые испытания</h3>
      <ul className="service-bento-list">
        <li>Плоские круглые штампы</li>
        <li>Испытания в скважинах</li>
        <li>Модуль деформации</li>
      </ul>
    </div>
  </div>

  {/* 6. Laboratory - Full Width */}
  <div className="service-bento-card full" onClick={() => {setActiveServiceTab('laboratory'); setActivePage('services');}}>
    <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/laboratory.jpg')" }}></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Лаборатория грунтов</h3>
      <ul className="service-bento-list">
        <li>Физико-механические свойства</li>
        <li>Химический анализ воды</li>
        <li>Коррозионная агрессивность</li>
        <li>Компрессионное сжатие</li>
      </ul>
    </div>
  </div>
</div>
`;

appJsx = appJsx.substring(0, oldSectionStart) + customServicesGrid + '\n              </div>\n            ' + appJsx.substring(oldSectionEnd);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx services bento updated!');
