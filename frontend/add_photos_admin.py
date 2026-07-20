import re

try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        content = f.read()

# 1. Add Image to lucide-react imports
if 'Image,' not in content and ' Image ' not in content:
    content = content.replace('Users\n}', 'Users, Image\n}')
    content = content.replace('Users }', 'Users, Image }')

# 2. Add media to default state
if 'parsed.media' not in content:
    content = content.replace(
        'if (!parsed.bot) {',
        'if (!parsed.media) {\n        parsed.media = { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" };\n      }\n      if (!parsed.bot) {'
    )
    content = content.replace(
        'bot: {',
        'media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },\n      bot: {'
    )

# 3. Add the card in the dashboard
card_html = """
                {/* 8. Photos */}
                <div onClick={() => setActiveAdminSection('photos')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                      <Image size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Медиафайлы</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Фотографии</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Управление фоновыми изображениями блоков на главной странице.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a855f7' }}>Редактировать →</div>
                  </div>
                </div>
"""

if "setActiveAdminSection('photos')" not in content:
    content = content.replace('{/* 7. Bot */}', card_html + '\n                {/* 7. Bot */}')


# 4. Add the section UI
section_ui = """
            {activeAdminSection === 'photos' && (
              <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>Управление фотографиями</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Фон блока: Буровая техника</h4>
                    <ImageUploadField 
                      value={adminData.media?.rigBg || ''} 
                      onChange={(val) => setAdminData({...adminData, media: {...adminData.media, rigBg: val}})} 
                      theme={theme} 
                    />
                  </div>
                  
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Фон блока: Лаборатория грунтов</h4>
                    <ImageUploadField 
                      value={adminData.media?.labBg || ''} 
                      onChange={(val) => setAdminData({...adminData, media: {...adminData.media, labBg: val}})} 
                      theme={theme} 
                    />
                  </div>
                  
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Фон блока: Инженерная геодезия</h4>
                    <ImageUploadField 
                      value={adminData.media?.geoBg || ''} 
                      onChange={(val) => setAdminData({...adminData, media: {...adminData.media, geoBg: val}})} 
                      theme={theme} 
                    />
                  </div>
                </div>
              </div>
            )}
"""
if "activeAdminSection === 'photos'" not in content:
    content = content.replace("{activeAdminSection === 'bot' && (", section_ui + "\n            {activeAdminSection === 'bot' && (")

# 5. Replace hardcoded backgrounds
content = content.replace(
    "backgroundImage: 'url(/images/rig.jpg)'",
    "backgroundImage: `url(${adminData.media?.rigBg || '/images/rig.jpg'})`"
)
content = content.replace(
    "backgroundImage: 'url(/images/lab.jpg)'",
    "backgroundImage: `url(${adminData.media?.labBg || '/images/lab.jpg'})`"
)
content = content.replace(
    "backgroundImage: 'url(/images/geo.jpg)'",
    "backgroundImage: `url(${adminData.media?.geoBg || '/images/geo.jpg'})`"
)

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
