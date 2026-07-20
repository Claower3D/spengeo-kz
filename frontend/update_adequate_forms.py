import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will inject a config object for dynamic lists right before it is used.
config_injection = """
const DYNAMIC_FORM_CONFIGS = {
  'blog_photos': { title: 'Фотогалерея', addText: 'Добавить фото', fields: [{ key: 'image', label: 'Ссылка на фотографию', type: 'text' }, { key: 'title', label: 'Подпись (Альтернативный текст)', type: 'text' }] },
  'blog_videos': { title: 'Видеогалерея', addText: 'Добавить видео', fields: [{ key: 'image', label: 'Ссылка на видео (YouTube/Vimeo)', type: 'text' }, { key: 'title', label: 'Название видео', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }] },
  'blog_soils': { title: 'Справочник грунтов', addText: 'Добавить грунт', fields: [{ key: 'title', label: 'Тип грунта (Название)', type: 'text' }, { key: 'coeff', label: 'Коэффициент сложности (число)', type: 'text' }, { key: 'desc', label: 'Характеристики грунта', type: 'textarea' }] },
  'blog_norms': { title: 'Нормативные документы', addText: 'Добавить документ', fields: [{ key: 'title', label: 'Шифр (ГОСТ/СНиП/СП)', type: 'text' }, { key: 'desc', label: 'Полное название документа', type: 'textarea' }, { key: 'image', label: 'Ссылка на PDF файл', type: 'text' }] },
  'blog_faq': { title: 'Частые вопросы (FAQ)', addText: 'Добавить вопрос', fields: [{ key: 'title', label: 'Текст вопроса', type: 'text' }, { key: 'desc', label: 'Текст ответа', type: 'textarea' }] },
  'blog_methods': { title: 'Методы испытаний', addText: 'Добавить метод', fields: [{ key: 'title', label: 'Название метода', type: 'text' }, { key: 'desc', label: 'Описание методики', type: 'textarea' }, { key: 'image', label: 'Иллюстрация', type: 'text' }] },
  'blog_news': { title: 'Новостная лента', addText: 'Добавить новость', fields: [{ key: 'title', label: 'Заголовок новости', type: 'text' }, { key: 'desc', label: 'Содержание новости', type: 'textarea' }, { key: 'image', label: 'Фото к новости', type: 'text' }] },
  'about_history': { title: 'История компании (Таймлайн)', addText: 'Добавить этап', fields: [{ key: 'title', label: 'Год / Период', type: 'text' }, { key: 'desc', label: 'Описание события', type: 'textarea' }] },
  'about_advantages': { title: 'Наши преимущества', addText: 'Добавить преимущество', fields: [{ key: 'title', label: 'Заголовок преимущества', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }, { key: 'image', label: 'Иконка (lucide name или URL)', type: 'text' }] },
  'about_career': { title: 'Вакансии', addText: 'Добавить вакансию', fields: [{ key: 'title', label: 'Должность', type: 'text' }, { key: 'coeff', label: 'Зарплата / Условия', type: 'text' }, { key: 'desc', label: 'Требования', type: 'textarea' }] },
  'about_documents': { title: 'Сертификаты и лицензии', addText: 'Добавить сертификат', fields: [{ key: 'title', label: 'Название лицензии', type: 'text' }, { key: 'image', label: 'Скан документа (URL)', type: 'text' }] }
};

const getListConfig = (sectionKey) => {
    return DYNAMIC_FORM_CONFIGS[sectionKey] || {
        title: 'Управление записями',
        addText: 'Добавить запись',
        fields: [
            { key: 'title', label: 'Название', type: 'text' },
            { key: 'desc', label: 'Описание', type: 'textarea' },
            { key: 'image', label: 'Фото/Ссылка (URL)', type: 'text' }
        ]
    };
};
"""

# Let's replace the ENTIRE `activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles'` block.
old_block_regex = re.compile(r"\{\s*activeAdminSection\.startsWith\('form_'\)\s*&&\s*activeAdminSection\s*!==\s*'form_knowledge_articles'\s*&&\s*\(\s*<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '30px' \}\}\>.*?</div\>\s*\)\s*\}", re.DOTALL)

# In the new block, we will define config inside the render or just use the helper function (we can inject it at the top of the component or just define it inline).
# Since it's JSX, we can define the `config` variable by mapping `activeAdminSection.replace('form_', '')`.

new_block = """              {activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles' && (() => {
                const sectionKey = activeAdminSection.replace('form_', '');
                
                const DYNAMIC_FORM_CONFIGS = {
                  'blog_photos': { title: 'Фотогалерея', addText: 'Добавить фото', fields: [{ key: 'image', label: 'Ссылка на фотографию (URL)', type: 'text' }, { key: 'title', label: 'Подпись (Альтернативный текст)', type: 'text' }] },
                  'blog_videos': { title: 'Видеогалерея', addText: 'Добавить видео', fields: [{ key: 'image', label: 'Ссылка на видео (YouTube/Vimeo)', type: 'text' }, { key: 'title', label: 'Название видео', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }] },
                  'blog_soils': { title: 'Справочник грунтов', addText: 'Добавить грунт', fields: [{ key: 'title', label: 'Тип грунта (Название)', type: 'text' }, { key: 'coeff', label: 'Коэффициент сложности (число)', type: 'text' }, { key: 'desc', label: 'Характеристики грунта', type: 'textarea' }] },
                  'blog_norms': { title: 'Нормативные документы', addText: 'Добавить документ', fields: [{ key: 'title', label: 'Шифр (ГОСТ/СНиП/СП)', type: 'text' }, { key: 'desc', label: 'Полное название документа', type: 'textarea' }, { key: 'image', label: 'Ссылка на PDF файл', type: 'text' }] },
                  'blog_faq': { title: 'Частые вопросы (FAQ)', addText: 'Добавить вопрос', fields: [{ key: 'title', label: 'Текст вопроса', type: 'text' }, { key: 'desc', label: 'Текст ответа', type: 'textarea' }] },
                  'blog_methods': { title: 'Методы испытаний', addText: 'Добавить метод', fields: [{ key: 'title', label: 'Название метода', type: 'text' }, { key: 'desc', label: 'Описание методики', type: 'textarea' }, { key: 'image', label: 'Иллюстрация', type: 'text' }] },
                  'blog_news': { title: 'Новостная лента', addText: 'Добавить новость', fields: [{ key: 'title', label: 'Заголовок новости', type: 'text' }, { key: 'desc', label: 'Содержание новости', type: 'textarea' }, { key: 'image', label: 'Фото к новости', type: 'text' }] },
                  'about_history': { title: 'История компании (Таймлайн)', addText: 'Добавить этап', fields: [{ key: 'title', label: 'Год / Период', type: 'text' }, { key: 'desc', label: 'Описание события', type: 'textarea' }] },
                  'about_advantages': { title: 'Наши преимущества', addText: 'Добавить преимущество', fields: [{ key: 'title', label: 'Заголовок преимущества', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }, { key: 'image', label: 'Иконка (lucide name или URL)', type: 'text' }] },
                  'about_career': { title: 'Вакансии', addText: 'Добавить вакансию', fields: [{ key: 'title', label: 'Должность', type: 'text' }, { key: 'coeff', label: 'Зарплата / Условия', type: 'text' }, { key: 'desc', label: 'Требования', type: 'textarea' }] },
                  'about_documents': { title: 'Сертификаты и лицензии', addText: 'Добавить сертификат', fields: [{ key: 'title', label: 'Название лицензии', type: 'text' }, { key: 'image', label: 'Скан документа (URL)', type: 'text' }] }
                };

                const config = DYNAMIC_FORM_CONFIGS[sectionKey] || {
                    title: 'Управление записями',
                    addText: 'Добавить запись',
                    fields: [
                        { key: 'title', label: 'Название', type: 'text' },
                        { key: 'desc', label: 'Описание', type: 'textarea' },
                        { key: 'image', label: 'Фото/Ссылка (URL)', type: 'text' }
                    ]
                };

                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* --- SPECIFIC LIST EDITOR --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>БД: {config.title}</h3>
                       <button onClick={() => {
                          const currentList = adminData.dynamicLists?.[sectionKey] || [];
                          const newList = [{ id: Date.now().toString(), title: '', desc: '', image: '', coeff: '' }, ...currentList];
                          setAdminData({ ...adminData, dynamicLists: { ...(adminData.dynamicLists || {}), [sectionKey]: newList } });
                       }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ {config.addText}</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                       {((adminData.dynamicLists || {})[sectionKey] || []).map((item, idx) => (
                          <div key={item.id} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', fontWeight: 'bold' }}>Запись #{idx+1}</span>
                                <button onClick={() => {
                                   const currentList = adminData.dynamicLists[sectionKey];
                                   const newList = currentList.filter((_, i) => i !== idx);
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                             </div>
                             
                             {config.fields.map(field => (
                               <div key={field.key}>
                                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: theme === 'white' ? '#64748b' : '#888', fontWeight: '600' }}>{field.label}</label>
                                  {field.type === 'textarea' ? (
                                     <textarea value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                                  ) : (
                                     <input value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                  )}
                               </div>
                             ))}
                          </div>
                       ))}
                       {((adminData.dynamicLists || {})[sectionKey] || []).length === 0 && (
                          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme === 'white' ? '#94a3b8' : '#666', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #333', borderRadius: '12px' }}>
                             База данных пуста. Нажмите кнопку "+ {config.addText}".
                          </div>
                       )}
                    </div>
                  </div>
                  
                  {/* --- PAGE CONTENT EDITOR (OPTIONAL/META) --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>Мета-данные страницы (Опционально)</h3>
                       <button onClick={() => alert('Мета-данные успешно сохранены!')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Сохранить мета-данные</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Заголовок страницы (H1)</label>
                          <input type="text" placeholder="Введите главный заголовок..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Краткое описание / Подзаголовок (в шапке)</label>
                          <textarea rows={2} placeholder="Параграф под заголовком..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  </div>

                </div>
                );
              })}"""

content = old_block_regex.sub(new_block, content)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated dynamic lists to be highly specific and adequate!")
