const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the dropdown menu background to be theme-aware
content = content.replace(/background:\s*rgba\(7,\s*9,\s*14,\s*0\.95\);/g, 'background: var(--bg-card);');

// 2. Remove the filter invert on the logo which is causing it to look like a black square in light theme
content = content.replace(/:is\(\[data-theme="white"\],\s*\[data-theme="light-gray"\]\)\s*\.logo\s*img\s*\{\s*filter:\s*invert\(1\)\s*hue-rotate\(180deg\);\s*\}/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed header dropdown background and logo filter in index.css');
