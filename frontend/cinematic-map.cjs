const fs = require('fs');

// --- 1. CSS Update ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const floatingMapCSS = `
/* ==========================================================================
   FLOATING CINEMATIC MAP DASHBOARD
   ========================================================================== */
.floating-map-section {
  position: relative;
  width: 100%;
  height: 750px;
  border-radius: 30px;
  overflow: hidden;
  margin-bottom: 80px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.05);
}

.floating-map-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 500;
  background: radial-gradient(circle at center, transparent 30%, rgba(3,5,9,0.7) 100%);
}

.floating-panel-left {
  position: absolute;
  top: 30px;
  left: 30px;
  bottom: 30px;
  width: 450px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 20px;
  pointer-events: none;
}

.floating-panel-header {
  background: rgba(10, 15, 25, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 35px 30px;
  pointer-events: auto;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}

.floating-panel-list {
  flex: 1;
  background: rgba(10, 15, 25, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 20px;
  pointer-events: auto;
  border: 1px solid rgba(255,255,255,0.08);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}

.floating-map-reset {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  pointer-events: auto;
}

[data-theme="white"] .floating-map-overlay {
  background: radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.4) 100%);
}
[data-theme="white"] .floating-panel-header,
[data-theme="white"] .floating-panel-list {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(0,0,0,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

@media (max-width: 1024px) {
  .floating-map-section {
    height: 900px;
    border-radius: 20px;
  }
  .floating-panel-left {
    width: auto;
    right: 20px;
    left: 20px;
    top: 20px;
    bottom: auto;
    height: 50%;
  }
}
`;

if (css.includes('PREMIUM MAP DASHBOARD')) {
  css = css.replace(/\/\* ==========================================================================\s*PREMIUM MAP DASHBOARD[\s\S]*?(?=\/\* =|$)/, '');
}
if (!css.includes('FLOATING CINEMATIC MAP DASHBOARD')) {
  css += '\n' + floatingMapCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Ensure ZoomControl is imported
if (!appJsx.includes('ZoomControl')) {
  appJsx = appJsx.replace(
    "import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, GeoJSON } from 'react-leaflet';",
    "import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, GeoJSON, ZoomControl } from 'react-leaflet';"
  );
}

const sIdx = appJsx.indexOf('{/* 4. Projects Section (Map Dashboard) */}');
const eIdxStr = '</section>';
const eIdx = appJsx.indexOf(eIdxStr, sIdx) + eIdxStr.length;

if (sIdx === -1) {
  console.error('Could not find the section in App.jsx');
  process.exit(1);
}

const newSection = `
                {/* 4. Projects Section (Floating Cinematic Map) */}
                <section className="floating-map-section">
              
              {/* Full background map */}
              <MapContainer center={[48.0196, 66.9237]} zoom={5} scrollWheelZoom={false} zoomControl={false} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: theme !== 'dark' ? '#f8fafc' : '#030509', zIndex: 1 }}>
                <ZoomControl position="topright" />
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

              {/* Vignette Overlay */}
              <div className="floating-map-overlay"></div>

              {/* Floating Panels (Left Side) */}
              <div className="floating-panel-left">
                
                <div className="floating-panel-header">
                  <EditableText id="portfolio_label_v3" defaultText="ПОРТФОЛИО" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.9rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }} />
                  <EditableText as="h2" id="portfolio_title_v3" defaultText="Выполненные Объекты" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, margin: 0, color: 'var(--color-text-primary)' }} />
                  <div style={{ marginTop: '20px' }}>
                    <a href="#portfolio" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); }} className="cta-button-primary glow-effect" style={{ padding: '12px 25px', fontSize: '0.95rem', borderRadius: '30px', width: '100%', display: 'inline-block', textAlign: 'center' }}>
                      <EditableText id="portfolio_btn_v3" defaultText="Смотреть все 50+ проектов" isVisualBuilder={isVisualBuilder} />
                    </a>
                  </div>
                </div>

                <div className="floating-panel-list projects-list-scroll">
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
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {proj.client}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {proj.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <MapPin size={14} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Reset Map Button */}
              {activeProjectCoords && (
                <div className="floating-map-reset">
                  <button 
                    onClick={() => { setActiveProjectCoords(null); setActiveMapZoom(5); }}
                    className="map-reset-btn"
                  >
                    <MapPin size={18} /> Вернуться к обзору
                  </button>
                </div>
              )}
              
            </section>`;

appJsx = appJsx.substring(0, sIdx) + newSection + appJsx.substring(eIdx);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx cinematic map dashboard updated.');
