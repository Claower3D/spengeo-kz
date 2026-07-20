import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the onClick handler to properly route to EXISTING admin forms
old_code = """onClick={() => {
                        if (sub.action) {
                           setActiveAdminSection('form_' + sub.action.val + '_' + (sub.action.subpage || ''));
                        }
                      }}"""
                      
new_code = """onClick={() => {
                        if (sub.action) {
                           if (sub.action.type === 'service') {
                               setActiveAdminSection('services');
                               // We can also trigger editing the specific service if editingServiceIndex exists
                               const sIndex = adminData.services.findIndex(s => s.id === sub.action.val || s.code?.toLowerCase().includes(sub.action.val));
                               if (sIndex !== -1 && typeof setEditingServiceIndex === 'function') {
                                   setEditingServiceIndex(sIndex);
                               }
                           } else if (sub.action.val === 'projects') {
                               setActiveAdminSection('blocks');
                           } else if (sub.action.val === 'about' && sub.action.subpage === 'team') {
                               setActiveAdminSection('blocks');
                           } else if (sub.action.val === 'blog' && sub.action.subpage === 'articles') {
                               setActiveAdminSection('form_knowledge_articles');
                           } else {
                               setActiveAdminSection('form_' + sub.action.val + '_' + (sub.action.subpage || ''));
                           }
                        }
                      }}"""

content = content.replace(old_code, new_code)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated onClick routing to point to correct existing admin forms")
