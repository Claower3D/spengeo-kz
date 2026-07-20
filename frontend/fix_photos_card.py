import sys

try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        app = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        app = f.read()

# 1. Fix adminData.team.img
app = app.replace('src={adminData.team.img}', "src={adminData.team[0]?.img || '/images/director.png'}")

# 2. Re-write the photos section
start_marker = "activeAdminSection === 'photos' && ("
end_marker = "activeAdminSection === 'bot' && ("

start_idx = app.find(start_marker)
end_idx = app.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_photos_section = """activeAdminSection === 'photos' && (
              <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>Управление фотографиями (Блоки главной страницы)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Оборудование и технологии */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Оборудование и технологии (3 карточки)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Буровая техника</div>
                        <ImageUploadField value={adminData.media?.rigBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, rigBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Лаборатория грунтов</div>
                        <ImageUploadField value={adminData.media?.labBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, labBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Инженерная геодезия</div>
                        <ImageUploadField value={adminData.media?.geoBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, geoBg: val}})} theme={theme} />
                      </div>
                    </div>
                  </div>

                  {/* Выполненные объекты (Услуги) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Услуги (6 карточек на главной)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      {['geology', 'geodesy', 'cpt', 'piles', 'plates', 'laboratory'].map((id, idx) => {
                        const service = adminData.services.find(s => s.id === id);
                        const titles = ['Инженерно-геологические изыскания', 'Геодезия и топосъемка', 'CPT Зондирование', 'Испытания свай', 'Штамповые испытания', 'Лаборатория грунтов'];
                        return (
                          <div key={id} style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>{titles[idx]}</div>
                            <ImageUploadField 
                              value={service?.image || ''} 
                              onChange={(val) => {
                                const arr = [...adminData.services];
                                const index = arr.findIndex(s => s.id === id);
                                if(index > -1) { arr[index].image = val; setAdminData({...adminData, services: arr}); }
                              }} 
                              theme={theme} 
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Лицензии и сертификаты (Директор) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Лицензии и сертификаты (Фото директора)</h4>
                    <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', maxWidth: '400px' }}>
                      <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Шенвизов Рудольф Константинович</div>
                      <ImageUploadField 
                        value={adminData.team[0]?.img || ''} 
                        onChange={(val) => {
                          const arr = [...adminData.team];
                          if (arr.length > 0) {
                              arr[0].img = val;
                              setAdminData({...adminData, team: arr});
                          }
                        }} 
                        theme={theme} 
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            """
    app = app[:start_idx] + new_photos_section + app[end_idx:]

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(app)

print('Success')
