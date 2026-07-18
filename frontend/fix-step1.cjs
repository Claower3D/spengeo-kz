const fs = require('fs');

let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

// Fix 1: Reset IDs to clear wrong cached text
appJsx = appJsx.replace(/id="approach_label"/g, 'id="approach_label_v2"');
appJsx = appJsx.replace(/id="approach_title"/g, 'id="approach_title_v2"');
appJsx = appJsx.replace(/id="founder_label"/g, 'id="founder_label_v2"');
appJsx = appJsx.replace(/id="founder_title"/g, 'id="founder_title_v2"');

// Fix 2: Force white text in the Director card (since its background is always dark navy)
// Fix f_name
appJsx = appJsx.replace(
  'id="f_name" defaultText="Шенвизов Рудольф" isVisualBuilder={isVisualBuilder} style={{ fontSize: \'2.8rem\', marginBottom: \'5px\', color: \'var(--color-text-primary)\'',
  'id="f_name" defaultText="Шенвизов Рудольф" isVisualBuilder={isVisualBuilder} style={{ fontSize: \'2.8rem\', marginBottom: \'5px\', color: \'#ffffff\''
);
// Fix f_patr
appJsx = appJsx.replace(
  'id="f_patr" defaultText="Константинович" isVisualBuilder={isVisualBuilder} style={{ fontSize: \'2.2rem\', marginBottom: \'25px\', color: \'var(--color-text-secondary)\'',
  'id="f_patr" defaultText="Константинович" isVisualBuilder={isVisualBuilder} style={{ fontSize: \'2.2rem\', marginBottom: \'25px\', color: \'rgba(255,255,255,0.85)\''
);
// Fix f_quote
appJsx = appJsx.replace(
  'fontStyle: \'italic\', borderLeft: \'3px solid var(--color-cyan)\', paddingLeft: \'25px\', position: \'relative\' }} />',
  'fontStyle: \'italic\', borderLeft: \'3px solid var(--color-cyan)\', paddingLeft: \'25px\', position: \'relative\' }} />'
);
// Wait, the quote is:
// style={{ color: 'var(--color-text-secondary)', fontSize: '1.15rem' ...
appJsx = appJsx.replace(
  'isVisualBuilder={isVisualBuilder} style={{ color: \'var(--color-text-secondary)\', fontSize: \'1.15rem\', lineHeight: 1.8, marginBottom: \'40px\', fontStyle: \'italic\'',
  'isVisualBuilder={isVisualBuilder} style={{ color: \'rgba(255,255,255,0.8)\', fontSize: \'1.15rem\', lineHeight: 1.8, marginBottom: \'40px\', fontStyle: \'italic\''
);

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Fixed Director text and reset IDs in App.jsx');
