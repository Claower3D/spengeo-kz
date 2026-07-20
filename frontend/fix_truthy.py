import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_init = """      if (!parsed.dynamicLists['about_licenses']) {
        parsed.dynamicLists['about_licenses'] = DOCUMENTS_DATA;
      }"""

new_init = """      if (!parsed.dynamicLists['about_licenses'] || parsed.dynamicLists['about_licenses'].length === 0) {
        parsed.dynamicLists['about_licenses'] = DOCUMENTS_DATA;
      }"""

content = content.replace(old_init, new_init)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed array truthiness check!")
