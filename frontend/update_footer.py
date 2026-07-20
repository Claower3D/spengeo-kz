import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove admin panel link
old_admin_link = """                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('admin'); logEvent('Footer navigation: Admin'); }} style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Админ-панель</a></li>"""
content = content.replace(old_admin_link, "")

# 2. Replace API text with Codix Style Line
old_api_text = """                <li>⚙️ API: Go REST Service Port 8083</li>"""
new_codix_text = """                <li style={{ marginTop: '15px' }}>Разработано при помощи <a href="https://codix-style-line-production.up.railway.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cyan)', textDecoration: 'none', textShadow: '0 0 10px rgba(14, 165, 233, 0.5)', borderBottom: '1px dashed var(--color-cyan)', paddingBottom: '2px', fontWeight: 600, letterSpacing: '0.5px', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderBottom = '1px solid #fff'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-cyan)'; e.currentTarget.style.textShadow = '0 0 10px rgba(14, 165, 233, 0.5)'; e.currentTarget.style.borderBottom = '1px dashed var(--color-cyan)'; }}>Codix Style Line</a></li>"""
content = content.replace(old_api_text, new_codix_text)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated footer with Codix Style Line!")
