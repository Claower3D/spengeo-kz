const fs = require('fs');

// 1. Add Dropdown CSS
const pathCSS = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let css = fs.readFileSync(pathCSS, 'utf8');

const dropdownCSS = `
/* ==================== DROPDOWN MENUS ==================== */
.nav-item-with-dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(15px);
  background-color: #0c1627;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  padding: 15px;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  min-width: 500px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
}
.nav-item-with-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.dropdown-item {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.8);
  text-align: left;
  padding: 12px 15px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: var(--font-sans);
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1.4;
}
.dropdown-item:hover {
  background-color: rgba(255, 213, 0, 0.05);
  color: var(--color-accent);
}
`;

if (!css.includes('.dropdown-menu')) {
    css += '\n' + dropdownCSS;
    fs.writeFileSync(pathCSS, css, 'utf8');
}

// 2. Update JSX to restore dropdowns
const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

// We need to replace the "Услуги" and "Оборудование" buttons with the dropdown wrappers
const servicesLiRegex = /<li>\s*<button type="button" className={`nav-btn \${activePage === 'services' \? 'active' : ''}`} onClick=\{\(\) => { setActivePage\('services'\); logEvent\('Opened services terminal.'\); }\}>\s*\{t\.nav\.services\}\s*<\/button>\s*<\/li>/;

const newServicesLi = `
                  <li className="nav-item-with-dropdown">
                    <button type="button" className={\`nav-btn \${activePage === 'services' ? 'active' : ''}\`} onClick={() => { setActivePage('services'); logEvent('Opened services terminal.'); }}>
                      {t.nav.services}
                    </button>
                    <div className="dropdown-menu">
                      {Object.entries(SERVICES_DATA).map(([key, item]) => (
                        <button key={key} type="button" className="dropdown-item" onClick={() => { setActiveServiceTab(key); setActivePage('services'); }}>
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </li>`;

jsx = jsx.replace(servicesLiRegex, newServicesLi);

const equipmentLiRegex = /<li>\s*<button type="button" className={`nav-btn \${activePage === 'equipment' \? 'active' : ''}`} onClick=\{\(\) => { setActivePage\('equipment'\); logEvent\('Opened equipment viewer.'\); }\}>\s*\{t\.nav\.equipment\}\s*<\/button>\s*<\/li>/;

const newEquipmentLi = `
                  <li className="nav-item-with-dropdown">
                    <button type="button" className={\`nav-btn \${activePage === 'equipment' ? 'active' : ''}\`} onClick={() => { setActivePage('equipment'); logEvent('Opened equipment viewer.'); }}>
                      {t.nav.equipment}
                    </button>
                    <div className="dropdown-menu" style={{ gridTemplateColumns: '1fr', minWidth: '300px' }}>
                      {DRILLING_RIGS.map((rig, idx) => (
                        <button key={'rig'+idx} type="button" className="dropdown-item" onClick={() => { setEquipCategory('rigs'); setSelectedRig(idx); setActivePage('equipment'); }}>
                          {rig.name}
                        </button>
                      ))}
                      {LAB_EQUIP.map((equip, idx) => (
                        <button key={'lab'+idx} type="button" className="dropdown-item" onClick={() => { setEquipCategory('lab'); setSelectedLab(idx); setActivePage('equipment'); }}>
                          {equip.name}
                        </button>
                      ))}
                    </div>
                  </li>`;

jsx = jsx.replace(equipmentLiRegex, newEquipmentLi);

fs.writeFileSync(pathJSX, jsx, 'utf8');
console.log('Dropdowns restored!');
