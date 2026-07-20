import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will add a fallback form rendering for anything that starts with 'form_'
# It should be placed right before `activeAdminSection === 'blocks'`

fallback_code = """
              {activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Управление контентом ({activeAdminSection.replace('form_', '')})</h3>
                  <div style={{ padding: '60px', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #333', borderRadius: '12px', color: theme === 'white' ? '#64748b' : '#888' }}>
                    Форма добавления и редактирования для этого раздела находится в процессе интеграции.<br/><br/>
                    Пожалуйста, используйте раздел "Базы Данных" или вернитесь позже.
                  </div>
                </div>
              )}
"""

content = content.replace(
    "{activeAdminSection === 'blocks' && (",
    fallback_code + "\n              {activeAdminSection === 'blocks' && ("
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added fallback for other forms")
