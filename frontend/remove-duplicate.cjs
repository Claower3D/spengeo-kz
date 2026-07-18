const fs = require('fs');
const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

const startIndex = jsx.indexOf('{/* ==================== PAGE: ADVANTAGES (KARGIIZ STYLE) ==================== */}');
const endIndex = jsx.indexOf('</section>', startIndex) + 10; // includes </section>

if (startIndex !== -1 && endIndex !== -1) {
    jsx = jsx.substring(0, startIndex) + jsx.substring(endIndex);
    fs.writeFileSync(pathJSX, jsx, 'utf8');
    console.log('Removed top advantages block!');
} else {
    console.log('Could not find block!');
}
