import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Video rendering
old_video_render = """                            {item.image.includes('youtube.com') || item.image.includes('youtu.be') || item.image.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={item.image.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}"""

new_video_render = """                            {item.image.includes('youtube.com') || item.image.includes('youtu.be') || item.image.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={item.image.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : item.image.startsWith('data:video/') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') ? (
                                <video src={item.image} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}"""

content = content.replace(old_video_render, new_video_render)

# Fix 2: Article photo upload button
old_article_btn = """                              <button onClick={() => {
                                const url = prompt('Введите URL картинки:', article.image || '/images/article_placeholder.jpg');
                                if (url !== null) {
                                  const newArr = [...adminData.articles];
                                  newArr[i].image = url;
                                  setAdminData({...adminData, articles: newArr});
                                }
                              }} style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Folder size={14}/> Выбрать фото
                              </button>
                              <input type="text" value={article.image || ''} readOnly style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', opacity: 0.7 }} />"""

new_article_btn = """                              <label style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                                <Folder size={14}/> С устройства
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 2.5 * 1024 * 1024) {
                                            alert('Файл слишком большой. Для временного предпросмотра размер урезан.');
                                            const tempUrl = URL.createObjectURL(file);
                                            const newArr = [...adminData.articles];
                                            newArr[i].image = tempUrl;
                                            setAdminData({...adminData, articles: newArr});
                                        } else {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const newArr = [...adminData.articles];
                                                newArr[i].image = ev.target.result;
                                                setAdminData({...adminData, articles: newArr});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }
                                }} />
                              </label>
                              <input type="text" value={article.image || ''} onChange={(e) => {
                                  const newArr = [...adminData.articles];
                                  newArr[i].image = e.target.value;
                                  setAdminData({...adminData, articles: newArr});
                              }} placeholder="Или вставьте URL..." style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />"""

content = content.replace(old_article_btn, new_article_btn)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed article upload button and local video rendering!")
