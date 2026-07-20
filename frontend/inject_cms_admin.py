import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the CMS tiles at the beginning of the dashboard
cms_tiles_html = """
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Управление структурой сайта</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {MENU_STRUCTURE['ru'].map((menuItem, idx) => {
                      if (!menuItem.items) return null;
                      const colors = ['rgba(59, 130, 246', 'rgba(16, 185, 129', 'rgba(245, 158, 11', 'rgba(168, 85, 247', 'rgba(236, 72, 153', 'rgba(6, 182, 212'];
                      const col = colors[idx % colors.length];
                      return (
                        <div key={idx} onClick={() => setActiveAdminSection('cms_' + menuItem.page)} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? `1px solid ${col}, 0.4)` : `1px solid ${col}, 0.3)`, padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(to bottom, ${col}, 0.15), transparent)`, pointerEvents: 'none' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                            <div style={{ background: theme === 'white' ? `${col}, 0.1)` : 'rgba(0,0,0,0.4)', border: theme === 'white' ? `1px solid ${col}, 0.2)` : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: `${col}, 1)` }}>
                              <Folder size={24} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{menuItem.items.length}</div>
                              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>подразделов</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Контент раздела</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{menuItem.title}</h2>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: `${col}, 1)` }}>Редактировать подразделы →</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Backend Системы</h3>
"""
content = content.replace(
    "{/* 1. Leads */}",
    cms_tiles_html + "\n                {/* 1. Leads */}"
)

# 2. Add the sub-sections view for cms_* paths
sub_sections_html = """
              {activeAdminSection.startsWith('cms_') && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                    Подразделы: {MENU_STRUCTURE['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.title}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {MENU_STRUCTURE['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => (
                      <div key={sidx} style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : 'rgba(255,255,255,0.02)', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => { setActiveAdminSection('content'); }}>
                        <div style={{ fontWeight: '500', color: theme === 'white' ? '#334155' : '#cbd5e1' }}>{sub.name}</div>
                        <Edit3 size={16} color="var(--color-cyan)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
"""

# Insert right before {activeAdminSection === 'leads' && (
content = content.replace(
    "{activeAdminSection === 'leads' && (",
    sub_sections_html + "\n              {activeAdminSection === 'leads' && ("
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected CMS tiles into admin dashboard")
