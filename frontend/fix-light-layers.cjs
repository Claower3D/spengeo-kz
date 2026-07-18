const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

const lightThemeLayerStyles = `

/* LIGHT THEME OVERRIDES FOR GEOLOGICAL LAYERS */
:is([data-theme="white"], [data-theme="light-gray"]) .crust-layer {
  background-image: 
    linear-gradient(to bottom, 
      var(--bg-dark-secondary) 0%, 
      rgba(248, 250, 252, 0.92) 300px, 
      rgba(248, 250, 252, 0.92) 80%, 
      var(--bg-dark) 100%
    ),
    url('/images/geodesy_surface_bg.png');
}

:is([data-theme="white"], [data-theme="light-gray"]) .aquifers-layer {
  background-image: 
    linear-gradient(to bottom, 
      var(--bg-dark) 0%, 
      rgba(248, 250, 252, 0.95) 150px, 
      rgba(248, 250, 252, 0.95) calc(100% - 150px), 
      var(--bg-dark) 100%
    ),
    url('/images/geology_bg_2.png');
}

:is([data-theme="white"], [data-theme="light-gray"]) .mantle-layer {
  background-image: 
    linear-gradient(to bottom, 
      var(--bg-dark) 0%, 
      rgba(248, 250, 252, 0.96) 150px, 
      rgba(248, 250, 252, 0.96) calc(100% - 250px), 
      var(--bg-dark) 100%
    ),
    url('/images/geology_bg_3.png');
}

:is([data-theme="white"], [data-theme="light-gray"]) .page-wrapper {
  background-color: var(--bg-dark);
}

:is([data-theme="white"], [data-theme="light-gray"]) .hero-overlay {
  background: linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%);
}

/* Ensure map and custom UI components blend nicely */
:is([data-theme="white"], [data-theme="light-gray"]) .leaflet-container {
  background: var(--bg-dark) !important;
}
`;

if (!content.includes('LIGHT THEME OVERRIDES FOR GEOLOGICAL LAYERS')) {
  fs.appendFileSync(path, lightThemeLayerStyles, 'utf8');
  console.log('Appended light theme geological layer overrides.');
} else {
  console.log('Light theme geological layer overrides already exist.');
}
