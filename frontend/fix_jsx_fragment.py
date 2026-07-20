import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the JSX fragment error
old_history_start = """            {(!activeSubPage || activeSubPage === 'history') && (
              <div className="glow-card-premium" """

new_history_start = """            {(!activeSubPage || activeSubPage === 'history') && (
              <>
              <div className="glow-card-premium" """

content = content.replace(old_history_start, new_history_start)

old_history_end2 = """                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
                  {(adminData.dynamicLists?.['about_history'] || DEFAULT_HISTORY).map((hist, i) => (
                    <HudCard key={i} style={{ padding: '25px', borderLeft: '4px solid var(--color-cyan)' }}>
                      <h3 style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>{hist.title}</h3>
                      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{hist.desc}</p>
                    </HudCard>
                  ))}
                </div>
            )}"""

new_history_end2 = """                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px', marginBottom: '60px' }}>
                  {(adminData.dynamicLists?.['about_history'] || DEFAULT_HISTORY).map((hist, i) => (
                    <HudCard key={i} style={{ padding: '25px', borderLeft: '4px solid var(--color-cyan)' }}>
                      <h3 style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>{hist.title}</h3>
                      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{hist.desc}</p>
                    </HudCard>
                  ))}
                </div>
              </>
            )}"""

content = content.replace(old_history_end2, new_history_end2)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed JSX Fragment Error")
