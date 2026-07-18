const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix Knowledge Base
const knowledgeStart = content.indexOf('{/* ==================== PAGE: KNOWLEDGE BASE ==================== */}');
const equipmentStart = content.indexOf('{/* ==================== PAGE: EQUIPMENT ==================== */}');

if (knowledgeStart !== -1 && equipmentStart !== -1) {
    let knowledgeStr = content.substring(knowledgeStart, equipmentStart);
    
    // Replace mapping logic
    knowledgeStr = knowledgeStr.replace(
        /\{BLOG_POSTS\.map\(post => \(/g,
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
    // Add missing closing parentheses
    knowledgeStr = knowledgeStr.replace(
        /\)\}\n            <\/div>\n\n            <div style=\{\{ padding: '30px',/g,
        `)}\n              })()}\n            </div>\n\n            <div style={{ padding: '30px',`
    );

    content = content.substring(0, knowledgeStart) + knowledgeStr + content.substring(equipmentStart);
}

// 2. Fix Equipment
const equipmentEnd = content.indexOf('{/* ==================== PAGE: DOCUMENTS ==================== */}');
if (equipmentStart !== -1 && equipmentEnd !== -1) {
    let equipStr = content.substring(equipmentStart, equipmentEnd);
    
    // Replace the equip-tabs
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
    
    // Replace equipCategory logic with activeSubPage
    equipStr = equipStr.replace(/equipCategory === 'rigs'/g, "activeSubPage === 'rigs'");
    equipStr = equipStr.replace(/equipCategory === 'lab'/g, "activeSubPage === 'lab'");
    
    // The previous logic was a ternary: {activeSubPage === 'rigs' ? (...) : (...)}
    // But now we have 7 tabs. If it's not rigs and not lab, we need a placeholder.
    // Let's replace the whole {activeSubPage === 'rigs' ? (rigs block) : (lab block)}
    // It's tricky to regex this cleanly. Let's do it safely.
    equipStr = equipStr.replace(/\{activeSubPage === 'rigs' \? \(/, `{activeSubPage === 'rigs' && (`);
    equipStr = equipStr.replace(/\) : \(\n\s*<div className="equip-grid">\n\s*<div className="equip-list">\n\s*\{LAB_EQUIP\.map/g, `)}\n\n            {activeSubPage === 'lab' && (\n              <div className="equip-grid">\n                <div className="equip-list">\n                  {LAB_EQUIP.map`);
    
    // Close the lab block properly - we replaced `) : (` with `)} ... {activeSubPage === 'lab' && (`
    // Which means the lab block already has its closing `)}` at the very end of the file/block.
    
    // Add placeholder for all other tabs right before the closing </div> of the equipment page wrapper
    equipStr = equipStr.replace(
        /(\s*)(<\/div>\n\s*<\/div>\n\s*\)})$/,
        `$1\n            {['cpt', 'geodetic', 'testing', 'pumps', 'transport'].includes(activeSubPage) && (
              <HudCard style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Раздел в процессе наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Спецификации оборудования для раздела "{activeSubPage}" готовятся нашими специалистами и скоро будут опубликованы.</p>
              </HudCard>
            )}$1$2`
    );
    
    content = content.substring(0, equipmentStart) + equipStr + content.substring(equipmentEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dropdown tab functionality in App.jsx');
