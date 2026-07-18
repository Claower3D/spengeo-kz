const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/activePage === 'blog'/g, "activePage === 'knowledge'");
content = content.replace(/PAGE: BLOG/g, 'PAGE: KNOWLEDGE BASE');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated App.jsx');
