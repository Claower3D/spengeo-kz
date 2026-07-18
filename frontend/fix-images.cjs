const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// The current string looks like:
// <div className="service-bento-bg" style={{ backgroundImage: "url('/images/services/geology.jpg')" }}></div>

const regex = /<div className="service-bento-bg" style={{ backgroundImage: "url\('(\/images\/services\/.*?\.jpg)'\)" }}><\/div>/g;

appJsx = appJsx.replace(regex, (match, url) => {
  return `<div className="service-bento-bg">
      <img src="${url}" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div>`;
});

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx fixed image fallbacks.');
