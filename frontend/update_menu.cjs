const fs = require('fs');
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const menuStruct = `const MENU_STRUCTURE = {
  ru: [
    { title: 'Главная', page: 'home', action: { type: 'page', val: 'home' } },
    { 
      title: 'О компании', page: 'about', 
      items: [
        { name: 'История', action: { type: 'page', val: 'about' } },
        { name: 'Команда', action: { type: 'page', val: 'about' } },
        { name: 'Наши преимущества', action: { type: 'scroll', page: 'home', target: 'advantages' } },
        { name: 'Лицензии', action: { type: 'page', val: 'documents' } },
        { name: 'Сертификаты', action: { type: 'page', val: 'documents' } }
      ]
    },
    {
      title: 'Услуги', page: 'services',
      columns: 2,
      items: [
        { name: 'Инженерно-геологические изыскания', action: { type: 'service', val: 'geology' } },
        { name: 'Инженерно-геодезические изыскания', action: { type: 'service', val: 'geodesy' } },
        { name: 'Экологические изыскания', action: { type: 'service', val: 'geology' } },
        { name: 'Гидрометеорологические изыскания', action: { type: 'service', val: 'geodesy' } },
        { name: 'Бурение инженерно-геологических скважин', action: { type: 'service', val: 'geology' } },
        { name: 'Гидрогеологические исследования', action: { type: 'service', val: 'hydrogeology' } },
        { name: 'Статическое зондирование (CPT)', action: { type: 'service', val: 'cpt' } },
        { name: 'Статические испытания свай', action: { type: 'service', val: 'piles' } },
        { name: 'Динамические испытания свай', action: { type: 'service', val: 'piles' } },
        { name: 'Штамповые испытания', action: { type: 'service', val: 'plates' } },
        { name: 'Лабораторные исследования', action: { type: 'service', val: 'laboratory' } },
        { name: 'Водопонижение', action: { type: 'service', val: 'hydrogeology' } },
        { name: 'Проектирование водопонижения', action: { type: 'service', val: 'hydrogeology' } }
      ]
    },
    {
      title: 'Проекты', page: 'projects',
      items: [
        { name: 'Поиск', action: { type: 'page', val: 'projects' } },
        { name: 'По регионам', action: { type: 'page', val: 'projects' } },
        { name: 'По услугам', action: { type: 'page', val: 'projects' } },
        { name: 'По заказчикам', action: { type: 'page', val: 'projects' } },
        { name: 'Страница проекта', action: { type: 'page', val: 'projects' } }
      ]
    },
    {
      title: 'Оборудование', page: 'equipment',
      items: [
        { name: 'Буровые установки', action: { type: 'equip', cat: 'rigs', idx: 0 } },
        { name: 'CPT', action: { type: 'equip', cat: 'lab', idx: 0 } },
        { name: 'Геодезическое оборудование', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'Испытательное оборудование', action: { type: 'equip', cat: 'lab', idx: 1 } },
        { name: 'Лаборатория', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'Насосное оборудование', action: { type: 'equip', cat: 'lab', idx: 2 } },
        { name: 'Автотранспорт', action: { type: 'equip', cat: 'rigs', idx: 1 } }
      ]
    },
    {
      title: 'База знаний', page: 'blog',
      items: [
        { name: 'Статьи', action: { type: 'page', val: 'blog' } },
        { name: 'Методы испытаний', action: { type: 'page', val: 'blog' } },
        { name: 'Типы грунтов', action: { type: 'page', val: 'blog' } },
        { name: 'Нормативные документы', action: { type: 'page', val: 'blog' } },
        { name: 'FAQ', action: { type: 'page', val: 'blog' } },
        { name: 'Новости', action: { type: 'page', val: 'blog' } },
        { name: 'Фото', action: { type: 'page', val: 'blog' } },
        { name: 'Видео', action: { type: 'page', val: 'blog' } }
      ]
    },
    { title: 'Контакты', page: 'contacts', action: { type: 'page', val: 'contacts' } }
  ]
};
`;

appJsx = appJsx.replace('function App() {\r\n  const [activePage, setActivePage] = useState(() => {', menuStruct + '\nfunction App() {\r\n  const [activePage, setActivePage] = useState(() => {');
appJsx = appJsx.replace('function App() {\n  const [activePage, setActivePage] = useState(() => {', menuStruct + '\nfunction App() {\n  const [activePage, setActivePage] = useState(() => {');

appJsx = appJsx.replace("['home', 'about', 'services', 'projects', 'admin']", "['home', 'about', 'services', 'projects', 'equipment', 'blog', 'documents', 'calculator', 'contacts', 'admin']");

const navStart = appJsx.indexOf('<ul className="nav-links">') + '<ul className="nav-links">'.length;
const navEnd = appJsx.indexOf('</ul>\r\n              </nav>') !== -1 ? appJsx.indexOf('</ul>\r\n              </nav>') : appJsx.indexOf('</ul>\n              </nav>');

const newNav = `
                  {(MENU_STRUCTURE[language] || MENU_STRUCTURE.ru).map((menu, i) => (
                    <li key={i} className={menu.items ? "nav-item-with-dropdown" : ""}>
                      <button 
                        type="button" 
                        className={\`nav-btn \${activePage === menu.page || (menu.page === 'about' && activePage === 'documents') ? 'active' : ''}\`} 
                        onClick={() => {
                          if (menu.action) {
                            if (menu.action.type === 'page') setActivePage(menu.action.val);
                          }
                        }}
                      >
                        {menu.title}
                      </button>
                      
                      {menu.items && (
                        <div className={\`dropdown-menu \${menu.columns ? 'dropdown-menu-wide' : ''}\`}>
                          {menu.items.map((item, j) => (
                            <button 
                              key={j} 
                              type="button" 
                              className="dropdown-item" 
                              onClick={() => {
                                if (item.action.type === 'page') {
                                  setActivePage(item.action.val);
                                } else if (item.action.type === 'scroll') {
                                  setActivePage(item.action.page);
                                  setTimeout(() => {
                                    const el = document.getElementById(item.action.target);
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                } else if (item.action.type === 'service') {
                                  setActiveServiceTab(item.action.val);
                                  setActivePage('services');
                                } else if (item.action.type === 'equip') {
                                  setEquipCategory(item.action.cat);
                                  if (item.action.cat === 'rigs') {
                                    if (typeof setSelectedRig === 'function') setSelectedRig(item.action.idx);
                                  } else {
                                    if (typeof setSelectedLab === 'function') setSelectedLab(item.action.idx);
                                  }
                                  setActivePage('equipment');
                                }
                              }}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                `;

appJsx = appJsx.substring(0, navStart) + newNav + appJsx.substring(navEnd);
fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('App.jsx updated');

let css = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'utf8');
css = css.replace('.nav-container {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  width: 100%;\r\n}', '.nav-container {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  width: 100%;\r\n  max-width: 1400px;\r\n}');
css = css.replace('.nav-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n}', '.nav-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n  max-width: 1400px;\n}');

css = css.replace('.nav-links {\r\n  display: flex;\r\n  gap: 30px;\r\n  white-space: nowrap;\r\n}', '.nav-links {\r\n  display: flex;\r\n  gap: 15px;\r\n  white-space: nowrap;\r\n}');
css = css.replace('.nav-links {\n  display: flex;\n  gap: 30px;\n  white-space: nowrap;\n}', '.nav-links {\n  display: flex;\n  gap: 15px;\n  white-space: nowrap;\n}');

css = css.replace('font-size: 0.95rem;\r\n  padding: 8px 0;\r\n  cursor: pointer;\r\n  position: relative;\r\n  transition: color 0.3s ease;\r\n  white-space: nowrap;\r\n}', 'font-size: 0.85rem;\r\n  padding: 8px 0;\r\n  cursor: pointer;\r\n  position: relative;\r\n  transition: color 0.3s ease;\r\n  white-space: nowrap;\r\n}');
css = css.replace('font-size: 0.95rem;\n  padding: 8px 0;\n  cursor: pointer;\n  position: relative;\n  transition: color 0.3s ease;\n  white-space: nowrap;\n}', 'font-size: 0.85rem;\n  padding: 8px 0;\n  cursor: pointer;\n  position: relative;\n  transition: color 0.3s ease;\n  white-space: nowrap;\n}');

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/index.css', css);
console.log('index.css updated');
