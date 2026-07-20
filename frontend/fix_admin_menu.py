import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update MENU_STRUCTURE
old_menu_items = """        { name: 'Лицензии', action: { type: 'page', val: 'documents' } },
        { name: 'Сертификаты', action: { type: 'page', val: 'documents' } }"""
new_menu_items = """        { name: 'Лицензии и сертификаты', action: { type: 'page', val: 'about', subpage: 'documents' } }"""
content = content.replace(old_menu_items, new_menu_items)

# 2. Add repair logic to useState
old_repair = """      if (!parsed.menu) {
        parsed.menu = MENU_STRUCTURE;
      }"""
new_repair = """      if (!parsed.menu) {
        parsed.menu = MENU_STRUCTURE;
      } else if (parsed.menu.ru) {
        // Repair legacy menu
        parsed.menu.ru.forEach(cat => {
          if (cat.items) {
            cat.items.forEach(item => {
              if (item.name === 'Лицензии' || item.name === 'Лицензии и сертификаты') {
                 item.name = 'Лицензии и сертификаты';
                 item.action = { type: 'page', val: 'about', subpage: 'documents' };
              }
            });
            cat.items = cat.items.filter(item => item.name !== 'Сертификаты');
          }
        });
      }"""
content = content.replace(old_repair, new_repair)

# 3. Update DYNAMIC_FORM_CONFIGS
old_config = """'about_documents': { title: 'Лицензии и сертификаты', addText: 'Добавить документ', fields: [{ key: 'title', label: 'Название лицензии', type: 'text' }, { key: 'image', label: 'Скан документа (URL)', type: 'text' }] }"""
new_config = """'about_documents': { title: 'Лицензии и сертификаты', addText: 'Добавить документ', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'subtitle', label: 'Подзаголовок (номер)', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }] }"""
content = content.replace(old_config, new_config)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched adminData menu and config fields!")
