import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the EXACT string and replace it using regex to handle whitespace
pattern = r'(<h3[^>]*>Backend Системы</h3>\s*)\{/\*\s*1\.\s*Leads\s*\*/\}'
replacement = r"\1<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>\n                {/* 1. Leads */}"

content = re.sub(pattern, replacement, content)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Inserted the missing div for Backend Системы grid")
