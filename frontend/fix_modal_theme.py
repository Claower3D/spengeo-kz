import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = """      {/* ==================== MODAL: ACTIVE ARTICLE ==================== */}
      {activeArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(5px)' }} onClick={() => setActiveArticle(null)}>
          <div style={{ background: 'var(--color-bg-base)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveArticle(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              <X size={20} />
            </button>

            {activeArticle.image && (
              <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <img src={activeArticle.image} alt={activeArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to top, var(--color-bg-base), transparent)' }}></div>
              </div>
            )}
            
            <div style={{ padding: '40px', marginTop: activeArticle.image ? '-60px' : '0', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--color-cyan)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                <span>{activeArticle.category}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{activeArticle.date}</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: 'var(--color-text-primary)', lineHeight: '1.2' }}>{activeArticle.title}</h2>
              
              <div style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {activeArticle.content || activeArticle.excerpt || "Текст статьи в процессе написания."}
              </div>
            </div>
          </div>
        </div>
      )}"""

new_modal = """      {/* ==================== MODAL: ACTIVE ARTICLE ==================== */}
      {activeArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(5px)' }} onClick={() => setActiveArticle(null)}>
          <div style={{ background: theme === 'white' ? '#fff' : '#0f172a', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveArticle(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.2s', backdropFilter: 'blur(4px)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
              <X size={20} />
            </button>

            {activeArticle.image && (
              <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <img src={activeArticle.image} alt={activeArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: `linear-gradient(to top, ${theme === 'white' ? '#fff' : '#0f172a'} 20%, transparent)` }}></div>
              </div>
            )}
            
            <div style={{ padding: '40px', marginTop: activeArticle.image ? '-60px' : '0', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                <span>{activeArticle.category}</span>
                <span style={{ color: theme === 'white' ? '#cbd5e1' : '#334155' }}>•</span>
                <span style={{ color: theme === 'white' ? '#64748b' : '#94a3b8' }}>{activeArticle.date}</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#f8fafc', lineHeight: '1.2' }}>{activeArticle.title}</h2>
              
              <div style={{ fontSize: '1.1rem', color: theme === 'white' ? '#334155' : '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {activeArticle.content || activeArticle.excerpt || "Текст статьи в процессе написания."}
              </div>
            </div>
          </div>
        </div>
      )}"""

content = content.replace(old_modal, new_modal)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed modal styling for both themes!")
