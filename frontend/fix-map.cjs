const fs = require('fs');

// 1. Fix CSS
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');
if (css.includes('.project-card-premium {')) {
  css = css.replace(/\.project-card-premium \{/, '.project-card-premium {\n  flex-shrink: 0;');
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('Fixed CSS flex-shrink');
}

// 2. Fix App.jsx
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Update imports
if (!appJsx.includes(', GeoJSON }')) {
  appJsx = appJsx.replace(
    "import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';",
    "import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, GeoJSON } from 'react-leaflet';"
  );
}

// Add state
const stateHookStr = `const [kzGeoJson, setKzGeoJson] = useState(null);
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KAZ.geo.json')
      .then(res => res.json())
      .then(data => setKzGeoJson(data))
      .catch(err => console.error("Failed to load KZ GeoJSON", err));
  }, []);`;

if (!appJsx.includes('const [kzGeoJson, setKzGeoJson]')) {
  appJsx = appJsx.replace(
    "const [activeProjectCoords, setActiveProjectCoords] = useState(null);",
    "const [activeProjectCoords, setActiveProjectCoords] = useState(null);\n  " + stateHookStr
  );
}

// Add GeoJSON to Map
const geoJsonComponent = `
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
`;

if (!appJsx.includes('<GeoJSON')) {
  appJsx = appJsx.replace(
    "<MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />",
    "<MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />" + geoJsonComponent
  );
}

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx updated with Kazakhstan Map Overlay.');
