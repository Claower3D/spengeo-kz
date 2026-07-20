import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the onClick handler for CMS sub-sections
old_code = """onClick={() => { setActiveAdminSection('content'); }}"""
new_code = """onClick={() => {
                        if (sub.action) {
                          if (sub.action.type === 'page') {
                            setActivePage(sub.action.val);
                            if (sub.action.subpage) {
                              setActiveSubPage(sub.action.subpage);
                            }
                          } else if (sub.action.type === 'service') {
                            setActivePage('services');
                            // If you have activeServiceTab or similar, you'd set it here.
                            // Assuming setActiveServiceTab exists based on our search.
                            if (typeof setActiveServiceTab === 'function') {
                              setActiveServiceTab(sub.action.val);
                            }
                          } else if (sub.action.type === 'link') {
                            setActivePage(sub.action.val);
                          }
                        }
                        setIsVisualBuilder(true);
                      }}"""

content = content.replace(old_code, new_code)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated onClick for CMS sub-sections")
