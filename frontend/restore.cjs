const fs = require('fs');
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

const deletedCode = `
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'white' : 'dark');
  };

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMsgs, setAssistantMsgs] = useState([`;

appJsx = appJsx.replace(
  `  const [theme, setTheme] = useState('dark');
    { sender: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ТОО «СпецИнжГео». Чем могу помочь? Отвечу на вопросы по изысканиям, бурению или сметам.' }`,
  `  const [theme, setTheme] = useState('dark');${deletedCode}
    { sender: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ТОО «СпецИнжГео». Чем могу помочь? Отвечу на вопросы по изысканиям, бурению или сметам.' }`
);

appJsx = appJsx.replace(
  `  const [theme, setTheme] = useState('dark');\r\n    { sender: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ТОО «СпецИнжГео». Чем могу помочь? Отвечу на вопросы по изысканиям, бурению или сметам.' }`,
  `  const [theme, setTheme] = useState('dark');${deletedCode}\r\n    { sender: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ТОО «СпецИнжГео». Чем могу помочь? Отвечу на вопросы по изысканиям, бурению или сметам.' }`
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Restored deleted lines in App.jsx');
