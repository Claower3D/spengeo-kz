import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                                  {field.type === 'textarea' ? (
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
                                  )}"""

new_block = """                                  {field.type === 'textarea' ? (
                                     <textarea value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                                  ) : (field.key === 'image' || field.label.toLowerCase().includes('ссылка') || field.label.toLowerCase().includes('скан') || field.label.toLowerCase().includes('фото')) ? (
                                     <div style={{ display: 'flex', gap: '10px' }}>
                                        <input placeholder="Вставьте URL или загрузите файл..." value={item[field.key] || ''} onChange={(e) => {
                                            const newList = [...adminData.dynamicLists[sectionKey]];
                                            newList[idx][field.key] = e.target.value;
                                            setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                        }} style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                        <label style={{ background: '#3b82f6', color: '#fff', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                                           С устройства
                                           <input type="file" accept="image/*,video/*,application/pdf" style={{ display: 'none' }} onChange={(e) => {
                                               const file = e.target.files[0];
                                               if (file) {
                                                   if (file.size > 2.5 * 1024 * 1024) {
                                                       alert('Файл больше 2.5МБ! Для сохранения в локальной памяти (localStorage) размер урезан. В продакшене файл будет отправлен на сервер.');
                                                       const tempUrl = URL.createObjectURL(file);
                                                       const newList = [...adminData.dynamicLists[sectionKey]];
                                                       newList[idx][field.key] = tempUrl;
                                                       setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                                   } else {
                                                       const reader = new FileReader();
                                                       reader.onload = (ev) => {
                                                           const newList = [...adminData.dynamicLists[sectionKey]];
                                                           newList[idx][field.key] = ev.target.result;
                                                           setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                                       };
                                                       reader.readAsDataURL(file);
                                                   }
                                               }
                                           }} />
                                        </label>
                                     </div>
                                  ) : (
                                     <input value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                  )}"""

content = content.replace(old_block, new_block)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added file upload feature!")
