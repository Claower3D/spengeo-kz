import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The style string:
old_style = "style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent', border: '1px solid transparent', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1, padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px', transition: 'border 0.2s' }}"
new_style = "style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent', border: '1px solid transparent', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1, minWidth: 0, textOverflow: 'ellipsis', padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px', transition: 'border 0.2s' }}"

content = content.replace(old_style, new_style)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed flexbox overflow issue for subsection cards!")
