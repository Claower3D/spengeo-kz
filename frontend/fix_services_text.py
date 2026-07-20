import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the logical OR evaluation issues
content = content.replace(
    "{adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0].code}", 
    "{(adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).code}"
)

content = content.replace(
    "{adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0].reg}", 
    "{(adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).reg}"
)

content = content.replace(
    "{adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0].title}", 
    "{(adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).title}"
)

content = content.replace(
    "{adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0].desc}", 
    "{(adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).desc}"
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed logical OR object rendering in services page!")
