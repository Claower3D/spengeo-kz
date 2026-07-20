import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the incorrectly placed grid div and put it before Backend Системы
# Actually, I can just replace the whole chunk

old_chunk = """              {activeAdminSection === 'dashboard' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Управление структурой сайта</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>"""

new_chunk = """              {activeAdminSection === 'dashboard' && (
                <>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Управление структурой сайта</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>"""

content = content.replace(old_chunk, new_chunk)

old_chunk_2 = """                  </div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Backend Системы</h3>
                {/* 1. Leads */}"""

new_chunk_2 = """                  </div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Backend Системы</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* 1. Leads */}"""

content = content.replace(old_chunk_2, new_chunk_2)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed layout of CMS tiles")
