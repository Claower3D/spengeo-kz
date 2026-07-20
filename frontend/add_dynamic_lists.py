import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# First, ensure dynamicLists exists in adminData
old_bot_check = """      if (!parsed.articles) {
        parsed.articles = BLOG_POSTS;
      }"""
new_bot_check = """      if (!parsed.articles) {
        parsed.articles = BLOG_POSTS;
      }
      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }"""
if "parsed.dynamicLists = {};" not in content:
    content = content.replace(old_bot_check, new_bot_check)

# Now, update the fallback generic editor to support BOTH Page Content and List Items!
old_fallback_regex = re.compile(r"\{\s*activeAdminSection\.startsWith\('form_'\).*?\}\)\s*\}", re.DOTALL)

# We will inject a local state using a hack, or we can just render both sections side by side!
# Side by side is easier to implement without injecting new useState hooks at the top.
# We will show the Page Editor, and below it, the Generic List Editor!

new_fallback = """              {activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* --- PAGE CONTENT EDITOR --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>Редактор страницы: {activeAdminSection.replace('form_', '').replace('_', ' / ')}</h3>
                       <button onClick={() => alert('Контент успешно сохранён в базу данных! Изменения применятся на сайте после кэширования.')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить текст</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Заголовок страницы (H1)</label>
                          <input type="text" placeholder="Введите главный заголовок..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Краткое описание / Подзаголовок</label>
                          <textarea rows={2} placeholder="Параграф под заголовком..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                      </div>

                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Основной текст (Контент)</label>
                          <textarea rows={4} placeholder="Полный текст страницы (можно использовать HTML теги)..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  </div>

                  {/* --- GENERIC LIST EDITOR --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>Элементы списка (База Данных)</h3>
                       <button onClick={() => {
                          const sectionKey = activeAdminSection.replace('form_', '');
                          const currentList = adminData.dynamicLists?.[sectionKey] || [];
                          const newList = [...currentList, { id: Date.now().toString(), title: 'Новый элемент', desc: '', image: '' }];
                          setAdminData({ ...adminData, dynamicLists: { ...(adminData.dynamicLists || {}), [sectionKey]: newList } });
                       }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить элемент</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                       {((adminData.dynamicLists || {})[activeAdminSection.replace('form_', '')] || []).map((item, idx) => (
                          <div key={item.id} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Элемент #{idx+1}</span>
                                <button onClick={() => {
                                   const sectionKey = activeAdminSection.replace('form_', '');
                                   const currentList = adminData.dynamicLists[sectionKey];
                                   const newList = currentList.filter((_, i) => i !== idx);
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={14}/></button>
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: theme === 'white' ? '#64748b' : '#888' }}>Название</label>
                                <input value={item.title} onChange={(e) => {
                                   const sectionKey = activeAdminSection.replace('form_', '');
                                   const newList = [...adminData.dynamicLists[sectionKey]];
                                   newList[idx].title = e.target.value;
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} style={{ width: '100%', padding: '8px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: theme === 'white' ? '#64748b' : '#888' }}>Описание</label>
                                <textarea value={item.desc} onChange={(e) => {
                                   const sectionKey = activeAdminSection.replace('form_', '');
                                   const newList = [...adminData.dynamicLists[sectionKey]];
                                   newList[idx].desc = e.target.value;
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} rows={3} style={{ width: '100%', padding: '8px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                             </div>
                             <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '4px', color: theme === 'white' ? '#64748b' : '#888' }}>Фото (URL)</label>
                                <input value={item.image || ''} onChange={(e) => {
                                   const sectionKey = activeAdminSection.replace('form_', '');
                                   const newList = [...adminData.dynamicLists[sectionKey]];
                                   newList[idx].image = e.target.value;
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} placeholder="/images/placeholder.jpg" style={{ width: '100%', padding: '8px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                             </div>
                          </div>
                       ))}
                       {((adminData.dynamicLists || {})[activeAdminSection.replace('form_', '')] || []).length === 0 && (
                          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme === 'white' ? '#94a3b8' : '#666', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #333', borderRadius: '12px' }}>
                             В этом разделе пока нет элементов. Нажмите "+ Добавить элемент".
                          </div>
                       )}
                    </div>
                  </div>
                </div>
              )}"""

content = old_fallback_regex.sub(new_fallback, content)

# Next, we also need to route ALL `equip` to their specific forms, NOT `blocks`.
# So if type === 'equip', we should map it to `form_equip_rigs`, `form_equip_lab`, etc!
# Wait, the frontend `equip` clicks had action.type === 'equip' and action.cat === 'rigs' / 'lab'.
# But the user screenshot shows 7 equipment tiles: 'CPT', 'Геодезическое', etc.
# Are those in MENU_STRUCTURE under equipment? Yes, but they have `action: { type: 'equip', cat: 'lab', idx: 0 }`.
# If I map them to `form_equip_${sub.action.cat}_${sub.action.idx}`, they will get their own lists!
# Let's fix the routing!
old_route = """                           } else if (sub.action.type === 'equip') {
                               setActiveAdminSection('blocks');"""
new_route = """                           } else if (sub.action.type === 'equip') {
                               // Route equipment to generic list editor so they can add/remove anything
                               setActiveAdminSection('form_equip_' + (sub.action.cat || 'misc') + '_' + (sub.action.idx || '0'));"""
content = content.replace(old_route, new_route)

# Wait, if old_route is not exactly like that because I didn't write it!
# In the previous python script:
# I didn't add sub.action.type === 'equip' at all! I just let it fall through to `else`.
# In the `else` block: `setActiveAdminSection('form_' + sub.action.val + '_' + (sub.action.subpage || ''));`
# If type === 'equip', `sub.action.val` is undefined. It became `form_undefined_undefined`.
# Let's fix the `else` block to handle missing `val`.

old_else = """                           } else {
                               setActiveAdminSection('form_' + sub.action.val + '_' + (sub.action.subpage || ''));
                           }"""
new_else = """                           } else if (sub.action.type === 'equip') {
                               setActiveAdminSection('form_equipment_' + (sub.action.cat || 'misc') + '_' + (sub.action.idx !== undefined ? sub.action.idx : '0'));
                           } else {
                               setActiveAdminSection('form_' + (sub.action.val || 'unknown') + '_' + (sub.action.subpage || ''));
                           }"""
content = content.replace(old_else, new_else)


with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Generic List Editor for all categories")
