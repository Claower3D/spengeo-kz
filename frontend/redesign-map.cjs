const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const mapCSS = `
/* ==========================================================================
   PREMIUM MAP DASHBOARD
   ========================================================================== */
.map-dashboard-container {
  background: rgba(10, 15, 25, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 50px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  margin-bottom: 60px;
}

[data-theme="white"] .map-dashboard-container {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 20px 50px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
}

.map-wrapper-premium {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
  position: relative;
  height: 500px;
}
[data-theme="white"] .map-wrapper-premium {
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  border-color: rgba(6, 182, 212, 0.4);
}

.project-card-premium {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.project-card-premium::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0; width: 4px;
  background: var(--color-cyan);
  transform: scaleY(0);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-origin: center;
}

.project-card-premium:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(6px);
  border-color: rgba(255,255,255,0.1);
}

.project-card-premium.active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transform: translateX(8px);
}
.project-card-premium.active::before {
  transform: scaleY(1);
}

[data-theme="white"] .project-card-premium {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0,0,0,0.06);
}
[data-theme="white"] .project-card-premium:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0,0,0,0.1);
}
[data-theme="white"] .project-card-premium.active {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, rgba(0, 0, 0, 0.02) 100%);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.map-reset-btn {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 10px 24px;
  background: rgba(10, 15, 25, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 182, 212, 0.5);
  color: white;
  border-radius: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.map-reset-btn:hover {
  background: rgba(6, 182, 212, 0.9);
  color: white;
  box-shadow: 0 15px 30px rgba(6, 182, 212, 0.4);
}
[data-theme="white"] .map-reset-btn {
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-text-primary);
}
[data-theme="white"] .map-reset-btn:hover {
  background: var(--color-cyan);
  color: white;
}

/* Custom Scrollbar for Project List */
.projects-list-scroll::-webkit-scrollbar {
  width: 6px;
}
.projects-list-scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
}
.projects-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 10px;
}
.projects-list-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.6);
}
[data-theme="white"] .projects-list-scroll::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.02);
}
[data-theme="white"] .projects-list-scroll::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.4);
}

@media (max-width: 900px) {
  .map-dashboard-container {
    padding: 30px 20px;
  }
}
`;

if (!css.includes('PREMIUM MAP DASHBOARD')) {
  css += '\n' + mapCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 4. Projects Section (Summarized) */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
                {/* 4. Projects Section (Map Dashboard) */}
                <section className="map-dashboard-container">
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <EditableText id="portfolio_label_v3" defaultText="ПОРТФОЛИО" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }} />
                <EditableText as="h2" id="portfolio_title_v3" defaultText="Выполненные Объекты" isVisualBuilder={isVisualBuilder} style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, margin: 0 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'stretch' }} className="portfolio-split-view">
                
                {/* Map Area */}
                <div style={{ flex: '1 1 60%' }} className="map-wrapper-premium">
                  <MapContainer center={[48.0196, 66.9237]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme !== 'dark' ? '#f8fafc' : '#030509', zIndex: 1 }}>
                    <TileLayer key={theme} 
                      url={theme !== 'dark' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"} 
                      attribution="&copy; OpenStreetMap &copy; CARTO" 
                    />
                    <MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />
                    {DETAILED_PROJECTS.map(proj => (
                      <Marker 
                        key={proj.id} 
                        position={proj.coords} 
                        icon={customGlowIcon}
                        eventHandlers={{
                          click: () => {
                            setActiveProjectCoords(proj.coords);
                            setActiveMapZoom(13);
                          }
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} className="hud-tooltip">
                          <strong style={{ color: 'var(--color-accent)' }}>{proj.client}</strong><br/>
                          {proj.name}
                        </Tooltip>
                        <Popup>
                          <strong style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>{proj.client}</strong><br/>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{proj.name}</span><br/>
                          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{proj.loc}</span><br/>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginTop: '5px', display: 'block' }}>{proj.type}</span>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  
                  {activeProjectCoords && (
                    <button 
                      onClick={() => { setActiveProjectCoords(null); setActiveMapZoom(5); }}
                      className="map-reset-btn"
                    >
                      <MapPin size={18} /> Вернуться к обзору РК
                    </button>
                  )}
                </div>

                {/* Projects List Area */}
                <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '16px', height: '500px', overflowY: 'auto', paddingRight: '15px' }} className="projects-list-scroll">
                  {DETAILED_PROJECTS.map(proj => {
                    const isActive = activeProjectCoords === proj.coords;
                    return (
                      <div 
                        key={proj.id} 
                        className={\`project-card-premium \${isActive ? 'active' : ''}\`}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {proj.client}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {proj.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <MapPin size={14} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          <Settings size={14} color="var(--color-cyan)" /> {proj.type}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); }} className="cta-button-primary glow-effect" style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '30px' }}>
                  <EditableText id="portfolio_btn_v3" defaultText="Смотреть все 50+ проектов" isVisualBuilder={isVisualBuilder} />
                </a>
              </div>
            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx map dashboard updated.');
