import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_text = "БЭКЕНД: GOLANG (PORT 8083) | ФРОНТЕНД: REACT (PORT 5174) | ЛИЦЕНЗИЯ: ГСЛ №19004562"
new_text = "БЭКЕНД: GOLANG | ФРОНТЕНД: REACT | ЛИЦЕНЗИЯ: ГСЛ №19004562"

content = content.replace(old_text, new_text)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed ports from the top ticker!")
