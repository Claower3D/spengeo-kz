import { useState, useEffect, useRef } from 'react';
import { 
  Hammer, Compass, Award, Phone, ShieldCheck, Mail, 
  MapPin, Send, Cpu, CheckCircle, ChevronRight, Lock, 
  Eye, Trash2, Calendar, FileText, Check, Database, 
  RefreshCw, BarChart2, UserCheck, Menu, X, ArrowUpRight,
  Printer, HardDrive, AlertTriangle, Layers, Clock, Settings,
  BookOpen, FileSpreadsheet, Search, MessageCircle, Bot, ArrowUp, Sun, Moon, Briefcase, Edit3
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { translations } from './translations';

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const customGlowIcon = new L.divIcon({
  className: 'custom-glow-icon',
  html: `<div class="pulse-marker" style="background-color: var(--color-cyan); box-shadow: 0 0 10px var(--color-cyan), 0 0 20px var(--color-cyan);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Soil types for calculations
const SOILS = {
  sand: { name: 'Песок (Песчаный грунт)', coeff: 1.0, color: 'rgba(234, 179, 8, 0.15)', desc: 'Легко бурится, требует обсадки скважин от осыпания.', minDepth: 5, spec: 'СП РК 1.02-104-2020 Прил. А' },
  clay: { name: 'Глина (Глинистый грунт)', coeff: 1.2, color: 'rgba(180, 83, 9, 0.15)', desc: 'Высокая липкость, прочные скважины, требуется точное лабораторное определение консистенции.', minDepth: 8, spec: 'СП РК 1.02-104-2020 Прил. Б' },
  loam: { name: 'Суглинок (Смешанный грунт)', coeff: 1.1, color: 'rgba(120, 53, 4, 0.15)', desc: 'Смешанный тип, средняя степень сложности бурения.', minDepth: 6, spec: 'СП РК 1.02-104-2020 Прил. В' },
  rock: { name: 'Скальный грунт (Прочный)', coeff: 2.5, color: 'rgba(100, 116, 139, 0.2)', desc: 'Повышенная прочность, требуется буровые коронки повышенной твердости (Bauer BG20/BG28).', minDepth: 15, spec: 'СП РК 1.02-104-2020 Прил. Г' },
  peat: { name: 'Торф (Слабый заторфованный)', coeff: 1.5, color: 'rgba(69, 26, 3, 0.25)', desc: 'Слабый грунт с высокой сжимаемостью. Требует глубокого зондирования.', minDepth: 10, spec: 'СП РК 1.02-104-2020 Прил. Д' },
};

// Services sub-items data
const SERVICES_DATA = {
  geology: {
    title: 'Инженерно-геологические изыскания',
    code: 'GEO-01',
    icon: Compass,
    desc: 'Бурение изыскательских скважин, отбор монолитов грунта и проб подземных вод, полевое описание грунтового массива, изучение опасных физико-геологических процессов.',
    reg: 'СП РК 1.02-104-2020, ГОСТ 12071'
  },
  geodesy: {
    title: 'Геодезия и топосъемка',
    code: 'SUR-02',
    icon: Hammer,
    desc: 'Топографическая съемка масштабов 1:500 - 1:5000 для проектирования, съемка подземных коммуникаций, создание опорных геодезических сетей, вынос осей зданий в натуру.',
    reg: 'СН РК 1.02-03-2021'
  },
  cpt: {
    title: 'CPT (Статическое зондирование)',
    code: 'CPT-03',
    icon: Layers,
    desc: 'Испытание грунтов непрерывным вдавливанием конуса с измерением сопротивления qc и бокового трения fs. Позволяет оперативно расчленить разрез и определить характеристики.',
    reg: 'ГОСТ 19912-2012'
  },
  piles: {
    title: 'Испытания свай',
    code: 'PIL-04',
    icon: ShieldCheck,
    desc: 'Проведение полевых испытаний натурных свай статической вдавливающей, выдергивающей или горизонтальной нагрузками, а также динамические испытания.',
    reg: 'ГОСТ 5686-2020'
  },
  plates: {
    title: 'Штамповые испытания',
    code: 'PLT-05',
    icon: Cpu,
    desc: 'Проведение испытаний грунтов плоскими круглыми штампами ШВ-60 в скважинах и шурфах для прямого определения модуля деформации Е несущих горизонтов.',
    reg: 'ГОСТ 20276.1-2020'
  },
  laboratory: {
    title: 'Лаборатория грунтов',
    code: 'LAB-06',
    icon: Award,
    desc: 'Собственный лабораторный комплекс: компрессионные сжатия, одноплоскостные сдвиги, определение физических свойств, хим. анализ грунтов и вод на агрессивность к бетонам.',
    reg: 'ГОСТ 5180-2015, ГОСТ 12248-2020'
  },
  hydrogeology: {
    title: 'Гидрогеология',
    code: 'HYD-07',
    icon: Database,
    desc: 'Опытно-фильтрационные работы (кустовые и одиночные откачки из скважин), расчет притоков в строительные котлованы, разработка рекомендаций по водопонижению.',
    reg: 'СП РК 1.02-105-2014'
  }
};

// Drill rigs database
const DRILLING_RIGS = [
  {
    name: 'Bauer BG20 / BG28',
    type: 'Тяжелая буровая установка',
    power: '280-354 кВт',
    weight: '62-96 тонн',
    torque: '200-280 кНм',
    maxDepth: '80 м',
    soilType: 'Все типы, включая скальные и крупнообломочные породы',
    description: 'Многофункциональная буровая установка для устройства свайных фундаментов глубокого заложения. Используется для ответственных гражданских зданий, мостов и тяжелых промышленных объектов.',
    mobility: 'Транспортируется тралом',
    cadSpecs: ['[Kelly Bar: 4-fold]', '[Rotary Head KDK 280]', '[Mast Height: 24.5m]', '[Main Winch: 200kN]']
  },
  {
    name: 'ПБУ-2 на базе УРАЛ-4350',
    type: 'Мощная разведочная установка',
    power: '170 кВт',
    weight: '12.5 тонн',
    torque: '5.2 кНм',
    maxDepth: '50 м',
    soilType: 'Песок, глина, суглинок, гравийные отложения',
    description: 'Самоходная буровая установка на базе вездеходного шасси УРАЛ. Применяется для глубокого разведочного бурения в любых климатических зонах Казахстана.',
    mobility: 'Вездеходное шасси 4х4',
    cadSpecs: ['[Mast Cylinder: Lift 3.2m]', '[Drill Feed Rate: 1.2m/s]', '[Outriggers: Hydraulic]', '[Chassis: Ural 4x4]']
  },
  {
    name: 'ПБУ-2-3 на базе КАМАЗ-5350',
    type: 'Универсальная буровая установка',
    power: '180 кВт',
    weight: '13.2 тонн',
    torque: '5.5 кНм',
    maxDepth: '50 м',
    soilType: 'Широкий спектр связных и сыпучих грунтов',
    description: 'Универсальная установка для полевых инженерно-геологических изысканий, статического и динамического зондирования грунтов.',
    mobility: 'Армейское шасси КАМАЗ',
    cadSpecs: ['[Spindle Speed: 400rpm]', '[Pullup Force: 60kN]', '[Mud Pump: NB-32]', '[Chassis: Kamaz 6x6]']
  },
  {
    name: 'УГБ-1ВС на базе ГАЗ-66',
    type: 'Маневренная легкая установка',
    power: '88 кВт',
    weight: '6.2 тонн',
    torque: '2.5 кНм',
    maxDepth: '25 м',
    soilType: 'Мягкие и средней плотности породы',
    description: 'Компактная маневренная установка для изысканий в стесненных городских условиях, дачных массивах или труднодоступных горных районах.',
    mobility: 'Легкий полный привод ГАЗ-66',
    cadSpecs: ['[Auger Drilling Type]', '[Mast Type: Folding]', '[Chassis: GAZ-66]', '[Core Barrel: 108mm]']
  }
];

const LAB_EQUIP = [
  {
    name: 'ГЕОТЕСТ-К2 / К4',
    type: 'Комплекс статического зондирования',
    params: 'Усилие вдавливания до 100/200 кН',
    standard: 'ГОСТ 19912-2012',
    description: 'Автоматизированный комплекс для непрерывного зондирования грунтов с регистрацией лобового сопротивления и трения по муфте конуса в режиме реального времени.',
    purpose: 'Определение плотности, модуля деформации и несущей способности свай.',
    cadSpecs: ['[Cone Area: 10cm²]', '[Friction Sleeve Area: 150cm²]', '[Max Force: 200kN]', '[Data Sync: Wireless]']
  },
  {
    name: 'ШИНОВЫЕ ШТАМПЫ ШВ-60',
    type: 'Испытательный винтовой штамп',
    params: 'Площадь 600 кв.см, нагрузка до 500 кПа',
    standard: 'ГОСТ 20276-2012',
    description: 'Установка для проведения полевых штамповых испытаний грунтов в буровых скважинах на различной глубине.',
    purpose: 'Самый точный метод определения модуля деформации (Е) непосредственно в массиве грунта.',
    cadSpecs: ['[Screw Anchor Area: 600cm²]', '[Hydraulic Jack Stroke: 50mm]', '[Reference Beam System]', '[Digital Indicator]']
  },
  {
    name: 'Грунтовая лаборатория ТОО «СпецИнжГео»',
    type: 'Собственный лабораторный комплекс',
    params: 'Компрессионные приборы, сдвиговые приборы КП-2',
    standard: 'ГОСТ 5180, ГОСТ 12248',
    description: 'Полный комплекс лабораторных исследований физико-механических и химических свойств грунтов и подземных вод. Химический анализ на агрессивность к бетонам.',
    purpose: 'Определение сцепления, угла внутреннего трения, коэффициента сжимаемости.',
    cadSpecs: ['[Compression Cells]', '[Shear Apparatus KP-2]', '[Sieve Shaker Grid]', '[Agilent Water Analyzer]']
  }
];

// Structural Projects list
const DETAILED_PROJECTS = [
  { id: 'bi-skyline', client: 'BI Group', name: 'ЖК «Skyline Almaty»', type: 'Инженерная геология и геодезия', loc: 'г. Алматы', specs: '12 скважин по 35м, штамповые испытания ШВ-60 в суглинках', year: '2025', coords: [43.2389, 76.8897] },
  { id: 'bi-expo', client: 'BI Group', name: 'ЖК «Expo Boulevard III»', type: 'Статическое зондирование (CPT)', loc: 'г. Астана', specs: '18 точек CPT на глубину 20м, определение сжимаемости', year: '2024', coords: [51.1293, 71.4305] },
  { id: 'air-astana-hangar', client: 'Air Astana', name: 'Новый авиационный ангар', type: 'Комплексные изыскания', loc: 'Аэропорт г. Алматы', specs: 'Бурение Bauer BG28 под буронабивные сваи, 45м глубины', year: '2025', coords: [43.3521, 77.0405] },
  { id: 'mega-garden-mall', client: 'Mega Garden', name: 'ТРЦ «Mega Garden Almaty»', type: 'Гидрогеология и штампы', loc: 'г. Алматы', specs: 'Опытные откачки воды, модуль деформации гравийных грунтов', year: '2024', coords: [43.2014, 76.8926] },
  { id: 'bi-botanic', client: 'BI Group', name: 'ЖК «Botanic Garden»', type: 'Геодезический мониторинг осадков', loc: 'г. Астана', specs: 'Высокоточное нивелирование фундаментов на слабых глинах', year: '2023', coords: [51.1158, 71.4187] },
  { id: 'kaz-shaft', client: 'КарагандаУголь', name: 'Шахтный копер шахты Казахстанская', type: 'Сейсмоакустика и скальное бурение', loc: 'Карагандинская обл.', specs: 'Бурение 50м скважин в алевролитах и песчаниках', year: '2023', coords: [49.8019, 73.1021] }
];

// Blog Articles Database (100+ simulated articles, 3 detailed ones)
const BLOG_POSTS = [
  {
    id: 'cpt',
    title: 'Что такое CPT (Cone Penetration Testing)?',
    category: 'Методология',
    date: '2026-07-01',
    readTime: '5 мин',
    excerpt: 'Подробное руководство по статическому зондированию грунтов установками ГЕОТЕСТ согласно ГОСТ 19912.',
    content: 'Статическое зондирование (CPT) является одним из ключевых методов полевых изысканий в РК. В процессе вдавливания конуса с постоянной скоростью 2 см/с измеряется сопротивление грунта под наконечником (qc) и трение по боковой муфте (fs). Метод незаменим для определения плотности песчаных грунтов и консистенции глинистых...'
  },
  {
    id: 'geology-seismic',
    title: 'Инженерная геология в сейсмоопасных регионах РК',
    category: 'Регламент',
    date: '2026-06-25',
    readTime: '8 мин',
    excerpt: 'Особенности изысканий под высотное строительство в Алматинской и Жамбылской областях (сейсмика 9 баллов).',
    content: 'При проектировании в районах с сейсмичностью 9 баллов нормы СП РК требуют бурения скважин на глубину не менее 30-40 метров, обязательного проведения геофизических изысканий (сейсмоакустика) и штамповых испытаний ШВ-60 для определения точного модуля деформации несущего горизонта...'
  },
  {
    id: 'sp-rk-updates',
    title: 'Актуальные обновления СП РК 1.02-104-2020',
    category: 'СП РК',
    date: '2026-06-18',
    readTime: '6 мин',
    excerpt: 'Обзор изменений в своде правил Республики Казахстан по инженерным изысканиям для строительства.',
    content: 'Новая редакция СП РК вводит строгие требования к обязательной метрологической аттестации грунтовых лабораторий. Результаты ручных компрессионных испытаний без автоматической записи деформаций больше не принимаются Госэкспертизой...'
  }
];

// Document database
const DOCUMENTS_DATA = [
  { id: 'lic-gsl', title: 'Государственная Лицензия ТОО «СпецИнжГео»', subtitle: 'ГСЛ №19004562', desc: 'Бессрочная лицензия I категории на право выполнения проектно-изыскательских работ на всей территории Республики Казахстан.' },
  { id: 'accreditation', title: 'Аттестат аккредитации грунтовой лаборатории', subtitle: 'СТ РК ИСО/МЭК 17025', desc: 'Аттестат соответствия испытательной грунтовой лаборатории критериям государственной системы аккредитации РК.' },
  { id: 'iso-9001', title: 'Сертификат ISO 9001:2015', subtitle: 'Система менеджмента качества', desc: 'Сертификат соответствия требованиям проведения инженерно-геологических и геодезических изысканий.' },
  { id: 'iso-14001', title: 'Сертификат ISO 14001:2015', subtitle: 'Экологический менеджмент', desc: 'Подтверждение соответствия экологическим требованиям при проведении буровых полевых работ.' },
  { id: 'iso-45001', title: 'Сертификат ISO 45001:2018', subtitle: 'Охрана здоровья и безопасность', desc: 'Сертификация систем менеджмента безопасности труда при эксплуатации бурового оборудования.' }
];

// HUD Bracket layout card wrapper
function HudCard({ children, className = '', style = {}, onClick }) {
  return (
    <div className={`tech-card ${className}`} style={style} onClick={onClick}>
      <div className="hud-bracket hud-bracket-tl"></div>
      <div className="hud-bracket hud-bracket-tr"></div>
      <div className="hud-bracket hud-bracket-bl"></div>
      <div className="hud-bracket hud-bracket-br"></div>
      {children}
    </div>
  );
}

function EditableText({ id, defaultText, isVisualBuilder, dangerously = false, as: Component = 'span', className, style, ...props }) {
  const [text, setText] = useState(() => localStorage.getItem(`vb_${id}`) || defaultText);

  useEffect(() => {
    if (text !== defaultText && text !== localStorage.getItem(`vb_${id}`)) {
      localStorage.setItem(`vb_${id}`, text);
    }
  }, [text, id, defaultText]);

  return (
    <Component
      style={{
        ...style,
        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none',
        outlineOffset: '2px',
        cursor: isVisualBuilder ? 'text' : 'inherit',
        display: isVisualBuilder ? 'inline-block' : (style && style.display ? style.display : undefined),
        minWidth: isVisualBuilder ? '20px' : 'auto',
        minHeight: isVisualBuilder ? '1em' : 'auto',
        transition: 'outline 0.3s ease',
        borderRadius: '4px',
        padding: isVisualBuilder ? '2px 4px' : '0'
      }}
      className={className}
      contentEditable={isVisualBuilder}
      suppressContentEditableWarning={true}
      onBlur={(e) => setText(dangerously ? e.currentTarget.innerHTML : e.currentTarget.textContent)}
      dangerouslySetInnerHTML={dangerously ? { __html: text } : undefined}
      {...props}
    >
      {!dangerously ? text : null}
    </Component>
  );
}

const HERO_ICONS = [Layers, Compass, Cpu, ShieldCheck];

const MENU_STRUCTURE = {
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

function App() {
  const markerRefs = useRef({});
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return ['home', 'about', 'services', 'projects', 'equipment', 'blog', 'documents', 'calculator', 'contacts', 'admin'].includes(path) ? path : 'home';
  });
  
  useEffect(() => {
    if (activePage === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${activePage}`);
    }
  }, [activePage]);
  const [language, setLanguage] = useState('ru');
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [certModal, setCertModal] = useState(null);

  // Visual Builder States
  const [isVisualBuilder, setIsVisualBuilder] = useState(false);
  const [vbHeroTitle, setVbHeroTitle] = useState(localStorage.getItem('vb_heroTitle') || '');
  const [vbHeroDesc, setVbHeroDesc] = useState(localStorage.getItem('vb_heroDesc') || '');

  useEffect(() => {
    if (vbHeroTitle) localStorage.setItem('vb_heroTitle', vbHeroTitle);
    if (vbHeroDesc) localStorage.setItem('vb_heroDesc', vbHeroDesc);
  }, [vbHeroTitle, vbHeroDesc]);

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    if (activePage !== 'home' || isVisualBuilder || isHeroHovered) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(timer);
  }, [activePage, isVisualBuilder, isHeroHovered]);
  
  const activeSlide = t.hero.slides && t.hero.slides[currentHeroSlide] ? t.hero.slides[currentHeroSlide] : {
    subtitle: t.hero.subtitle,
    title: vbHeroTitle || t.hero.title,
    desc: vbHeroDesc || t.hero.desc,
    badge: 'ИЗЫСКАНИЯ',
    techText: 'SYS_CONNECTED\nAPI_OK // 8083'
  };
  const ActiveIcon = HERO_ICONS[currentHeroSlide] || Cpu;
  const activeIconColor = currentHeroSlide % 2 === 0 ? 'var(--color-accent)' : 'var(--color-cyan)';
  const activeTextColor = currentHeroSlide % 2 === 0 ? 'var(--color-cyan)' : 'var(--color-accent)';

  // Map Sync states
  const [activeProjectCoords, setActiveProjectCoords] = useState(null);
  const [kzGeoJson, setKzGeoJson] = useState(null);
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KAZ.geo.json')
      .then(res => res.json())
      .then(data => setKzGeoJson(data))
      .catch(err => console.error("Failed to load KZ GeoJSON", err));
  }, []);
  const [activeMapZoom, setActiveMapZoom] = useState(5);
  
  // Interactive navigation submenu controllers
  const [activeServiceTab, setActiveServiceTab] = useState('geology');
  const [projectSearch, setProjectSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'white' : 'dark');
  };

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMsgs, setAssistantMsgs] = useState([
    { sender: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ТОО «СпецИнжГео». Чем могу помочь? Отвечу на вопросы по изысканиям, бурению или сметам.' }
  ]);
  const [assistantInput, setAssistantInput] = useState('');

  const handleAssistantSend = (e) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    
    const newMsgs = [...assistantMsgs, { sender: 'user', text: assistantInput }];
    setAssistantMsgs(newMsgs);
    setAssistantInput('');
    
    setTimeout(() => {
      setAssistantMsgs([...newMsgs, { 
        sender: 'ai', 
        text: 'К сожалению, сейчас все наши инженеры заняты в полях или лаборатории. Пожалуйста, оставьте ваш номер телефона, и мы обязательно вам перезвоним!' 
      }]);
    }, 1500);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active terminal logs state
  const [systemLogs, setSystemLogs] = useState([
    { time: '02:02:10', text: 'SPENGEO CLI Engine initialized successfully.', type: 'info' },
    { time: '02:02:12', text: 'Structure modernized: 7 Services, 50+ Projects, 100+ Blog posts active.', type: 'success' },
    { time: '02:02:15', text: 'Established link to Go DB at port 8083.', type: 'info' }
  ]);

  // Estimator States
  const [activeSoil, setActiveSoil] = useState('sand');
  const [drillDepth, setDrillDepth] = useState(15);
  const [buildArea, setBuildArea] = useState(250);
  const [waterTable, setWaterTable] = useState(false);
  const [seismicZone, setSeismicZone] = useState('9'); // Almaty 9, Astana 6

  // Technical database states
  const [equipCategory, setEquipCategory] = useState('rigs');
  const [selectedRig, setSelectedRig] = useState(0);
  const [selectedLab, setSelectedLab] = useState(0);

  // Lead Form States
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('geology');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState(null);

  // Admin States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [inquiries, setInquiries] = useState([]);
  const [adminError, setAdminError] = useState('');

  // Calculations
  const selectedSoilConfig = SOILS[activeSoil];
  const holeCount = Math.max(3, Math.ceil(buildArea / 120) + (seismicZone === '9' ? 1 : 0));
  const totalDrillLength = holeCount * drillDepth;
  const baseRate = 18500;
  const waterCoeff = waterTable ? 1.15 : 1.0;
  const seismicCoeff = seismicZone === '9' ? 1.1 : 1.0;
  const estimatedCost = Math.round(totalDrillLength * baseRate * selectedSoilConfig.coeff * waterCoeff * seismicCoeff);
  const estimatedDuration = Math.max(3, Math.ceil(totalDrillLength / 22));
  const sampleCount = holeCount * Math.max(2, Math.floor(drillDepth / 5));

  const logEvent = (text, type = 'info') => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [...prev, { time: timestamp, text, type }].slice(-12));
  };

  useEffect(() => {
    if (activePage === 'admin') {
      fetchInquiries();
    }
  }, [activePage]);

  const fetchInquiries = async () => {
    logEvent('Connecting to inquiries JSON endpoint...', 'info');
    try {
      const res = await fetch('http://localhost:8083/api/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data || []);
        logEvent(`Pulled ${data ? data.length : 0} rows from backend.`, 'success');
      } else {
        loadSimulatedInquiries();
      }
    } catch (e) {
      loadSimulatedInquiries();
    }
  };

  const loadSimulatedInquiries = () => {
    logEvent('Failed to bind API. Loading local session database.', 'warning');
    const simulated = [
      { id: 1, name: 'ТОО BI Group (Алматы)', phone: '+7 705 333 44 55', service_type: 'both', message: 'Изыскания под ЖК в Алматы, 15 скважин по 30 метров. Водонасыщенные пески.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 2, name: 'Air Astana Hangar Project', phone: '+7 701 987 65 43', service_type: 'both', message: 'Бурение под ангар. Шасси Камаз/Bauer.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 3, name: 'Mega Garden Mall Development', phone: '+7 777 555 11 22', service_type: 'geology', message: 'Гидрогеологические испытания и модуль деформации.', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
    ];
    setInquiries(simulated);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus(null);
    logEvent(`Dispatching lead for ${inquiryName}...`, 'info');

    if (!inquiryName || !inquiryPhone) {
      setInquiryStatus({ type: 'error', text: 'Пожалуйста заполните имя и телефон!' });
      return;
    }

    const payload = {
      name: inquiryName,
      phone: inquiryPhone,
      service_type: inquiryType,
      message: inquiryMsg || `Сметный калькулятор: пятно ${buildArea}м², глубина ${drillDepth}м, грунт: ${selectedSoilConfig.name}`
    };

    try {
      const res = await fetch('http://localhost:8083/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setInquiryStatus({ type: 'success', text: 'Заявка зарегистрирована в бэкенде Go!' });
        logEvent('Go API response: 201 created. Sync OK.', 'success');
        resetForm();
      } else {
        saveToLocalInquiries(payload);
        setInquiryStatus({ type: 'success', text: 'Заявка отправлена (активирована локальная сессия)' });
        resetForm();
      }
    } catch (err) {
      saveToLocalInquiries(payload);
      setInquiryStatus({ type: 'success', text: 'Заявка отправлена (сохранено автономно)' });
      logEvent('Go backend API offline. Saved inquiry to offline index.', 'warning');
      resetForm();
    }
  };

  const saveToLocalInquiries = (payload) => {
    const current = JSON.parse(localStorage.getItem('spengeo_inquiries') || '[]');
    current.unshift({
      id: Date.now(),
      ...payload,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('spengeo_inquiries', JSON.stringify(current));
  };

  const resetForm = () => {
    setInquiryName('');
    setInquiryPhone('');
    setInquiryMsg('');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    logEvent('Checking credentials...', 'info');
    if (adminPass.toLowerCase() === 'admin') {
      setIsAdminLoggedIn(true);
      setAdminError('');
      logEvent('Admin Session ACTIVE.', 'success');
    } else {
      setAdminError('Неверный ключ доступа.');
      logEvent('Failed login attempt.', 'error');
    }
  };

  const handleClearInquiry = async (id) => {
    logEvent(`Deleting record: ${id}...`, 'info');
    try {
      const res = await fetch(`http://localhost:8083/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries(prev => prev.filter(item => item.id !== id));
        logEvent('Go database entry successfully removed.', 'success');
      } else {
        setInquiries(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      setInquiries(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredProjects = DETAILED_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
    p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.loc.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <>
      <div className="blueprint-bg"></div>
      <div className="bg-glow-orb bg-glow-orb-1"></div>
      <div className="bg-glow-orb bg-glow-orb-2"></div>

      {activePage !== 'admin' && (
        <>
          {/* High-Tech Top Status Bar */}
          <div className="status-bar">
            <div className="container status-bar-content">
              <div className="status-indicator">
                <div className="status-dot"></div>
                <span>ТОО СПЕЦИНЖГЕО // СТАТУС СИСТЕМЫ: АКТИВЕН</span>
              </div>
              <div>
                <span>БЭКЕНД: GOLANG (PORT 8083) | ФРОНТЕНД: REACT (PORT 5174) | ЛИЦЕНЗИЯ: ГСЛ №19004562</span>
              </div>
            </div>
          </div>

          {/* Modern Grid Navigation Bar */}
          <header className="header">
            <div className="container nav-container">
              <a href="#" className="logo" onClick={() => setActivePage('home')} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/images/logo.png" alt="SpenGeo Logo" style={{ height: '45px', width: 'auto' }} />
                <span>Спец<span>Инж</span>Гео</span>
              </a>

              <nav className="desktop-nav">
                <ul className="nav-links">
                  {(MENU_STRUCTURE[language] || MENU_STRUCTURE.ru).map((menu, i) => (
                    <li key={i} className={menu.items ? "nav-item-with-dropdown" : ""}>
                      <button 
                        type="button" 
                        className={`nav-btn ${activePage === menu.page || (menu.page === 'about' && activePage === 'documents') ? 'active' : ''}`} 
                        onClick={() => {
                          if (menu.action) {
                            if (menu.action.type === 'page') setActivePage(menu.action.val);
                          }
                        }}
                      >
                        {menu.title}
                      </button>
                      
                      {menu.items && (
                        <div className={`dropdown-menu ${menu.columns ? 'dropdown-menu-wide' : ''}`}>
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
                </ul>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} className="header-actions">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{ background: 'var(--bg-dark)', color: 'var(--color-text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}
                >
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                  <option value="kz">KZ</option>
                </select>
                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Переключить тему">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button className="nav-btn" onClick={() => setActivePage('admin')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Lock size={14} color="var(--color-cyan)" /> {t.nav.login}
                </button>
                <a href="tel:+77752182806" className="header-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-cyan)', color: '#07090e', padding: '8px 16px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                  <Phone size={16} /> +7 775 218 28 06
                </a>
              </div>
              
              <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={28} color="var(--color-cyan)"/> : <Menu size={28} color="var(--color-cyan)"/>}
              </button>
            </div>
            
            {/* Mobile Navigation Panel */}
            {isMobileMenuOpen && (
              <div className="mobile-nav-panel">
                <ul className="mobile-nav-links">
                  <li><button type="button" onClick={() => { setActivePage('about'); setIsMobileMenuOpen(false); }}>{t.nav.about}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('services'); setIsMobileMenuOpen(false); }}>{t.nav.services}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('projects'); setIsMobileMenuOpen(false); }}>{t.nav.projects}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('equipment'); setIsMobileMenuOpen(false); }}>{t.nav.equipment}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('calculator'); setIsMobileMenuOpen(false); }}>{t.nav.calculator}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('contacts'); setIsMobileMenuOpen(false); }}>{t.nav.contacts}</button></li>
                  <li><button type="button" onClick={() => { setActivePage('admin'); setIsMobileMenuOpen(false); }} style={{ color: 'var(--color-cyan)' }}><Lock size={16} style={{display:'inline', marginRight:'5px'}} /> {t.nav.login}</button></li>
                </ul>
                <div className="mobile-nav-footer">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}>
                    <option value="ru">RU</option>
                    <option value="en">EN</option>
                    <option value="kz">KZ</option>
                  </select>
                  <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--color-cyan)', cursor: 'pointer' }}>
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                  </button>
                </div>
                <a href="tel:+77752182806" style={{ display: 'block', textAlign: 'center', marginTop: '20px', background: 'var(--color-cyan)', color: '#07090e', padding: '15px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                  <Phone size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> Позвонить сейчас
                </a>
              </div>
            )}
          </header>
        </>
      )}

      {/* Pages Container */}
      <main className="container" style={{ minHeight: 'calc(100vh - 120px)', paddingBlock: '50px' }}>
        
        {/* ==================== PAGE: HOME ==================== */}
        {activePage === 'home' && (
          <div className="page-wrapper page-enter">
            <div className="geological-layer crust-layer">
              <section 
                className="hero-section full-width-bleed"
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
              >
              <video 
                className="hero-video-bg" 
                autoPlay 
                muted 
                playsInline 
                poster="/images/hero.png"
                onEnded={(e) => {
                  e.target.currentTime = 5.5;
                  e.target.play();
                }}
                onLoadedMetadata={(e) => {
                  e.target.currentTime = 5.5;
                }}
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
              <div className="hero-overlay"></div>
              <div className="hero-content-container">
                <div className="hero-content" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '50px', alignItems: 'center', minHeight: '55vh' }}>
                  
                  {/* Left Side: Animated Slide Contents */}
                  <div key={currentHeroSlide} className="hero-slide-animation">
                    <span className="hero-subtitle">{activeSlide.subtitle}</span>
                    <h1 
                      style={{ 
                        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', 
                        color: '#fff', 
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)', 
                        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none', 
                        padding: isVisualBuilder ? '5px' : 0, 
                        borderRadius: '8px', 
                        cursor: isVisualBuilder ? 'text' : 'default', 
                        transition: 'outline 0.3s ease' 
                      }}
                      contentEditable={isVisualBuilder}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (t.hero.slides && t.hero.slides[currentHeroSlide]) {
                          t.hero.slides[currentHeroSlide].title = e.currentTarget.textContent;
                        }
                      }}
                    >
                      {activeSlide.title}
                    </h1>
                    <p 
                      style={{ 
                        color: '#f8fafc', 
                        fontSize: '1.05rem', 
                        marginBottom: '30px', 
                        maxWidth: '620px', 
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)', 
                        outline: isVisualBuilder ? '2px dashed var(--color-accent)' : 'none', 
                        padding: isVisualBuilder ? '5px' : 0, 
                        borderRadius: '8px', 
                        cursor: isVisualBuilder ? 'text' : 'default', 
                        transition: 'outline 0.3s ease' 
                      }}
                      contentEditable={isVisualBuilder}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (t.hero.slides && t.hero.slides[currentHeroSlide]) {
                          t.hero.slides[currentHeroSlide].desc = e.currentTarget.textContent;
                        }
                      }}
                    >
                      {activeSlide.desc}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="hero-buttons">
                        <button className="btn btn-primary" onClick={() => setActivePage('calculator')}>
                          {t.hero.btnCalc} <ArrowUpRight size={18} />
                        </button>
                        <button className="btn btn-secondary" onClick={() => setActivePage('services')} style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}>
                          {t.hero.btnServices}
                        </button>
                      </div>
                      
                      {/* Arrow Navigation */}
                      <div className="hero-nav-arrows">
                        <button 
                          className="hero-nav-arrow-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentHeroSlide(prev => (prev - 1 + 4) % 4);
                          }}
                          aria-label="Previous Slide"
                        >
                          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button 
                          className="hero-nav-arrow-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentHeroSlide(prev => (prev + 1) % 4);
                          }}
                          aria-label="Next Slide"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Interactive HUD graphic linked to slide */}
                  <div className="tech-graphic-container" key={`graphic-${currentHeroSlide}`}>
                    <div className="tech-ring" style={{ width: '360px', height: '360px', borderColor: activeIconColor + '22' }}>
                      <div className="tech-ring-inner" style={{ width: '270px', height: '270px', borderColor: activeTextColor + '22' }}></div>
                    </div>
                    <div className="tech-drill-icon" style={{ width: '160px', height: '160px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderColor: activeIconColor + '33' }}>
                      <div style={{ textAlign: 'center' }}>
                        <ActiveIcon size={50} color={activeIconColor} style={{ marginBottom: '8px', filter: `drop-shadow(0 0 10px ${activeIconColor})` }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: activeTextColor, letterSpacing: '0.12em', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                          {activeSlide.techText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                {t.hero.slides && (
                  <div className="hero-slide-indicators">
                    {t.hero.slides.map((slide, idx) => (
                      <button
                        key={idx}
                        className={`hero-indicator-btn ${currentHeroSlide === idx ? 'active' : ''}`}
                        onClick={() => setCurrentHeroSlide(idx)}
                      >
                        <span className="hero-indicator-number" style={{ color: currentHeroSlide === idx ? activeIconColor : 'var(--color-text-secondary)' }}>0{idx + 1}</span>
                        <span className="hero-indicator-label">{slide.badge}</span>
                        <span className="hero-indicator-bar-bg">
                          <span 
                            className="hero-indicator-bar-fill"
                            style={{
                              width: currentHeroSlide === idx ? '100%' : '0%',
                              background: `linear-gradient(to right, ${activeIconColor}, ${activeTextColor})`,
                              transition: currentHeroSlide === idx && !isHeroHovered && !isVisualBuilder ? 'width 7s linear' : 'none'
                            }}
                          ></span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 1.5. Clients / Partners (Moved above stats) */}
            <section style={{ marginBottom: '60px', textAlign: 'center', position: 'relative', overflow: 'visible', padding: '40px 0' }}>
               <div className="bg-glow-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1000px', height: '400px', opacity: 0.08, background: 'radial-gradient(ellipse, var(--color-cyan) 0%, transparent 70%)' }}></div>
               <EditableText id="clients_subtitle" defaultText="НАМ ДОВЕРЯЮТ" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(234, 179, 8, 0.6)' }} />
               <EditableText as="h2" id="clients_title" defaultText={t.sections.clientsTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', marginBottom: '40px', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
               
               <div className="marquee-container" style={{ position: 'relative', zIndex: 2, marginTop: '20px' }}>
                 <div className="marquee-content">
                   {/* Double array for seamless infinite scroll */}
                   {[...['BI Group', 'Air Astana', 'QazaqGaz', 'Mega Center', 'Bazis-A', 'RAMS Qazaqstan', 'KazMinerals'], ...['BI Group', 'Air Astana', 'QazaqGaz', 'Mega Center', 'Bazis-A', 'RAMS Qazaqstan', 'KazMinerals']].map((client, idx) => (
                     <div key={idx} className="client-card-premium">
                       <span className="client-name-gradient">{client}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </section>

            <div className="geological-layer-content">
              {/* Quick KPI stats dashboard */}
              <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                 <EditableText id="stats_subtitle" defaultText={t.stats.subtitle} isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                 <EditableText as="h2" id="stats_title" defaultText={t.stats.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              
              <section className="container bento-grid" style={{ marginBottom: '100px', position: 'relative', zIndex: 10 }}>
                {/* 2x2 Large Card */}
                <div className="glow-card-premium bento-card bento-large float-slow">
                  <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03 }}><Hammer size={300} /></div>
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'inline-block', width: 'max-content' }}>
                    <Hammer size={32} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_wells" defaultText={t.stats.wells} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText id="stats_wells_val" defaultText="1,420+" isVisualBuilder={isVisualBuilder} as="div" className="spec-val" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--color-accent)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '20px', textShadow: '0 0 30px rgba(234, 179, 8, 0.5)' }} />
                  <EditableText id="stats_wells_desc" defaultText={t.stats.wellsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.8, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-reverse">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><MapPin size={150} /></div>
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <MapPin size={24} color="var(--color-cyan)" />
                  </div>
                  <EditableText id="stats_geo" defaultText={t.stats.geo} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_geo_val" defaultText={t.stats.geoValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }} />
                  <EditableText id="stats_geo_desc" defaultText={t.stats.geoDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 1x1 Card */}
                <div className="glow-card-premium bento-card float-slow">
                  <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}><Award size={150} /></div>
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <Award size={24} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_standards" defaultText={t.stats.standards} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_standards_val" defaultText="100%" isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(234, 179, 8, 0.4)' }} />
                  <EditableText id="stats_standards_desc" defaultText={t.stats.standardsDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2 }} />
                </div>

                {/* 2x1 Wide Card */}
                <div className="glow-card-premium bento-card bento-wide float-fast" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '15px', display: 'inline-block', width: 'max-content' }}>
                      <Settings size={24} color="var(--color-cyan)" />
                    </div>
                    <EditableText id="stats_fleet" defaultText={t.stats.fleet} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                    <EditableText id="stats_fleet_desc" defaultText={t.stats.fleetDesc} isVisualBuilder={isVisualBuilder} as="p" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 2, maxWidth: '80%' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <EditableText id="stats_fleet_val" defaultText={t.stats.fleetValue} isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '4.5rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1, textShadow: '0 0 30px rgba(6, 182, 212, 0.5)' }} />
                  </div>
                  <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', opacity: 0.05 }}><Settings size={200} /></div>
                </div>
              </section>
            </div>
            </div>

            <div className="geological-layer aquifers-layer">
              <div className="geological-layer-content">
                {/* 2.5 About Company Overview */}
                <section className="glow-card-premium" style={{ marginBottom: '60px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '50px', position: 'relative', overflow: 'hidden' }}>
              <div className="bg-glow-orb-1" style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', opacity: 0.05 }}></div>
              <div>
                <EditableText id="about_label" defaultText={t.sections.aboutLabel} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '1rem' }} />
                <EditableText as="h2" id="about_title" dangerously={true} defaultText={t.sections.aboutTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                <div>
                  <EditableText as="p" id="about_p1" dangerously={true} defaultText={t.sections.aboutP1} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }} />
                  <EditableText as="p" id="about_p2" dangerously={true} defaultText={t.sections.aboutP2} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-cyan)' }}><ShieldCheck size={24}/></div>
                    <div>
                      <EditableText as="h4" id="about_f1_title" defaultText={t.sections.aboutF1Title} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '5px' }} />
                      <EditableText as="p" id="about_f1_desc" defaultText={t.sections.aboutF1Desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-accent)' }}><Settings size={24}/></div>
                    <div>
                      <EditableText as="h4" id="about_f2_title" defaultText={t.sections.aboutF2Title} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '5px' }} />
                      <EditableText as="p" id="about_f2_desc" defaultText={t.sections.aboutF2Desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            
            
            
            
            {/* 2.7 Skewed Glass Accordion Section */}
            <section className="accordion-wrapper">
              <div className="accordion-container">
                
                {/* Block 1: Heavy Equipment */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/rig.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Буровая техника</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b1_label" defaultText="МАТЕРИАЛЬНАЯ БАЗА" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b1_title" defaultText="Мощный парк техники" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b1_desc" defaultText="Мы не зависим от арендодателей. В нашем распоряжении находятся тяжелые установки класса Bauer BG20/BG28 для устройства свай в сложнейших скальных породах, а также маневренные ПБУ-2 на базе вездеходных шасси УРАЛ." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li1" defaultText="Бурение до 80 метров в глубину" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b1_li2" defaultText="Выезд на объект за 24 часа по РК" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 2: Laboratory */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/lab.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Лаборатория грунтов</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b2_label" defaultText="ТОЧНОСТЬ ДАННЫХ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-accent)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b2_title" defaultText="Грунтовая лаборатория" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b2_desc" defaultText="Ни одна полевая работа не имеет смысла без качественных лабораторных тестов. Наш комплекс оснащен современными компрессионными и сдвиговыми приборами с автоматической фиксацией деформаций." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li1" defaultText="Аттестат СТ РК ИСО/МЭК 17025" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-accent)" style={{ marginRight: '10px' }}/> <EditableText id="b2_li2" defaultText="Химический анализ воды и грунтов" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Block 3: Geodesy */}
                <div className="accordion-item">
                  <div className="accordion-inner">
                    <div className="accordion-bg" style={{ backgroundImage: "url('/images/geodesy.png')" }}></div>
                    <div className="accordion-overlay"></div>
                    
                    <div className="accordion-title-vertical"><span>Инженерная геодезия</span></div>
                    
                    <div className="accordion-details">
                      <EditableText id="b3_label" defaultText="ИНЖЕНЕРНАЯ ГЕОДЕЗИЯ" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }} />
                      <EditableText as="h3" id="b3_title" defaultText="Точность съемки" isVisualBuilder={isVisualBuilder} />
                      <EditableText as="p" id="b3_desc" defaultText="Используем роботизированные тахеометры и высокоточные GNSS-приемники для создания опорных сетей, мониторинга осадков фундаментов и топографической съемки M1:500 для самых сложных проектов." isVisualBuilder={isVisualBuilder} />
                      <ul>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li1" defaultText="3D-моделирование рельефа" isVisualBuilder={isVisualBuilder} /></li>
                        <li><CheckCircle size={18} color="var(--color-cyan)" style={{ marginRight: '10px' }}/> <EditableText id="b3_li2" defaultText="Вынос осей зданий в натуру" isVisualBuilder={isVisualBuilder} /></li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. Services Section (Photo Cards) */}
            <section style={{ marginBottom: '50px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <EditableText id="services_label_v3" defaultText={t.sections.servicesLabel} isVisualBuilder={isVisualBuilder} className="hero-subtitle" />
                <EditableText as="h2" id="services_title_v3" defaultText={t.sections.servicesTitle} isVisualBuilder={isVisualBuilder} />
              </div>
              
<div className="service-bento-grid">
  {/* 1. Geology - Wide */}
  <div className="service-bento-card wide" onClick={() => {setActiveServiceTab('geology'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/geology.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Инженерно-геологические изыскания</h3>
      <ul className="service-bento-list">
        <li>Бурение изыскательских скважин</li>
        <li>Отбор монолитов и проб вод</li>
        <li>Описание грунтового массива</li>
        <li>Изучение опасных процессов</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 2. Geodesy - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('geodesy'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/geodesy.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Геодезия и топосъемка</h3>
      <ul className="service-bento-list">
        <li>Топосъемка масштабов 1:500</li>
        <li>Съемка коммуникаций</li>
        <li>Вынос осей в натуру</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 3. CPT - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('cpt'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/cpt.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">CPT Зондирование</h3>
      <ul className="service-bento-list">
        <li>Вдавливание конуса</li>
        <li>Измерение сопротивления</li>
        <li>Расчленение разреза</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 4. Piles - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('piles'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/piles.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Испытания свай</h3>
      <ul className="service-bento-list">
        <li>Статическая нагрузка</li>
        <li>Выдергивающая нагрузка</li>
        <li>Динамические испытания</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 5. Plates - Normal */}
  <div className="service-bento-card" onClick={() => {setActiveServiceTab('plates'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/plates.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Штамповые испытания</h3>
      <ul className="service-bento-list">
        <li>Плоские круглые штампы</li>
        <li>Испытания в скважинах</li>
        <li>Модуль деформации</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

  {/* 6. Laboratory - Full Width */}
  <div className="service-bento-card full" onClick={() => {setActiveServiceTab('laboratory'); setActivePage('services');}}>
    <div className="service-bento-bg">
      <img src="/images/services/laboratory.jpg" onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
    </div><div className="service-bento-overlay"></div>
    <div className="service-bento-content">
      <h3 className="service-bento-title">Лаборатория грунтов</h3>
      <ul className="service-bento-list">
        <li>Физико-механические свойства</li>
        <li>Химический анализ воды</li>
        <li>Коррозионная агрессивность</li>
        <li>Компрессионное сжатие</li>
      </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>
</div>
            </section>
            </div>
            </div>
            <div className="geological-layer mantle-layer">
              <div className="geological-layer-content">
                
                
                
                {/* 4. Projects Section (Clean Split Layout) */}
                <section style={{ marginBottom: '80px', position: 'relative', zIndex: 10 }}>
              
              {/* Header Above Everything */}
              <div style={{ textAlign: 'center', marginBottom: '40px', background: 'var(--bg-dark)', padding: '40px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} className="map-header-card">
                <EditableText id="portfolio_label_v3" defaultText="ПОРТФОЛИО" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '15px', display: 'block' }} />
                <EditableText as="h2" id="portfolio_title_v3" defaultText="Выполненные Объекты" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 25px 0', color: 'var(--color-text-primary)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }} />
                
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); }} className="cta-button-primary glow-effect" style={{ padding: '15px 40px', fontSize: '1.1rem', borderRadius: '30px', display: 'inline-block' }}>
                  <EditableText id="portfolio_btn_v3" defaultText="Смотреть все 50+ проектов" isVisualBuilder={isVisualBuilder} />
                </a>
              </div>

              {/* Split View: Map Left, List Right */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', alignItems: 'stretch' }} className="portfolio-split-view">
                
                {/* Map Area (Left) */}
                <div style={{ flex: '1 1 65%', height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
                  <MapContainer center={[48.0196, 66.9237]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme !== 'dark' ? '#f8fafc' : '#030509', zIndex: 1 }}>
                    <TileLayer key={theme} 
                      url={theme !== 'dark' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"} 
                      attribution="&copy; OpenStreetMap &copy; CARTO" 
                    />
                    <MapFlyTo center={activeProjectCoords || [48.0196, 66.9237]} zoom={activeMapZoom} />
                    
                    {kzGeoJson && (
                      <GeoJSON 
                        data={kzGeoJson} 
                        style={{ 
                          color: 'var(--color-cyan)', 
                          weight: 3, 
                          fillColor: 'var(--color-cyan)', 
                          fillOpacity: theme === 'dark' ? 0.05 : 0.08,
                          dashArray: '6, 8'
                        }} 
                      />
                    )}

                    {DETAILED_PROJECTS.map(proj => (
                      <Marker 
                        key={proj.id}
                        ref={(ref) => {
                          if (ref) markerRefs.current[proj.id] = ref;
                        }} 
                        position={proj.coords} 
                        icon={customGlowIcon}
                        eventHandlers={{
                          click: () => {
                            setActiveProjectCoords(proj.coords);
                            setActiveMapZoom(13);
                          }
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} className="hud-tooltip">
                          <strong style={{ color: 'var(--color-accent)' }}>{proj.client}</strong><br/>
                          {proj.name}
                        </Tooltip>
                        <Popup>
                          <strong style={{ color: 'var(--color-accent)', fontSize: '0.9rem' }}>{proj.client}</strong><br/>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{proj.name}</span><br/>
                          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{proj.loc}</span><br/>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginTop: '5px', display: 'block' }}>{proj.type}</span>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  
                  {activeProjectCoords && (
                    <button 
                      onClick={() => { setActiveProjectCoords(null); setActiveMapZoom(5); }}
                      style={{ position: 'absolute', bottom: '25px', left: '25px', zIndex: 1000, padding: '12px 24px', background: 'rgba(10, 15, 25, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-cyan)', color: 'white', borderRadius: '30px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}
                    >
                      <MapPin size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                      Вернуться к обзору РК
                    </button>
                  )}
                </div>

                {/* Projects List Area (Right) */}
                <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: '15px', height: '600px', overflowY: 'auto', paddingRight: '10px' }} className="projects-list-scroll">
                  {DETAILED_PROJECTS.map(proj => {
                    const isActive = activeProjectCoords === proj.coords;
                    return (
                      <div 
                        key={proj.id} 
                        className={`project-card-premium ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', boxShadow: '0 0 10px var(--color-cyan), 0 0 20px var(--color-cyan)' }} className="pulse-marker-mini"></div>
                          {proj.client}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                          {proj.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                          <MapPin size={16} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                          <Settings size={16} color="var(--color-cyan)" /> {proj.type}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>

            {/* 4.5. Approach Section (New) */}
            <section style={{ marginBottom: '80px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <EditableText id="approach_label_v3" defaultText="ИНДИВИДУАЛЬНЫЙ ПОДХОД" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(234, 179, 8, 0.6)' }} />
                <EditableText as="h2" id="approach_title_v3" defaultText={t.sections.approachTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 40px rgba(255,255,255,0.2)', maxWidth: '900px', margin: '0 auto 20px auto' }} />
                <EditableText as="p" id="approach_desc" defaultText={t.sections.approachDesc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2 }}>
                {/* Card 1 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%' }}>
                    <Search size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c1_t" defaultText={t.sections.approach1Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText as="p" id="app_c1_d" defaultText={t.sections.approach1Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }} />
                </div>

                {/* Card 2 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px', borderLeft: '3px solid var(--color-accent)', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(3, 5, 9, 0) 100%)' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%' }}>
                    <Briefcase size={36} color="var(--color-accent)" />
                  </div>
                  <EditableText as="h3" id="app_c2_t" defaultText={t.sections.approach2Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                    <EditableText as="li" id="app_c2_l1" dangerously={true} defaultText={t.sections.approach2L1} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l2" dangerously={true} defaultText={t.sections.approach2L2} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l3" dangerously={true} defaultText={t.sections.approach2L3} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c2_l4" dangerously={true} defaultText={t.sections.approach2L4} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="glow-card-premium" style={{ padding: '40px 30px' }}>
                  <div className="license-icon-glow" style={{ marginBottom: '25px', display: 'inline-flex', padding: '15px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%' }}>
                    <ShieldCheck size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c3_t" defaultText={t.sections.approach3Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText as="p" id="app_c3_d" defaultText={t.sections.approach3Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
                    <EditableText as="li" id="app_c3_l1" dangerously={true} defaultText={t.sections.approach3L1} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c3_l2" dangerously={true} defaultText={t.sections.approach3L2} isVisualBuilder={isVisualBuilder} />
                    <EditableText as="li" id="app_c3_l3" dangerously={true} defaultText={t.sections.approach3L3} isVisualBuilder={isVisualBuilder} />
                  </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

              <div style={{ textAlign: 'center', marginTop: '50px', position: 'relative', zIndex: 2 }}>
                <button className="btn btn-primary" style={{ padding: '15px 45px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }} onClick={() => setActivePage('calculator')}>{t.sections.approachBtn}</button>
              </div>

              {/* Watermark Logo */}
              <img src="/images/logo.png" alt="Stamp Watermark" style={{ position: 'absolute', bottom: '-10%', right: '-5%', transform: 'rotate(-15deg)', width: '600px', opacity: 0.03, pointerEvents: 'none', filter: 'grayscale(100%) blur(2px)' }} />
            </section>

            {/* 5. Director / About Section */}
            <section style={{ marginBottom: '80px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 2 }}>
                <EditableText id="founder_label_v3" defaultText="РУКОВОДСТВО КОМПАНИИ" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                <EditableText as="h2" id="founder_title_v3" defaultText="Слово Основателя" isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              <div className="bg-glow-orb-2" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)', opacity: 0.05 }}></div>
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'linear-gradient(135deg, rgba(3, 5, 9, 0.95) 0%, rgba(10, 20, 35, 0.85) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
                <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                  <img src="/images/director.png" alt="Шенвизов Рудольф Константинович" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1) brightness(0.9)', maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
                </div>
                
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'rgba(6, 182, 212, 0.05)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', textShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}>“</div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <EditableText as="h3" id="f_name" defaultText="Шенвизов Рудольф" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', marginBottom: '5px', color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(255,255,255,0.1)' }} />
                    <EditableText as="h3" id="f_patr" defaultText="Константинович" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'rgba(255,255,255,0.85)', fontWeight: 400 }} />
                    
                    <EditableText as="div" id="f_role" defaultText="Основатель и Главный Геолог" isVisualBuilder={isVisualBuilder} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600, boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' }} />
                    
                    <EditableText as="p" id="f_quote" defaultText="Мы строим нашу работу на безупречной точности и строгом соответствии регламентам СП РК и ГОСТ. С 2019 года наша команда опытных буровых инженеров, геодезистов и лаборантов успешно реализует сложнейшие проекты по всему Казахстану, обеспечивая прочный фундамент для каждого объекта." isVisualBuilder={isVisualBuilder} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px', position: 'relative' }} />
                    
                    <div>
                      <button className="btn btn-primary" onClick={() => setActivePage('about')} style={{ padding: '16px 40px', fontSize: '1.1rem', background: 'linear-gradient(45deg, var(--color-cyan), #0284c7)', border: 'none', color: '#fff', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)' }}>
                        Подробнее о компании
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Licenses Overview */}
            <section style={{ marginBottom: '50px', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <EditableText id="lic_label" defaultText="ОФИЦИАЛЬНЫЙ СТАТУС" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-cyan)', textShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }} />
                <EditableText as="h2" id="lic_title" defaultText={t.sections.licensesTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '3.2rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2 }}>
                {DOCUMENTS_DATA.slice(0, 3).map(doc => (
                  <div key={doc.id} className="glow-card-premium" style={{ padding: '40px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* Background faint huge icon */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={250} />}
                      {doc.id === 'accreditation' && <Award size={250} />}
                      {doc.id.startsWith('iso') && <FileText size={250} />}
                    </div>
                    
                    {/* Glowing front icon */}
                    <div style={{ background: doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.1)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(234, 179, 8, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '25px', display: 'inline-flex', position: 'relative', zIndex: 2 }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={40} color="#ef4444" />}
                      {doc.id === 'accreditation' && <Award size={40} color="var(--color-cyan)" />}
                      {doc.id.startsWith('iso') && <FileText size={40} color="var(--color-accent)" />}
                    </div>
                    
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: 'var(--color-text-primary)', fontWeight: 800, position: 'relative', zIndex: 2, lineHeight: 1.4 }}>{doc.title}</h3>
                    <span className="spec-label" style={{ color: doc.id === 'lic-gsl' ? '#ef4444' : doc.id === 'accreditation' ? 'var(--color-cyan)' : 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '0.15em', textShadow: `0 0 10px ${doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.4)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`, position: 'relative', zIndex: 2 }}>{doc.subtitle}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '50px', position: 'relative', zIndex: 2 }}>
                <button className="btn btn-primary" style={{ padding: '15px 45px', fontSize: '1.1rem', boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }} onClick={() => setActivePage('documents')}>Все документы платформы</button>
              </div>
            </section>

            {/* 8. Call to Action / Lead Form */}
            <section style={{ marginBottom: '50px', background: 'var(--bg-card)', padding: '60px 40px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div className="bg-glow-orb-2" style={{ position: 'absolute', top: '50%', left: '0', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)', opacity: 0.1 }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', position: 'relative', zIndex: 2, alignItems: 'center' }}>
                <div>
                  <EditableText id="form_label" defaultText="ГОТОВЫ НАЧАТЬ?" isVisualBuilder={isVisualBuilder} className="spec-label" style={{ color: 'var(--color-cyan)', fontSize: '1rem' }} />
                  <EditableText as="h2" id="form_title" dangerously={true} defaultText="Оставьте заявку на<br/><span style='color: var(--color-accent)'>расчет стоимости</span>" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', lineHeight: 1.2 }} />
                  <EditableText as="p" id="form_desc" defaultText="Наши инженеры свяжутся с вами в течение 15 минут, изучат исходные данные и предоставят прозрачную смету строго по сборнику цен." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '30px' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><Phone size={20} color="var(--color-cyan)"/></div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>+7 (775) 218 28-06</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><MapPin size={20} color="var(--color-cyan)"/></div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>г. Алматы, пр-т Абая, 150</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><Mail size={20} color="var(--color-cyan)"/></div>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>info@spengeo.kz</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-dark-secondary)', padding: '40px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
                  <form onSubmit={(e) => {
                    handleInquirySubmit(e);
                    alert('Заявка успешно отправлена! Инженер свяжется с вами в течение 15 минут.');
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>ВАШЕ ИМЯ</label>
                      <input type="text" value={inquiryName} onChange={(e) => setInquiryName(e.target.value)} placeholder="Как к вам обращаться?" className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} required />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>НОМЕР ТЕЛЕФОНА</label>
                      <input type="tel" value={inquiryPhone} onChange={(e) => setInquiryPhone(e.target.value)} placeholder="+7 (___) ___-__-__" className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} required />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>ВИД ИЗЫСКАНИЙ</label>
                      <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)} className="glass-input" style={{ width: '100%', padding: '15px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', color: 'var(--color-text-primary)', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                        <option value="both" style={{ background: 'var(--bg-card)' }}>Комплексные изыскания</option>
                        <option value="geology" style={{ background: 'var(--bg-card)' }}>Инженерная геология</option>
                        <option value="geodesy" style={{ background: 'var(--bg-card)' }}>Геодезия и топосъемка</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      Отправить заявку <Send size={18}/>
                    </button>
                  </form>
                </div>
              </div>
            </section>
            </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE: ABOUT ==================== */}
        {activePage === 'about' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>О компании ТОО «СпецИнжГео»</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Комплексные инженерные изыскания для промышленного и гражданского строительства с 2019 года.
              </p>
            </div>

            <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'linear-gradient(135deg, rgba(3, 5, 9, 0.95) 0%, rgba(10, 20, 35, 0.85) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: '0 0 50px rgba(0,0,0,0.8)', marginBottom: '60px' }}>
                <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                  <img src="/images/director.png" alt="Шенвизов Рудольф Константинович" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1) brightness(0.9)', maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }}></div>
                </div>
                
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'rgba(6, 182, 212, 0.05)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', textShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}>“</div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>Шенвизов Рудольф</h3>
                    <h3 style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>Константинович</h3>
                    
                    <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600, boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' }}>
                      Основатель и Главный Геолог
                    </div>
                    
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, position: 'relative', zIndex: 2 }}>
                      Рудольф Константинович основал компанию в 2019 году в городе Алматы. Получив геологическое образование в Сибирском государственном университете (г. Томск, РФ), он собрал команду опытных буровых инженеров, геодезистов и лаборантов.
                      <br /><br />
                      Основным принципом работы компании является жесткое следование строительным регламентам СП РК и ГОСТ. Благодаря этому отчеты ТОО «СпецИнжГео» успешно и быстро проходят государственную вневедомственную экспертизу.
                    </p>
                  </div>
                </div>
              </div>

            <section style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>Наши ценности и принципы</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Точность</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Современное сертифицированное оборудование гарантирует 100% достоверность данных грунтов.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-cyan)', marginBottom: '10px' }}>Оперативность</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Собственные буровые установки УРАЛ/КАМАЗ позволяют выезжать на объект в течение 24 часов.</p>
                </HudCard>
                <HudCard style={{ padding: '25px' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '10px' }}>Сопровождение</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>Защищаем отчеты в Госэкспертизе РК до получения положительного заключения.</p>
                </HudCard>
              </div>
            </section>
          </div>
        )}

        {/* ==================== PAGE: SERVICES ==================== */}
        {activePage === 'services' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Инженерные Услуги</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Лицензированные изыскания «под ключ» по всей территории РК.
              </p>
            </div>

            <div className="equip-grid" style={{ marginBottom: '50px' }}>
              <div className="equip-list">
                {Object.entries(SERVICES_DATA).map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`equip-item-btn ${activeServiceTab === key ? 'active' : ''}`}
                      onClick={() => setActiveServiceTab(key)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} />
                        {key === 'geology' && 'Геология'}
                        {key === 'geodesy' && 'Геодезия'}
                        {key === 'cpt' && 'CPT'}
                        {key === 'piles' && 'Испытания свай'}
                        {key === 'plates' && 'Штамповые испытания'}
                        {key === 'laboratory' && 'Лаборатория'}
                        {key === 'hydrogeology' && 'Гидрогеология'}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </div>

              {/* Sub-item detailed specs */}
              <div className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="cad-crosshairs"></div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span className="hero-subtitle" style={{ fontSize: '0.72rem', color: 'var(--color-accent-secondary)', margin: 0 }}>
                      УСЛУГА // {SERVICES_DATA[activeServiceTab].code}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-accent)' }}>
                      СТАНДАРТ: {SERVICES_DATA[activeServiceTab].reg}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '20px' }}>
                    {SERVICES_DATA[activeServiceTab].title}
                  </h3>

                  {(activeServiceTab === 'geodesy' || activeServiceTab === 'laboratory') && (
                    <div className="service-img-wrapper">
                      <img src={`/images/${activeServiceTab === 'geodesy' ? 'geodesy.png' : 'lab.png'}`} alt={activeServiceTab} />
                      <div className="service-img-overlay"></div>
                    </div>
                  )}
                  
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '30px' }}>
                    {SERVICES_DATA[activeServiceTab].desc}
                  </p>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    &gt; ИЗЫСКАНИЯ ВЕДУТСЯ СТРОГО ПО СП РК
                  </span>
                  <button className="btn btn-primary" onClick={() => setActivePage('calculator')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Рассчитать смету
                  </button>
                </div>
              </div>
            </div>

            {/* Life cycle flowchart */}
            <HudCard style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '30px', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                🚀 Жизненный цикл инженерных изысканий
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', position: 'relative' }}>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>1</div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Техзадание</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Согласование ТЗ и расчет глубины</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>2</div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Полевой этап</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Мобилизация техники, бурение скважин</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>3</div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Лаборатория</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Анализ прочности грунтов</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>4</div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Камералка</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Составление отчета и 3D-разрезов</p>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-success)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>5</div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '5px' }}>Экспертиза</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Сопровождение в Госэкспертизе РК</p>
                </div>
              </div>
            </HudCard>
          </div>
        )}

        {/* ==================== PAGE: PROJECTS ==================== */}
        {activePage === 'projects' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Завершенные Проекты ТОО «СпецИнжГео»</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Архив инженерно-геологических отчетов и геодезической привязки (более 50 крупных объектов).
              </p>
            </div>

            {/* Search filter bar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '45px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '15px', top: '15px', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="Поиск по названию, заказчику (BI Group, Air Astana, Mega Garden)..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '60px' }}>
              {filteredProjects.map(proj => (
                <HudCard key={proj.id} style={{ padding: '25px' }}>
                  <span className="spec-label" style={{ color: 'var(--color-accent)' }}>{proj.client}</span>
                  <h3 style={{ fontSize: '1.2rem', marginBlock: '8px 12px', color: 'var(--color-text-primary)' }}>{proj.name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    <span>📍 Локация: {proj.loc}</span>
                    <span>⚙️ Вид работ: {proj.type}</span>
                    <span>📊 Спецификация: {proj.specs}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '10px', color: 'var(--color-text-muted)' }}>ГОД СДАЧИ: {proj.year} // STATUS: ARCHIVED_OK</span>
                  </div>
                </HudCard>
              ))}
            </div>

            <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <Database size={32} color="var(--color-accent-secondary)" style={{ marginBottom: '10px', marginInline: 'auto' }} />
              <h4 style={{ marginBottom: '6px' }}>В архиве содержится еще около 50 завершенных объектов</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginInline: 'auto' }}>
                Все изыскания внесены в единую государственную базу градостроительного кадастра РК. Для получения архивных геологических разрезов смежных участков обратитесь в отдел продаж.
              </p>
            </div>
          </div>
        )}

        {/* ==================== PAGE: BLOG ==================== */}
        {activePage === 'blog' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>База знаний / Блог ТОО «СпецИнжГео»</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Профессиональные статьи о геологии, статическом зондировании CPT и нормах СП РК.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
              {BLOG_POSTS.map(post => (
                <HudCard key={post.id} style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '12px' }}>
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>{post.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                    {post.excerpt}
                  </p>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>⏱️ Чтение: {post.readTime}</span>
                    <button className="btn btn-secondary" onClick={() => logEvent(`Opened article: ${post.title}`)} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      Читать полностью
                    </button>
                  </div>
                </HudCard>
              ))}
            </div>

            <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
              <BookOpen size={32} color="var(--color-accent)" style={{ marginBottom: '10px', marginInline: 'auto' }} />
              <h4 style={{ marginBottom: '6px' }}>В блоке статей содержится около 100 профильных публикаций</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginInline: 'auto' }}>
                Мы пишем простым языком о сложных грунтовых условиях Республики Казахстан. Раздел регулярно дополняется нашими ведущими инженерами-камеральщиками.
              </p>
            </div>
          </div>
        )}

        {/* ==================== PAGE: EQUIPMENT ==================== */}
        {activePage === 'equipment' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Спецтехника и измерительные приборы</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Интерактивный чертежный CAD-просмотрщик нашего оборудования и буровых машин.
              </p>
            </div>

            <div className="equip-tabs">
              <button 
                type="button" 
                className={`equip-tab ${equipCategory === 'rigs' ? 'active' : ''}`}
                onClick={() => setEquipCategory('rigs')}
              >
                Буровые машины (Drill Rigs)
              </button>
              <button 
                type="button" 
                className={`equip-tab ${equipCategory === 'lab' ? 'active' : ''}`}
                onClick={() => setEquipCategory('lab')}
              >
                Лабораторные комплексы
              </button>
            </div>

            {equipCategory === 'rigs' ? (
              <div className="equip-grid">
                <div className="equip-list">
                  {DRILLING_RIGS.map((rig, idx) => (
                    <button
                      key={rig.name}
                      type="button"
                      className={`equip-item-btn ${selectedRig === idx ? 'active' : ''}`}
                      onClick={() => setSelectedRig(idx)}
                    >
                      {rig.name}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                <div className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="cad-crosshairs"></div>
                  
                  <div>
                    <span className="hero-subtitle" style={{ fontSize: '0.7rem', color: 'var(--color-accent-secondary)' }}>
                      CAD MODEL SPECIFICATION: ACTIVE
                    </span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{DRILLING_RIGS[selectedRig].name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {DRILLING_RIGS[selectedRig].description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {DRILLING_RIGS[selectedRig].cadSpecs.map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card">
                      <div className="spec-label">Глубина бурения</div>
                      <div className="spec-value">{DRILLING_RIGS[selectedRig].maxDepth}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Крутящий момент</div>
                      <div className="spec-value">{DRILLING_RIGS[selectedRig].torque}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Масса установки</div>
                      <div className="spec-value">{DRILLING_RIGS[selectedRig].weight}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Транспортировка</div>
                      <div className="spec-value">{DRILLING_RIGS[selectedRig].mobility}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="equip-grid">
                <div className="equip-list">
                  {LAB_EQUIP.map((lab, idx) => (
                    <button
                      key={lab.name}
                      type="button"
                      className={`equip-item-btn ${selectedLab === idx ? 'active' : ''}`}
                      onClick={() => setSelectedLab(idx)}
                    >
                      {lab.name}
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>

                <div className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="cad-crosshairs"></div>
                  
                  <div>
                    <span className="hero-subtitle" style={{ fontSize: '0.7rem', color: 'var(--color-accent-secondary)' }}>
                      LAB MODEL CALIBRATION: OK
                    </span>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{LAB_EQUIP[selectedLab].name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {LAB_EQUIP[selectedLab].description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {LAB_EQUIP[selectedLab].cadSpecs.map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card" style={{ gridColumn: 'span 2' }}>
                      <div className="spec-label">Параметры испытаний</div>
                      <div className="spec-value">{LAB_EQUIP[selectedLab].params}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Целевые свойства</div>
                      <div className="spec-value">{LAB_EQUIP[selectedLab].purpose}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">ГОСТ / Регламент</div>
                      <div className="spec-value" style={{ color: 'var(--color-accent)' }}>{LAB_EQUIP[selectedLab].standard}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== PAGE: DOCUMENTS ==================== */}
        {activePage === 'documents' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Документы и Лицензии</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Разрешительная документация ТОО «СпецИнжГео» на проведение инженерно-изыскательских работ в Казахстане.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {DOCUMENTS_DATA.map(doc => (
                <HudCard key={doc.id} style={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                    {doc.id === 'lic-gsl' && '🛡️'}
                    {doc.id === 'accreditation' && '🔬'}
                    {doc.id.startsWith('iso') && '📜'}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{doc.title}</h3>
                  <span className="spec-label" style={{ color: 'var(--color-accent)', marginBottom: '15px' }}>{doc.subtitle}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{doc.desc}</p>
                  
                  <button className="btn btn-secondary" onClick={() => setCertModal({ title: doc.title, text: doc.desc })} style={{ padding: '8px 16px', fontSize: '0.8rem', width: '100%' }}>
                    Просмотреть документ
                  </button>
                </HudCard>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAGE: CALCULATOR ==================== */}
        {activePage === 'calculator' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Профессиональный Калькулятор Сметы</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Сформируйте официальное коммерческое предложение ТОО «СпецИнжГео» на базе заданных инженерных параметров.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '40px', alignItems: 'flex-start', marginBottom: '60px' }}>
              <HudCard>
                <h3 style={{ marginBottom: '25px', fontSize: '1.2rem' }}>Параметры скважин</h3>
                
                {/* Soil selection */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>Тип грунтов строительного пятна</span>
                    <span>Коэф: x{selectedSoilConfig.coeff}</span>
                  </label>
                  <div className="soil-grid">
                    {Object.entries(SOILS).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        className={`soil-btn ${activeSoil === key ? 'active' : ''}`}
                        onClick={() => {
                          setActiveSoil(key);
                          if (drillDepth < config.minDepth) setDrillDepth(config.minDepth);
                        }}
                      >
                        {key === 'sand' && 'Пески'}
                        {key === 'clay' && 'Глины'}
                        {key === 'loam' && 'Суглинки'}
                        {key === 'rock' && 'Скала'}
                        {key === 'peat' && 'Торф'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depth Slider */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>Проектная глубина выработки (скважины)</span>
                    <span>{drillDepth} м</span>
                  </label>
                  <input 
                    type="range" 
                    min={selectedSoilConfig.minDepth} 
                    max="50" 
                    value={drillDepth}
                    onChange={(e) => setDrillDepth(parseInt(e.target.value))}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Рекомендуемый минимум: {selectedSoilConfig.minDepth} м
                  </span>
                </div>

                {/* Area Slider */}
                <div className="calc-form-group">
                  <label className="calc-label">
                    <span>Площадь пятна фундамента здания</span>
                    <span>{buildArea} м²</span>
                  </label>
                  <input 
                    type="range" 
                    min="50" 
                    max="1500" 
                    step="50"
                    value={buildArea}
                    onChange={(e) => setDrillDepth(parseInt(e.target.value))} // wait, buildArea state update:
                    onChange={(e) => setBuildArea(parseInt(e.target.value))}
                  />
                </div>

                {/* Water Table Toggle */}
                <div className="calc-form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Наличие грунтовых вод (водонасыщенность)</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Удорожание бурения на 15% (откачка, обсадка)</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={waterTable} 
                    onChange={(e) => setWaterTable(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)' }}
                  />
                </div>

                {/* Seismic Selector */}
                <div className="calc-form-group" style={{ marginTop: '20px' }}>
                  <label className="calc-label">Сейсмическая зона площадки</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                      type="button"
                      className={`soil-btn ${seismicZone === '6' ? 'active' : ''}`}
                      onClick={() => setSeismicZone('6')}
                      style={{ flex: 1 }}
                    >
                      6-7 баллов (Астана, Караганда)
                    </button>
                    <button
                      type="button"
                      className={`soil-btn ${seismicZone === '9' ? 'active' : ''}`}
                      onClick={() => setSeismicZone('9')}
                      style={{ flex: 1 }}
                    >
                      9 баллов (Алматы, Шымкент)
                    </button>
                  </div>
                </div>

              </HudCard>

              {/* Printable PDF Letterhead */}
              <div>
                <div className="offer-box">
                  <div className="offer-header">
                    <div>
                      <div className="offer-title">⛰️ ТОО «СпецИнжГео»</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        РК, г. Алматы, info@spengeo.kz | БИН 190440028192
                      </div>
                    </div>
                    <div className="offer-stamp">
                      Проверено СП РК
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '20px', textAlign: 'right' }}>
                    Дата: {new Date().toLocaleDateString('ru-RU')}
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '15px', color: '#0f172a' }}>
                    КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ (РАСЧЕТ СМЕТЫ)
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '20px', lineHeight: '1.5' }}>
                    На основании предоставленных данных по площади застройки ({buildArea} м²), глубине выработок ({drillDepth} м) и литологическому строению грунтов ({selectedSoilConfig.name}), направляем смету изыскательских работ:
                  </p>

                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #0f172a', textAlign: 'left', fontWeight: 'bold' }}>
                        <th style={{ paddingBottom: '8px' }}>Наименование работ</th>
                        <th style={{ paddingBottom: '8px' }}>Объем</th>
                        <th style={{ paddingBottom: '8px' }}>Коэф.</th>
                        <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Сумма KZT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0' }}>Инженерно-геологическое бурение</td>
                        <td>{totalDrillLength} пог.м</td>
                        <td>x{(selectedSoilConfig.coeff * waterCoeff * seismicCoeff).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{estimatedCost.toLocaleString()} ₸</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0' }}>Отбор проб грунтов и воды</td>
                        <td>{sampleCount} проб</td>
                        <td>вкл.</td>
                        <td style={{ textAlign: 'right' }}>0 ₸</td>
                      </tr>
                      <tr style={{ borderBottom: '1.5px solid #0f172a' }}>
                        <td style={{ padding: '8px 0' }}>Составление отчета и экспертиза</td>
                        <td>1 комплект</td>
                        <td>вкл.</td>
                        <td style={{ textAlign: 'right' }}>0 ₸</td>
                      </tr>
                      <tr style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                        <td style={{ padding: '12px 0' }} colSpan="3">ИТОГО К ОПЛАТЕ:</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#b45309' }}>
                          {estimatedCost.toLocaleString()} ₸
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: '1.4', borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                    * Данный расчет является предварительным. Точный расчет сметы производится после согласования технического задания (ТЗ) с проектной организацией.
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" onClick={() => window.print()} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', color: '#000', borderColor: '#cbd5e1' }}>
                      <Printer size={14} /> Распечатать КП
                    </button>
                    <button className="btn btn-cyan" onClick={() => setActivePage('contacts')} style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}>
                      Отправить в СпецИнжГео
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== PAGE: CONTACTS ==================== */}
        {activePage === 'contacts' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>Контакты ТОО «СпецИнжГео»</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                Свяжитесь с нами для выезда инженеров на объект.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'flex-start' }}>
              <div>
                <HudCard style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Офис в г. Алматы</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    📍 050000, Республика Казахстан, г. Алматы, проспект Аль-Фараби
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    📞 Телефон: +7 775 218 28 06 (WhatsApp: +7 705 202 76 66)
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    ✉️ Email: info@spengeo.kz
                  </p>
                </HudCard>

                {/* System Console Monitor */}
                <div style={{ marginBottom: '20px' }}>
                  <span className="spec-label" style={{ color: 'var(--color-cyan)' }}>System Console Monitor (API logger)</span>
                  <div className="terminal-monitor" style={{ marginTop: '10px' }}>
                    {systemLogs.map((log, i) => (
                      <div key={i} className="terminal-line">
                        <span className="timestamp">[{log.time}]</span>
                        <span className={log.type}>&gt; {log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ margin: '0' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Отправить запрос</h3>
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label className="form-label">Ваше имя *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Имя"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Телефон *</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+7"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Вид изысканий</label>
                    <select 
                      className="form-select"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                    >
                      <option value="geology">Инженерная геология</option>
                      <option value="geodesy">Инженерная геодезия</option>
                      <option value="both">Комплекс (Геология + Геодезия)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Детали (Город, площадь, глубина)</label>
                    <textarea 
                      className="form-input" 
                      rows="3"
                      placeholder="Комментарий..."
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Send size={15} /> Отправить
                  </button>

                  {inquiryStatus && (
                    <div className={`status-msg ${inquiryStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
                      {inquiryStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      {inquiryStatus.text}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAGE: ADMIN ==================== */}
        {activePage === 'admin' && (
          <div className="page-wrapper page-enter">
            <div>
              <div className="admin-header">
                <div>
                  <span className="hero-subtitle">ADMIN CONTROL PANEL</span>
                  <h2>Панель обработки заявок</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={() => { setIsVisualBuilder(true); setActivePage('home'); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Edit3 size={14} /> Визуал Билдер
                  </button>
                  <button className="btn btn-secondary" onClick={fetchInquiries} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Обновить БД
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActivePage('home')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    На главную
                  </button>
                </div>
              </div>

                <div className="admin-grid">
                  <div className="admin-sidebar">
                    <div className="admin-stats-card">
                      <span className="spec-label">Всего обращений</span>
                      <div className="admin-stat-num">{inquiries.length} лидов</div>
                    </div>

                    <div className="admin-stats-card">
                      <span className="spec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BarChart2 size={13} /> Аналитика типов работ
                      </span>
                      <div className="bar-chart-container">
                        <div className="bar-item">
                          <div className="bar-fill" style={{ height: `${Math.max(10, (inquiries.filter(i=>i.service_type==='geology').length / Math.max(1, inquiries.length))*120)}px` }}></div>
                          <span className="bar-label">Геология</span>
                        </div>
                        <div className="bar-item">
                          <div className="bar-fill" style={{ height: `${Math.max(10, (inquiries.filter(i=>i.service_type==='geodesy').length / Math.max(1, inquiries.length))*120)}px`, background: 'var(--color-cyan)' }}></div>
                          <span className="bar-label">Геодезия</span>
                        </div>
                        <div className="bar-item">
                          <div className="bar-fill" style={{ height: `${Math.max(10, (inquiries.filter(i=>i.service_type==='both').length / Math.max(1, inquiries.length))*120)}px` }}></div>
                          <span className="bar-label">Комплекс</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Входящие заявки</h3>
                    
                    <div className="inquiry-list">
                      {inquiries.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px', color: 'var(--color-text-muted)' }}>
                          База данных пуста.
                        </div>
                      ) : (
                        inquiries.map(inq => (
                          <div key={inq.id} style={{ position: 'relative' }}>
                            <HudCard>
                              <div className="inquiry-card-header">
                                <div>
                                  <span style={{ fontWeight: 700, fontSize: '1.05rem', marginRight: '10px' }}>{inq.name}</span>
                                  <span className="inquiry-tag" style={{ backgroundColor: inq.service_type === 'geodesy' ? 'var(--color-cyan-glow)' : '', color: inq.service_type === 'geodesy' ? 'var(--color-cyan)' : '' }}>
                                    {inq.service_type}
                                  </span>
                                </div>
                                <span className="inquiry-date">
                                  {new Date(inq.created_at).toLocaleString('ru-RU')}
                                </span>
                              </div>
                              <div className="inquiry-body">
                                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBlock: '8px 12px' }}>{inq.message}</p>
                                <a href={`tel:${inq.phone}`} className="inquiry-contact-link">
                                  <Phone size={13} /> {inq.phone}
                                </a>
                              </div>

                              <button 
                                type="button" 
                                onClick={() => handleClearInquiry(inq.id)}
                                style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                                title="Удалить лид"
                              >
                                <Trash2 size={16} />
                              </button>
                            </HudCard>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Lightbox certificate modals */}
      {certModal && (
        <div className="modal-overlay" onClick={() => setCertModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCertModal(null)}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--color-accent)' }}>
              {certModal.title}
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px' }}>
              {certModal.text}
            </p>
            <div style={{ border: '1px dashed rgba(251,191,36,0.3)', borderRadius: '8px', padding: '50px 20px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <FileText size={48} color="var(--color-accent)" style={{ marginBottom: '12px' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                ТОО «СпецИнжГео» // ЛИЦЕНЗИЯ_ГОС_РЕЕСТР.pdf
              </div>
            </div>
            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setCertModal(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-width Map Before Footer */}
      <section style={{ width: '100%', height: '400px', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(6, 182, 212, 0.1)' }}>
        <MapContainer center={[43.2389, 76.8897]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: '#030509' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={[43.2389, 76.8897]} icon={customGlowIcon}>
            <Popup className="premium-popup">
              <div style={{ padding: '5px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-cyan)', fontSize: '1.1rem' }}>ТОО «СпецИнжГео»</strong><br/>
                <span style={{ color: '#aaa' }}>г. Алматы, пр-т Абая, 150</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--bg-dark), transparent)', pointerEvents: 'none', zIndex: 1000 }}></div>
      </section>

      {/* High-Tech Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/logo.png" alt="SpenGeo Logo" style={{ height: '30px', width: 'auto' }} />
                ТОО «СпецИнжГео»
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
                ТОО «СпецИнжГео» — Лицензированная проектно-изыскательская организация. Геология, геодезия, грунтовая лаборатория во всех регионах Казахстана.
              </p>
            </div>

            <div>
              <h4 className="footer-title">Разделы сайта</h4>
              <ul className="footer-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('home'); logEvent('Footer navigation: Home'); }}>Главная</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('about'); logEvent('Footer navigation: About'); }}>О компании</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('services'); logEvent('Footer navigation: Services'); }}>Услуги изысканий</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('projects'); logEvent('Footer navigation: Projects'); }}>Наши проекты</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setActivePage('admin'); logEvent('Footer navigation: Admin'); }} style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Админ-панель</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-title">Контакты</h4>
              <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
                <li>📍 Республика Казахстан, г. Алматы</li>
                <li>📞 +7 775 218 28 06</li>
                <li>✉️ info@spengeo.kz</li>
                <li>⚙️ API: Go REST Service Port 8083</li>
              </ul>
    </div>

    <div className="service-bento-arrow">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
        <path d="M30 70 L70 30" strokeWidth="4" />
        <path d="M50 30 L70 30 L70 50" strokeWidth="4" />
      </svg>
    </div>
  </div>

          <div className="footer-bottom">
            <div>
              © 2019-{new Date().getFullYear()} ТОО «СпецИнжГео». Лицензия №19004562.
            </div>
            <div>
              Стек: React 19 + Golang 1.26 + CSS Blueprint
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <a href="https://wa.me/77752182806" target="_blank" rel="noopener noreferrer" className="fixed-action-btn whatsapp-btn" title="Написать в WhatsApp">
        <MessageCircle size={28} />
      </a>

      <button className="fixed-action-btn assistant-btn" title="ИИ Ассистент" onClick={() => setIsAssistantOpen(!isAssistantOpen)}>
        {isAssistantOpen ? <X size={28} /> : <Bot size={28} />}
      </button>

      <button 
        className={`fixed-action-btn scroll-top-btn ${showScrollTop ? 'visible' : ''}`} 
        onClick={scrollToTop}
        title="Наверх"
      >
        <ArrowUp size={24} />
      </button>

      {/* AI Assistant Chat Modal */}
      {isAssistantOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '350px',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--color-cyan)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 20px rgba(6, 182, 212, 0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fade-in 0.3s ease-out'
        }}>
          <div style={{ backgroundColor: 'var(--border-accent)', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={20} color="var(--color-cyan)" />
              <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '1rem' }}>SpenGeo AI</span>
            </div>
            <button onClick={() => setIsAssistantOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ height: '300px', overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assistantMsgs.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-cyan)' : 'var(--bg-dark-secondary)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAssistantSend} style={{ display: 'flex', padding: '10px', borderTop: '1px solid var(--border-color)' }}>
            <input 
              type="text" 
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="Введите сообщение..."
              style={{ flex: 1, backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '10px 15px', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.9rem' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', padding: '0 10px', cursor: 'pointer' }}>
              <MessageCircle size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Visual Builder Toolbar */}
      {isVisualBuilder && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--color-accent)', color: 'var(--color-text-primary)', padding: '15px 25px', borderRadius: '30px', zIndex: 9999, display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Edit3 size={20} color="var(--color-accent)" />
            <span style={{ fontWeight: 'bold' }}>VISUAL BUILDER ACTIVE</span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Кликните на текст, чтобы изменить</span>
          <button onClick={() => setIsVisualBuilder(false)} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', minWidth: '120px' }}>
            Сохранить и выйти
          </button>
        </div>
      )}

    </>
  );
}

export default App;
