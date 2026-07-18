const fs = require('fs');

// 1. Update index.css
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

css = css.replace(
  '  background-color: #0c1627; /* Dark navy */\r\n  clip-path: polygon(0 0, 75% 0, 45% 100%, 0 100%);',
  '  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); /* Yellow-Orange */\r\n  clip-path: polygon(0 0, 75% 0, 45% 100%, 0 100%);'
);
css = css.replace(
  '  background-color: #0c1627; /* Dark navy */\n  clip-path: polygon(0 0, 75% 0, 45% 100%, 0 100%);',
  '  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); /* Yellow-Orange */\n  clip-path: polygon(0 0, 75% 0, 45% 100%, 0 100%);'
);

css = css.replace(
  '  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);\r\n  background-color: #0f1c30;',
  '  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);\r\n  background: linear-gradient(135deg, #fbbf24 0%, #ea580c 100%);'
);
css = css.replace(
  '  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);\n  background-color: #0f1c30;',
  '  clip-path: polygon(0 0, 80% 0, 50% 100%, 0 100%);\n  background: linear-gradient(135deg, #fbbf24 0%, #ea580c 100%);'
);

css = css.replace(
  '  width: 75%; /* Constrain text to fit inside the dark area */\r\n  color: #fff;',
  '  width: 75%; /* Constrain text to fit inside the dark area */\r\n  color: #07090e;'
);
css = css.replace(
  '  width: 75%; /* Constrain text to fit inside the dark area */\n  color: #fff;',
  '  width: 75%; /* Constrain text to fit inside the dark area */\n  color: #07090e;'
);

css = css.replace(
  '  font-size: 0.8rem;\r\n  color: rgba(255, 255, 255, 0.75);',
  '  font-size: 0.8rem;\r\n  color: rgba(7, 9, 14, 0.85);'
);
css = css.replace(
  '  font-size: 0.8rem;\n  color: rgba(255, 255, 255, 0.75);',
  '  font-size: 0.8rem;\n  color: rgba(7, 9, 14, 0.85);'
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
console.log('Updated index.css');

// 2. Update App.jsx
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

appJsx = appJsx.replace(
  /color: 'var\(--color-accent\)' }}\>\n\s*<circle cx="50" cy="50" r="45" strokeDasharray="5 5"/g,
  "color: '#07090e' }}>\n                             <circle cx=\"50\" cy=\"50\" r=\"45\" strokeDasharray=\"5 5\""
);
appJsx = appJsx.replace(
  /color: 'var\(--color-accent\)' }}\>\r\n\s*<circle cx="50" cy="50" r="45" strokeDasharray="5 5"/g,
  "color: '#07090e' }}>\r\n                             <circle cx=\"50\" cy=\"50\" r=\"45\" strokeDasharray=\"5 5\""
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Updated App.jsx');
