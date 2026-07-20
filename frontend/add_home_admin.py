import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Default constants
new_defaults = """
const DEFAULT_HOME_SERVICES = [
  { title: 'Инженерно-геологические изыскания', bullets: 'Бурение изыскательских скважин,Отбор монолитов и проб вод,Описание грунтового массива,Изучение опасных процессов' },
  { title: 'Геодезия и топосъемка', bullets: 'Топосъемка масштабов 1:500,Съемка коммуникаций,Вынос осей в натуру' },
  { title: 'CPT Зондирование', bullets: 'Вдавливание конуса,Измерение сопротивления,Расчленение разреза' },
  { title: 'Испытания свай', bullets: 'Статическая нагрузка,Выдергивающая нагрузка,Динамические испытания' },
  { title: 'Штамповые испытания', bullets: 'Плоские круглые штампы,Испытания в скважинах,Модуль деформации' },
  { title: 'Лаборатория грунтов', bullets: 'Физико-механические свойства,Химический анализ воды,Коррозионная агрессивность,Компрессионное сжатие' }
];

const DEFAULT_HOME_SLANTS = [
  { title: 'БУРОВАЯ ТЕХНИКА', image: '/images/services.jpg' },
  { title: 'ЛАБОРАТОРИЯ ГРУНТОВ', image: '/images/lab.jpg' },
  { title: 'ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ', image: '/images/geo.jpg' }
];

const DEFAULT_HOME_FOUNDER = [
  { name: 'Шенвизов Рудольф Константинович', role: 'ОСНОВАТЕЛЬ И ГЛАВНЫЙ ГЕОЛОГ', desc: 'Мы строим нашу работу на безупречной точности и строгом соответствии регламентам СП РК и ГОСТ. С 2019 года наша команда опытных буровых инженеров, геодезистов и лаборантов успешно реализует сложнейшие проекты по всему Казахстану, обеспечивая прочный фундамент для каждого объекта.', image: '/images/director.png' }
];

// === ADMIN DATA FOR BLOCKS ===
"""
content = content.replace("// === ADMIN DATA FOR BLOCKS ===", new_defaults)

# 2. Add to loadInitialAdminData
init_repl = """      if (!parsed.dynamicLists['about_history']"""
new_init = """      if (!parsed.dynamicLists['home_services'] || parsed.dynamicLists['home_services'].length === 0) parsed.dynamicLists['home_services'] = DEFAULT_HOME_SERVICES;
      if (!parsed.dynamicLists['home_slants'] || parsed.dynamicLists['home_slants'].length === 0) parsed.dynamicLists['home_slants'] = DEFAULT_HOME_SLANTS;
      if (!parsed.dynamicLists['home_founder'] || parsed.dynamicLists['home_founder'].length === 0) parsed.dynamicLists['home_founder'] = DEFAULT_HOME_FOUNDER;
      if (!parsed.dynamicLists['about_history']"""
content = content.replace(init_repl, new_init)

# 3. Update MENU_STRUCTURE
menu_repl = """    { title: 'Главная', page: 'home', action: { type: 'page', val: 'home' } },"""
new_menu = """    { 
      title: 'Главная', page: 'home', action: { type: 'page', val: 'home' },
      items: [
        { name: 'Сетка услуг', action: { type: 'page', val: 'home', subpage: 'services' } },
        { name: 'Наклонные карточки', action: { type: 'page', val: 'home', subpage: 'slants' } },
        { name: 'Блок основателя', action: { type: 'page', val: 'home', subpage: 'founder' } }
      ]
    },"""
content = content.replace(menu_repl, new_menu)

# 4. Update DYNAMIC_FORM_CONFIGS
config_repl = """                  // About"""
new_config = """                  // Home
                  'home_services': { title: 'Сетка услуг', addText: 'Добавить услугу', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'bullets', label: 'Список (через запятую)', type: 'textarea' }] },
                  'home_slants': { title: 'Наклонные карточки', addText: 'Добавить карточку', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'image', label: 'Фоновое изображение (URL)', type: 'text' }] },
                  'home_founder': { title: 'Блок основателя', addText: 'Добавить текст', fields: [{ key: 'name', label: 'ФИО', type: 'text' }, { key: 'role', label: 'Должность', type: 'text' }, { key: 'desc', label: 'Текст', type: 'textarea' }, { key: 'image', label: 'Фотография (URL)', type: 'text' }] },

                  // About"""
content = content.replace(config_repl, new_config)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Prepped data structures!")
