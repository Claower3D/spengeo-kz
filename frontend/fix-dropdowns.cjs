const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject a useEffect to scroll to top whenever activePage or activeSubPage changes.
// This ensures that clicking a dropdown item from anywhere on the page always scrolls up to show the content.
if (!content.includes('useEffect(() => { window.scrollTo(')) {
    const useEffectInjection = `
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, activeSubPage]);
  `;
    // Find a good place to inject it, right after state declarations inside App component
    content = content.replace(/(const \[language, setLanguage\] = useState\('ru'\);)/, '$1\n' + useEffectInjection);
}

// 2. Fix the Equipment dropdown to only show the valid categories (rigs and lab)
const equipmentDropdownStart = content.indexOf('<button type="button" className={`dropdown-item ${activePage === \'equipment\' && activeSubPage === \'rigs\'');
const equipmentDropdownEnd = content.indexOf('</div>\n                  </li>\n                  <li className="nav-item-with-dropdown">\n                    <button type="button" className={`nav-btn ${activePage === \'knowledge\'', equipmentDropdownStart);

if (equipmentDropdownStart !== -1 && equipmentDropdownEnd !== -1) {
    const fixedEquipmentDropdown = `<button type="button" className={\`dropdown-item \${activePage === 'equipment' && equipCategory === 'rigs' ? 'active' : ''}\`} onClick={() => { setActivePage('equipment'); setEquipCategory('rigs'); }}>Буровые установки</button>
                      <button type="button" className={\`dropdown-item \${activePage === 'equipment' && equipCategory === 'lab' ? 'active' : ''}\`} onClick={() => { setActivePage('equipment'); setEquipCategory('lab'); }}>Лабораторные комплексы</button>
                    `;
    content = content.substring(0, equipmentDropdownStart) + fixedEquipmentDropdown + content.substring(equipmentDropdownEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dropdown routing and scrolling in App.jsx');
