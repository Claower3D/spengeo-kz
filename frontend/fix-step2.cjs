const fs = require('fs');

// --- 1. Fix App.jsx Map & Hero ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// The Map background color
appJsx = appJsx.replace(
  'background: \'#030509\', zIndex: 1',
  'background: theme === \'white\' ? \'#f1f5f9\' : \'#030509\', zIndex: 1'
);

// The Map tiles URL
appJsx = appJsx.replace(
  'url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"',
  'url={theme === \'white\' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}'
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Fixed Map in App.jsx');

// --- 2. Fix index.css Hero Gradient & Text Colors ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const lightThemeFix = `
/* Light Theme Specific Fixes */
[data-theme="white"] {
  --color-text-secondary: #334155 !important;
  --color-text-muted: #64748b !important;
}

[data-theme="white"] .blueprint-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background: linear-gradient(to top, var(--bg-dark) 0%, transparent 100%);
  z-index: 5;
  pointer-events: none;
}
`;

if (!css.includes('Light Theme Specific Fixes')) {
  css += '\n' + lightThemeFix;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('Added light theme CSS fixes.');
}

