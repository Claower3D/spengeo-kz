import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add adminData.menu initialization in the state fallback
old_state = """      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }
      return parsed;"""
new_state = """      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }
      if (!parsed.menu) {
        parsed.menu = MENU_STRUCTURE;
      }
      return parsed;"""
content = content.replace(old_state, new_state)

# 2. Add `const dynamicMenu = adminData.menu || MENU_STRUCTURE;` inside the App component
# Let's place it right after `const [adminData, setAdminData] = useState(...)`
old_usedata = """  const [adminData, setAdminData] = useState(() => {"""
new_usedata = """  const [adminData, setAdminData] = useState(() => {"""

# Wait, `adminData` is defined there. We can define `dynamicMenu` just below it.
# Let's find `const [activeAdminSection, setActiveAdminSection]`
old_active_admin = """  const [activeAdminSection, setActiveAdminSection] = useState('dashboard');"""
new_active_admin = """  const [activeAdminSection, setActiveAdminSection] = useState('dashboard');
  const dynamicMenu = adminData.menu || MENU_STRUCTURE;"""
content = content.replace(old_active_admin, new_active_admin)

# 3. Replace all uses of MENU_STRUCTURE with dynamicMenu EXCEPT the definition.
# Uses of MENU_STRUCTURE:
# MENU_STRUCTURE['ru']
# MENU_STRUCTURE[language]
# MENU_STRUCTURE.ru

content = content.replace("MENU_STRUCTURE['ru']", "dynamicMenu['ru']")
content = content.replace("MENU_STRUCTURE[language]", "dynamicMenu[language]")
content = content.replace("MENU_STRUCTURE.ru", "dynamicMenu.ru")

# We just replaced `MENU_STRUCTURE` inside `const dynamicMenu = adminData.menu || MENU_STRUCTURE;` which is bad.
content = content.replace("const dynamicMenu = adminData.menu || dynamicMenu;", "const dynamicMenu = adminData.menu || MENU_STRUCTURE;")
content = content.replace("parsed.menu = dynamicMenu;", "parsed.menu = MENU_STRUCTURE;")

# 4. Now modify the Subsections view to add the + button, the inputs, and the trash button
# Let's find the subsections header
old_subsections_header = """                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                    Подразделы: {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.title}
                  </h3>"""

new_subsections_header = """                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>
                      Подразделы: {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.title}
                    </h3>
                    <button onClick={() => {
                        const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                        const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                        if (catIndex !== -1) {
                            const newSubId = 'sub_' + Date.now();
                            if (!newMenu['ru'][catIndex].items) newMenu['ru'][catIndex].items = [];
                            newMenu['ru'][catIndex].items.push({ name: 'Новый подраздел', action: { type: 'page', val: activeAdminSection.replace('cms_', ''), subpage: newSubId } });
                            setAdminData({...adminData, menu: newMenu});
                        }
                    }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить подраздел</button>
                  </div>"""
content = content.replace(old_subsections_header, new_subsections_header)


# 5. Now replace the items.map block!
old_subsections_map_regex = re.compile(r"\{\s*dynamicMenu\['ru'\]\.find\(m => m\.page === activeAdminSection\.replace\('cms_', ''\)\)\?\.items\.map\(\(sub, sidx\) => \(\s*<div key=\{sidx\}.*?<div style=\{\{ color: '#06b6d4' \}\}\><Edit2 size=\{18\}/\></div\>\s*</div\>\s*\)\)\s*\}", re.DOTALL)

# Let's make sure we find the exact block! It is:
#                     {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => (
#                       <div key={sidx} style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : 'rgba(255,255,255,0.02)', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => {
# ... routing logic ...
#                           <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{sub.name}</span>
#                           <div style={{ color: '#06b6d4' }}><Edit2 size={18}/></div>
#                       </div>
#                     ))}

def replacer(match):
    original = match.group(0)
    # We will replace the inner <span> and <Edit2> with an <input> and <Edit2> + <Trash2>
    
    # Replace the onClick of the parent div because now we want to click on Edit2 specifically, or just keep it on the whole div.
    # Actually, we can just replace the inner contents of the div!
    inner_old = """<span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{sub.name}</span>
                          <div style={{ color: '#06b6d4' }}><Edit2 size={18}/></div>"""
                          
    inner_new = """<input value={sub.name} onChange={(e) => {
                             const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                             const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                             if (catIndex !== -1) {
                                 newMenu['ru'][catIndex].items[sidx].name = e.target.value;
                                 setAdminData({...adminData, menu: newMenu});
                             }
                         }} onClick={(e) => e.stopPropagation()} style={{ fontSize: '1rem', fontWeight: 'bold', background: 'transparent', border: 'none', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1 }} />
                         
                         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                             <div style={{ color: '#06b6d4' }}><Edit2 size={18}/></div>
                             <button onClick={(e) => {
                                 e.stopPropagation();
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items.splice(sidx, 1);
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16}/></button>
                         </div>"""
    
    return original.replace(inner_old, inner_new)

content = old_subsections_map_regex.sub(replacer, content)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added dynamic subsections capability")
