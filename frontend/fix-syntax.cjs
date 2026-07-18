const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /(\s*)\)\}\n(\s*)<\/div>\n(\s*)<div style=\{\{\s*padding:\s*'30px',\s*textAlign:\s*'center',/,
    `$1)}\n$1  })()}\n$2</div>\n$3<div style={{ padding: '30px', textAlign: 'center',`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax error in App.jsx');
