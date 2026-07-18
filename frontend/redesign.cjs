const fs = require('fs');

// 1. Add Ultra-Premium CSS to index.css
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const premiumCSS = `
/* ==========================================================================
   ANTIGRAVITY DESIGN EXPERT: 3D, GLASSMORPHISM & KINETIC TYPOGRAPHY
   ========================================================================== */

/* 1. Ultra-Premium Glassmorphism */
.glass-panel, .dropdown-menu {
  background: rgba(7, 9, 14, 0.5) !important;
  backdrop-filter: blur(40px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(40px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

[data-theme="white"] .glass-panel, [data-theme="white"] .dropdown-menu {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(40px) saturate(150%) !important;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* 2. 3D Hover Effects for Premium Cards */
.glow-card-premium {
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease, border-color 0.6s ease !important;
  transform-style: preserve-3d;
  perspective: 1000px;
  position: relative;
  overflow: hidden;
}

.glow-card-premium:hover {
  transform: translateY(-12px) rotateX(3deg) rotateY(-3deg) scale(1.02) !important;
  box-shadow: 
    30px 30px 60px rgba(0, 0, 0, 0.6), 
    -10px -10px 40px rgba(6, 182, 212, 0.15),
    inset 0 0 20px rgba(255, 213, 0, 0.05) !important;
  border-color: rgba(6, 182, 212, 0.5) !important;
  z-index: 10;
}

[data-theme="white"] .glow-card-premium:hover {
  box-shadow: 
    30px 30px 60px rgba(0, 0, 0, 0.12), 
    -10px -10px 40px rgba(6, 182, 212, 0.15) !important;
}

/* Floating 3D Glare effect inside cards */
.glow-card-premium::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}
.glow-card-premium:hover::after {
  opacity: 1;
}

/* 3. Floating Animation (Antigravity) */
@keyframes float-element {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes float-element-reverse {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(15px) rotate(-1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.float-slow { animation: float-element 6s ease-in-out infinite; }
.float-fast { animation: float-element 4s ease-in-out infinite; }
.float-reverse { animation: float-element-reverse 7s ease-in-out infinite; }

/* 4. Text Gradients (Neon Glow) */
.text-gradient-premium {
  background: linear-gradient(to right, #06B6D4, #3B82F6, #FFD500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0px 0px 30px rgba(6, 182, 212, 0.4);
  display: inline-block;
}

/* 5. Magnetic Buttons */
.btn-primary {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
  position: relative;
  overflow: hidden;
}
.btn-primary::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
}
.btn-primary:hover::before {
  left: 150%;
}
.btn-primary:hover {
  transform: translateY(-4px) scale(1.05) !important;
  box-shadow: 0 20px 35px rgba(6, 182, 212, 0.5) !important;
}

/* Smooth scrolling */
html { scroll-behavior: smooth; }
`;

if (!css.includes('ANTIGRAVITY DESIGN EXPERT')) {
  css += '\n' + premiumCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('Added premium CSS.');
} else {
  console.log('Premium CSS already present.');
}

// 2. Modify App.jsx to inject these classes
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Add text-gradient-premium to Hero Title
appJsx = appJsx.replace(
  '<EditableText as="h1" id="hero_title" defaultText="Инженерные Изыскания" isVisualBuilder={isVisualBuilder} style={{ fontSize: \'clamp(2.5rem, 5vw, 4rem)\', lineHeight: 1.1, margin: \'0 0 20px 0\', fontWeight: 800, textShadow: \'0 0 30px rgba(0,0,0,0.5)\' }} />',
  '<EditableText as="h1" id="hero_title" defaultText="Инженерные Изыскания" isVisualBuilder={isVisualBuilder} className="text-gradient-premium" style={{ fontSize: \'clamp(3rem, 6vw, 4.5rem)\', lineHeight: 1.1, margin: \'0 0 20px 0\', fontWeight: 800, textShadow: \'0 0 40px rgba(6, 182, 212, 0.4)\', letterSpacing: \'-0.02em\' }} />'
);

// Fallback in case of exact match fail
appJsx = appJsx.replace(
  /id="hero_title" defaultText="Инженерные Изыскания"[^>]*\/>/g,
  'id="hero_title" defaultText="Инженерные Изыскания" isVisualBuilder={isVisualBuilder} className="text-gradient-premium float-slow" style={{ fontSize: \'clamp(3.5rem, 6vw, 5rem)\', lineHeight: 1.1, margin: \'0 0 20px 0\', fontWeight: 900, letterSpacing: \'-1px\' }} />'
);

// Add float classes to HUD cards / Info boxes
appJsx = appJsx.replace(
  /<div className="hud-info-box" style={{ padding: '20px',/g,
  '<div className="hud-info-box float-slow" style={{ padding: \'20px\','
);
appJsx = appJsx.replace(
  /<div className="hud-info-box" style={{ padding: '20px', borderLeft/g,
  '<div className="hud-info-box float-reverse" style={{ padding: \'20px\', borderLeft'
);

// Add text-gradient-premium to SpenGeo Highlights
appJsx = appJsx.replace(
  /color: 'var\(--color-cyan\)' }}>СпецИнжГео<\/span>/g,
  'color: \'var(--color-cyan)\' }} className="text-gradient-premium">СпецИнжГео</span>'
);

// Add float to images in hero (if any)
appJsx = appJsx.replace(
  /className="tech-card"/g,
  'className="tech-card float-slow"'
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx modified for 3D redesign.');
