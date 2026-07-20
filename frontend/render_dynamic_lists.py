import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_blog_fallback = """            ) : (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Раздел "{activeSubPage}" в стадии наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Наши редакторы готовят экспертный контент для этого раздела. Пожалуйста, загляните позже.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('articles')} style={{ marginTop: '20px' }}>Смотреть основные статьи</button>
              </div>
            )}"""

new_blog_fallback = """            ) : adminData.dynamicLists?.['blog_' + activeSubPage] && adminData.dynamicLists['blog_' + activeSubPage].length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                {adminData.dynamicLists['blog_' + activeSubPage].map((item, idx) => (
                  <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                     {item.image && (
                         <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            {item.image.includes('youtube.com') || item.image.includes('youtu.be') || item.image.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={item.image.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                         </div>
                     )}
                     <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                         {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                         {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                     </div>
                  </HudCard>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Раздел "{activeSubPage}" в стадии наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Наши редакторы готовят экспертный контент для этого раздела. Пожалуйста, загляните позже.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('articles')} style={{ marginTop: '20px' }}>Смотреть основные статьи</button>
              </div>
            )}"""

content = content.replace(old_blog_fallback, new_blog_fallback)

# Now about page. Let's add a dynamic fallback at the end of the about section.
# The about section ends just before {/* ==================== PAGE: SERVICES ==================== */}
about_end_marker = "        {/* END SERVICES */}" # wait, activePage === 'about' ends before SERVICES. Let's find end of about.
# Actually, the activePage === 'about' block ends around line 1758: ")} \n </div> \n )} \n {/* END SERVICES */}" 
# Wait, let's just insert it right before the last closing div of the `about` page.

# We can find `</section>\n            )}\n          </div>\n        )}`
old_about_end = """            </section>
            )}
          </div>
        )}"""

new_about_end = """            </section>
            )}

            {activeSubPage && activeSubPage !== 'history' && activeSubPage !== 'team' && activeSubPage !== 'advantages' && adminData.dynamicLists?.['about_' + activeSubPage] && adminData.dynamicLists['about_' + activeSubPage].length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                {adminData.dynamicLists['about_' + activeSubPage].map((item, idx) => (
                  <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                     {item.image && (
                         <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                     )}
                     <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                         {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                         {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                     </div>
                  </HudCard>
                ))}
              </div>
            )}
          </div>
        )}"""

content = content.replace(old_about_end, new_about_end)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added dynamic list rendering to public pages!")
