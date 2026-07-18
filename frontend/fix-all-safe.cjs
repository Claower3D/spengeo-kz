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
    
    // Replace the tabs
    const oldTabsStart = equipStr.indexOf('<div className="equip-tabs">');
    const oldTabsEnd = equipStr.indexOf('</div>', oldTabsStart) + 6;
    
    const newTabs = `<div className="equip-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button type="button" className={\`equip-tab \${activeSubPage === 'rigs' ? 'active' : ''}\`} onClick={() => setActiveSubPage('rigs')}>Буровые машины</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'lab' ? 'active' : ''}\`} onClick={() => setActiveSubPage('lab')}>Лаборатория</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'cpt' ? 'active' : ''}\`} onClick={() => setActiveSubPage('cpt')}>CPT</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'geodetic' ? 'active' : ''}\`} onClick={() => setActiveSubPage('geodetic')}>Геодезия</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'testing' ? 'active' : ''}\`} onClick={() => setActiveSubPage('testing')}>Испытательное оборуд.</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'pumps' ? 'active' : ''}\`} onClick={() => setActiveSubPage('pumps')}>Насосы</button>
              <button type="button" className={\`equip-tab \${activeSubPage === 'transport' ? 'active' : ''}\`} onClick={() => setActiveSubPage('transport')}>Транспорт</button>
            </div>`;
    
    equipStr = equipStr.substring(0, oldTabsStart) + newTabs + equipStr.substring(oldTabsEnd);
    
    // Replace logic
    equipStr = equipStr.replace(/{equipCategory === 'rigs' \? \(/g, "{activeSubPage === 'rigs' && (");
    
    // Fix the `) : (` for the lab block
    const labStart = equipStr.indexOf(') : (\n              <div className="equip-grid">\n                <div className="equip-list">\n                  {LAB_EQUIP.map');
    if (labStart !== -1) {
        equipStr = equipStr.substring(0, labStart) + ')}\n\n            {activeSubPage === \'lab\' && (\n              <div className="equip-grid">\n                <div className="equip-list">\n                  {LAB_EQUIP.map' + equipStr.substring(labStart + 125);
    } else {
        // Fallback for \r\n
        const labStart2 = equipStr.indexOf(') : (\r\n              <div className="equip-grid">\r\n                <div className="equip-list">\r\n                  {LAB_EQUIP.map');
        if (labStart2 !== -1) {
            equipStr = equipStr.substring(0, labStart2) + ')}\r\n\r\n            {activeSubPage === \'lab\' && (\r\n              <div className="equip-grid">\r\n                <div className="equip-list">\r\n                  {LAB_EQUIP.map' + equipStr.substring(labStart2 + 130);
        }
    }
    
    // Add placeholder for missing categories right before the final closing div of the page wrapper
    const endDivIdx = equipStr.lastIndexOf('</div>\n          </div>');
    const endDivIdx2 = equipStr.lastIndexOf('</div>\r\n          </div>');
    const targetIdx = endDivIdx !== -1 ? endDivIdx : endDivIdx2;
    
    if (targetIdx !== -1) {
        const placeholder = `
            {['cpt', 'geodetic', 'testing', 'pumps', 'transport'].includes(activeSubPage) && (
              <HudCard style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Раздел в процессе наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Спецификации оборудования для раздела "{activeSubPage}" готовятся нашими специалистами и скоро будут опубликованы.</p>
              </HudCard>
            )}\n            `;
        equipStr = equipStr.substring(0, targetIdx) + placeholder + equipStr.substring(targetIdx);
    }
    
    content = content.substring(0, equipmentStart) + equipStr + content.substring(documentsStart);
}

// 3. Fix Knowledge Base logic
const knowledgeStart = content.indexOf('{/* ==================== PAGE: KNOWLEDGE BASE ==================== */}');
const equipmentStart2 = content.indexOf('{/* ==================== PAGE: EQUIPMENT ==================== */}');

if (knowledgeStart !== -1 && equipmentStart2 !== -1) {
    let knowledgeStr = content.substring(knowledgeStart, equipmentStart2);
    
    const replaceStart = knowledgeStr.indexOf('{BLOG_POSTS.map(post => (');
    const replaceEnd = knowledgeStr.indexOf('            </div>', replaceStart);
    
    if (replaceStart !== -1 && replaceEnd !== -1) {
        const newKnowledgeLogic = `{(() => {
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
                
                return filtered.map(post => (
                  <HudCard key={post.id} style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '12px' }}>
                      <span>{post.category}</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>⏱️ Чтение: {post.readTime}</span>
                      <button className="btn btn-secondary" onClick={() => logEvent(\`Opened article: \${post.title}\`)} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                        Читать полностью
                      </button>
                    </div>
                  </HudCard>
                ));
              })()}
`;
        knowledgeStr = knowledgeStr.substring(0, replaceStart) + newKnowledgeLogic + knowledgeStr.substring(replaceEnd);
    }
    
    content = content.substring(0, knowledgeStart) + knowledgeStr + content.substring(equipmentStart2);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed everything super safely.');
