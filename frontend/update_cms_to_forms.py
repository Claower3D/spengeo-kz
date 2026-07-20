import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Revert the previous Visual Builder onClick and use form-based routing
old_code = """onClick={() => {
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
                      
new_code = """onClick={() => {
                        if (sub.action) {
                           setActiveAdminSection('form_' + sub.action.val + '_' + (sub.action.subpage || ''));
                        }
                      }}"""

content = content.replace(old_code, new_code)

# Ensure BLOG_POSTS is in adminData
if "articles: BLOG_POSTS" not in content:
    content = content.replace(
        "bot: { \n        name: 'SPENGEO_ASSISTANT',",
        "articles: BLOG_POSTS,\n      bot: { \n        name: 'SPENGEO_ASSISTANT',"
    )
    
# Replace usage of BLOG_POSTS with adminData.articles in the frontend
content = content.replace("BLOG_POSTS.map(post =>", "adminData.articles.map(post =>")

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated onClick to use forms and added articles to adminData")
