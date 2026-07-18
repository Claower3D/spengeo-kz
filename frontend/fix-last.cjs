const fs = require('fs');

// --- 1. Fix CSS geological layers for light theme ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const layerFixes = `
/* Light Theme Fixes for Parallax Backgrounds */
[data-theme="white"] .crust-layer {
  background-image: 
    linear-gradient(to bottom, 
      rgba(248, 250, 252, 0.98) 0%, 
      rgba(248, 250, 252, 0.95) 300px, 
      rgba(248, 250, 252, 0.95) 80%, 
      #f8fafc 100%
    ),
    url('/images/geodesy_surface_bg.png');
}

[data-theme="white"] .aquifers-layer {
  background-image: 
    linear-gradient(to bottom, 
      #f8fafc 0%, 
      rgba(248, 250, 252, 0.95) 150px, 
      rgba(248, 250, 252, 0.95) calc(100% - 150px), 
      #f8fafc 100%
    ),
    url('/images/geology_bg_2.png');
}

[data-theme="white"] .mantle-layer {
  background-image: 
    linear-gradient(to bottom, 
      #f8fafc 0%, 
      rgba(248, 250, 252, 0.95) 150px, 
      rgba(248, 250, 252, 0.95) calc(100% - 250px), 
      #f8fafc 100%
    ),
    url('/images/geology_bg_3.png');
}
`;

if (!css.includes('Light Theme Fixes for Parallax Backgrounds')) {
  css += '\n' + layerFixes;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('CSS layers fixed.');
}

// --- 2. Fix App.jsx theme logic for map ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

appJsx = appJsx.replace(/theme === 'white'/g, "theme !== 'dark'");

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx map theme check relaxed.');
