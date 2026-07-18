const fs = require('fs');
const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

// Fix the cramped text layout in the Advantages section by replacing the grid columns
jsx = jsx.replace(/gridTemplateColumns: '110px 1fr'/g, "gridTemplateColumns: 'auto 1fr'");
jsx = jsx.replace(/gridTemplateColumns: '90px 1fr'/g, "gridTemplateColumns: 'auto 1fr'");

// Add some word-break or spacing improvements
jsx = jsx.replace(/<strong style={{ color: '#fff' }}>/g, "<strong style={{ color: '#fff', whiteSpace: 'nowrap' }}>");

fs.writeFileSync(pathJSX, jsx, 'utf8');
console.log('Advantages text fixed!');
