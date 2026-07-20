import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Seed admin data
old_admin_data_init = """      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }"""
new_admin_data_init = """      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }
      if (!parsed.dynamicLists['about_licenses']) {
        parsed.dynamicLists['about_licenses'] = DOCUMENTS_DATA;
      }"""
content = content.replace(old_admin_data_init, new_admin_data_init)

old_fallback_init = """      articles: BLOG_POSTS,"""
new_fallback_init = """      articles: BLOG_POSTS,
      dynamicLists: { 'about_licenses': DOCUMENTS_DATA },"""
if new_fallback_init not in content:
    content = content.replace(old_fallback_init, new_fallback_init)

# Replace usage
content = content.replace("{DOCUMENTS_DATA.slice(0, 3).map(doc => (", "{(adminData.dynamicLists?.['about_licenses'] || DOCUMENTS_DATA).slice(0, 3).map((doc, idx) => { doc.id = doc.id || idx; return (")
content = content.replace("{DOCUMENTS_DATA.map(doc => (", "{(adminData.dynamicLists?.['about_licenses'] || DOCUMENTS_DATA).map((doc, idx) => { doc.id = doc.id || idx; return (")
content = content.replace("key={doc.id}", "key={doc.id || Math.random()}")

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Linked licenses to admin panel dynamic lists!")
