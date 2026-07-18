const fs = require('fs');
const pathCSS = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let css = fs.readFileSync(pathCSS, 'utf8');

const bentoCSS = `
/* ========================================================================= */
/* BENTO GRID (Kargiiz/Spengeo Corporate Style) */
/* ========================================================================= */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 15px;
}
@media (min-width: 768px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(3, 1fr); }
}

.bento-item {
  position: relative;
  background-color: #f1f5f9;
  overflow: hidden;
  min-height: 280px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.bento-item:hover {
  transform: translateY(-2px);
}

.bento-item-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-size: cover;
  background-position: center right;
  z-index: 1;
}

.bento-item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 75%;
  background-color: #0c1c30; /* Deep navy */
  clip-path: polygon(0 0, 100% 0, 45% 100%, 0 100%);
  z-index: 2;
  transition: all 0.3s ease;
}

.bento-item:hover .bento-item-overlay {
  width: 80%;
  background-color: #091524;
}

.bento-item-content {
  position: relative;
  z-index: 3;
  padding: 30px 25px;
  width: 60%;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bento-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 15px;
  line-height: 1.2;
}

.bento-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.bento-logo {
  margin-top: auto;
  width: 40px;
  height: 40px;
  opacity: 0.8;
}

.bento-item:hover .bento-logo {
  opacity: 1;
}
`;

if (!css.includes('.bento-grid')) {
    css += '\n' + bentoCSS;
    fs.writeFileSync(pathCSS, css, 'utf8');
}

const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

// Replace the old service grid with the bento grid
const gridStart = jsx.indexOf('<div style={{ display: \'grid\', gridTemplateColumns: \'repeat(auto-fit, minmax(320px, 1fr))\', gap: \'30px\' }}>');
const gridEnd = jsx.indexOf('</section>', gridStart);

if (gridStart !== -1 && gridEnd !== -1) {
    const bentoJSX = `<div className="bento-grid">
                {Object.entries(SERVICES_DATA).slice(0, 6).map(([key, item]) => {
                  return (
                    <div key={key} className="bento-item" onClick={() => {setActiveServiceTab(key); setActivePage('services');}}>
                      <div className="bento-item-bg">
                         <img src={\`/images/services/\${key}.jpg\`} alt={item.title} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right'}} onError={(e) => { e.target.src='/images/hero.png' }} />
                      </div>
                      <div className="bento-item-overlay"></div>
                      <div className="bento-item-content">
                        <h3 className="bento-title">{item.title}</h3>
                        <p className="bento-desc">{item.desc.substring(0, 80)}...</p>
                        
                        <div className="bento-logo">
                           <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%', color: 'var(--color-accent)' }}>
                             <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
                             <path d="M30 70 L70 30" strokeWidth="4" />
                             <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
                           </svg>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            `;
    
    // Replace just the div part before </section>
    const innerDivEnd = jsx.lastIndexOf('</div>', gridEnd);
    jsx = jsx.substring(0, gridStart) + bentoJSX + jsx.substring(innerDivEnd + 6);
    fs.writeFileSync(pathJSX, jsx, 'utf8');
}

console.log('Bento grid applied successfully!');
