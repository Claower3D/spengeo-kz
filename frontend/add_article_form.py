import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the admin form for articles
articles_form_code = """
              {activeAdminSection === 'form_knowledge_articles' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>Управление Базой Знаний: Статьи</h3>
                  
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}><BookOpen size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>Статьи</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, articles: [{id: Date.now().toString(), title: 'Новая статья', category: 'Статья', date: new Date().toISOString().split('T')[0], readTime: '5 мин', excerpt: '', content: '', image: ''}, ...adminData.articles]})} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить статью</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {adminData.articles.map((article, i) => (
                        <div key={i} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Статья #{i+1}</span>
                            <button onClick={() => {
                              const newArr = [...adminData.articles];
                              newArr.splice(i, 1);
                              setAdminData({...adminData, articles: newArr});
                            }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Заголовок</div>
                                  <input type="text" value={article.title} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].title = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Категория</div>
                                  <input type="text" value={article.category} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].category = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Фотография (обложка)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {article.image && <img src={article.image} alt={article.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                              <button onClick={() => {
                                const url = prompt('Введите URL картинки:', article.image || '/images/article_placeholder.jpg');
                                if (url !== null) {
                                  const newArr = [...adminData.articles];
                                  newArr[i].image = url;
                                  setAdminData({...adminData, articles: newArr});
                                }
                              }} style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Folder size={14}/> Выбрать фото
                              </button>
                              <input type="text" value={article.image || ''} readOnly style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', opacity: 0.7 }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Краткое описание (excerpt)</div>
                            <textarea value={article.excerpt} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].excerpt = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={2} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Полный текст (content)</div>
                            <textarea value={article.content} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].content = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={5} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
"""

# Insert the form code
content = content.replace(
    "{/* ===== ADMIN SUB-PAGES ===== */}",
    "{/* ===== ADMIN SUB-PAGES ===== */}\n" + articles_form_code
)


# 2. Modify article card to render the image if it exists
old_card_code = """<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '12px' }}>
                        <span>{post.category}</span>
                        <span>{post.date}</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                        {post.excerpt}
                      </p>"""
                      
new_card_code = """
                      {post.image && (
                          <div style={{ margin: '-30px -30px 20px -30px', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                             <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '12px' }}>
                        <span>{post.category}</span>
                        <span>{post.date}</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                        {post.excerpt}
                      </p>"""
                      
content = content.replace(old_card_code, new_card_code)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added admin form for articles and image rendering")
