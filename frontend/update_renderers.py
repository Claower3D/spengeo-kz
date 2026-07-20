import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Team map
content = content.replace("adminData.team.map((member, i)", "(adminData.dynamicLists?.['about_team'] || adminData.team).map((member, i)")

# Replace the Advantages block
old_advantages = """            {(!activeSubPage || activeSubPage === 'advantages') && (
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>Наши преимущества</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Точность</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Современное полевое оборудование гарантирует 100% достоверность свойств грунтов.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-cyan)', marginBottom: '10px' }}>Оперативность</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Собственные буровые установки б/у и выезд на объект в течение 24 часов.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Сроки</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Выдаем отчет об изысканиях в строго отведенное время.</p>
                </HudCard>
              </div>
            </section>
            )}"""

new_advantages = """            {(!activeSubPage || activeSubPage === 'advantages') && (
            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>Наши преимущества</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {(adminData.dynamicLists?.['about_advantages'] || DEFAULT_ADVANTAGES).map((adv, i) => (
                  <HudCard key={i} style={{ padding: '25px' }}>
                    <h4 style={{ color: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-cyan)', marginBottom: '10px' }}>{adv.title}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{adv.desc}</p>
                  </HudCard>
                ))}
              </div>
            </section>
            )}"""

content = content.replace(old_advantages, new_advantages)


# Add Timeline to History block
old_history_end = """                      </p>
                    </div>
                  </div>
                </div>
            )}"""

new_history_end = """                      </p>
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

content = content.replace(old_history_end, new_history_end)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced hardcoded components with dynamic mappers!")
