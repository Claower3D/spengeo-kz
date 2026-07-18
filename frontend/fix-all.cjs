const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add scroll to top useEffect
if (!content.includes('useEffect(() => { window.scrollTo(')) {
    const useEffectInjection = `
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, activeSubPage]);
  `;
    content = content.replace(/(const \[language, setLanguage\] = useState\('ru'\);)/, '$1\n' + useEffectInjection);
}

// 2. Fix Equipment logic to use activeSubPage
const equipmentStart = content.indexOf('{/* ==================== PAGE: EQUIPMENT ==================== */}');
const documentsStart = content.indexOf('{/* ==================== PAGE: DOCUMENTS ==================== */}');

if (equipmentStart !== -1 && documentsStart !== -1) {
    let equipStr = content.substring(equipmentStart, documentsStart);
    
    // Replace equipCategory tabs with activeSubPage tabs
    equipStr = equipStr.replace(
        /<div className="equip-tabs">[\s\S]*?<\/div>/,
        `<div className="equip-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" className={\`equip-tab \${activeSubPage === 'rigs' ? 'active' : ''}\`} onClick={() => setActiveSubPage('rigs')}>Буровые машины</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'lab' ? 'active' : ''}\`} onClick={() => setActiveSubPage('lab')}>Лаборатория</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'cpt' ? 'active' : ''}\`} onClick={() => setActiveSubPage('cpt')}>CPT</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'geodetic' ? 'active' : ''}\`} onClick={() => setActiveSubPage('geodetic')}>Геодезия</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'testing' ? 'active' : ''}\`} onClick={() => setActiveSubPage('testing')}>Испытательное оборуд.</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'pumps' ? 'active' : ''}\`} onClick={() => setActiveSubPage('pumps')}>Насосы</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'transport' ? 'active' : ''}\`} onClick={() => setActiveSubPage('transport')}>Транспорт</button>
            </div>`
    );
    
    // Change ternary to independent conditional renders
    equipStr = equipStr.replace(
        /\{equipCategory === 'rigs' \? \(/,
        `{activeSubPage === 'rigs' && (`
    );
    
    equipStr = equipStr.replace(
        /\) : \(\n\s*<div className="equip-grid">\n\s*<div className="equip-list">\n\s*\{LAB_EQUIP\.map/,
        `)}\n\n            {activeSubPage === 'lab' && (\n              <div className="equip-grid">\n                <div className="equip-list">\n                  {LAB_EQUIP.map`
    );
    
    // Replace selectedRig/selectedLab state variables usage - wait, these are fine, they use component state.
    
    // Add placeholder for all other tabs
    equipStr = equipStr.replace(
        /(\s*)(<\/div>\n\s*<\/div>\n\s*\)})$/,
        `$1\n            {['cpt', 'geodetic', 'testing', 'pumps', 'transport'].includes(activeSubPage) && (
              <HudCard style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Раздел в процессе наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Спецификации оборудования для раздела "{activeSubPage}" готовятся нашими специалистами и скоро будут опубликованы.</p>
              </HudCard>
            )}$1$2`
    );

    content = content.substring(0, equipmentStart) + equipStr + content.substring(documentsStart);
}

// 3. Fix Knowledge Base logic
const knowledgeStart = content.indexOf('{/* ==================== PAGE: KNOWLEDGE BASE ==================== */}');
const equipmentStart2 = content.indexOf('{/* ==================== PAGE: EQUIPMENT ==================== */}');

if (knowledgeStart !== -1 && equipmentStart2 !== -1) {
    let knowledgeStr = content.substring(knowledgeStart, equipmentStart2);
    
    knowledgeStr = knowledgeStr.replace(
        /\{BLOG_POSTS\.map\(post => \(/,
        `{(() => {
                let filtered = BLOG_POSTS;
                if (activeSubPage === 'methods') filtered = BLOG_POSTS.filter(p => p.category === 'Методология');
                else if (activeSubPage === 'regulations') filtered = BLOG_POSTS.filter(p => p.category === 'СП РК' || p.category === 'Регламент');
                else if (['soils', 'faq', 'news', 'photo', 'video'].includes(activeSubPage)) filtered = [];
                
                if (filtered.length === 0) return (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <HudCard style={{ padding: '40px', textAlign: 'center' }}>
                      <h3 style={{ marginBottom: '15px' }}>Раздел в процессе наполнения</h3>
                      <p style={{ color: 'var(--color-text-secondary)' }}>Материалы для раздела "{activeSubPage}" готовятся нашими специалистами и скоро будут опубликованы.</p>
                    </HudCard>
                  </div>
                );
                
                return filtered.map(post => (`
    );
    
    knowledgeStr = knowledgeStr.replace(
        /\)\}\n            <\/div>\n\n            <div style=\{\{\s*padding:\s*'30px'/g,
        `))}\n              })()}\n            </div>\n\n            <div style={{ padding: '30px'`
    );

    content = content.substring(0, knowledgeStart) + knowledgeStr + content.substring(equipmentStart2);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed everything properly.');
