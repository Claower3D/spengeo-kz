const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace hardcoded transparent whites used for borders with the theme-aware variable
content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--border-color)');

// Replace hardcoded transparent blacks used for backgrounds with theme-aware variable
content = content.replace(/rgba\(0,\s*0,\s*0,\s*0\.2\)/g, 'var(--bg-dark-secondary)');

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced hardcoded colors in App.jsx');
