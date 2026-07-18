const fs = require('fs');
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const searchStr = "<section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '60px', position: 'relative' }}>";

const startIndex = appJsx.indexOf(searchStr);
if (startIndex !== -1) {
  const endIndex = appJsx.indexOf('</section>', startIndex) + '</section>'.length;
  
  const bentoHtml = `
              <section className="container bento-grid" style={{ marginBottom: '100px', position: 'relative', zIndex: 10 }}>
                {/* 2x2 Large Card */}
                <div className="glow-card-premium bento-card bento-large float-slow">
                  <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03 }}><Hammer size={300} /></div>
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'inline-block', width: 'max-content' }}>
                    <Hammer size={32} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_wells" defaultText={t.stats.wells} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText id="stats_wells_val" defaultText="1,420+" isVisualBuilder={isVisualBuilder} as="div" className="spec-val" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--color-accent)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '20px', textShadow: '0 0 30px rgba(234, 179, 8, 0.5)' }} />
                  <EditableText id="stats_wells_desc" defaultText={t.stats.wellsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.8, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-reverse">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><MapPin size={150} /></div>
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <MapPin size={24} color="var(--color-cyan)" />
                  </div>
                  <EditableText id="stats_geo" defaultText={t.stats.geo} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_geo_val" defaultText={t.stats.geoValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }} />
                  <EditableText id="stats_geo_desc" defaultText={t.stats.geoDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-slow">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><Award size={150} /></div>
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <Award size={24} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_standards" defaultText={t.stats.standards} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_standards_val" defaultText="100%" isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(234, 179, 8, 0.4)' }} />
                  <EditableText id="stats_standards_desc" defaultText={t.stats.standardsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 2x1 Wide Card */}
                <div className="glow-card-premium bento-card bento-wide float-fast" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '15px', display: 'inline-block', width: 'max-content' }}>
                      <Settings size={24} color="var(--color-cyan)" />
                    </div>
                    <EditableText id="stats_fleet" defaultText={t.stats.fleet} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                    <EditableText id="stats_fleet_desc" defaultText={t.stats.fleetDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <EditableText id="stats_fleet_val" defaultText={t.stats.fleetValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, textShadow: '0 0 30px rgba(6, 182, 212, 0.5)' }} />
                  </div>
                  <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', opacity: 0.05 }}><Settings size={200} /></div>
                </div>
              </section>`;

  appJsx = appJsx.substring(0, startIndex) + bentoHtml + appJsx.substring(endIndex);
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
  console.log('Successfully injected bento stats section.');
} else {
  console.log('Failed to find stats section bounds.');
}
