const fs = require('fs');
const lines = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('activePage === \'home\' && ('));
if (start !== -1) {
  console.log(lines.slice(start, start + 250).join('\n'));
} else {
  console.log('Home page string not found.');
}
