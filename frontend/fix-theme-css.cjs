const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// Replace all occurrences of:
// [data-theme="white"], [data-theme="light-gray"] .something
// with:
// :is([data-theme="white"], [data-theme="light-gray"]) .something
// BUT we have to be careful not to replace the main variable definition block:
// [data-theme="white"], [data-theme="light-gray"] { ... }

// So we look for exactly: [data-theme="white"], [data-theme="light-gray"] .
// and replace it with: :is([data-theme="white"], [data-theme="light-gray"]) .

content = content.replace(/\[data-theme="white"\],\s*\[data-theme="light-gray"\]\s+\./g, ':is([data-theme="white"], [data-theme="light-gray"]) .');

// What if it targets an HTML element like img or h3 without a dot?
// e.g. [data-theme="white"], [data-theme="light-gray"] img
// Let's replace ANY sequence of:
// `[data-theme="white"], [data-theme="light-gray"] `
// followed by any character EXCEPT `{`
// Actually, it's safer to just do a smart string replacement.

let newContent = content;
newContent = newContent.replace(/\[data-theme="white"\],\s*\[data-theme="light-gray"\]\s+([^{]+?)\s*\{/g, ':is([data-theme="white"], [data-theme="light-gray"]) $1 {');

// Also need to handle comma-separated lists like:
// [data-theme="white"], [data-theme="light-gray"] .footer h3, [data-theme="white"], [data-theme="light-gray"] .footer-title
newContent = newContent.replace(/\[data-theme="white"\],\s*\[data-theme="light-gray"\]\s+([A-Za-z0-9_.:-]+)/g, ':is([data-theme="white"], [data-theme="light-gray"]) $1');

// After the above regex, let's verify if `[data-theme="white"], [data-theme="light-gray"] {` is untouched.
// Yes, because `{` is not in the `[A-Za-z0-9_.:-]+` character class.

fs.writeFileSync(path, newContent, 'utf8');
console.log('Fixed CSS theme selector bugs.');
