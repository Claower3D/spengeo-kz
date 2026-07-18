const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const sIdx = appJsx.indexOf('{/* 4. Projects Section (Floating Cinematic Map) */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
                {/* 4. Projects Section (Clean Split Layout) */}
                <section style={{ marginBottom: '80px', position: 'relative', zIndex: 10 }}>
              
              {/* Header Above Everything */}
              <div style={{ textAlign: 'center', marginBottom: '40px', background: 'var(--bg-dark)', padding: '40px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} className="map-header-card">
                <EditableText id="portfolio_label_v3" defaultText="ПОРТФОЛИО" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }} />
                <EditableText as="h2" id="portfolio_title_v3" defaultText="Выполненные Объекты" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 25px 0', color: 'var(--color-text-primary)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />
                
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); }} className="cta-button-primary glow-effect" style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-block' }}>
                  <EditableText id="portfolio_btn_v3" defaultText="Смотреть все 50+ проектов" isVisualBuilder={isVisualBuilder} />
                </a>
              </div>

              {/* Split View: Map Left, List Right */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'stretch' }} className="portfolio-split-view">
                
                {/* Map Area (Left) */}
                <div style={{ flex: '1 1 65%', height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
                  <MapContainer center={[48.0196, 66.9237]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme !== 'dark' ? '#f8fafc' : '#030509', zIndex: 1 }}>
                    <TileLayer key={theme} 
                      url={theme !== 'dark' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"} 
                      attribution="&copy; OpenStreetMap &copy; CARTO" 
                    />
                    <MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />
                    
                    {kzGeoJson && (
                      <GeoJSON 
                        data={kzGeoJson} 
                        style={{ 
                          color: 'var(--color-cyan)', 
                          weight: 3, 
                          fillColor: 'var(--color-cyan)', 
                          fillOpacity: theme === 'dark' ? 0.05 : 0.08,
                          dashArray: '6, 8'
                        }} 
                      />
                    )}

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
                      style={{ position: 'absolute', bottom: '25px', left: '25px', zIndex: 1000, padding: '12px 24px', background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-cyan)', color: 'white', borderRadius: '30px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                    >
                      <MapPin size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                      Вернуться к обзору РК
                    </button>
                  )}
                </div>

                {/* Projects List Area (Right) */}
                <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: '15px', height: '600px', overflowY: 'auto', paddingRight: '10px' }} className="projects-list-scroll">
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
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {proj.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                          <MapPin size={16} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                          <Settings size={16} color="var(--color-cyan)" /> {proj.type}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx layout reverted to requested layout.');
