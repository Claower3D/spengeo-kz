const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const targetStr = `                      <div 
                        key={proj.id} 
                        className={\`project-card-premium \${isActive ? 'active' : ''}\`}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', boxShadow: '0 0 10px var(--color-cyan), 0 0 20px var(--color-cyan)' }} className="pulse-marker-mini"></div>
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
                      </div>`;

const replaceStr = `                      <div 
                        key={proj.id} 
                        style={{
                          position: 'relative',
                          padding: '15px 25px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: isActive ? 1 : 0.6,
                          background: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                          borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent'
                        }}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}
                      >
                        {/* Decorative Background Bubble (Пузырь) */}
                        <div style={{ position: 'absolute', top: '10px', left: '15px', width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', opacity: theme === 'dark' ? 0.15 : 0.25, zIndex: 0, transition: 'all 0.3s ease', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {proj.client}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                          {proj.name}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <MapPin size={16} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <Settings size={16} color="var(--color-cyan)" /> {proj.type}
                        </div>
                      </div>`;

if (appJsx.includes('class="pulse-marker-mini"')) {
  // It's using className not class, so let's rely on standard replace
}
appJsx = appJsx.split(targetStr).join(replaceStr);

// Also fix the map-header-card background logic for light theme
const headerTarget = `className="map-header-card">`;
const headerReplace = `className="map-header-card" style={{ background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.9)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.1)' }}>`;

if (!appJsx.includes(headerReplace)) {
  // Try to find the exact line
  const regex = /background:\s*'var\(--bg-dark\)'[\s\S]*?className="map-header-card"/;
  appJsx = appJsx.replace(regex, "background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.95)', padding: '40px 20px', borderRadius: '30px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)' }} className=\"map-header-card\"");
}

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx updated with bubble backgrounds');
