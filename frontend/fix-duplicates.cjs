const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetDropdown = `<button type="button" className={\`dropdown-item \${activePage === 'about' && activeSubPage === 'vacancies' ? 'active' : ''}\`} onClick={() => { setActivePage('about'); setActiveSubPage('vacancies'); }}>Вакансии</button>
                        <button type="button" className={\`dropdown-item \${activePage === 'about' && activeSubPage === 'vacancies' ? 'active' : ''}\`} onClick={() => { setActivePage('about'); setActiveSubPage('vacancies'); }}>Вакансии</button>`;
                        
const replacementDropdown = `<button type="button" className={\`dropdown-item \${activePage === 'about' && activeSubPage === 'vacancies' ? 'active' : ''}\`} onClick={() => { setActivePage('about'); setActiveSubPage('vacancies'); }}>Вакансии</button>`;

if (content.includes(targetDropdown)) {
  content = content.replace(targetDropdown, replacementDropdown);
  console.log('Fixed duplicate in dropdown.');
} else {
  console.log('Duplicate in dropdown not found via exact string, trying regex...');
  // Let's use regex in case whitespace is slightly different
  const regexDropdown = /<button type="button" className=\{`dropdown-item \$\{activePage === 'about' && activeSubPage === 'vacancies' \? 'active' : ''\}`\} onClick=\{\(\) => \{ setActivePage\('about'\); setActiveSubPage\('vacancies'\); \}\}>Вакансии<\/button>\r?\n\s*<button type="button" className=\{`dropdown-item \$\{activePage === 'about' && activeSubPage === 'vacancies' \? 'active' : ''\}`\} onClick=\{\(\) => \{ setActivePage\('about'\); setActiveSubPage\('vacancies'\); \}\}>Вакансии<\/button>/;
  if (regexDropdown.test(content)) {
    content = content.replace(regexDropdown, replacementDropdown);
    console.log('Fixed duplicate in dropdown via regex.');
  }
}

// Side-bar duplicate check (even though we didn't find it, just in case)
const regexSidebar = /<button \r?\n\s*type="button" \r?\n\s*className=\{`sidebar-nav-btn \$\{activeSubPage === 'vacancies' \? 'active' : ''\}`\}\r?\n\s*onClick=\{\(\) => setActiveSubPage\('vacancies'\)\}\r?\n\s*>\r?\n\s*Вакансии\r?\n\s*<\/button>\r?\n\s*<button \r?\n\s*type="button" \r?\n\s*className=\{`sidebar-nav-btn \$\{activeSubPage === 'vacancies' \? 'active' : ''\}`\}\r?\n\s*onClick=\{\(\) => setActiveSubPage\('vacancies'\)\}\r?\n\s*>\r?\n\s*Вакансии\r?\n\s*<\/button>/;
const replacementSidebar = `<button \n                type="button" \n                className={\`sidebar-nav-btn \${activeSubPage === 'vacancies' ? 'active' : ''}\`}\n                onClick={() => setActiveSubPage('vacancies')}\n              >\n                Вакансии\n              </button>`;
if (regexSidebar.test(content)) {
  content = content.replace(regexSidebar, replacementSidebar);
  console.log('Fixed duplicate in sidebar via regex.');
}

fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx updated.');
