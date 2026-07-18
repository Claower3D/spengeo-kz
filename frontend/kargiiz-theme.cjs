const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace all font-family with Montserrat
content = content.replace(/--font-sans: '[^']+'+/g, "--font-sans: 'Montserrat'");
content = content.replace(/--font-display: '[^']+'+/g, "--font-display: 'Montserrat'");

// 2. Change the primary accent to Yellow and make elements solid (Kargiiz style)
// We replace the main variables block
const newTheme = `
  /* Premium Industrial Colors - Kargiiz Style */
  --bg-dark: #121212;
  --bg-dark-secondary: #1e1e1e;
  --bg-card: rgba(30, 30, 30, 0.8);
  --bg-card-hover: rgba(45, 45, 45, 0.95);
  
  --color-accent: #FFD500;
  --color-accent-glow: rgba(255, 213, 0, 0.25);
  --color-cyan: #FFD500;
  --color-cyan-glow: rgba(255, 213, 0, 0.25);
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #aaaaaa;
  --color-text-muted: #666666;
  
  --color-success: #10b981;
  --color-danger: #ef4444;

  --border-color: rgba(255, 255, 255, 0.1);
  --border-accent: rgba(255, 213, 0, 0.3);
  --border-radius-lg: 0px;
  --border-radius-md: 0px;
  --border-radius-sm: 0px;
`;

const rootStart = content.indexOf('--bg-dark:');
const rootEnd = content.indexOf('}', rootStart);
if (rootStart !== -1 && rootEnd !== -1) {
    content = content.substring(0, rootStart - 35) + newTheme + content.substring(rootEnd);
}

// 3. Make all buttons use the solid style to match Kargiiz
// Replace buttons CSS logic slightly
content = content.replace(/background: rgba\(245, 158, 11, 0\.1\);/g, 'background: var(--color-accent); color: #000;');
content = content.replace(/background: transparent;/g, 'background: transparent; color: var(--color-text-primary);');
content = content.replace(/text-transform: uppercase;/g, 'text-transform: uppercase; letter-spacing: 1px;');

fs.writeFileSync(path, content, 'utf8');
console.log('CSS modified for Kargiiz aesthetic');
