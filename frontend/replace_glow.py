import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'rgba(234, 179, 8': 'rgba(59, 130, 246', # amber-500 rgb
    'rgba(245, 158, 11': 'rgba(59, 130, 246', # amber-500 rgb alternative
    'rgba(251, 191, 36': 'rgba(96, 165, 250', # amber-400 rgb
    '#eab308': '#3b82f6', # amber-500
    '#f59e0b': '#3b82f6', # amber-500
    '#fbbf24': '#60a5fa', # amber-400
}

for old_str, new_str in replacements.items():
    content = content.replace(old_str, new_str)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced all hardcoded yellow glows with blue in App.jsx!")
