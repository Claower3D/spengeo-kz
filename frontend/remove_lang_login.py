import re

# 1. Update App.jsx to remove language and login
with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Desktop Select
content = re.sub(
    r'<select\s+value=\{language\}\s+onChange=\{\(e\) => setLanguage\(e\.target\.value\)\}.*?<option value="kz">KZ</option>\s*</select>',
    '',
    content,
    flags=re.DOTALL
)

# Mobile Select
content = re.sub(
    r'<select\s+value=\{language\}\s+onChange=\{\(e\) => setLanguage\(e\.target\.value\)\}.*?<option value="kz">KZ</option>\s*</select>',
    '',
    content,
    flags=re.DOTALL
)

# Desktop Admin Login Button
content = re.sub(
    r'<button className="nav-btn" onClick=\{\(\) => setActivePage\(\'admin\'\)\}.*?\{t\.nav\.login\}\s*</button>',
    '',
    content,
    flags=re.DOTALL
)

# Mobile Admin Login Button
content = re.sub(
    r'<li><button type="button" onClick=\{\(\) => \{ setActivePage\(\'admin\'\); setIsMobileMenuOpen\(false\); \}\}.*?\{t\.nav\.login\}</button></li>',
    '',
    content,
    flags=re.DOTALL
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update index.css for dropdown-item:hover in light theme
with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'a', encoding='utf-8') as f:
    f.write('''
/* Light Theme Dropdown Hover Override */
:is([data-theme="white"], [data-theme="light-gray"]) .dropdown-item:hover {
  color: var(--color-cyan);
  background: rgba(6, 182, 212, 0.08);
  font-weight: 600;
}
:is([data-theme="white"], [data-theme="light-gray"]) .dropdown-item.active {
  color: var(--color-accent);
}
''')

print("Removed language and login, updated dropdown hover CSS!")
