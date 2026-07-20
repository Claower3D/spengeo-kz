import sys

try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        app = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        app = f.read()

# 1. Update filteredProjects logic
app = app.replace(
    'const filteredProjects = DETAILED_PROJECTS.filter(p =>',
    'const currentProjects = adminData.projects && adminData.projects.length > 0 ? adminData.projects : DETAILED_PROJECTS;\n  const filteredProjects = currentProjects.filter(p =>'
)

# 2. Update frontend HudCard to include image
old_hud_card = """<HudCard key={proj.id} style={{ padding: '25px' }}>
                      <span className="spec-label" style={{ color: 'var(--color-accent)' }}>{proj.client}</span>"""

new_hud_card = """<HudCard key={proj.id} style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                      {proj.image && <img src={proj.image} alt={proj.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}
                      <span className="spec-label" style={{ color: 'var(--color-accent)' }}>{proj.client}</span>"""
app = app.replace(old_hud_card, new_hud_card)

# 3. Update admin panel to include ImageUploadField for projects
old_admin_proj = """<div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' }}>
                            <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Заказчик</label>
                            <input value={p.client} onChange={e => { const arr = [...adminData.projects]; arr[i].client = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>"""

new_admin_proj = """<div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' }}>
                            <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Заказчик</label>
                            <input value={p.client} onChange={e => { const arr = [...adminData.projects]; arr[i].client = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '5px' }}>
                            <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Фото объекта</label>
                            <ImageUploadField value={p.image || ''} onChange={(val) => { const arr = [...adminData.projects]; arr[i].image = val; setAdminData({...adminData, projects: arr}); }} theme={theme} />
                          </div>"""
app = app.replace(old_admin_proj, new_admin_proj)

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print('Success')
