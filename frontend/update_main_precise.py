import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)

# 1. Replace the entire accordion-container content
accordion_start = '<div className="accordion-container">'
accordion_end = '</div>\n                  </div>\n                </section>'

start_idx = content.find(accordion_start)
end_idx = content.find(accordion_end, start_idx) + len(accordion_end)

if start_idx != -1 and end_idx != -1:
    old_accordion = content[start_idx:end_idx]
    new_accordion = """<div className="accordion-container">
              {(adminData.dynamicLists?.['home_slants'] || DEFAULT_HOME_SLANTS).map((item, i) => (
                <div key={i} className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: `url('${item.image}')` }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>{item.title}</span></div>
                    
                    <div className="accordion-content">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                      <ul>
                        {item.li1 && <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> {item.li1}</li>}
                        {item.li2 && <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> {item.li2}</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
                  </div>
                </section>"""
    content = content.replace(old_accordion, new_accordion)

# 2. Replace the Bento grid content
bento_start = '<div className="service-bento-grid">'
bento_end = '</div>\n            </section>'

start_idx = content.find(bento_start)
end_idx = content.find(bento_end, start_idx) + len(bento_end)

if start_idx != -1 and end_idx != -1:
    old_bento = content[start_idx:end_idx]
    new_bento = """<div className="service-bento-grid">
              {(adminData.dynamicLists?.['home_services'] || DEFAULT_HOME_SERVICES).map((srv, i) => (
                <div key={i} className={`service-bento-card ${i === 0 ? 'wide' : i === 5 ? 'full' : ''}`} onClick={() => {setActiveServiceTab('geology'); setActivePage('services');}}>
                  <div className="service-bento-bg">
                    <img src={['/images/services/geology.jpg', '/images/services/geodesy.jpg', '/images/services/cpt.jpg', '/images/services/piles.jpg', '/images/services/plates.jpg', '/images/services/laboratory.jpg'][i % 6]} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
                  </div><div className="service-bento-overlay"></div>
                  <div className="service-bento-content">
                    <h3 className="service-bento-title">{srv.title}</h3>
                    <ul className="service-bento-list">
                      {srv.bullets.split(',').map((b, bi) => (
                        <li key={bi}>{b.trim()}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-bento-arrow">
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
                      <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
                      <path d="M30 70 L70 30" strokeWidth="4" />
                      <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            </section>"""
    content = content.replace(old_bento, new_bento)

# 3. Replace the Founder block
founder_start = '<section className="about-preview">'
founder_end = '</section>\n            </div>\n            </div>\n            <div className="geological-layer mantle-layer">'

start_idx = content.find(founder_start)
end_idx = content.find(founder_end, start_idx) + len(founder_end)

if start_idx != -1 and end_idx != -1:
    old_founder = content[start_idx:end_idx]
    new_founder = """<section className="about-preview">
              <div className="about-preview-container">
                {(adminData.dynamicLists?.['home_founder'] || DEFAULT_HOME_FOUNDER).slice(0, 1).map((founder, i) => (
                <div key={i} className="about-preview-content">
                  <div className="about-preview-image">
                    <div className="image-frame">
                      <img src={founder.image} alt="Director" />
                    </div>
                  </div>
                  <div className="about-preview-text">
                    <div className="section-badge">
                      ЛИЦЕНЗИИ И СЕРТИФИКАТЫ
                    </div>
                    <h2 className="section-title">
                      {founder.name}
                    </h2>
                    <div className="founder-quote-icon">“</div>
                    <div className="director-role">{founder.role}</div>
                    <p className="director-quote">
                      {founder.desc}
                    </p>
                    <button className="cta-button-primary" onClick={() => {setActivePage('about'); setActiveSubPage('history');}}>
                      Подробнее о компании
                    </button>
                  </div>
                </div>
                ))}
              </div>
            </section>
            </div>
            </div>
            <div className="geological-layer mantle-layer">"""
    content = content.replace(old_founder, new_founder)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced main page blocks with precise string matching!")
