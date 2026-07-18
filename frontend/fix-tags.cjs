const fs = require('fs');
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Replace the unbalanced tags
appJsx = appJsx.replace(/<\/div>\s*<\/div>\s*<\/section>\s*<\/div>\s*<\/div>\s*<div className="geological-layer mantle-layer">/, '</div>\n            </section>\n            </div>\n            </div>\n            <div className="geological-layer mantle-layer">');

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Fixed tags.');
