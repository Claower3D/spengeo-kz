const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Reset all the messed up titles by incrementing the ID to force a localStorage cache bust
const replacements = [
  { old: 'id="services_title"', new: 'id="services_title_v3"' },
  { old: 'id="services_label"', new: 'id="services_label_v3"' },
  { old: 'id="portfolio_title"', new: 'id="portfolio_title_v3"' },
  { old: 'id="portfolio_label"', new: 'id="portfolio_label_v3"' },
  { old: 'id="approach_title_v2"', new: 'id="approach_title_v3"' },
  { old: 'id="approach_label_v2"', new: 'id="approach_label_v3"' },
  { old: 'id="founder_title_v2"', new: 'id="founder_title_v3"' },
  { old: 'id="founder_label_v2"', new: 'id="founder_label_v3"' }
];

replacements.forEach(r => {
  appJsx = appJsx.replace(new RegExp(r.old, 'g'), r.new);
});

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Cache bust for titles complete!');
