import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "background: rgba(255, 255, 255, 0.7) !important;", 
    "background: rgba(255, 255, 255, 0.98) !important;"
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed dropdown background opacity in index.css")
