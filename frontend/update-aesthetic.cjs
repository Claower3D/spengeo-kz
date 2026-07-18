const fs = require('fs');

// 1. Update CSS
const pathCSS = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let css = fs.readFileSync(pathCSS, 'utf8');

// Replace the previous bento-grid CSS with the updated "Our Style" version
const newBentoCSS = `
/* ========================================================================= */
/* BENTO GRID (Kargiiz/Spengeo Corporate Style) */
/* ========================================================================= */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 25px;
}
@media (min-width: 768px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(3, 1fr); }
}

.bento-item {
  position: relative;
  background-color: var(--bg-dark-secondary);
  overflow: hidden;
  min-height: 280px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 2px;
}

.bento-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.bento-item-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.bento-item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #0c1627; /* Dark navy */
  clip-path: polygon(0 0, 75% 0, 45% 100%, 0 100%);
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.bento-item:hover .bento-item-overlay {
  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);
  background-color: #0f1c30;
}

.bento-item-content {
  position: relative;
  z-index: 3;
  padding: 30px 25px;
  width: 75%; /* Constrain text to fit inside the dark area */
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bento-title {
  font-family: var(--font-sans);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 15px;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.bento-desc {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
  padding-right: 15px;
}

.bento-arrow-btn {
  margin-top: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 213, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.bento-item:hover .bento-arrow-btn {
  border: 1px solid var(--color-accent);
  background-color: rgba(255, 213, 0, 0.1);
  transform: rotate(45deg);
}
`;

// Replace the old block
const bentoStart = css.indexOf('/* BENTO GRID (Kargiiz/Spengeo Corporate Style) */');
const bentoEnd = css.indexOf('}', css.lastIndexOf('.bento-item:hover .bento-logo')) + 1;

if (bentoStart !== -1 && bentoEnd !== -1) {
    css = css.substring(0, bentoStart - 80) + newBentoCSS + css.substring(bentoEnd);
} else if (!css.includes('.bento-arrow-btn')) {
    css += '\n' + newBentoCSS;
}

fs.writeFileSync(pathCSS, css, 'utf8');

// 2. Update JSX
const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

const oldBentoStart = jsx.indexOf('<div className="bento-grid">');
const oldBentoEnd = jsx.indexOf('</div>\n            {/* ==================== PAGE: ADVANTAGES');

if (oldBentoStart !== -1 && oldBentoEnd !== -1) {
    const newBentoJSX = `<div className="bento-grid">
                {Object.entries(SERVICES_DATA).slice(0, 6).map(([key, item]) => {
                  return (
                    <div key={key} className="bento-item" onClick={() => {setActiveServiceTab(key); setActivePage('services');}}>
                      <div className="bento-item-bg">
                         <img src={\`/images/services/\${key}.jpg\`} alt={item.title} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center'}} onError={(e) => { e.target.src='/images/hero.png' }} />
                      </div>
                      <div className="bento-item-overlay"></div>
                      <div className="bento-item-content">
                        <h3 className="bento-title">{item.title}</h3>
                        <p className="bento-desc">{item.desc.substring(0, 110)}...</p>
                        
                        <div className="bento-arrow-btn">
                          <ArrowUpRight size={18} color="var(--color-accent)" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            `;
    
    // Replace just the grid
    jsx = jsx.substring(0, oldBentoStart) + newBentoJSX + jsx.substring(oldBentoEnd + 6);
    fs.writeFileSync(pathJSX, jsx, 'utf8');
}

console.log('Updated to match exact aesthetic!');
