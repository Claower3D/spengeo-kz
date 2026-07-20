import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define the missing default data constants right after BLOG_POSTS
pattern_blog = re.compile(r"(const BLOG_POSTS = \[.*?\];)", re.DOTALL)

new_defaults = """

const DEFAULT_HISTORY = [
  { title: '2019', desc: 'Основание компании ТОО «СпецИнжГео». Начало работы в г. Алматы.' },
  { title: '2021', desc: 'Расширение парка буровых машин. Выход на объекты государственного значения.' },
  { title: '2023', desc: 'Внедрение CPT технологий. Открытие собственной грунтовой лаборатории.' },
  { title: '2025', desc: 'Цифровизация бизнес-процессов. Модернизация ИТ-инфраструктуры.' }
];

const DEFAULT_ADVANTAGES = [
  { title: 'Лицензия II категории', desc: 'Имеем государственную лицензию на строительно-монтажные и изыскательские работы.', image: 'Award' },
  { title: 'Собственный автопарк', desc: 'Более 15 единиц спецтехники, включая буровые установки и лаборатории.', image: 'Truck' },
  { title: 'Штат экспертов', desc: 'Аттестованные геологи, геодезисты и инженеры с опытом более 10 лет.', image: 'Users' }
];

const DEFAULT_TEAM = [
  { name: 'Чудинов Константин Олегович', position: 'Генеральный директор', desc: 'Основатель компании, профессиональный геолог с 15-летним стажем. Руководит стратегическим развитием и ключевыми проектами.', image: '/images/director.png' }
];

const DEFAULT_FAQ = [
  { question: 'Какие сроки выполнения изысканий?', answer: 'В среднем полевые работы занимают от 3 до 7 дней, лабораторные исследования — до 14 дней.' },
  { question: 'Работаете ли вы в регионах?', answer: 'Да, мы мобилизуем технику в любую точку Казахстана в течение 48 часов.' }
];

const DEFAULT_METHODS = [
  { title: 'Статическое зондирование (CPT)', desc: 'Непрерывное вдавливание конуса для определения несущей способности грунта.' },
  { title: 'Штамповые испытания', desc: 'Определение модуля деформации с помощью винтового штампа ШВ-60.' }
];

const DEFAULT_SOILS = [
  { title: 'Суглинки и глины', desc: 'Связные грунты, требующие тщательного лабораторного анализа на влажность и пластичность.' },
  { title: 'Пески и супеси', desc: 'Несвязные грунты, часто являющиеся надежным основанием для фундаментов.' }
];

const DEFAULT_NORMS = [
  { title: 'СП РК 1.02-104-2020', desc: 'Инженерные изыскания для строительства. Основные положения.' },
  { title: 'ГОСТ 19912-2012', desc: 'Грунты. Методы полевых испытаний статическим и динамическим зондированием.' }
];
"""

content = pattern_blog.sub(r"\1" + new_defaults, content)

# 2. Add them to App init logic
pattern_init = re.compile(r"(if \(\!parsed\.dynamicLists\['blog_articles'\].*?\} \n)", re.DOTALL)

new_init_additions = """
      if (!parsed.dynamicLists['about_history'] || parsed.dynamicLists['about_history'].length === 0) parsed.dynamicLists['about_history'] = DEFAULT_HISTORY;
      if (!parsed.dynamicLists['about_advantages'] || parsed.dynamicLists['about_advantages'].length === 0) parsed.dynamicLists['about_advantages'] = DEFAULT_ADVANTAGES;
      if (!parsed.dynamicLists['about_team'] || parsed.dynamicLists['about_team'].length === 0) parsed.dynamicLists['about_team'] = DEFAULT_TEAM;
      
      if (!parsed.dynamicLists['blog_faq'] || parsed.dynamicLists['blog_faq'].length === 0) parsed.dynamicLists['blog_faq'] = DEFAULT_FAQ;
      if (!parsed.dynamicLists['blog_methods'] || parsed.dynamicLists['blog_methods'].length === 0) parsed.dynamicLists['blog_methods'] = DEFAULT_METHODS;
      if (!parsed.dynamicLists['blog_soils'] || parsed.dynamicLists['blog_soils'].length === 0) parsed.dynamicLists['blog_soils'] = DEFAULT_SOILS;
      if (!parsed.dynamicLists['blog_norms'] || parsed.dynamicLists['blog_norms'].length === 0) parsed.dynamicLists['blog_norms'] = DEFAULT_NORMS;
"""

content = pattern_init.sub(r"\1" + new_init_additions, content)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected default arrays and initializers!")
