import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the items.map block inside the cms_ activeAdminSection
old_map_regex = re.compile(r"\{\s*dynamicMenu\['ru'\]\.find\(m => m\.page === activeAdminSection\.replace\('cms_', ''\)\)\?\.items\.map\(\(sub, sidx\) => \(\s*<div key=\{sidx\}.*?</div>\s*</div>\s*\)\)\s*\}", re.DOTALL)

# Let's use string replace instead of regex to be absolutely safe since it's a huge block.
# We'll just define the old block exactly.
old_block_start = "{dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => ("
old_block_end = """                         </div>
                      </div>
                    ))}"""

# I will use regex because the routing logic in the middle is long.
# Let's do it cleanly using python string operations:
start_idx = content.find(old_block_start)
end_idx = content.find(old_block_end, start_idx) + len(old_block_end)

if start_idx != -1 and end_idx != -1:
    new_map = """{dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => (
                      <div key={sidx} style={{ padding: '20px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: theme === 'white' ? '0 4px 15px rgba(0,0,0,0.03)' : 'none', transition: 'transform 0.2s', transform: 'translateY(0)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <input value={sub.name} onChange={(e) => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items[sidx].name = e.target.value;
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent', border: '1px solid transparent', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1, padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.border = theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #444'} onBlur={(e) => e.target.style.border = '1px solid transparent'} />
                             <button onClick={() => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items.splice(sidx, 1);
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginLeft: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}><Trash2 size={16}/></button>
                          </div>
                          
                          <button onClick={() => {
                             if (sub.action) {
                                 if (sub.action.type === 'service') {
                                     setActiveAdminSection('services');
                                     const sIndex = adminData.services.findIndex(s => s.id === sub.action.val || s.code?.toLowerCase().includes(sub.action.val));
                                     if (sIndex !== -1 && typeof setEditingServiceIndex === 'function') {
                                         setEditingServiceIndex(sIndex);
                                     }
                                 } else if (sub.action.val === 'projects') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'about' && sub.action.subpage === 'team') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'blog' && sub.action.subpage === 'articles') {
                                     setActiveAdminSection('form_knowledge_articles');
                                 } else if (sub.action.type === 'equip') {
                                     setActiveAdminSection('form_equipment_' + (sub.action.cat || 'misc') + '_' + (sub.action.idx !== undefined ? sub.action.idx : '0'));
                                 } else {
                                     setActiveAdminSection('form_' + (sub.action.val || 'unknown') + '_' + (sub.action.subpage || ''));
                                 }
                             }
                          }} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', padding: '12px', borderRadius: '8px', color: '#06b6d4', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#06b6d4'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = '1px solid #06b6d4'; }} onMouseOut={(e) => { e.currentTarget.style.background = theme === 'white' ? '#f8fafc' : '#1a1a1a'; e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.border = theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333'; }}>
                             Настроить контент <Edit3 size={16}/>
                          </button>
                      </div>
                    ))}"""
    content = content[:start_idx] + new_map + content[end_idx:]

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Redesigned subsection tiles!")
