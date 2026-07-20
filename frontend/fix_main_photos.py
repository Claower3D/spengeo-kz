import sys

# 1. UPDATE index.css
try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\index.css', 'r', encoding='utf-8') as f:
        css = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\index.css', 'r', encoding='utf-16') as f:
        css = f.read()

css = css.replace("url('/images/geodesy_surface_bg.png')", "var(--crust-bg, url('/images/geodesy_surface_bg.png'))")
css = css.replace("url('/images/geology_bg_2.png')", "var(--aquifers-bg, url('/images/geology_bg_2.png'))")
css = css.replace("url('/images/geology_bg_3.png')", "var(--mantle-bg, url('/images/geology_bg_3.png'))")

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\index.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. UPDATE App.jsx
try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        app = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        app = f.read()

# Add CSS vars to wrapper
old_wrapper = "<div style={isVisualBuilder ? { paddingTop: '60px', paddingLeft: '300px', paddingRight: '300px', height: '100vh', overflow: 'hidden', background: '#0a0a0a', transition: 'all 0.3s ease' } : {}}>"
new_wrapper = """<div style={{
        ...(isVisualBuilder ? { paddingTop: '60px', paddingLeft: '300px', paddingRight: '300px', height: '100vh', overflow: 'hidden', background: '#0a0a0a', transition: 'all 0.3s ease' } : {}),
        '--crust-bg': adminData.media?.crustBg ? f'url({adminData.media.crustBg})' : 'url(/images/geodesy_surface_bg.png)',
        '--aquifers-bg': adminData.media?.aquifersBg ? f'url({adminData.media.aquifersBg})' : 'url(/images/geology_bg_2.png)',
        '--mantle-bg': adminData.media?.mantleBg ? f'url({adminData.media.mantleBg})' : 'url(/images/geology_bg_3.png)'
      }}>""".replace("f'", "`").replace("')", "`)")

app = app.replace(old_wrapper, new_wrapper)

# Add inputs to photos section
old_photos = """                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>Управление фотографиями</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>"""

new_photos = """                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>Управление фотографиями</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  
                  {/* Hero Backgrounds */}
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Главная страница: Слой 1 (Поверхность)</h4>
                    <ImageUploadField value={adminData.media?.crustBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, crustBg: val}})} theme={theme} />
                  </div>
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Главная страница: Слой 2 (Водоносный горизонт)</h4>
                    <ImageUploadField value={adminData.media?.aquifersBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, aquifersBg: val}})} theme={theme} />
                  </div>
                  <div style={{ padding: '20px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                    <h4 style={{ marginBottom: '10px', color: theme === 'white' ? '#334155' : '#ccc' }}>Главная страница: Слой 3 (Мантия)</h4>
                    <ImageUploadField value={adminData.media?.mantleBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, mantleBg: val}})} theme={theme} />
                  </div>
"""

app = app.replace(old_photos, new_photos)

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print('Success')
