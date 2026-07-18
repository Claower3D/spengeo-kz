const fs = require('fs');

// --- 1. CSS Injection ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const approachCSS = `
/* ==========================================================================
   PREMIUM APPROACH CARDS
   ========================================================================== */
.approach-card-premium {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 50px 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.approach-card-premium::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: -1;
}

.approach-card-premium:hover {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.2);
}
.approach-card-premium:hover::after {
  opacity: 1;
}

/* Center Card Highlighting */
.approach-card-center {
  background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,1) 100%);
  border-top: 4px solid var(--color-accent);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

@media (min-width: 1024px) {
  .approach-card-center {
    transform: scale(1.05);
    z-index: 2;
  }
  .approach-card-center:hover {
    transform: scale(1.05) translateY(-10px);
    box-shadow: 0 40px 80px rgba(234, 179, 8, 0.15);
  }
}

/* Watermark Numbers */
.approach-watermark {
  position: absolute;
  bottom: -20px;
  right: -10px;
  font-size: 12rem;
  font-weight: 900;
  color: var(--color-cyan);
  opacity: 0.03;
  pointer-events: none;
  line-height: 1;
  font-family: 'Inter', sans-serif;
  transition: all 0.5s ease;
}
.approach-card-premium:hover .approach-watermark {
  transform: scale(1.1) rotate(-5deg);
  opacity: 0.08;
}
.approach-card-center .approach-watermark {
  color: var(--color-accent);
}

/* Dark Theme Adjustments */
[data-theme="dark"] .approach-card-premium {
  background: rgba(10, 15, 25, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
[data-theme="dark"] .approach-card-center {
  background: linear-gradient(180deg, rgba(15, 20, 30, 0.8) 0%, rgba(10, 15, 25, 0.9) 100%);
  box-shadow: 0 30px 60px rgba(0,0,0,0.6);
}
[data-theme="dark"] .approach-card-premium:hover {
  box-shadow: 0 30px 60px rgba(6, 182, 212, 0.2);
}
[data-theme="dark"] .approach-watermark {
  opacity: 0.05;
}
[data-theme="dark"] .approach-card-premium:hover .approach-watermark {
  opacity: 0.1;
}
`;

if (!css.includes('PREMIUM APPROACH CARDS')) {
  css += '\n' + approachCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS injected.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const targetStr = `              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2 }}>
                {/* Card 1 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%' }}>
                    <Search size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c1_t" defaultText={t.sections.approach1Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText as="p" id="app_c1_d" defaultText={t.sections.approach1Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }} />
                </div>

                {/* Card 2 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px', borderLeft: '3px solid var(--color-accent)', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(3, 5, 9, 0) 100%)' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%' }}>
                    <Briefcase size={36} color="var(--color-accent)" />
                  </div>
                  <EditableText as="h3" id="app_c2_t" defaultText={t.sections.approach2Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                    <EditableText as="li" id="app_c2_l1" dangerously={true} defaultText={t.sections.approach2L1} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l2" dangerously={true} defaultText={t.sections.approach2L2} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l3" dangerously={true} defaultText={t.sections.approach2L3} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l4" dangerously={true} defaultText={t.sections.approach2L4} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%' }}>
                    <ShieldCheck size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c3_t" defaultText={t.sections.approach3Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText as="p" id="app_c3_d" defaultText={t.sections.approach3Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                    <EditableText as="li" id="app_c3_l1" dangerously={true} defaultText={t.sections.approach3L1} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c3_l2" dangerously={true} defaultText={t.sections.approach3L2} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c3_l3" dangerously={true} defaultText={t.sections.approach3L3} isVisualBuilder={isVisualBuilder} />
                  </ul>
    </div>`;

const replaceStr = `              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2, alignItems: 'center' }}>
                {/* Card 1 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">01</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'inline-flex', padding: '20px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <Search size={40} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c1_t" defaultText={t.sections.approach1Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.3 }} />
                  <EditableText as="p" id="app_c1_d" defaultText={t.sections.approach1Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, flex: 1 }} />
                </div>

                {/* Card 2 */}
                <div className="approach-card-premium approach-card-center">
                  <div className="approach-watermark">02</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'inline-flex', padding: '20px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)' }}>
                    <Briefcase size={40} color="var(--color-accent)" />
                  </div>
                  <EditableText as="h3" id="app_c2_t" defaultText={t.sections.approach2Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.3 }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c2_l1" dangerously={true} defaultText={t.sections.approach2L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '10px' }} />
                    <EditableText as="li" id="app_c2_l2" dangerously={true} defaultText={t.sections.approach2L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '10px' }} />
                    <EditableText as="li" id="app_c2_l3" dangerously={true} defaultText={t.sections.approach2L3} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '10px' }} />
                    <EditableText as="li" id="app_c2_l4" dangerously={true} defaultText={t.sections.approach2L4} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">03</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'inline-flex', padding: '20px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <ShieldCheck size={40} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c3_t" defaultText={t.sections.approach3Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.3 }} />
                  <EditableText as="p" id="app_c3_d" defaultText={t.sections.approach3Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c3_l1" dangerously={true} defaultText={t.sections.approach3L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '10px' }} />
                    <EditableText as="li" id="app_c3_l2" dangerously={true} defaultText={t.sections.approach3L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '10px' }} />
                    <EditableText as="li" id="app_c3_l3" dangerously={true} defaultText={t.sections.approach3L3} isVisualBuilder={isVisualBuilder} />
                  </ul>
    </div>`;

appJsx = appJsx.split(targetStr).join(replaceStr);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx approach cards redesigned.');
