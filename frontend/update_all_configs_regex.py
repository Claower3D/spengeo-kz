import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DYNAMIC_FORM_CONFIGS block
pattern_configs = re.compile(r"const DYNAMIC_FORM_CONFIGS = \{.*?\n\s+?\};\n", re.DOTALL)

new_configs = """const DYNAMIC_FORM_CONFIGS = {
                  'services': { title: 'Услуги', addText: 'Добавить услугу', fields: [{ key: 'code', label: 'Код услуги', type: 'text' }, { key: 'title', label: 'Название услуги', type: 'text' }] },
                  'about_history': { title: 'История (Таймлайн)', addText: 'Добавить этап', fields: [{ key: 'title', label: 'Год / Период', type: 'text' }, { key: 'desc', label: 'Описание события', type: 'textarea' }] },
                  'about_advantages': { title: 'Наши преимущества', addText: 'Добавить преимущество', fields: [{ key: 'title', label: 'Название преимущества', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }, { key: 'image', label: 'Иконка (lucide name или URL)', type: 'text' }] },
                  'about_team': { title: 'Команда', addText: 'Добавить сотрудника', fields: [{ key: 'name', label: 'ФИО', type: 'text' }, { key: 'position', label: 'Должность', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }, { key: 'image', label: 'Фото (URL)', type: 'text' }] },
                  'about_career': { title: 'Вакансии', addText: 'Добавить вакансию', fields: [{ key: 'title', label: 'Должность', type: 'text' }, { key: 'coeff', label: 'График / Условия', type: 'text' }, { key: 'desc', label: 'Требования', type: 'textarea' }] },
                  'about_documents': { title: 'Лицензии и сертификаты', addText: 'Добавить документ', fields: [{ key: 'title', label: 'Название документа', type: 'text' }, { key: 'image', label: 'Ссылка на документ (URL)', type: 'text' }] },
                  
                  // Blog / Knowledge Base
                  'blog_articles': { title: 'Статьи', addText: 'Добавить статью', fields: [{ key: 'title', label: 'Заголовок', type: 'text' }, { key: 'date', label: 'Дата', type: 'text' }, { key: 'category', label: 'Категория', type: 'text' }, { key: 'desc', label: 'Краткое содержание', type: 'textarea' }, { key: 'image', label: 'Изображение (URL)', type: 'text' }] },
                  'blog_faq': { title: 'FAQ (Вопросы)', addText: 'Добавить вопрос', fields: [{ key: 'question', label: 'Вопрос', type: 'text' }, { key: 'answer', label: 'Ответ', type: 'textarea' }] },
                  'blog_methods': { title: 'Методы испытаний', addText: 'Добавить метод', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }] },
                  'blog_soils': { title: 'Типы грунтов', addText: 'Добавить грунт', fields: [{ key: 'title', label: 'Название грунта', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }] },
                  'blog_norms': { title: 'Нормативные документы', addText: 'Добавить норматив', fields: [{ key: 'title', label: 'Шифр', type: 'text' }, { key: 'desc', label: 'Описание', type: 'text' }] },
                  'blog_news': { title: 'Новости', addText: 'Добавить новость', fields: [{ key: 'title', label: 'Заголовок', type: 'text' }, { key: 'date', label: 'Дата', type: 'text' }, { key: 'desc', label: 'Текст', type: 'textarea' }] },
                  'blog_photos': { title: 'Фото', addText: 'Добавить фото', fields: [{ key: 'title', label: 'Подпись', type: 'text' }, { key: 'image', label: 'Ссылка на фото (URL)', type: 'text' }] },
                  'blog_video': { title: 'Видео', addText: 'Добавить видео', fields: [{ key: 'title', label: 'Подпись', type: 'text' }, { key: 'image', label: 'Ссылка на видео (URL)', type: 'text' }] },

                  // Equipment
                  'equipment_rigs_0': { title: 'Буровые установки', addText: 'Добавить установку', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }, { key: 'soilType', label: 'Типы грунтов', type: 'text' }] },
                  'equipment_rigs_1': { title: 'Автотранспорт', addText: 'Добавить авто', fields: [{ key: 'name', label: 'Марка/Модель', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_0': { title: 'CPT / Зондирование', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_1': { title: 'Испытательное оборудование', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_2': { title: 'Лаборатория / Геодезия', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text', required: true }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] }
                };\n"""

content = pattern_configs.sub(new_configs, content)


# Replace App initialization
pattern_init = re.compile(r"if \(\!parsed\.dynamicLists\['about_documents'\].*?return parsed;", re.DOTALL)

new_init = """if (!parsed.dynamicLists['about_documents'] || parsed.dynamicLists['about_documents'].length === 0) {
        parsed.dynamicLists['about_documents'] = DOCUMENTS_DATA;
      }
      
      // Migrate hardcoded DB arrays to dynamic lists
      if (!parsed.dynamicLists['equipment_rigs_0'] || parsed.dynamicLists['equipment_rigs_0'].length === 0) {
        parsed.dynamicLists['equipment_rigs_0'] = DRILLING_RIGS;
      }
      if (!parsed.dynamicLists['equipment_lab_2'] || parsed.dynamicLists['equipment_lab_2'].length === 0) {
        parsed.dynamicLists['equipment_lab_2'] = LAB_EQUIP;
      }
      if (!parsed.dynamicLists['blog_articles'] || parsed.dynamicLists['blog_articles'].length === 0) {
        parsed.dynamicLists['blog_articles'] = BLOG_POSTS;
      }
      
      return parsed;"""

content = pattern_init.sub(new_init, content)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied dynamic configs and initializers with regex!")
