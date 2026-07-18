const fs = require('fs');

// --- 1. Fix React Leaflet TileLayer not updating ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

appJsx = appJsx.replace(
  '<TileLayer \r\n                      url={theme !== \'dark\' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}',
  '<TileLayer key={theme} \r\n                      url={theme !== \'dark\' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}'
);
appJsx = appJsx.replace(
  '<TileLayer \n                      url={theme !== \'dark\' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}',
  '<TileLayer key={theme} \n                      url={theme !== \'dark\' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}'
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx map key added.');

// --- 2. Force CSS overrides with !important ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

css = css.replace(
  /url\('\/images\/geodesy_surface_bg\.png'\);/g,
  "url('/images/geodesy_surface_bg.png') !important;"
);
css = css.replace(
  /url\('\/images\/geology_bg_2\.png'\);/g,
  "url('/images/geology_bg_2.png') !important;"
);
css = css.replace(
  /url\('\/images\/geology_bg_3\.png'\);/g,
  "url('/images/geology_bg_3.png') !important;"
);

// Also let's just force the background-color of the layers themselves to white in light theme
const extraOverrides = `
[data-theme="white"] .geological-layer {
  background-color: #f8fafc !important;
}
`;

if (!css.includes('background-color: #f8fafc !important;')) {
  css += '\n' + extraOverrides;
}

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
console.log('CSS layers forced with !important.');
