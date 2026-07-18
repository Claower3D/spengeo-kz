const fs = require('fs');

// --- 1. PERFECT CSS INJECTION ---
let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');

const perfectionCSS = `
/* ==========================================================================
   ULTRA-PREMIUM POLISH (PERFECTION)
   ========================================================================== */

/* 1. Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  background: var(--bg-dark);
}
::-webkit-scrollbar-track {
  background: var(--bg-dark-secondary);
}
::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 5px;
  border: 2px solid var(--bg-dark-secondary);
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.8);
}

[data-theme="white"] ::-webkit-scrollbar-thumb {
  background: rgba(2, 132, 199, 0.4);
}
[data-theme="white"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(2, 132, 199, 0.8);
}

/* 2. Selection Highlights */
::selection {
  background: rgba(234, 179, 8, 0.3);
  color: var(--color-text-primary);
  text-shadow: none;
}

/* 3. Glass Form Inputs */
.glass-input {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  color: var(--color-text-primary) !important;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
}
.glass-input:focus {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: var(--color-cyan) !important;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.2), inset 0 2px 4px rgba(0,0,0,0.1) !important;
  transform: translateY(-2px);
}
[data-theme="white"] .glass-input {
  background: rgba(0, 0, 0, 0.02) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
}
[data-theme="white"] .glass-input:focus {
  background: #ffffff !important;
  border-color: var(--color-cyan) !important;
  box-shadow: 0 5px 20px rgba(2, 132, 199, 0.15) !important;
}

/* 4. Page Entry Animation */
@keyframes page-enter {
  0% { opacity: 0; transform: translateY(20px) scale(0.99); filter: blur(5px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
.page-enter {
  animation: page-enter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* 5. WhatsApp Pulse */
@keyframes pulse-whatsapp {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
.whatsapp-btn {
  animation: pulse-whatsapp 2s infinite;
  transition: transform 0.3s ease !important;
}
.whatsapp-btn:hover {
  transform: scale(1.1) rotate(-5deg) !important;
}
`;

if (!css.includes('ULTRA-PREMIUM POLISH')) {
  css += '\n' + perfectionCSS;
  fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
  console.log('Perfection CSS added.');
}

// --- 2. PERFECT APP.JSX INJECTION ---
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Add page-enter to page-wrapper
appJsx = appJsx.replace(/className="page-wrapper"/g, 'className="page-wrapper page-enter"');

// Add glass-input to text inputs and select
appJsx = appJsx.replace(/style={{ width: '100%', padding: '15px', background: 'var\(--bg-dark\)', border: '1px solid var\(--border-color\)'/g, 'className="glass-input" style={{ width: \'100%\', padding: \'15px\', background: \'var(--bg-dark)\', border: \'1px solid var(--border-color)\'');

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx polished.');
