import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

old_founder_block = "".join(lines[1475:1509])

new_founder_block = """            {/* 5. Director / About Section */}
            {(adminData.dynamicLists?.['home_founder'] || DEFAULT_HOME_FOUNDER).slice(0, 1).map((founder, i) => (
            <section key={i} style={{ marginBottom: '80px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                <div className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }}>РУКОВОДСТВО КОМПАНИИ</div>
                <h2 style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }}>Слово Основателя</h2>
              </div>
              <div className="bg-glow-orb-2" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)', opacity: 0.05 }}></div>
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                  <img src={founder.image} alt={founder.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1)', maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }}></div>
                </div>
                
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'var(--color-cyan)', opacity: 0.05, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>“</div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{founder.name.split(' ').slice(0, 2).join(' ')}</h3>
                    <h3 style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>{founder.name.split(' ').slice(2).join(' ')}</h3>
                    
                    <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600 }}>{founder.role}</div>
                    
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px', position: 'relative' }}>{founder.desc}</p>
                    
                    <div>
                      <button className="btn btn-primary" onClick={() => setActivePage('about')} style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.2)' }}>
                        Подробнее о компании
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            ))}\n"""

content = "".join(lines)
content = content.replace(old_founder_block, new_founder_block)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Founder block updated!")
