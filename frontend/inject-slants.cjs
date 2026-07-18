const fs = require('fs');

// --- 1. CSS Injection for Slanted Overlay and Arrow ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const updatedCSS = `
/* ==========================================================================
   SLANTED PHOTO STYLISTIC FOR BENTO
   ========================================================================== */
.service-bento-bg {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-size: cover;
  background-position: center right;
  opacity: 1 !important; /* Fully visible image */
  mask-image: none !important;
  -webkit-mask-image: none !important;
  transition: transform 0.5s;
  z-index: 0;
}
.service-bento-card:hover .service-bento-bg {
  transform: scale(1.05);
}

.service-bento-overlay {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: var(--bg-dark); /* Base dark color */
  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);
  z-index: 1;
  transition: clip-path 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.service-bento-card.wide .service-bento-overlay {
  clip-path: polygon(0 0, 70% 0, 55% 100%, 0 100%);
}
.service-bento-card.full .service-bento-overlay {
  clip-path: polygon(0 0, 60% 0, 50% 100%, 0 100%);
}

.service-bento-card:hover .service-bento-overlay {
  clip-path: polygon(0 0, 85% 0, 45% 100%, 0 100%);
}
.service-bento-card.wide:hover .service-bento-overlay {
  clip-path: polygon(0 0, 75% 0, 50% 100%, 0 100%);
}

/* Light Theme Overrides for Overlay */
[data-theme="white"] .service-bento-overlay {
  background: rgba(255, 255, 255, 0.95);
}

.service-bento-content {
  position: relative;
  z-index: 2;
}

.service-bento-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  z-index: 2;
  color: var(--color-accent);
  opacity: 0.8;
  transition: transform 0.3s, opacity 0.3s;
}
.service-bento-card:hover .service-bento-arrow {
  transform: scale(1.1) translate(5px, -5px);
  opacity: 1;
  color: var(--color-cyan);
}
`;

if (!css.includes('SLANTED PHOTO STYLISTIC FOR BENTO')) {
  css += '\n' + updatedCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS updated with slanted stylistic.');
}

// --- 2. App.jsx Update ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// We need to inject <div className="service-bento-overlay"></div> right after service-bento-bg
// And we need to inject the SVG arrow right before the end of the card

const arrowSvg = `
    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
`;

// Replace <div className="service-bento-bg" ...></div> with <div className="service-bento-bg" ...></div><div className="service-bento-overlay"></div>
appJsx = appJsx.replace(/<div className="service-bento-bg" style={{ backgroundImage: "url\('\/images\/services\/(.*?)\.jpg'\)" }}><\/div>/g, 
  '<div className="service-bento-bg" style={{ backgroundImage: "url(\'/images/services/$1.jpg\')" }}></div><div className="service-bento-overlay"></div>');

// Add the arrow before the closing </div> of each card
// A bit tricky with regex, let's do it by finding </ul>\n    </div>\n  </div>
appJsx = appJsx.replace(/<\/ul>\s*<\/div>\s*<\/div>/g, '</ul>\n    </div>\n' + arrowSvg + '  </div>');

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx updated with overlay and arrows.');
