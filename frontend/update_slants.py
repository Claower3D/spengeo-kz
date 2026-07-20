import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update DEFAULT_HOME_SLANTS with the full data
old_slants = """const DEFAULT_HOME_SLANTS = [
  { title: 'БУРОВАЯ ТЕХНИКА', image: '/images/services.jpg' },
  { title: 'ЛАБОРАТОРИЯ ГРУНТОВ', image: '/images/lab.jpg' },
  { title: 'ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ', image: '/images/geo.jpg' }
];"""

new_slants = """const DEFAULT_HOME_SLANTS = [
  { title: 'БУРОВАЯ ТЕХНИКА', image: '/images/services.jpg', desc: 'Собственный парк техники премиум-класса. В нашем распоряжении находятся тяжелые установки Bauer BG20/BG28 для устройства свай в сложных скальных породах, а также маневренные УРБ-2А2 для изысканий в городских условиях.', li1: 'Бурение до 80 метров в глубину', li2: 'Выезд на объект за 24 часа' },
  { title: 'ЛАБОРАТОРИЯ ГРУНТОВ', image: '/images/lab.png', desc: 'Автоматизированный комплекс тестирования. Мы используем высокоточные прессовые установки и компрессионные приборы для определения несущей способности грунта с погрешностью менее 0.1%.', li1: 'Аттестат аккредитации №КЗ.Т.02.0521', li2: 'Более 50 видов исследований' },
  { title: 'ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ', image: '/images/geo.jpg', desc: 'Топографическая съемка высокой детализации. Применяем роботизированные тахеометры Leica и спутниковые системы Trimble для обеспечения миллиметровой точности.', li1: 'Съемка в масштабах от 1:500 до 1:5000', li2: 'Построение 3D-моделей рельефа' }
];"""

content = content.replace(old_slants, new_slants)

# 2. Update DYNAMIC_FORM_CONFIGS to include these fields
old_config = """'home_slants': { title: 'Наклонные карточки', addText: 'Добавить карточку', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'image', label: 'Фоновое изображение (URL)', type: 'text' }] },"""
new_config = """'home_slants': { title: 'Наклонные карточки', addText: 'Добавить карточку', fields: [{ key: 'title', label: 'Название', type: 'text' }, { key: 'image', label: 'Фоновое изображение (URL)', type: 'text' }, { key: 'desc', label: 'Описание', type: 'textarea' }, { key: 'li1', label: 'Пункт 1', type: 'text' }, { key: 'li2', label: 'Пункт 2', type: 'text' }] },"""
content = content.replace(old_config, new_config)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated slants config!")
