const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find the line that has `))} \n </div>` and replace it
content = content.replace(/\)\)\}\s*<\/div>/, ')))}\n              })()}\n            </div>');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax error in App.jsx');
