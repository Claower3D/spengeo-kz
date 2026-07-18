const fs = require('fs');
const lines = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8').split('\n');
lines.forEach((l, i) => { 
  if (l.includes('<EditableText') && (l.includes('as="h2"') || l.includes('hero-subtitle') || l.includes('spec-label'))) {
    console.log((i+1) + ': ' + l.trim());
  }
});
