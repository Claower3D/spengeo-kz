import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 1604 and 2217 syntax errors
for i in range(len(lines)):
    if '))}' in lines[i]:
        # We only want to replace `))}` that correspond to our new block mappings.
        # Check previous lines to see if it's the right context.
        # Actually, let's just use string replacement on the exact block.
        pass

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: About licenses section
old_block1 = """                    <span className="spec-label" style={{ color: doc.id === 'lic-gsl' ? '#ef4444' : doc.id === 'accreditation' ? 'var(--color-cyan)' : 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '0.15em', textShadow: `0 0 10px ${doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.4)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`, position: 'relative', zIndex: 2 }}>{doc.subtitle}</span>
                  </div>
                ))}"""
new_block1 = """                    <span className="spec-label" style={{ color: doc.id === 'lic-gsl' ? '#ef4444' : doc.id === 'accreditation' ? 'var(--color-cyan)' : 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '0.15em', textShadow: `0 0 10px ${doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.4)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`, position: 'relative', zIndex: 2 }}>{doc.subtitle}</span>
                  </div>
                ); })}"""
content = content.replace(old_block1, new_block1)

# Fix 2: Documents page
old_block2 = """                  <button className="btn btn-secondary" onClick={() => setCertModal({ title: doc.title, text: doc.desc })} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>
                    Просмотреть документ
                  </button>
                </HudCard>
              ))}"""
new_block2 = """                  <button className="btn btn-secondary" onClick={() => setCertModal({ title: doc.title, text: doc.desc })} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>
                    Просмотреть документ
                  </button>
                </HudCard>
              ); })}"""
content = content.replace(old_block2, new_block2)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed syntax errors in App.jsx!")
