import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Accordion replace
accordion_pattern = r'(<div className="accordion-container">).*?(</div>\s*</div>\s*</section>)'
accordion_new = r"""\1
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
\2"""

if re.search(accordion_pattern, content, re.DOTALL):
    content = re.sub(accordion_pattern, accordion_new, content, flags=re.DOTALL)
    print("Accordion replaced successfully.")
else:
    print("Accordion pattern not found!")

# 2. Bento grid
bento_pattern = r'(<div className="service-bento-grid">).*?(</section>)'
bento_new = r"""\1
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
\2"""

# Make sure we only replace the FIRST match of bento-grid
if re.search(bento_pattern, content, re.DOTALL):
    content = re.sub(bento_pattern, bento_new, content, count=1, flags=re.DOTALL)
    print("Bento grid replaced successfully.")
else:
    print("Bento pattern not found!")

# 3. Founder replace
founder_pattern = r'(<section className="about-preview">).*?(</section>)'
founder_new = r"""\1
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
                      <EditableText id="founder_badge" defaultText="ЛИЦЕНЗИИ И СЕРТИФИКАТЫ" isVisualBuilder={isVisualBuilder} />
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
                      <EditableText id="founder_btn" defaultText="Подробнее о компании" isVisualBuilder={isVisualBuilder} />
                    </button>
                  </div>
                </div>
                ))}
              </div>
\2"""

if re.search(founder_pattern, content, re.DOTALL):
    content = re.sub(founder_pattern, founder_new, content, count=1, flags=re.DOTALL)
    print("Founder replaced successfully.")
else:
    print("Founder pattern not found!")

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
