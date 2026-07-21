import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Hammer, Compass, Award, Phone, ShieldCheck, Mail, 
  MapPin, Send, Cpu, CheckCircle, ChevronRight, Lock, 
  Eye, Trash2, Calendar, FileText, Check, Database, 
  RefreshCw, BarChart2, UserCheck, Menu, X, ArrowUpRight,
  Printer, HardDrive, AlertTriangle, Layers, Clock, Settings,
  BookOpen, FileSpreadsheet, Search, MessageCircle, Bot, ArrowUp, Sun, Moon, Briefcase, Edit3, Folder, Users, Image, Calculator
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
  sand: { name: 'Песок (Песчаный грунт)', coeff: 1.0, color: 'rgba(59, 130, 246, 0.15)', desc: 'Легко бурится, требует обсадки скважин от осыпания.', minDepth: 5, spec: 'СП РК 1.02-104-2020 Прил. А' },
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
  { id: 'bi-skyline', client: 'BI Group', name: 'ЖК «Skyline Almaty»', type: 'Инженерная геология и геодезия', loc: 'г. Алматы', specs: '12 скважин по 35м, штамповые испытания ШВ-60 в суглинках', year: '2025', coords: [43.2389, 76.8897], image: '/images/rig.png' },
  { id: 'bi-expo', client: 'BI Group', name: 'ЖК «Expo Boulevard III»', type: 'Статическое зондирование (CPT)', loc: 'г. Астана', specs: '18 точек CPT на глубину 20м, определение сжимаемости', year: '2024', coords: [51.1293, 71.4305], image: '/images/lab.png' },
  { id: 'air-astana-hangar', client: 'Air Astana', name: 'Новый авиационный ангар', type: 'Комплексные изыскания', loc: 'Аэропорт г. Алматы', specs: 'Бурение Bauer BG28 под буронабивные сваи, 45м глубины', year: '2025', coords: [43.3521, 77.0405], image: '/images/geodesy.png' },
  { id: 'mega-garden-mall', client: 'Mega Garden', name: 'ТРЦ «Mega Garden Almaty»', type: 'Гидрогеология и штампы', loc: 'г. Алматы', specs: 'Опытные откачки воды, модуль деформации гравийных грунтов', year: '2024', coords: [43.2014, 76.8926], image: '/images/rig.png' },
  { id: 'bi-botanic', client: 'BI Group', name: 'ЖК «Botanic Garden»', type: 'Геодезический мониторинг осадков', loc: 'г. Астана', specs: 'Высокоточное нивелирование фундаментов на слабых глинах', year: '2023', coords: [51.1158, 71.4187], image: '/images/lab.png' },
  { id: 'kaz-shaft', client: 'КарагандаУголь', name: 'Шахтный копер шахты Казахстанская', type: 'Сейсмоакустика и скальное бурение', loc: 'Карагандинская обл.', specs: 'Бурение 50м скважин в алевролитах и песчаниках', year: '2023', coords: [49.8019, 73.1021], image: '/images/geodesy.png' }
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
    const handleUpdate = (e) => {
      if (e.detail.id === id) {
        setText(e.detail.text);
        localStorage.setItem(`vb_${id}`, e.detail.text);
      }
    };
    window.addEventListener('vb_update', handleUpdate);
    return () => window.removeEventListener('vb_update', handleUpdate);
  }, [id]);

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
      onClick={(e) => {
        if (isVisualBuilder) {
          e.stopPropagation();
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('vb_select', { detail: { id, text } }));
        }
      }}
      onBlur={(e) => {
        const val = dangerously ? e.currentTarget.innerHTML : e.currentTarget.textContent;
        setText(val);
        if (isVisualBuilder) {
          window.dispatchEvent(new CustomEvent('vb_select', { detail: { id, text: val } }));
        }
      }}
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
        { name: 'История', action: { type: 'page', val: 'about', subpage: 'history' } },
        { name: 'Команда', action: { type: 'page', val: 'about', subpage: 'team' } },
        { name: 'Наши преимущества', action: { type: 'page', val: 'about', subpage: 'advantages' } },
        { name: 'Лицензии и сертификаты', action: { type: 'page', val: 'about', subpage: 'documents' } }
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
        { name: 'Поиск', action: { type: 'page', val: 'projects', subpage: 'search' } },
        { name: 'По регионам', action: { type: 'page', val: 'projects', subpage: 'regions' } },
        { name: 'По услугам', action: { type: 'page', val: 'projects', subpage: 'services' } },
        { name: 'По заказчикам', action: { type: 'page', val: 'projects', subpage: 'clients' } },
        { name: 'Страница проекта', action: { type: 'page', val: 'projects', subpage: 'detail' } }
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
        { name: 'Статьи', action: { type: 'page', val: 'blog', subpage: 'articles' } },
        { name: 'Методы испытаний', action: { type: 'page', val: 'blog', subpage: 'methods' } },
        { name: 'Типы грунтов', action: { type: 'page', val: 'blog', subpage: 'soils' } },
        { name: 'Нормативные документы', action: { type: 'page', val: 'blog', subpage: 'norms' } },
        { name: 'FAQ', action: { type: 'page', val: 'blog', subpage: 'faq' } },
        { name: 'Новости', action: { type: 'page', val: 'blog', subpage: 'news' } },
        { name: 'Фото', action: { type: 'page', val: 'blog', subpage: 'photos' } },
        { name: 'Видео', action: { type: 'page', val: 'blog', subpage: 'videos' } }
      ]
    },
    { title: 'Контакты', page: 'contacts', action: { type: 'page', val: 'contacts' } }
  ]
};


function ImageUploadField({ value, onChange, theme }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const isLight = theme === 'white';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isLight ? '#fff' : '#000', padding: '6px', border: isLight ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '8px', flex: 1, boxShadow: isLight ? 'inset 0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
      {value && <img src={value} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: isLight ? '1px solid #e2e8f0' : '1px solid #222' }} alt="" onError={(e) => { e.target.style.display = 'none'; }} onLoad={(e) => { e.target.style.display = 'block'; }} />}
      <label style={{ background: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.5)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
        <Folder size={14} /> Выбрать
        <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
      <input 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        placeholder="Или вставьте URL ссылки..." 
        style={{ width: '100px', flex: 1, background: 'transparent', border: 'none', color: isLight ? '#0f172a' : '#fff', outline: 'none', padding: '0 5px', fontSize: '0.85rem' }} 
      />
    </div>
  );
}

function App() {

  

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

// === ADMIN DATA FOR BLOCKS ===

  const [adminData, setAdminData] = useState(() => {
    const saved = localStorage.getItem('spengeo_admin_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.team)) {
        parsed.team = parsed.team ? [parsed.team] : [];
      }
      if (!parsed.media) {
        parsed.media = { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" };
      }
      if (!parsed.bot) {
        parsed.bot = { name: 'SPENGEO_ASSISTANT', welcomeMsg: 'Здравствуйте! Я автоматический ассистент СпецИнжГео. Чем могу помочь?', active: true, scenarios: [{ id: Date.now().toString(), keywords: 'цена, стоимость, прайс', answer: 'Для уточнения стоимости инженерных изысканий оставьте заявку, наш специалист свяжется с вами.' }] };
      }
      if (!parsed.articles) {
        parsed.articles = BLOG_POSTS;
      }
      if (!parsed.dynamicLists) {
        parsed.dynamicLists = {};
      }
      if (!parsed.dynamicLists['about_documents'] || parsed.dynamicLists['about_documents'].length === 0) {
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
      

      if (!parsed.dynamicLists['about_history'] || parsed.dynamicLists['about_history'].length === 0) parsed.dynamicLists['about_history'] = DEFAULT_HISTORY;
      if (!parsed.dynamicLists['about_advantages'] || parsed.dynamicLists['about_advantages'].length === 0) parsed.dynamicLists['about_advantages'] = DEFAULT_ADVANTAGES;
      
      if (!parsed.projects || parsed.projects.length === 0) {
        parsed.projects = DETAILED_PROJECTS;
      }
      if (!parsed.team || parsed.team.length === 0) {
        parsed.team = [{ name: 'Шенвизов Рудольф', role: 'Константинович', badge: 'ОСНОВАТЕЛЬ И ГЛАВНЫЙ ГЕОЛОГ', desc: 'Мы строим нашу работу на безупречной точности...', img: '/images/director.png' }];
      }

      if (!parsed.dynamicLists['blog_faq'] || parsed.dynamicLists['blog_faq'].length === 0) parsed.dynamicLists['blog_faq'] = DEFAULT_FAQ;
      if (!parsed.dynamicLists['blog_methods'] || parsed.dynamicLists['blog_methods'].length === 0) parsed.dynamicLists['blog_methods'] = DEFAULT_METHODS;
      if (!parsed.dynamicLists['blog_soils'] || parsed.dynamicLists['blog_soils'].length === 0) parsed.dynamicLists['blog_soils'] = DEFAULT_SOILS;
      if (!parsed.dynamicLists['blog_norms'] || parsed.dynamicLists['blog_norms'].length === 0) parsed.dynamicLists['blog_norms'] = DEFAULT_NORMS;
      
      if (!parsed.seo) {
        parsed.seo = { yandexMetricaId: '', googleAnalyticsId: '' };
      }
      if (!parsed.global) {
        parsed.global = {
          companyName: 'ТОО «СпецИнжГео»',
          phone: '+7 775 218 28 06',
          email: 'info@spengeo.kz',
          address: 'Республика Казахстан, г. Алматы',
          mapCoords: '43.2389, 76.8897'
        };
      }
      if (!parsed.calc) {
        parsed.calc = {
          waterCoeff: 1.15,
          seismicCoeff9: 1.1,
          seismicCoeff6: 1.0,
          holeAreaDivisor: 120,
          drillSpeedPerDay: 22,
          soilSandPrice: 18500,
          soilClayPrice: 22200,
          soilLoamPrice: 20350,
          soilRockPrice: 46250,
          soilPeatPrice: 27750
        };
      }

      return parsed;
    }
    return {
      projects: DETAILED_PROJECTS,
      rigs: DRILLING_RIGS,
      lab: LAB_EQUIP,
      services: Object.entries(SERVICES_DATA).map(([k, v]) => ({ id: k, ...v, image: `/images/services/${k}.jpg` })),
      team: [{ name: 'Шенвизов Рудольф', role: 'Константинович', badge: 'ОСНОВАТЕЛЬ И ГЛАВНЫЙ ГЕОЛОГ', desc: 'Мы строим нашу работу на безупречной точности...', img: '/images/director.png' }],
      articles: BLOG_POSTS,
      dynamicLists: { 'about_documents': DOCUMENTS_DATA },
      media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: { 
        name: 'SPENGEO_ASSISTANT', 
        welcomeMsg: 'Здравствуйте! Я автоматический ассистент СпецИнжГео. Чем могу помочь?', 
        active: true, 
        scenarios: [
          { id: Date.now().toString(), keywords: 'цена, стоимость, прайс', answer: 'Для уточнения стоимости инженерных изысканий оставьте заявку, наш специалист свяжется с вами.' }
        ] 
      },
      calc: {
        waterCoeff: 1.15,
        seismicCoeff9: 1.1,
        seismicCoeff6: 1.0,
        holeAreaDivisor: 120,
        drillSpeedPerDay: 22,
        soilSandPrice: 18500,
        soilClayPrice: 22200,
        soilLoamPrice: 20350,
        soilRockPrice: 46250,
        soilPeatPrice: 27750
      }
    };
  });
  
  useEffect(() => {
    localStorage.setItem('spengeo_admin_data', JSON.stringify(adminData));
  }, [adminData]);

  useEffect(() => {
    const handleSelect = (e) => {
      setActiveEditorElement(e.detail.id);
      setActiveEditorText(e.detail.text);
    };
    window.addEventListener('vb_select', handleSelect);
    return () => window.removeEventListener('vb_select', handleSelect);
  }, []);

  const markerRefs = useRef({});
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    return ['home', 'about', 'services', 'projects', 'equipment', 'blog', 'documents', 'calculator', 'contacts', 'admin'].includes(path) ? path : 'home';
  });
  
  const SEO_METADATA = {
    home: { title: "Инженерные изыскания под ключ в Казахстане | СпецИнжГео", desc: "ТОО 'СпецИнжГео' — инженерно-геологические, геодезические, топографические изыскания и лабораторный анализ грунтов по всей территории Республики Казахстан." },
    about: { title: "О компании | СпецИнжГео", desc: "Узнайте о 'СпецИнжГео' — лидере в сфере инженерных изысканий в Казахстане. Наша миссия, команда экспертов и современное оборудование." },
    services: { title: "Наши услуги: Геология, Геодезия, Экология | СпецИнжГео", desc: "Полный комплекс инженерных изысканий для строительства: геологические, геодезические, экологические и гидрометеорологические исследования." },
    projects: { title: "Реализованные проекты | СпецИнжГео", desc: "Ознакомьтесь с портфолио успешно завершенных проектов ТОО 'СпецИнжГео' по всему Казахстану. Бурение, топосъемка, лаборатория." },
    equipment: { title: "Наша техника и оборудование | СпецИнжГео", desc: "Современный парк буровой спецтехники, включая установки Bauer BG28, ПБУ-2 и высокоточное геодезическое оборудование." },
    documents: { title: "Лицензии и сертификаты | СпецИнжГео", desc: "Официальные лицензии, сертификаты и аккредитации ТОО 'СпецИнжГео' на проведение инженерных изысканий в Казахстане." },
    calculator: { title: "Калькулятор стоимости изысканий | СпецИнжГео", desc: "Рассчитайте предварительную стоимость инженерно-геологических изысканий с помощью нашего онлайн-калькулятора." },
    contacts: { title: "Контакты | СпецИнжГео", desc: "Свяжитесь с нами для заказа инженерных изысканий. Адрес офиса, телефоны, email и форма обратной связи." }
  };

  useEffect(() => {
    if (activePage === 'home') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/${activePage}`);
    }
    
    // Dynamic SEO Updates
    const seo = SEO_METADATA[activePage] || SEO_METADATA.home;
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.desc);
    }
  }, [activePage]);
  const [language, setLanguage] = useState('ru');
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [certModal, setCertModal] = useState(null);

  // Visual Builder States
  useEffect(() => {
    // Yandex Metrica
    if (adminData?.seo?.yandexMetricaId) {
      const ymId = adminData.seo.yandexMetricaId;
      if (!document.getElementById('yandex-metrica-script')) {
        const script = document.createElement('script');
        script.id = 'yandex-metrica-script';
        script.type = 'text/javascript';
        script.innerHTML = `
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${ymId}, "init", {
               clickmap:true,
               trackLinks:true,
               accurateTrackBounce:true,
               webvisor:true
          });
        `;
        document.head.appendChild(script);
      }
    }

    // Google Analytics
    if (adminData?.seo?.googleAnalyticsId) {
      const gaId = adminData.seo.googleAnalyticsId;
      if (!document.getElementById('google-analytics-script')) {
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        const script2 = document.createElement('script');
        script2.id = 'google-analytics-script';
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(script2);
      }
    }
  }, [adminData?.seo?.yandexMetricaId, adminData?.seo?.googleAnalyticsId]);

  const [isVisualBuilder, setIsVisualBuilder] = useState(false);
  const [activeEditorElement, setActiveEditorElement] = useState(null);
  const [activeEditorText, setActiveEditorText] = useState("");
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
  const [theme, setTheme] = useState('white');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
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
  const [activeAdminSection, setActiveAdminSection] = useState('dashboard');
  const [activeArticle, setActiveArticle] = useState(null);
  const dynamicMenu = adminData.menu || MENU_STRUCTURE;
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);

  // Calculations
  const calcConfig = adminData.calc || { waterCoeff: 1.15, seismicCoeff9: 1.1, seismicCoeff6: 1.0, holeAreaDivisor: 120, drillSpeedPerDay: 22, soilSandPrice: 18500, soilClayPrice: 22200, soilLoamPrice: 20350, soilRockPrice: 46250, soilPeatPrice: 27750 };
  const currentSoils = {
    sand: { ...SOILS.sand, price: calcConfig.soilSandPrice || 18500 },
    clay: { ...SOILS.clay, price: calcConfig.soilClayPrice || 22200 },
    loam: { ...SOILS.loam, price: calcConfig.soilLoamPrice || 20350 },
    rock: { ...SOILS.rock, price: calcConfig.soilRockPrice || 46250 },
    peat: { ...SOILS.peat, price: calcConfig.soilPeatPrice || 27750 }
  };
  const selectedSoilConfig = currentSoils[activeSoil];
  
  const holeCount = Math.max(3, Math.ceil(buildArea / calcConfig.holeAreaDivisor) + (seismicZone === '9' ? 1 : 0));
  const totalDrillLength = holeCount * drillDepth;
  const waterCoeff = waterTable ? calcConfig.waterCoeff : 1.0;
  const seismicCoeff = seismicZone === '9' ? calcConfig.seismicCoeff9 : calcConfig.seismicCoeff6;
  const estimatedCost = Math.round(totalDrillLength * selectedSoilConfig.price * waterCoeff * seismicCoeff);
  const estimatedDuration = Math.max(3, Math.ceil(totalDrillLength / calcConfig.drillSpeedPerDay));
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

  const currentProjects = adminData.projects && adminData.projects.length > 0 ? adminData.projects : DETAILED_PROJECTS;
  const filteredProjects = currentProjects.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
    p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.loc.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <>
      <div style={{
        ...(isVisualBuilder ? { paddingTop: '60px', paddingLeft: '300px', paddingRight: '300px', height: '100vh', overflow: 'hidden', background: '#0a0a0a', transition: 'all 0.3s ease' } : {}),
        '--crust-bg': adminData.media?.crustBg ? `url(${adminData.media.crustBg})` : 'url(/images/geodesy_surface_bg.png)',
        '--aquifers-bg': adminData.media?.aquifersBg ? `url(${adminData.media.aquifersBg})` : 'url(/images/geology_bg_2.png)',
        '--mantle-bg': adminData.media?.mantleBg ? `url(${adminData.media.mantleBg})` : 'url(/images/geology_bg_3.png)'
      }}>
        <div style={isVisualBuilder ? { height: '100%', width: '100%', overflowY: 'auto', position: 'relative', boxShadow: '0 0 50px rgba(0,0,0,0.8)', borderLeft: '1px solid #333', borderRight: '1px solid #333', backgroundColor: 'var(--bg-main)' } : {}}>
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
                <span>БЭКЕНД: GOLANG | ФРОНТЕНД: REACT | ЛИЦЕНЗИЯ: ГСЛ №19004562</span>
              </div>
            </div>
          </div>

          {/* Modern Grid Navigation Bar */}
          <header className="header">
            <div className="container nav-container">
              <a href="/" className="logo" onClick={(e) => { e.preventDefault(); setActivePage('home'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/images/logo.png" alt="SpenGeo Logo" style={{ height: '45px', width: 'auto' }} />
                <span>Спец<span>Инж</span>Гео</span>
              </a>

              <nav className="desktop-nav">
                <ul className="nav-links">
                  {(dynamicMenu[language] || dynamicMenu.ru).map((menu, i) => (
                    <li key={i} className={menu.items ? "nav-item-with-dropdown" : ""}>
                      <a 
                        href={menu.action && menu.action.type === 'page' ? (menu.action.val === 'home' ? '/' : `/${menu.action.val}`) : '#'}
                        className={`nav-btn ${activePage === menu.page || (menu.page === 'about' && activePage === 'documents') ? 'active' : ''}`} 
                        onClick={(e) => {
                          if (menu.action && menu.action.type === 'page') e.preventDefault();
                          if (menu.action) {
                            if (menu.action.type === 'page') {
                              setActivePage(menu.action.val);
                              setActiveSubPage(menu.action.subpage || null);
                            }
                          }
                        }}
                      >
                        {menu.title}
                      </a>
                      
                      {menu.items && (
                        <div className={`dropdown-menu ${menu.columns ? 'dropdown-menu-wide' : ''}`}>
                          {menu.items.map((item, j) => (
                            <a 
                              key={j} 
                              href={item.action.type === 'page' ? (item.action.val === 'home' ? '/' : `/${item.action.val}`) : '#'}
                              className="dropdown-item" 
                              onClick={(e) => {
                                if (item.action.type === 'page' || item.action.type === 'service' || item.action.type === 'equip') e.preventDefault();
                                if (item.action.type === 'page') {
                                  setActivePage(item.action.val);
                                  setActiveSubPage(item.action.subpage || null);
                                } else if (item.action.type === 'scroll') {
                                  e.preventDefault();
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
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} className="header-actions">
                
                <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--color-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Переключить тему">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <a href={`tel:${(adminData.global?.phone || '+7 775 218 28 06').replace(/[^\d+]/g, '')}`} className="header-phone-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-cyan)', color: '#07090e', padding: '8px 16px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                  <Phone size={16} /> {adminData.global?.phone || '+7 775 218 28 06'}
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
                  <li><a href="/about" onClick={(e) => { e.preventDefault(); setActivePage('about'); setIsMobileMenuOpen(false); }}>{t.nav.about}</a></li>
                  <li><a href="/services" onClick={(e) => { e.preventDefault(); setActivePage('services'); setIsMobileMenuOpen(false); }}>{t.nav.services}</a></li>
                  <li><a href="/projects" onClick={(e) => { e.preventDefault(); setActivePage('projects'); setIsMobileMenuOpen(false); }}>{t.nav.projects}</a></li>
                  <li><a href="/equipment" onClick={(e) => { e.preventDefault(); setActivePage('equipment'); setIsMobileMenuOpen(false); }}>{t.nav.equipment}</a></li>
                  <li><a href="/calculator" onClick={(e) => { e.preventDefault(); setActivePage('calculator'); setIsMobileMenuOpen(false); }}>{t.nav.calculator}</a></li>
                  <li><a href="/contacts" onClick={(e) => { e.preventDefault(); setActivePage('contacts'); setIsMobileMenuOpen(false); }}>{t.nav.contacts}</a></li>
                  
                </ul>
                <div className="mobile-nav-footer">
                  
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
               <EditableText id="clients_subtitle" defaultText="НАМ ДОВЕРЯЮТ" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }} />
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
              
              <section className="container bento-grid" style={{ paddingBottom: '100px', position: 'relative', zIndex: 10 }}>
                {/* 2x2 Large Card */}
                <div className="glow-card-premium bento-card bento-large float-slow">
                  <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.03 }}><Hammer size={300} /></div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '30px', display: 'inline-block', width: 'max-content' }}>
                    <Hammer size={32} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_wells" defaultText={t.stats.wells} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '15px', color: 'var(--color-text-primary)' }} />
                  <EditableText id="stats_wells_val" defaultText="1,420+" isVisualBuilder={isVisualBuilder} as="div" className="spec-val" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)', fontWeight: 900, color: 'var(--color-accent)', fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: '20px', textShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }} />
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
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', width: 'max-content' }}>
                    <Award size={24} color="var(--color-accent)" />
                  </div>
                  <EditableText id="stats_standards" defaultText={t.stats.standards} isVisualBuilder={isVisualBuilder} className="spec-label" style={{ marginBottom: '10px' }} />
                  <EditableText id="stats_standards_val" defaultText="100%" isVisualBuilder={isVisualBuilder} as="div" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: '15px', textShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }} />
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
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '50%', color: 'var(--color-accent)' }}><Settings size={24}/></div>
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
      <img src={adminData.services.find(s => s.id === 'geology')?.image || "/images/services/geology.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
      <img src={adminData.services.find(s => s.id === 'geodesy')?.image || "/images/services/geodesy.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
      <img src={adminData.services.find(s => s.id === 'cpt')?.image || "/images/services/cpt.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
      <img src={adminData.services.find(s => s.id === 'piles')?.image || "/images/services/piles.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
      <img src={adminData.services.find(s => s.id === 'plates')?.image || "/images/services/plates.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
      <img src={adminData.services.find(s => s.id === 'laboratory')?.image || "/images/services/laboratory.jpg"} onError={(e) => { e.target.src='/images/hero.png'; e.target.style.filter='brightness(0.7)'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} alt="Service" />
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
              <div style={{ textAlign: 'center', marginBottom: '40px', background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.95)', padding: '40px 20px', borderRadius: '30px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)' }} className="map-header-card">
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

                    {currentProjects.map(proj => (
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
                <div style={{ flex: '1 1 35%', display: 'flex', flexDirection: 'column', gap: '15px', height: '600px', overflowY: 'auto', padding: '25px', background: theme === 'dark' ? 'var(--bg-dark)' : 'rgba(255,255,255,0.95)', borderRadius: '24px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', boxShadow: theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)' }} className="projects-list-scroll">
                  {filteredProjects.map(proj => {
                    const isActive = activeProjectCoords === proj.coords;
                    return (
                      <div 
                        key={proj.id} 
                        style={{
                          position: 'relative',
                          padding: '15px 25px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: 1,
                          background: isActive ? (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                          borderLeft: isActive ? '3px solid var(--color-cyan)' : '3px solid transparent',
                          borderRadius: '16px'
                        }}
                        onClick={() => {
                          setActiveProjectCoords(proj.coords);
                          setActiveMapZoom(13);
                          setTimeout(() => {
                            const marker = markerRefs.current[proj.id];
                            if (marker) marker.openPopup();
                          }, 1500); // Wait for flyTo animation to finish
                        }}
                      >
                        {/* Decorative Background Bubble (Пузырь) */}
                        <div style={{ position: 'absolute', top: '10px', left: '15px', width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--color-cyan)', opacity: theme === 'dark' ? 0.15 : 0.25, zIndex: 0, transition: 'all 0.3s ease', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}></div>
                        
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {proj.client}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                          {proj.name}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          <MapPin size={16} color="var(--color-cyan)" /> {proj.loc}
                        </div>
                        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
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
                <EditableText id="approach_label_v3" defaultText="ИНДИВИДУАЛЬНЫЙ ПОДХОД" isVisualBuilder={isVisualBuilder} className="hero-subtitle" style={{ color: 'var(--color-accent)', textShadow: '0 0 15px rgba(59, 130, 246, 0.6)' }} />
                <EditableText as="h2" id="approach_title_v3" defaultText={t.sections.approachTitle} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 40px rgba(255,255,255,0.2)', maxWidth: '900px', margin: '0 auto 20px auto' }} />
                <EditableText as="p" id="approach_desc" defaultText={t.sections.approachDesc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', position: 'relative', zIndex: 2, alignItems: 'stretch' }}>
                {/* Card 1 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">01</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <Search size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c1_t" defaultText={t.sections.approach1Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <EditableText as="p" id="app_c1_d" defaultText={t.sections.approach1Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, flex: 1 }} />
                </div>

                {/* Card 2 */}
                <div className="approach-card-premium approach-card-center">
                  <div className="approach-watermark">02</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}>
                    <Briefcase size={36} color="var(--color-accent)" />
                  </div>
                  <EditableText as="h3" id="app_c2_t" defaultText={t.sections.approach2Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c2_l1" dangerously={true} defaultText={t.sections.approach2L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l2" dangerously={true} defaultText={t.sections.approach2L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l3" dangerously={true} defaultText={t.sections.approach2L3} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c2_l4" dangerously={true} defaultText={t.sections.approach2L4} isVisualBuilder={isVisualBuilder} />
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="approach-card-premium">
                  <div className="approach-watermark">03</div>
                  <div className="license-icon-glow" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}>
                    <ShieldCheck size={36} color="var(--color-cyan)" />
                  </div>
                  <EditableText as="h3" id="app_c3_t" defaultText={t.sections.approach3Title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)', lineHeight: 1.4 }} />
                  <EditableText as="p" id="app_c3_d" defaultText={t.sections.approach3Text} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }} />
                  <ul style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6, paddingLeft: '20px', margin: 0, flex: 1 }}>
                    <EditableText as="li" id="app_c3_l1" dangerously={true} defaultText={t.sections.approach3L1} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c3_l2" dangerously={true} defaultText={t.sections.approach3L2} isVisualBuilder={isVisualBuilder} style={{ marginBottom: '12px' }} />
                    <EditableText as="li" id="app_c3_l3" dangerously={true} defaultText={t.sections.approach3L3} isVisualBuilder={isVisualBuilder} />
                  </ul>
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
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                  <img src={adminData.team[0]?.img || '/images/director.png'} alt="Шенвизов Рудольф Константинович" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1)', maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }}></div>
                </div>
                
                <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'var(--color-cyan)', opacity: 0.05, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>“</div>
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <EditableText as="h3" id="f_name" defaultText="Шенвизов Рудольф" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }} />
                    <EditableText as="h3" id="f_patr" defaultText="Константинович" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }} />
                    
                    <EditableText as="div" id="f_role" defaultText="Основатель и Главный Геолог" isVisualBuilder={isVisualBuilder} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600 }} />
                    
                    <EditableText as="p" id="f_quote" defaultText="Мы строим нашу работу на безупречной точности и строгом соответствии регламентам СП РК и ГОСТ. С 2019 года наша команда опытных буровых инженеров, геодезистов и лаборантов успешно реализует сложнейшие проекты по всему Казахстану, обеспечивая прочный фундамент для каждого объекта." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.15rem', lineHeight: 1.8, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px', position: 'relative' }} />
                    
                    <div>
                      <button className="btn btn-primary" onClick={() => setActivePage('about')} style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(6, 182, 212, 0.2)' }}>
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
                {(adminData.dynamicLists?.['about_documents'] || DOCUMENTS_DATA).slice(0, 3).map((doc, idx) => { doc.id = doc.id || idx; return (
                  <div key={doc.id || Math.random()} className="glow-card-premium" style={{ padding: '40px 30px', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* Background faint huge icon */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={250} />}
                      {doc.id === 'accreditation' && <Award size={250} />}
                      {doc.id.startsWith('iso') && <FileText size={250} />}
                    </div>
                    
                    {/* Glowing front icon */}
                    <div style={{ background: doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.1)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '25px', display: 'inline-flex', position: 'relative', zIndex: 2 }}>
                      {doc.id === 'lic-gsl' && <ShieldCheck size={40} color="#ef4444" />}
                      {doc.id === 'accreditation' && <Award size={40} color="var(--color-cyan)" />}
                      {doc.id.startsWith('iso') && <FileText size={40} color="var(--color-accent)" />}
                    </div>
                    
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: 'var(--color-text-primary)', fontWeight: 800, position: 'relative', zIndex: 2, lineHeight: 1.4 }}>{doc.title}</h3>
                    <span className="spec-label" style={{ color: doc.id === 'lic-gsl' ? '#ef4444' : doc.id === 'accreditation' ? 'var(--color-cyan)' : 'var(--color-accent)', fontSize: '0.9rem', letterSpacing: '0.15em', textShadow: `0 0 10px ${doc.id === 'lic-gsl' ? 'rgba(239, 68, 68, 0.4)' : doc.id === 'accreditation' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`, position: 'relative', zIndex: 2 }}>{doc.subtitle}</span>
                  </div>
                ); })}
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
            <div key={activeSubPage || 'main'} style={{ marginBottom: '50px' }}>
              <EditableText
                as="h2"
                id={`about_title_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                defaultText={
                  activeSubPage === 'history' ? 'История компании' : 
                  activeSubPage === 'team' ? 'Наша команда' : 
                  activeSubPage === 'advantages' ? 'Наши преимущества' :
                  'О компании ТОО «СпецИнжГео»'
                }
              />
              <EditableText
                as="p"
                id={`about_desc_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                style={{ color: 'var(--color-text-secondary)' }}
                defaultText={
                  activeSubPage === 'history' ? 'Путь развития нашей компании с 2019 года до сегодняшнего дня.' : 
                  activeSubPage === 'team' ? 'Познакомьтесь с нашими ведущими инженерами и специалистами.' : 
                  activeSubPage === 'advantages' ? 'Узнайте, почему нам доверяют крупнейшие строительные компании.' :
                  'Комплексные инженерные изыскания для промышленного и гражданского строительства с 2019 года.'
                }
              />
            </div>

            {(!activeSubPage || activeSubPage === 'history') && (
              <>
              <div className="glow-card-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0', alignItems: 'stretch', padding: '0', overflow: 'hidden', position: 'relative', zIndex: 2, background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 0 50px rgba(0,0,0,0.1)', marginBottom: '60px' }}>
                  <div style={{ position: 'relative', minHeight: '500px', overflow: 'hidden' }}>
                    <img src={adminData.team[0]?.img || adminData.team[0]?.image || '/images/director.png'} alt={adminData.team[0]?.name || "Генеральный директор"} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'contrast(1.1)', maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--color-cyan)', filter: 'blur(100px)', opacity: 0.15, zIndex: 0 }}></div>
                  </div>
                  
                  <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-10px', left: '20px', fontSize: '15rem', color: 'var(--color-cyan)', opacity: 0.05, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>“</div>
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <EditableText as="h3" id="ceo_name_first" defaultText="Шенвизов Рудольф" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.8rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }} />
                      <EditableText as="h3" id="ceo_name_last" defaultText="Константинович" isVisualBuilder={isVisualBuilder} style={{ fontSize: '2.2rem', marginBottom: '25px', color: 'var(--color-text-secondary)', fontWeight: 400 }} />
                      
                      <EditableText as="div" id="ceo_badge" defaultText="Основатель и Главный Геолог" isVisualBuilder={isVisualBuilder} style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '20px', color: 'var(--color-cyan)', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '35px', fontWeight: 600 }} />
                      
                      <EditableText as="p" id="ceo_desc" dangerously={true} defaultText="Рудольф Константинович основал компанию в 2019 году в городе Алматы. Получив геологическое образование в Сибирском государственном университете (г. Томск, РФ), он собрал команду опытных буровых инженеров, геодезистов и лаборантов.<br /><br />Основным принципом работы компании является жесткое следование строительным регламентам СП РК и ГОСТ. Благодаря этому отчеты ТОО «СпецИнжГео» успешно и быстро проходят государственную вневедомственную экспертизу." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, position: 'relative', zIndex: 2, fontStyle: 'italic', borderLeft: '3px solid var(--color-cyan)', paddingLeft: '25px' }} />
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px', marginBottom: '60px' }}>
                  {(adminData.dynamicLists?.['about_history'] || DEFAULT_HISTORY).map((hist, i) => (
                    <HudCard key={i} style={{ padding: '25px', borderLeft: '4px solid var(--color-cyan)' }}>
                      <EditableText as="h3" id={`hist_title_${i}`} defaultText={hist.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '2rem', color: 'var(--color-text-primary)', marginBottom: '10px' }} />
                      <EditableText as="p" id={`hist_desc_${i}`} defaultText={hist.desc} isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }} />
                    </HudCard>
                  ))}
                </div>
              </>
            )}

            {activeSubPage === 'team' && (
              <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                  {(adminData.team || []).map((member, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ position: 'relative', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div className="hud-bracket hud-bracket-tl"></div><div className="hud-bracket hud-bracket-tr"></div><div className="hud-bracket hud-bracket-bl"></div><div className="hud-bracket hud-bracket-br"></div>
                        <img src={member.img || member.image || '/images/director.png'} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)' }}></div>
                      </div>
                      <div>
                        <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--color-card-bg)', border: '1px solid var(--color-cyan)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '0.1em' }}>
                          {member.badge || 'СПЕЦИАЛИСТ'}
                        </div>
                        <h3 style={{ fontSize: '2.2rem', marginBottom: '5px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{member.name}</h3>
                        <div style={{ fontSize: '1.1rem', color: 'var(--color-accent)', marginBottom: '20px', fontWeight: '500' }}>
                          {member.role || member.position}
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, borderLeft: '3px solid var(--color-cyan)', paddingLeft: '20px', fontStyle: 'italic' }}>
                          {member.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!activeSubPage || activeSubPage === 'advantages') && (
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
            )}

            {activeSubPage && activeSubPage !== 'history' && activeSubPage !== 'team' && activeSubPage !== 'advantages' && adminData.dynamicLists?.['about_' + activeSubPage] && adminData.dynamicLists['about_' + activeSubPage].length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                {adminData.dynamicLists['about_' + activeSubPage].map((item, idx) => (
                  <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                     {item.image && (
                         <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                     )}
                     <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                         {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                         {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                     </div>
                  </HudCard>
                ))}
              </div>
            )}
          </div>
        )}
        {/* END SERVICES */}

        {/* ==================== PAGE: SERVICES ==================== */}
        {activePage === 'services' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <EditableText as="h2" id="services_title" defaultText="Инженерные Услуги" isVisualBuilder={isVisualBuilder} />
              <EditableText as="p" id="services_desc" defaultText="Лицензированные изыскания «под ключ» по всей территории РК." isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)' }} />
            </div>

            <div className="equip-grid" style={{ marginBottom: '50px' }}>
              <div className="equip-list">
                {adminData.services.map((item, index) => {
                  const key = item.id || `service-${index}`;
                  const Icon = SERVICES_DATA[key]?.icon || ChevronRight;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`equip-item-btn ${activeServiceTab === key ? 'active' : ''}`}
                      onClick={() => setActiveServiceTab(key)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} />
                        {item.title}
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </div>

              {/* Sub-item detailed specs */}
              <div key={activeServiceTab} className="cad-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="cad-crosshairs"></div>
                {(() => {
                  const currentService = adminData.services.find((s, idx) => (s.id || `service-${idx}`) === activeServiceTab) || adminData.services[0];
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span className="hero-subtitle" style={{ fontSize: '0.72rem', color: 'var(--color-accent-secondary)', margin: 0 }}>
                          УСЛУГА // <EditableText id={`service_code_${activeServiceTab || '0'}`} defaultText={currentService.code} isVisualBuilder={isVisualBuilder} />
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-accent)' }}>
                          СТАНДАРТ: <EditableText id={`service_reg_${activeServiceTab || '0'}`} defaultText={currentService.reg} isVisualBuilder={isVisualBuilder} />
                        </span>
                      </div>
                      
                      <EditableText as="h3" id={`service_title_${activeServiceTab || '0'}`} defaultText={currentService.title} isVisualBuilder={isVisualBuilder} style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '20px' }} />

                      {currentService.image && (
                        <div className="service-img-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
                          <img src={currentService.image} alt={activeServiceTab} style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                          <div className="service-img-overlay"></div>
                        </div>
                      )}
                      
                      <EditableText as="p" id={`service_desc_${activeServiceTab || '0'}`} defaultText={currentService.desc} isVisualBuilder={isVisualBuilder} style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '30px' }} />
                    </div>
                  );
                })()}

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
              <EditableText as="h3" id="services_lifecycle" defaultText="🚀 Жизненный цикл инженерных изысканий" isVisualBuilder={isVisualBuilder} style={{ marginBottom: '30px', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', position: 'relative' }}>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>1</div>
                  <EditableText as="h4" id="lifecycle_t1" defaultText="Техзадание" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d1" defaultText="Согласование ТЗ и расчет глубины" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>2</div>
                  <EditableText as="h4" id="lifecycle_t2" defaultText="Полевой этап" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d2" defaultText="Мобилизация техники, бурение скважин" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>3</div>
                  <EditableText as="h4" id="lifecycle_t3" defaultText="Лаборатория" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d3" defaultText="Анализ прочности грунтов" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-cyan-glow)', border: '2px solid var(--color-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>4</div>
                  <EditableText as="h4" id="lifecycle_t4" defaultText="Камералка" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d4" defaultText="Составление отчета и 3D-разрезов" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-glow)', border: '2px solid var(--color-success)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 12px', fontWeight: 'bold' }}>5</div>
                  <EditableText as="h4" id="lifecycle_t5" defaultText="Экспертиза" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.9rem', marginBottom: '5px' }} />
                  <EditableText as="p" id="lifecycle_d5" defaultText="Сопровождение в Госэкспертизе РК" isVisualBuilder={isVisualBuilder} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }} />
                </div>
              </div>
            </HudCard>
          </div>
        )}

        {/* ==================== PAGE: PROJECTS ==================== */}
        {activePage === 'projects' && (
          <div className="page-wrapper page-enter">
            <div key={activeSubPage || 'main'} style={{ marginBottom: '50px' }}>
              <EditableText
                as="h2"
                id={`projects_title_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                defaultText={
                  activeSubPage === 'regions' ? 'Проекты по регионам' :
                  activeSubPage === 'services' ? 'Проекты по видам услуг' :
                  activeSubPage === 'clients' ? 'Проекты по заказчикам' :
                  activeSubPage === 'detail' ? 'Страница проекта' :
                  'Завершенные Проекты ТОО «СпецИнжГео»'
                }
              />
              <EditableText
                as="p"
                id={`projects_desc_${activeSubPage || 'main'}`}
                isVisualBuilder={isVisualBuilder}
                style={{ color: 'var(--color-text-secondary)' }}
                defaultText="Архив инженерно-геологических отчетов и геодезической привязки (более 50 крупных объектов)."
              />
            </div>

            {activeSubPage === 'detail' ? (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Детальная страница проекта в разработке</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Выберите проект из списка чтобы просмотреть его карточку.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('search')} style={{ marginTop: '20px' }}>Вернуться к поиску</button>
              </div>
            ) : (
              <>
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
                  {filteredProjects.map(proj => {
                    const fallbackImg = currentProjects.find(d => d.id === proj.id)?.image || '/images/rig.png';
                    const finalImg = proj.image || fallbackImg;
                    return (
                    <HudCard key={proj.id} style={{ padding: '25px', display: 'flex', flexDirection: 'column' }}>
                      <img src={finalImg} alt={proj.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                      <span className="spec-label" style={{ color: 'var(--color-accent)' }}>{proj.client}</span>
                      <h3 style={{ fontSize: '1.2rem', marginBlock: '8px 12px', color: 'var(--color-text-primary)' }}>{proj.name}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        <span>📍 Локация: {proj.loc}</span>
                        <span>⚙️ Вид работ: {proj.type}</span>
                        <span>📊 Спецификация: {proj.specs}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '10px', color: 'var(--color-text-muted)' }}>ГОД СДАЧИ: {proj.year || '2025'} // STATUS: ARCHIVED_OK</span>
                      </div>
                    </HudCard>
                    );
                  })}
                </div>

                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <Database size={32} color="var(--color-accent-secondary)" style={{ marginBottom: '10px', marginInline: 'auto' }} />
                  <h4 style={{ marginBottom: '6px' }}>В архиве содержится еще около 50 завершенных объектов</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginInline: 'auto' }}>
                    Все изыскания внесены в единую государственную базу градостроительного кадастра РК. Для получения архивных геологических разрезов смежных участков обратитесь в отдел продаж.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== PAGE: BLOG ==================== */}
        {activePage === 'blog' && (
          <div className="page-wrapper page-enter">
            <div style={{ marginBottom: '50px' }}>
              <h2>
                {activeSubPage === 'methods' ? 'Методы испытаний' :
                 activeSubPage === 'soils' ? 'Типы грунтов' :
                 activeSubPage === 'norms' ? 'Нормативные документы' :
                 activeSubPage === 'faq' ? 'Часто задаваемые вопросы' :
                 activeSubPage === 'news' ? 'Новости' :
                 activeSubPage === 'photos' ? 'Фотогалерея' :
                 activeSubPage === 'videos' ? 'Видеоматериалы' :
                 'База знаний / Статьи'}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Профессиональные материалы о геологии, статическом зондировании CPT и нормах СП РК.
              </p>
            </div>

            {(!activeSubPage || activeSubPage === 'articles') ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                  {(adminData.articles || []).map(post => (
                    <HudCard key={post.id} style={{ padding: '30px' }}>
                      
                      {post.image && (
                          <div style={{ margin: '-30px -30px 20px -30px', height: '180px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                             <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                      )}
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
                        <button className="btn btn-secondary" onClick={() => { logEvent(`Opened article: ${post.title}`); setActiveArticle(post); }} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
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
              </>
            ) : adminData.dynamicLists?.['blog_' + activeSubPage] && adminData.dynamicLists['blog_' + activeSubPage].length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                {adminData.dynamicLists['blog_' + activeSubPage].map((item, idx) => (
                  <HudCard key={item.id || idx} style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                     {item.image && (
                         <div style={{ width: '100%', height: '220px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
                            {item.image.includes('youtube.com') || item.image.includes('youtu.be') || item.image.includes('vimeo.com') ? (
                                <iframe width="100%" height="100%" src={item.image.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} frameBorder="0" allowFullScreen></iframe>
                            ) : item.image.startsWith('data:video/') || item.image.startsWith('blob:') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') || activeSubPage === 'videos' ? (
                                <video src={item.image} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                         </div>
                     )}
                     <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {item.title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>}
                         {item.coeff && <span style={{ display: 'inline-block', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cyan)', borderRadius: '4px', fontSize: '0.85rem', width: 'fit-content' }}>{item.coeff}</span>}
                         {item.desc && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.desc}</p>}
                     </div>
                  </HudCard>
                ))}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed var(--color-cyan)', borderRadius: '12px', marginBottom: '60px', background: 'rgba(6, 182, 212, 0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--color-cyan)' }}>Раздел "{activeSubPage}" в стадии наполнения</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Наши редакторы готовят экспертный контент для этого раздела. Пожалуйста, загляните позже.</p>
                <button className="btn btn-secondary" onClick={() => setActiveSubPage('articles')} style={{ marginTop: '20px' }}>Смотреть основные статьи</button>
              </div>
            )}
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
                  {(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS).map((rig, idx) => (
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
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {((typeof (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs === 'string' ? (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs.split(',').map(s=>s.trim()) : (adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.cadSpecs) || []).map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card">
                      <div className="spec-label">Глубина бурения</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.maxDepth}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Крутящий момент</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.torque}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Масса установки</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.weight}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Транспортировка</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS)[selectedRig]?.mobility}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="equip-grid">
                <div className="equip-list">
                  {(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP).map((lab, idx) => (
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
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '15px' }}>{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.name}</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '30px' }}>
                      {(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                      {((typeof (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs === 'string' ? (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs.split(',').map(s=>s.trim()) : (adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.cadSpecs) || []).map(spec => (
                        <span key={spec} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '4px', color: 'var(--color-accent)' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-card" style={{ gridColumn: 'span 2' }}>
                      <div className="spec-label">Параметры испытаний</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.params}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">Целевые свойства</div>
                      <div className="spec-value">{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.purpose}</div>
                    </div>
                    <div className="spec-card">
                      <div className="spec-label">ГОСТ / Регламент</div>
                      <div className="spec-value" style={{ color: 'var(--color-accent)' }}>{(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP)[selectedLab]?.standard}</div>
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
              {(adminData.dynamicLists?.['about_documents'] || DOCUMENTS_DATA).map((doc, idx) => { doc.id = doc.id || idx; return (
                <HudCard key={doc.id || Math.random()} style={{ padding: '30px', textAlign: 'center' }}>
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
              ); })}
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
                    <span>{selectedSoilConfig.price} ₸ / пог.м</span>
                  </label>
                  <div className="soil-grid">
                    {Object.entries(currentSoils).map(([key, config]) => (
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Удорожание бурения на {Math.round((calcConfig.waterCoeff - 1) * 100)}% (откачка, обсадка)</span>
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
                      <div className="offer-title">⛰️ {adminData.global?.companyName || 'ТОО «СпецИнжГео»'}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {adminData.global?.address || 'РК, г. Алматы'}, {adminData.global?.email || 'info@spengeo.kz'} | БИН 190440028192
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
                        <td>x{(waterCoeff * seismicCoeff).toFixed(2)}</td>
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
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Главный офис</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    📍 {adminData.global?.address || '050000, Республика Казахстан, г. Алматы, проспект Аль-Фараби'}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    📞 Телефон: {adminData.global?.phone || '+7 775 218 28 06'}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '15px' }}>
                    ✉️ Email: {adminData.global?.email || 'info@spengeo.kz'}
                  </p>
                </HudCard>

                {/* System Info Block */}
                <div style={{ marginBottom: '20px', padding: '20px', background: theme === 'white' ? '#f8fafc' : 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--border-radius-md)', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                  <span className="spec-label" style={{ color: 'var(--color-cyan)', marginBottom: '10px', display: 'block' }}>Добро пожаловать</span>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    Вы находитесь в защищенной панели управления платформой ТОО «СпецИнжГео». Здесь вы можете редактировать контент сайта, добавлять новые услуги, управлять базой проектов и оборудования, а также отслеживать аналитику.
                  </p>
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
          <div className="page-wrapper page-enter" style={{ background: theme === 'white' ? '#f8fafc' : '#0a0a0a', margin: '-50px', padding: '50px', minHeight: '100vh', borderRadius: '12px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', color: theme === 'white' ? '#0f172a' : '#fff', fontFamily: 'sans-serif' }}>
              <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                    {activeAdminSection === 'dashboard' ? 'Выберите раздел для управления' : 
                     activeAdminSection === 'leads' ? 'Управление заявками' :
                     activeAdminSection === 'services' ? 'Управление услугами' :
                     activeAdminSection === 'content' ? 'Управление контентом' :
                     activeAdminSection === 'pages' ? 'Структура страниц' :
                     activeAdminSection === 'settings' ? 'Глобальные настройки' :
                     activeAdminSection === 'bot' ? 'Настройки ассистента' :
                     activeAdminSection === 'calculator' ? 'Настройки калькулятора' : 'Панель управления'}
                  </h1>
                  <p style={{ fontSize: '0.9rem', color: theme === 'white' ? '#64748b' : '#888' }}>
                    {activeAdminSection === 'dashboard' ? 'Нажмите на плитку чтобы открыть нужный раздел администрирования.' : 'Вносите изменения и сохраняйте настройки.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {activeAdminSection === 'dashboard' && (
                    <>
                      <button onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.json';
                        fileInput.onchange = (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            try {
                              const parsed = JSON.parse(ev.target.result);
                              setAdminData(parsed);
                              localStorage.setItem('spengeo_admin_data', JSON.stringify(parsed));
                              alert('Данные успешно импортированы! Страница будет перезагружена.');
                              window.location.reload();
                            } catch(err) {
                              alert('Ошибка при чтении файла JSON: ' + err.message);
                            }
                          };
                          reader.readAsText(file);
                        };
                        fileInput.click();
                      }} style={{ background: theme === 'white' ? '#f1f5f9' : 'rgba(6, 182, 212, 0.1)', color: theme === 'white' ? '#0f172a' : '#06b6d4', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📥 Импорт (JSON)
                      </button>
                      <button onClick={() => {
                        const dataStr = JSON.stringify(adminData, null, 2);
                        const blob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'spengeo_admin_backup_' + new Date().toISOString().split('T')[0] + '.json';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }} style={{ background: theme === 'white' ? '#f1f5f9' : 'rgba(59, 130, 246, 0.1)', color: theme === 'white' ? '#0f172a' : '#3b82f6', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(59, 130, 246, 0.3)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📤 Экспорт (JSON)
                      </button>
                    </>
                  )}
                  {activeAdminSection !== 'dashboard' && (
                    <button onClick={() => setActiveAdminSection('dashboard')} style={{ background: theme === 'white' ? '#f1f5f9' : '#222', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      ← Назад в панель
                    </button>
                  )}
                </div>
              </div>

              {activeAdminSection === 'dashboard' && (
                <>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Управление структурой сайта</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {dynamicMenu['ru'].map((menuItem, idx) => {
                      if (!menuItem.items) return null;
                      const colors = ['rgba(59, 130, 246', 'rgba(16, 185, 129', 'rgba(59, 130, 246', 'rgba(168, 85, 247', 'rgba(236, 72, 153', 'rgba(6, 182, 212'];
                      const col = colors[idx % colors.length];
                      return (
                        <div key={idx} onClick={() => setActiveAdminSection('cms_' + menuItem.page)} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? `1px solid ${col}, 0.4)` : `1px solid ${col}, 0.3)`, padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(to bottom, ${col}, 0.15), transparent)`, pointerEvents: 'none' }}></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                            <div style={{ background: theme === 'white' ? `${col}, 0.1)` : 'rgba(0,0,0,0.4)', border: theme === 'white' ? `1px solid ${col}, 0.2)` : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: `${col}, 1)` }}>
                              <Folder size={24} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{menuItem.items.length}</div>
                              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>подразделов</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Контент раздела</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{menuItem.title}</h2>
                            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: `${col}, 1)` }}>Редактировать подразделы →</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff'}}>Backend Системы</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* 1. Leads */}
                <div onClick={() => setActiveAdminSection('leads')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                      <Database size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{inquiries.length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>заявок</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Обработка лидов</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Входящие заявки</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Управляйте входящими лидами с сайта. Звоните клиентам и меняйте статусы.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10b981' }}>Управление →</div>
                  </div>
                </div>

                {/* 2. Services */}
                <div onClick={() => setActiveAdminSection('services')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                      <Briefcase size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{adminData.services.length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>услуг</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Список услуг</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Услуги</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Управляйте описанием услуг, изображениями, видео и переводами.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3b82f6' }}>Управление →</div>
                  </div>
                </div>

                {/* 3. Visual Builder */}
                <div onClick={() => { setIsVisualBuilder(true); setActivePage('home'); }} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                      <Edit3 size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>страниц</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Конструктор страниц</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Visual Builder</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Редактируйте тексты, заголовки и блоки прямо на страницах сайта.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a855f7' }}>Открыть Builder →</div>
                  </div>
                </div>

                {/* 4. Content */}
                <div onClick={() => setActiveAdminSection('content')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                      <BookOpen size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{Object.keys(translations).length}</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>языка</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Тексты и переводы</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Контент</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Редактируйте все тексты сайта на русском, казахском и английском языках.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3b82f6' }}>Редактировать →</div>
                  </div>
                </div>

                {/* 5. Pages */}
                <div onClick={() => setActiveAdminSection('pages')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(236, 72, 153, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#ec4899' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
                        {dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)}
                      </div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>страниц</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Структура сайта</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Меню и Страницы</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Управление пунктами навигации и иерархией страниц.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#ec4899' }}>Редактировать →</div>
                  </div>
                </div>

                {/* 6. Calculator Settings */}
                <div onClick={() => setActiveAdminSection('calculator')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#f59e0b' }}>
                      <Calculator size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>6</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>параметров</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Расчеты сметы</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Калькулятор</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Настройка базовой стоимости бурения и повышающих коэффициентов.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f59e0b' }}>Настроить →</div>
                  </div>
                </div>

                {/* 7. Blocks */}
                <div onClick={() => setActiveAdminSection('blocks')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#10b981' }}>
                      <Database size={24} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>4</div>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>базы</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Базы данных</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Блоки и Фото</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Редактирование, добавление проектов, услуг, оборудования и команды с фото.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#10b981' }}>Управление →</div>
                  </div>
                </div>

                {/* 6. Settings */}
                <div onClick={() => setActiveAdminSection('settings')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(107, 114, 128, 0.4)' : '1px solid rgba(107, 114, 128, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(107, 114, 128, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(107, 114, 128, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#9ca3af' }}>
                      <Settings size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Глобальные параметры</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Настройки</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Название компании, цвета, логотип, контактная информация и SEO.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#9ca3af' }}>Настроить →</div>
                  </div>
                </div>

                
                {/* 8. Photos */}
                <div onClick={() => setActiveAdminSection('photos')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#a855f7' }}>
                      <Image size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Медиафайлы</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>Фотографии</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Управление фоновыми изображениями блоков на главной странице.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a855f7' }}>Редактировать →</div>
                  </div>
                </div>

                {/* 7. Bot */}
                <div onClick={() => setActiveAdminSection('bot')} style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(6, 182, 212, 0.3)', padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.15), transparent)', pointerEvents: 'none' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: theme === 'white' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.4)', border: theme === 'white' ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}>
                      <Bot size={24} />
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Настройки чат-бота</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px' }}>SPENGEO_ASSISTANT</h2>
                    <p style={{ fontSize: '0.85rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '24px', lineHeight: 1.5 }}>Приветствия, FAQ, авто-ответы, телефон поддержки и имя ассистента.</p>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#06b6d4' }}>Настроить ассистента →</div>
                  </div>
                </div>
              </div>

              {/* Bottom stats row like in the screenshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Новых лидов</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{inquiries.length}</span>
                </div>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Услуг на сайте</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>{adminData.services.length}</span>
                </div>
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                  <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Активных ботов</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>1</span>
                </div>
              </div>
              
              {/* Inquiries List on Dashboard */}
              <div style={{ marginTop: '60px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Последние заявки</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {inquiries.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', border: theme === 'white' ? '1px dashed rgba(0,0,0,0.1)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: theme === 'white' ? '#64748b' : '#888' }}>База данных пуста.</div>
                  ) : (
                    inquiries.map(inq => (
                      <div key={inq.id} style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme === 'white' ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{inq.name} <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginLeft: '8px' }}>{inq.service_type}</span></div>
                          <div style={{ fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '8px' }}>{inq.message}</div>
                          <a href={`tel:${inq.phone}`} style={{ fontSize: '0.85rem', color: theme === 'white' ? '#0f172a' : '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}><Phone size={12} color={theme === 'white' ? '#0f172a' : '#fff'}/> {inq.phone}</a>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '16px' }}>{new Date(inq.created_at).toLocaleString('ru-RU')}</div>
                          <button onClick={() => handleClearInquiry(inq.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              </>
              )}

              {/* ===== ADMIN SUB-PAGES ===== */}

              {activeAdminSection === 'calculator' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>Настройки Калькулятора</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Коэф. грунтовых вод (удорожание)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.waterCoeff || 1.15} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, waterCoeff: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Сейсмика 9 баллов (Алматы)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.seismicCoeff9 || 1.1} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, seismicCoeff9: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Сейсмика 6-7 баллов (Астана)</label>
                      <input 
                        type="number" step="0.01"
                        value={adminData.calc?.seismicCoeff6 || 1.0} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, seismicCoeff6: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Делитель площади на 1 скважину</label>
                      <input 
                        type="number" 
                        value={adminData.calc?.holeAreaDivisor || 120} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, holeAreaDivisor: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Скорость бурения (пог.м/день)</label>
                      <input 
                        type="number" 
                        value={adminData.calc?.drillSpeedPerDay || 22} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, drillSpeedPerDay: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '40px', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Стоимость бурения по типам грунтов (₸/пог.м)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Пески</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilSandPrice || 18500} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilSandPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Глины</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilClayPrice || 22200} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilClayPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Суглинки</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilLoamPrice || 20350} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilLoamPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Скала</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilRockPrice || 46250} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilRockPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Торф</label>
                      <input 
                        type="number"
                        value={adminData.calc?.soilPeatPrice || 27750} 
                        onChange={e => setAdminData(prev => ({...prev, calc: {...prev.calc, soilPeatPrice: Number(e.target.value)}}))}
                        style={{ padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => {
                      localStorage.setItem('spengeo_admin_data', JSON.stringify(adminData));
                      logEvent('Настройки калькулятора сохранены', 'success');
                      alert('Сохранено!');
                    }} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Сохранить настройки
                    </button>
                  </div>
                </div>
              )}

              {/* ===== ADMIN SUB-PAGES ===== */}

              {activeAdminSection === 'form_knowledge_articles' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>Управление Базой Знаний: Статьи</h3>
                  
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}><BookOpen size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>Статьи</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, articles: [{id: Date.now().toString(), title: 'Новая статья', category: 'Статья', date: new Date().toISOString().split('T')[0], readTime: '5 мин', excerpt: '', content: '', image: ''}, ...adminData.articles]})} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить статью</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {(adminData.articles || []).map((article, i) => (
                        <div key={i} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888' }}>Статья #{i+1}</span>
                            <button onClick={() => {
                              const newArr = [...adminData.articles];
                              newArr.splice(i, 1);
                              setAdminData({...adminData, articles: newArr});
                            }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14}/></button>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Заголовок</div>
                                  <input type="text" value={article.title} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].title = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                              <div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Категория</div>
                                  <input type="text" value={article.category} onChange={e => {
                                    const newArr = [...adminData.articles];
                                    newArr[i].category = e.target.value;
                                    setAdminData({...adminData, articles: newArr});
                                  }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                              </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Фотография (обложка)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {article.image && <img src={article.image} alt={article.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                              <label style={{ padding: '8px 12px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                                <Folder size={14}/> С устройства
                                <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        if (file.size > 2.5 * 1024 * 1024) {
                                            alert('Файл слишком большой. Для временного предпросмотра размер урезан.');
                                            const tempUrl = URL.createObjectURL(file);
                                            const newArr = [...adminData.articles];
                                            newArr[i].image = tempUrl;
                                            setAdminData({...adminData, articles: newArr});
                                        } else {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const newArr = [...adminData.articles];
                                                newArr[i].image = ev.target.result;
                                                setAdminData({...adminData, articles: newArr});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }
                                }} />
                              </label>
                              <input type="text" value={article.image || ''} onChange={(e) => {
                                  const newArr = [...adminData.articles];
                                  newArr[i].image = e.target.value;
                                  setAdminData({...adminData, articles: newArr});
                              }} placeholder="Или вставьте URL..." style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Краткое описание (excerpt)</div>
                            <textarea value={article.excerpt} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].excerpt = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={2} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Полный текст (content)</div>
                            <textarea value={article.content} onChange={e => {
                              const newArr = [...adminData.articles];
                              newArr[i].content = e.target.value;
                              setAdminData({...adminData, articles: newArr});
                            }} rows={5} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '6px', fontFamily: 'inherit' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


              
                            {activeAdminSection.startsWith('form_') && activeAdminSection !== 'form_knowledge_articles' && (() => {
                const sectionKey = activeAdminSection.replace('form_', '');
                
                const DYNAMIC_FORM_CONFIGS = {
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
                  'equipment_rigs_0': { title: 'Буровые установки', addText: 'Добавить установку', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'maxDepth', label: 'Глубина бурения', type: 'text' }, { key: 'torque', label: 'Крутящий момент', type: 'text' }, { key: 'weight', label: 'Масса установки', type: 'text' }, { key: 'mobility', label: 'Транспортировка', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }, { key: 'soilType', label: 'Типы грунтов', type: 'text' }, { key: 'cadSpecs', label: 'CAD-Спецификации (через запятую)', type: 'text' }] },
                  'equipment_rigs_1': { title: 'Автотранспорт', addText: 'Добавить авто', fields: [{ key: 'name', label: 'Марка/Модель', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_0': { title: 'CPT / Зондирование', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_1': { title: 'Испытательное оборудование', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text' }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }] },
                  'equipment_lab_2': { title: 'Лаборатория / Геодезия', addText: 'Добавить прибор', fields: [{ key: 'name', label: 'Название', type: 'text', required: true }, { key: 'type', label: 'Тип', type: 'text' }, { key: 'params', label: 'Параметры испытаний', type: 'text' }, { key: 'purpose', label: 'Целевые свойства', type: 'text' }, { key: 'standard', label: 'ГОСТ / Регламент', type: 'text' }, { key: 'description', label: 'Описание', type: 'textarea' }, { key: 'cadSpecs', label: 'CAD-Спецификации (через запятую)', type: 'text' }] }
                };

                const config = DYNAMIC_FORM_CONFIGS[sectionKey] || {
                    title: 'Управление записями',
                    addText: 'Добавить запись',
                    fields: [
                        { key: 'title', label: 'Название', type: 'text' },
                        { key: 'desc', label: 'Описание', type: 'textarea' },
                        { key: 'image', label: 'Фото/Ссылка (URL)', type: 'text' }
                    ]
                };

                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* --- SPECIFIC LIST EDITOR --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>БД: {config.title}</h3>
                       <button onClick={() => {
                          const currentList = adminData.dynamicLists?.[sectionKey] || [];
                          const newList = [{ id: Date.now().toString(), title: '', desc: '', image: '', coeff: '' }, ...currentList];
                          setAdminData({ ...adminData, dynamicLists: { ...(adminData.dynamicLists || {}), [sectionKey]: newList } });
                       }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ {config.addText}</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                       {((adminData.dynamicLists || {})[sectionKey] || []).map((item, idx) => (
                          <div key={item.id} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#888', fontWeight: 'bold' }}>Запись #{idx+1}</span>
                                <button onClick={() => {
                                   const currentList = adminData.dynamicLists[sectionKey];
                                   const newList = currentList.filter((_, i) => i !== idx);
                                   setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                             </div>
                             
                             {config.fields.map(field => (
                               <div key={field.key}>
                                  <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '6px', color: theme === 'white' ? '#64748b' : '#888', fontWeight: '600' }}>{field.label}</label>
                                  {field.type === 'textarea' ? (
                                     <textarea value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                                  ) : (field.key === 'image' || field.label.toLowerCase().includes('ссылка') || field.label.toLowerCase().includes('скан') || field.label.toLowerCase().includes('фото')) ? (
                                     <div style={{ display: 'flex', gap: '10px' }}>
                                        <input placeholder="Вставьте URL или загрузите файл..." value={item[field.key] || ''} onChange={(e) => {
                                            const newList = [...adminData.dynamicLists[sectionKey]];
                                            newList[idx][field.key] = e.target.value;
                                            setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                        }} style={{ flex: 1, padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                        <label style={{ background: '#3b82f6', color: '#fff', padding: '0 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                                           С устройства
                                           <input type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar" style={{ display: 'none' }} onChange={(e) => {
                                               const file = e.target.files[0];
                                               if (file) {
                                                   if (file.size > 2.5 * 1024 * 1024) {
                                                       alert('Файл больше 2.5МБ! Для сохранения в локальной памяти (localStorage) размер урезан. В продакшене файл будет отправлен на сервер.');
                                                       const tempUrl = URL.createObjectURL(file);
                                                       const newList = [...adminData.dynamicLists[sectionKey]];
                                                       newList[idx][field.key] = tempUrl;
                                                       setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                                   } else {
                                                       const reader = new FileReader();
                                                       reader.onload = (ev) => {
                                                           const newList = [...adminData.dynamicLists[sectionKey]];
                                                           newList[idx][field.key] = ev.target.result;
                                                           setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                                       };
                                                       reader.readAsDataURL(file);
                                                   }
                                               }
                                           }} />
                                        </label>
                                     </div>
                                  ) : (
                                     <input value={item[field.key] || ''} onChange={(e) => {
                                         const newList = [...adminData.dynamicLists[sectionKey]];
                                         newList[idx][field.key] = e.target.value;
                                         setAdminData({ ...adminData, dynamicLists: { ...adminData.dynamicLists, [sectionKey]: newList } });
                                     }} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                                  )}
                               </div>
                             ))}
                          </div>
                       ))}
                       {((adminData.dynamicLists || {})[sectionKey] || []).length === 0 && (
                          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: theme === 'white' ? '#94a3b8' : '#666', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #333', borderRadius: '12px' }}>
                             База данных пуста. Нажмите кнопку "+ {config.addText}".
                          </div>
                       )}
                    </div>
                  </div>
                  
                  {/* --- PAGE CONTENT EDITOR (OPTIONAL/META) --- */}
                  <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>Мета-данные страницы (Опционально)</h3>
                       <button onClick={() => alert('Мета-данные успешно сохранены!')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Сохранить мета-данные</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Заголовок страницы (H1)</label>
                          <input type="text" placeholder="Введите главный заголовок..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px' }} />
                      </div>
                      
                      <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '8px' }}>Краткое описание / Подзаголовок (в шапке)</label>
                          <textarea rows={2} placeholder="Параграф под заголовком..." defaultValue="" style={{ width: '100%', padding: '12px', background: theme === 'white' ? '#f8fafc' : '#000', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', color: theme === 'white' ? '#0f172a' : '#fff', borderRadius: '8px', fontFamily: 'inherit' }} />
                      </div>
                    </div>
                  </div>

                </div>
                );
              })()}

              {activeAdminSection === 'blocks' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#fff', borderBottom: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', paddingBottom: '15px' }}>Управление Базами Данных</h3>
                  
                  {/* КОМАНДА */}
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '8px', color: '#06b6d4' }}><Users size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>Команда</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, team: [{name: 'Новый сотрудник', role: 'Должность', badge: 'СПЕЦИАЛИСТ', desc: '', img: ''}, ...(adminData.team || [])]})} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить сотрудника</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      {(adminData.team || []).map((member, i) => (
                        <div key={i} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <label style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', fontWeight: 'bold' }}>Сотрудник #{i + 1}</label>
                             <button onClick={() => { const arr = (adminData.team || []).filter((_, idx) => idx !== i); setAdminData({...adminData, team: arr}); }} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Фамилия Имя</label>
                            <input value={member.name} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].name = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Должность</label>
                            <input value={member.role || member.position || ''} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].role = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Бейдж (например: РУКОВОДСТВО)</label>
                            <input value={member.badge || ''} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].badge = e.target.value; setAdminData({...adminData, team: arr}); }} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Фотография</label>
                            <ImageUploadField value={member.img || member.image || ''} onChange={v => { const arr = [...(adminData.team || [])]; arr[i].img = v; setAdminData({...adminData, team: arr}); }} theme={theme} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px' }}>Описание</label>
                            <textarea value={member.desc} onChange={e => { const arr = [...(adminData.team || [])]; arr[i].desc = e.target.value; setAdminData({...adminData, team: arr}); }} rows={3} style={{ width: '100%', padding: '10px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', resize: 'vertical' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ПРОЕКТЫ */}
                  <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}><MapPin size={20} /></div>
                        <h4 style={{ color: theme === 'white' ? '#0f172a' : '#fff', fontSize: '1.2rem', margin: 0 }}>Проекты (Выполненные объекты)</h4>
                      </div>
                      <button onClick={() => setAdminData({...adminData, projects: [{id: Date.now().toString(), name: 'Новый проект', client: 'Клиент', type: 'Услуга', loc: 'Локация', specs: 'Описание', coords: [48, 66]}, ...(adminData.projects || [])]})} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить проект</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {(adminData.projects || []).map((p, i) => (
                        <div key={i} style={{ padding: '15px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '10px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'all 0.2s', position: 'relative' }}>
                          <button onClick={() => { const arr = (adminData.projects || []).filter((_, idx) => idx !== i); setAdminData({...adminData, projects: arr}); }} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', paddingRight: '50px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Название объекта</label>
                              <input value={p.name} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].name = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Заказчик</label>
                              <input value={p.client} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].client = e.target.value; setAdminData({...adminData, projects: arr}); }} style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Фото объекта</label>
                              <ImageUploadField value={p.image || ''} onChange={v => { const arr = [...(adminData.projects || [])]; arr[i].image = v; setAdminData({...adminData, projects: arr}); }} theme={theme} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 100px', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Локация</label>
                              <input value={p.loc || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].loc = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="г. Алматы" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Вид работ</label>
                              <input value={p.type || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].type = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="Инженерная геология" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Спецификация</label>
                              <input value={p.specs || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].specs = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="12 скважин по 35м" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ fontSize: '0.75rem', color: theme === 'white' ? '#64748b' : '#888' }}>Год</label>
                              <input value={p.year || ''} onChange={e => { const arr = [...(adminData.projects || [])]; arr[i].year = e.target.value; setAdminData({...adminData, projects: arr}); }} placeholder="2025" style={{ padding: '8px 12px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ОБОРУДОВАНИЕ REMOVED: Now managed entirely through dynamic lists in DB Section */}

                </div>
              )}

              
              {activeAdminSection.startsWith('cms_') && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', margin: 0 }}>
                      Подразделы: {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.title}
                    </h3>
                    <button onClick={() => {
                        const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                        const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                        if (catIndex !== -1) {
                            const newSubId = 'sub_' + Date.now();
                            if (!newMenu['ru'][catIndex].items) newMenu['ru'][catIndex].items = [];
                            newMenu['ru'][catIndex].items.push({ name: 'Новый подраздел', action: { type: 'page', val: activeAdminSection.replace('cms_', ''), subpage: newSubId } });
                            setAdminData({...adminData, menu: newMenu});
                        }
                    }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Добавить подраздел</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {dynamicMenu['ru'].find(m => m.page === activeAdminSection.replace('cms_', ''))?.items.map((sub, sidx) => (
                      <div key={sidx} style={{ padding: '20px', background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: theme === 'white' ? '0 4px 15px rgba(0,0,0,0.03)' : 'none', transition: 'transform 0.2s', transform: 'translateY(0)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <input value={sub.name} onChange={(e) => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items[sidx].name = e.target.value;
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'transparent', border: '1px solid transparent', outline: 'none', color: theme === 'white' ? '#0f172a' : '#fff', flex: 1, minWidth: 0, textOverflow: 'ellipsis', padding: '4px 8px', marginLeft: '-8px', borderRadius: '6px', transition: 'border 0.2s' }} onFocus={(e) => e.target.style.border = theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #444'} onBlur={(e) => e.target.style.border = '1px solid transparent'} />
                             <button onClick={() => {
                                 const newMenu = JSON.parse(JSON.stringify(dynamicMenu));
                                 const catIndex = newMenu['ru'].findIndex(m => m.page === activeAdminSection.replace('cms_', ''));
                                 if (catIndex !== -1) {
                                     newMenu['ru'][catIndex].items.splice(sidx, 1);
                                     setAdminData({...adminData, menu: newMenu});
                                 }
                             }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', marginLeft: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}><Trash2 size={16}/></button>
                          </div>
                          
                          <button onClick={() => {
                             if (sub.action) {
                                 if (sub.action.type === 'service') {
                                     setActiveAdminSection('services');
                                     const sIndex = adminData.services.findIndex(s => s.id === sub.action.val || s.code?.toLowerCase().includes(sub.action.val));
                                     if (sIndex !== -1 && typeof setEditingServiceIndex === 'function') {
                                         setEditingServiceIndex(sIndex);
                                     }
                                 } else if (sub.action.val === 'projects') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'about' && sub.action.subpage === 'team') {
                                     setActiveAdminSection('blocks');
                                 } else if (sub.action.val === 'blog' && sub.action.subpage === 'articles') {
                                     setActiveAdminSection('form_knowledge_articles');
                                 } else if (sub.action.type === 'equip') {
                                     setActiveAdminSection('form_equipment_' + (sub.action.cat || 'misc') + '_' + (sub.action.idx !== undefined ? sub.action.idx : '0'));
                                 } else {
                                     setActiveAdminSection('form_' + (sub.action.val || 'unknown') + '_' + (sub.action.subpage || ''));
                                 }
                             }
                          }} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', padding: '12px', borderRadius: '8px', color: '#06b6d4', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = '#06b6d4'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = '1px solid #06b6d4'; }} onMouseOut={(e) => { e.currentTarget.style.background = theme === 'white' ? '#f8fafc' : '#1a1a1a'; e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.border = theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333'; }}>
                             Настроить контент <Edit3 size={16}/>
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'leads' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Входящие заявки ({inquiries.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {inquiries.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', border: theme === 'white' ? '1px dashed rgba(0,0,0,0.1)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: theme === 'white' ? '#64748b' : '#888' }}>База данных пуста.</div>
                    ) : (
                      inquiries.map(inq => (
                        <div key={inq.id} style={{ background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px', color: theme === 'white' ? '#0f172a' : '#fff' }}>{inq.name} <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', marginLeft: '8px' }}>{inq.service_type}</span></div>
                            <div style={{ fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#aaa', marginBottom: '8px' }}>{inq.message}</div>
                            <a href={`tel:${inq.phone}`} style={{ fontSize: '0.85rem', color: theme === 'white' ? '#0f172a' : '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}><Phone size={12} color={theme === 'white' ? '#0f172a' : '#fff'}/> {inq.phone}</a>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '16px' }}>{new Date(inq.created_at).toLocaleString('ru-RU')}</div>
                            <button onClick={() => handleClearInquiry(inq.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)' }}>Удалить <Trash2 size={16} style={{ verticalAlign: 'middle', marginLeft: '4px' }}/></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeAdminSection === 'services' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>Услуги ({adminData.services.length})</h3>
                    <button onClick={() => setAdminData({...adminData, services: [...adminData.services, {id: Date.now().toString(), title: 'Новая услуга', code: 'NEW-00', desc: '', reg: '', image: ''}]})} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Добавить услугу</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {adminData.services.map((service, index) => { const key = service.id || index; return (
                      <div key={key} style={{ padding: '16px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'white' ? '#f8fafc' : '#1a1a1a' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>{service.title}</div>
                          <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px' }}>Код: {service.code}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => setEditingServiceIndex(index)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px 8px' }}>Редактировать</button>
                          <button onClick={() => { const arr = adminData.services.filter((_, idx) => idx !== index); setAdminData({...adminData, services: arr}); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 8px' }}>Удалить</button>
                        </div>
                      </div>
                    ); })}
                  </div>

                  {editingServiceIndex !== null && adminData.services[editingServiceIndex] && createPortal((
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: theme === 'white' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                      <div style={{ background: theme === 'white' ? '#ffffff' : '#0a0a0a', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '650px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', boxShadow: theme === 'white' ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: theme === 'white' ? '1px solid #f1f5f9' : '1px solid #1a1a1a', paddingBottom: '20px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>Настройка услуги</h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'white' ? '#64748b' : '#666', marginTop: '5px' }}>Идентификатор: {adminData.services[editingServiceIndex].id || editingServiceIndex}</div>
                          </div>
                          <button onClick={() => setEditingServiceIndex(null)} style={{ background: theme === 'white' ? '#f1f5f9' : '#1a1a1a', border: 'none', color: theme === 'white' ? '#64748b' : '#888', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}><X size={20} /></button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 3 }}>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Название услуги <span style={{ color: '#ef4444' }}>*</span></label>
                              <input value={adminData.services[editingServiceIndex].title} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].title = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', transition: 'border 0.2s', outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Внутр. код</label>
                              <input value={adminData.services[editingServiceIndex].code} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].code = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', outline: 'none' }} />
                            </div>
                          </div>
                          
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Обложка услуги (фото)</label>
                            <ImageUploadField value={adminData.services[editingServiceIndex].image || ''} onChange={v => { const arr = [...adminData.services]; arr[editingServiceIndex].image = v; setAdminData({...adminData, services: arr}); }} theme={theme} />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Нормативная база (СНиП, ГОСТ)</label>
                            <input value={adminData.services[editingServiceIndex].reg || ''} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].reg = e.target.value; setAdminData({...adminData, services: arr}); }} style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', outline: 'none' }} placeholder="Например: СНиП РК 1.02-18-2004" />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: theme === 'white' ? '#334155' : '#aaa', marginBottom: '8px' }}>Официальное описание (для каталога)</label>
                            <textarea value={adminData.services[editingServiceIndex].desc || ''} onChange={e => { const arr = [...adminData.services]; arr[editingServiceIndex].desc = e.target.value; setAdminData({...adminData, services: arr}); }} rows={5} style={{ width: '100%', padding: '16px', fontSize: '1rem', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '10px', resize: 'vertical', lineHeight: '1.6', outline: 'none' }} placeholder="Укажите подробное описание состава работ..." />
                          </div>
                          
                          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button onClick={() => setEditingServiceIndex(null)} style={{ background: 'transparent', color: theme === 'white' ? '#64748b' : '#aaa', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Отмена</button>
                            <button onClick={() => setEditingServiceIndex(null)} style={{ background: 'var(--color-cyan)', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}>Сохранить изменения</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ), document.body)                  }
                </div>
              )}

              {activeAdminSection === 'content' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Тексты и переводы</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {Object.keys(translations).map(lang => (
                      <div key={lang} style={{ padding: '20px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{lang === 'ru' ? '🇷🇺' : lang === 'kk' ? '🇰🇿' : '🇬🇧'}</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '10px' }}>{lang}</div>
                        <button style={{ background: '#3b82f6', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', width: '100%' }}>Редактировать</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'pages' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff' }}>
                      Структура сайта ({dynamicMenu[language].reduce((acc, curr) => acc + 1 + (curr.items ? curr.items.length : 0), 0)} страниц)
                    </h3>
                    <button onClick={() => alert('Добавление новых страниц в данный момент требует участия разработчика, так как каждая страница имеет уникальный дизайн и анимации в коде.')} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Добавить страницу</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {dynamicMenu[language].map((page, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Parent Page */}
                        <div style={{ padding: '16px', background: theme === 'white' ? '#f8fafc' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Folder size={16} color="#ec4899" /> {page.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginTop: '4px', marginLeft: '24px' }}>Path: /{page.page}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => alert('SEO настройки для этой страницы скоро будут доступны для редактирования.')} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer' }}>SEO</button>
                            <button onClick={() => alert('Для изменения контента этой страницы, пожалуйста, обратитесь к разработчику. Сайт использует сложную верстку, которая жестко задана в коде для высокой производительности и анимаций.')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>Настроить</button>
                          </div>
                        </div>
                        
                        {/* Subpages */}
                        {page.items && page.items.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '32px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '0', bottom: '20px', width: '2px', background: theme === 'white' ? '#e2e8f0' : '#333' }}></div>
                            {page.items.map((sub, subIdx) => (
                              <div key={subIdx} style={{ position: 'relative', padding: '12px 16px', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #2a2a2a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'white' ? '#fff' : '#111' }}>
                                <div style={{ position: 'absolute', left: '-16px', top: '50%', width: '16px', height: '2px', background: theme === 'white' ? '#e2e8f0' : '#333' }}></div>
                                <div>
                                  <div style={{ fontWeight: '500', color: theme === 'white' ? '#334155' : '#ccc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={14} color="#64748b" /> {sub.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: theme === 'white' ? '#94a3b8' : '#666', marginTop: '4px', marginLeft: '22px' }}>
                                    Action: {sub.action?.type} {sub.action?.subpage ? `(${sub.action.subpage})` : ''}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button onClick={() => alert('SEO настройки для этой страницы скоро будут доступны для редактирования.')} style={{ background: 'none', border: 'none', color: '#ec4899', cursor: 'pointer', fontSize: '0.85rem' }}>SEO</button>
                                  <button onClick={() => alert('Для изменения контента этой страницы, пожалуйста, обратитесь к разработчику. Сайт использует сложную верстку, которая жестко задана в коде для высокой производительности и анимаций.')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}>Контент</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeAdminSection === 'settings' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Глобальные настройки</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Название компании</label>
                      <input type="text" value={adminData.global?.companyName || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, companyName: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Основной телефон</label>
                      <input type="text" value={adminData.global?.phone || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, phone: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Email для уведомлений</label>
                      <input type="text" value={adminData.global?.email || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, email: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Адрес местоположения</label>
                      <input type="text" value={adminData.global?.address || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, address: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Координаты карты (Широта, Долгота)</label>
                      <input type="text" placeholder="Например: 49.8066, 73.0855" value={adminData.global?.mapCoords || ''} onChange={e => setAdminData(prev => ({...prev, global: {...prev.global, mapCoords: e.target.value}}))} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} />
                      <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '8px' }}>Внимание: изменение адреса не сдвинет карту автоматически. Обязательно впишите координаты (например, 49.8066, 73.0855 для Караганды), иначе карта останется в Алматы.</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>ID Яндекс Метрики (Счетчик)</label>
                      <input 
                        type="text" 
                        placeholder="Например: 98765432"
                        value={adminData.seo?.yandexMetricaId || ''} 
                        onChange={e => setAdminData(prev => ({...prev, seo: {...prev.seo, yandexMetricaId: e.target.value}}))}
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc' }}>Google Analytics (Measurement ID)</label>
                      <input 
                        type="text" 
                        placeholder="Например: G-XXXXXXXXXX"
                        value={adminData.seo?.googleAnalyticsId || ''} 
                        onChange={e => setAdminData(prev => ({...prev, seo: {...prev.seo, googleAnalyticsId: e.target.value}}))}
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff' }} 
                      />
                    </div>
                    <button onClick={() => {
                      localStorage.setItem('spengeo_admin_data', JSON.stringify(adminData));
                      alert('Настройки SEO и аналитики сохранены!');
                    }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>Сохранить настройки</button>
                  </div>
                </div>
              )}

              
            {activeAdminSection === 'photos' && (
              <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: theme === 'white' ? '#0f172a' : '#fff', marginBottom: '20px' }}>Управление фотографиями (Блоки главной страницы)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Оборудование и технологии */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Оборудование и технологии (3 карточки)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Буровая техника</div>
                        <ImageUploadField value={adminData.media?.rigBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, rigBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Лаборатория грунтов</div>
                        <ImageUploadField value={adminData.media?.labBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, labBg: val}})} theme={theme} />
                      </div>
                      <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                        <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Инженерная геодезия</div>
                        <ImageUploadField value={adminData.media?.geoBg || ''} onChange={(val) => setAdminData({...adminData, media: {...adminData.media, geoBg: val}})} theme={theme} />
                      </div>
                    </div>
                  </div>

                  {/* Выполненные объекты (Услуги) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Услуги (6 карточек на главной)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                      {['geology', 'geodesy', 'cpt', 'piles', 'plates', 'laboratory'].map((id, idx) => {
                        const service = adminData.services.find(s => s.id === id);
                        const titles = ['Инженерно-геологические изыскания', 'Геодезия и топосъемка', 'CPT Зондирование', 'Испытания свай', 'Штамповые испытания', 'Лаборатория грунтов'];
                        return (
                          <div key={id} style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333' }}>
                            <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>{titles[idx]}</div>
                            <ImageUploadField 
                              value={service?.image || ''} 
                              onChange={(val) => {
                                const arr = [...adminData.services];
                                const index = arr.findIndex(s => s.id === id);
                                if(index > -1) { arr[index].image = val; setAdminData({...adminData, services: arr}); }
                              }} 
                              theme={theme} 
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Лицензии и сертификаты (Директор) */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--color-cyan)', marginBottom: '15px', borderBottom: '1px solid rgba(6, 182, 212, 0.2)', paddingBottom: '10px' }}>Блок: Лицензии и сертификаты (Фото директора)</h4>
                    <div style={{ padding: '15px', background: theme === 'white' ? '#f8fafc' : '#0a0a0a', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #333', maxWidth: '400px' }}>
                      <div style={{ marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#334155' : '#ccc' }}>Шенвизов Рудольф Константинович</div>
                      <ImageUploadField 
                        value={adminData.team[0]?.img || ''} 
                        onChange={(val) => {
                          const arr = [...adminData.team];
                          if (arr.length > 0) {
                              arr[0].img = val;
                              setAdminData({...adminData, team: arr});
                          }
                        }} 
                        theme={theme} 
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeAdminSection === 'bot' && (
                <div style={{ background: theme === 'white' ? '#fff' : '#111', border: theme === 'white' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '30px', boxShadow: theme === 'white' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px', color: theme === 'white' ? '#0f172a' : '#fff' }}>Настройки Чат-бота</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc', fontWeight: 'bold' }}>Имя ассистента</label>
                      <input type="text" value={adminData.bot.name} onChange={e => setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, name: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: theme === 'white' ? '#475569' : '#ccc', fontWeight: 'bold' }}>Приветственное сообщение</label>
                      <textarea rows="3" value={adminData.bot.welcomeMsg} onChange={e => setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, welcomeMsg: e.target.value}})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', background: theme === 'white' ? '#f8fafc' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', resize: 'vertical', outline: 'none' }}></textarea>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="checkbox" id="bot_active" checked={adminData.bot.active} onChange={e => setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, active: e.target.checked}})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <label htmlFor="bot_active" style={{ color: theme === 'white' ? '#0f172a' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Бот активен на сайте</label>
                    </div>
                    
                    <hr style={{ border: 'none', borderTop: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', margin: '10px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, color: theme === 'white' ? '#0f172a' : '#fff' }}>Сценарии ответов (Intents)</h4>
                      <button onClick={() => setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, scenarios: [...adminData.bot.scenarios, { id: Date.now().toString(), keywords: '', answer: '' }]}})} style={{ background: 'var(--color-cyan)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>+ Добавить сценарий</button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {adminData.bot.scenarios.map((scenario, index) => (
                        <div key={scenario.id} style={{ background: theme === 'white' ? '#f1f5f9' : '#1a1a1a', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid #333', borderRadius: '10px', padding: '20px', position: 'relative' }}>
                          <button onClick={() => { const arr = adminData.bot.scenarios.filter((_, idx) => idx !== index); setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, scenarios: arr}}); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '40px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px', fontWeight: 'bold' }}>Ключевые слова (через запятую)</label>
                              <input value={scenario.keywords} onChange={e => { const arr = [...adminData.bot.scenarios]; arr[index].keywords = e.target.value; setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, scenarios: arr}}); }} placeholder="Например: привет, здравствуй, добрый день" style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', outline: 'none' }} />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.8rem', color: theme === 'white' ? '#64748b' : '#888', marginBottom: '5px', fontWeight: 'bold' }}>Ответ бота</label>
                              <textarea value={scenario.answer} onChange={e => { const arr = [...adminData.bot.scenarios]; arr[index].answer = e.target.value; setAdminData({...adminData, media: { rigBg: "/images/rig.jpg", labBg: "/images/lab.jpg", geoBg: "/images/geo.jpg" },
      bot: {...adminData.bot, scenarios: arr}}); }} rows={3} style={{ width: '100%', padding: '10px', background: theme === 'white' ? '#fff' : '#000', color: theme === 'white' ? '#0f172a' : '#fff', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid #444', borderRadius: '6px', resize: 'vertical', outline: 'none' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      {adminData.bot.scenarios.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px', color: theme === 'white' ? '#64748b' : '#888', border: theme === 'white' ? '1px dashed #cbd5e1' : '1px dashed #444', borderRadius: '10px' }}>Нет сценариев. Добавьте сценарий, чтобы бот мог отвечать на вопросы.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
        {(() => {
          const getMapCenter = () => {
            if (adminData.global?.mapCoords) {
              const parts = adminData.global.mapCoords.match(/-?\d+\.\d+/g);
              if (parts && parts.length >= 2) return [Number(parts[0]), Number(parts[1])];
            }
            const addr = (adminData.global?.address || '').toLowerCase();
            if (addr.includes('караганда')) return [49.8019, 73.1021];
            if (addr.includes('астана') || addr.includes('нур-султан')) return [51.1694, 71.4491];
            if (addr.includes('шымкент')) return [42.3417, 69.5901];
            if (addr.includes('актобе')) return [50.2839, 57.1670];
            if (addr.includes('атырау')) return [47.1167, 51.8833];
            if (addr.includes('актау')) return [43.65, 51.15];
            if (addr.includes('усть-каменогорск')) return [49.9483, 82.6278];
            if (addr.includes('павлодар')) return [52.3, 76.95];
            return [43.2389, 76.8897]; // fallback Алматы
          };
          const center = getMapCenter();
          return (
            <MapContainer key={`footer-map-${center.join(',')}`} center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', background: theme === 'white' ? '#f8fafc' : '#030509' }}>
              <TileLayer
                key={theme}
                url={theme === 'white' ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={center} icon={customGlowIcon}>
                <Popup className="premium-popup">
              <div style={{ padding: '5px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-cyan)', fontSize: '1.1rem' }}>{adminData.global?.companyName || 'ТОО «СпецИнжГео»'}</strong><br/>
                <span style={{ color: '#aaa' }}>{adminData.global?.address || 'г. Алматы, пр-т Абая, 150'}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        );
        })()}
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
                <li><a href="/" onClick={(e) => { e.preventDefault(); setActivePage('home'); logEvent('Footer navigation: Home'); }}>Главная</a></li>
                <li><a href="/about" onClick={(e) => { e.preventDefault(); setActivePage('about'); logEvent('Footer navigation: About'); }}>О компании</a></li>
                <li><a href="/services" onClick={(e) => { e.preventDefault(); setActivePage('services'); logEvent('Footer navigation: Services'); }}>Услуги изысканий</a></li>
                <li><a href="/projects" onClick={(e) => { e.preventDefault(); setActivePage('projects'); logEvent('Footer navigation: Projects'); }}>Наши проекты</a></li>

              </ul>
            </div>

            <div>
              <h4 className="footer-title">Контакты</h4>
              <ul className="footer-links" style={{ fontSize: '0.85rem' }}>
                <li>📍 {adminData.global?.address || 'Республика Казахстан, г. Алматы'}</li>
                <li>📞 {adminData.global?.phone || '+7 775 218 28 06'}</li>
                <li>✉️ {adminData.global?.email || 'info@spengeo.kz'}</li>
                <li style={{ marginTop: '15px' }}>Разработано при помощи <a href="https://codix-style-line-production.up.railway.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-cyan)', textDecoration: 'none', textShadow: '0 0 10px rgba(14, 165, 233, 0.5)', borderBottom: '1px dashed var(--color-cyan)', paddingBottom: '2px', fontWeight: 600, letterSpacing: '0.5px', transition: 'all 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.textShadow = '0 0 15px rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderBottom = '1px solid #fff'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-cyan)'; e.currentTarget.style.textShadow = '0 0 10px rgba(14, 165, 233, 0.5)'; e.currentTarget.style.borderBottom = '1px dashed var(--color-cyan)'; }}>Codix Style Line</a></li>
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

      {/* PROFESSIONAL VISUAL BUILDER PANELS */}
      {isVisualBuilder && (
        <>
          {/* Top Panel */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#0a0a0a', borderBottom: '1px solid #222', zIndex: 10000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'linear-gradient(45deg, var(--color-cyan), var(--color-accent))', padding: '6px', borderRadius: '8px' }}>
                <Edit3 size={18} color="#000" />
              </div>
              <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '1.1rem' }}>SPENGEO BUILDER</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', padding: '6px 16px', borderRadius: '8px', border: '1px solid #333' }}>
                <span style={{ fontSize: '0.85rem', color: '#888' }}>Страница:</span>
                <select 
                  value={activePage} 
                  onChange={(e) => setActivePage(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {dynamicMenu.ru.map(m => (
                    <option key={m.page} value={m.page} style={{ background: '#111' }}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="btn btn-secondary" onClick={() => setIsVisualBuilder(false)} style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid #444', color: '#ccc' }}>
                Выйти
              </button>
              <button className="btn btn-primary" onClick={() => setIsVisualBuilder(false)} style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--color-cyan)', color: '#000', fontWeight: 'bold' }}>
                <Check size={16} /> Опубликовать
              </button>
            </div>
          </div>

          {/* Left Panel */}
          <div style={{ position: 'fixed', top: '60px', left: 0, bottom: 0, width: '300px', background: '#0a0a0a', borderRight: '1px solid #222', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', fontSize: '0.8rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Слои и Блоки
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Top Navigation', 'Hero Section', 'Features Grid', 'About Company', 'Services Tabs', 'Projects Filter', 'Call to Action', 'Footer'].map((layer, i) => (
                <div key={i} style={{ padding: '12px 16px', background: '#111', border: '1px solid #222', borderRadius: '8px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-cyan)'; e.currentTarget.style.background = '#1a1a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = '#111'; }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Layers size={14} color={i === 1 ? 'var(--color-cyan)' : '#666'} /> 
                    <span style={{ color: i === 1 ? '#fff' : '#ccc', fontWeight: i === 1 ? 'bold' : 'normal' }}>{layer}</span>
                  </div>
                  <Eye size={14} color={i === 1 ? 'var(--color-cyan)' : '#444'} />
                </div>
              ))}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', border: '1px dashed #444', color: '#aaa', padding: '10px' }}>
                + Добавить блок
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ position: 'fixed', top: '60px', right: 0, bottom: 0, width: '300px', background: '#0a0a0a', borderLeft: '1px solid #222', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222', fontSize: '0.8rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Свойства элемента
            </div>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {activeEditorElement ? (
                <>
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Выбранный элемент</label>
                    <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', color: 'var(--color-cyan)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <Edit3 size={14} /> #{activeEditorElement}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Текст (HTML)</label>
                    <textarea 
                      rows="6" 
                      style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '0.9rem', lineHeight: '1.5', outline: 'none' }} 
                      value={activeEditorText}
                      onChange={(e) => {
                        setActiveEditorText(e.target.value);
                        window.dispatchEvent(new CustomEvent('vb_update', { detail: { id: activeEditorElement, text: e.target.value } }));
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} 
                      onBlur={(e) => e.target.style.borderColor = '#333'} 
                    />
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', color: '#666', textAlign: 'center', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Кликните на любой пунктирный текстовый блок на сайте, чтобы начать его редактирование.
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Отступы (Margin / Padding)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" placeholder="Margin (px)" style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                  <input type="text" placeholder="Padding (px)" style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                </div>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Типографика</label>
                <select style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', marginBottom: '12px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option>Display Font (Unbounded)</option>
                  <option>Body Font (Inter)</option>
                  <option>Mono Font (JetBrains)</option>
                </select>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" defaultValue="3.5rem" style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                  <input type="text" defaultValue="800" style={{ width: '80px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none', textAlign: 'center' }} onFocus={(e) => e.target.style.borderColor = 'var(--color-cyan)'} onBlur={(e) => e.target.style.borderColor = '#333'} />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Цвет</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '30px', height: '30px', background: 'var(--color-text-primary)', borderRadius: '6px', border: '1px solid #444' }}></div>
                  <input type="text" defaultValue="var(--color-text-primary)" style={{ flex: 1, background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '10px', fontSize: '0.85rem', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', border: '1px solid #333', background: '#111', color: '#ef4444', padding: '10px' }}>
                <Trash2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} /> Удалить блок
              </button>
            </div>
          </div>
        </>
      )}

      </div>
      </div>

      {/* ==================== MODAL: ACTIVE ARTICLE ==================== */}
      {activeArticle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(5px)' }} onClick={() => setActiveArticle(null)}>
          <div style={{ background: theme === 'white' ? '#fff' : '#0f172a', border: theme === 'white' ? '1px solid #cbd5e1' : '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveArticle(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, transition: 'background 0.2s', backdropFilter: 'blur(4px)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
              <X size={20} />
            </button>

            {activeArticle.image && (
              <div style={{ width: '100%', height: '350px', position: 'relative' }}>
                <img src={activeArticle.image} alt={activeArticle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: `linear-gradient(to top, ${theme === 'white' ? '#fff' : '#0f172a'} 20%, transparent)` }}></div>
              </div>
            )}
            
            <div style={{ padding: '40px', marginTop: activeArticle.image ? '-60px' : '0', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#06b6d4', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                <span>{activeArticle.category}</span>
                <span style={{ color: theme === 'white' ? '#cbd5e1' : '#334155' }}>•</span>
                <span style={{ color: theme === 'white' ? '#64748b' : '#94a3b8' }}>{activeArticle.date}</span>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: theme === 'white' ? '#0f172a' : '#f8fafc', lineHeight: '1.2' }}>{activeArticle.title}</h2>
              
              <div style={{ fontSize: '1.1rem', color: theme === 'white' ? '#334155' : '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {activeArticle.content || activeArticle.excerpt || "Текст статьи в процессе написания."}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
