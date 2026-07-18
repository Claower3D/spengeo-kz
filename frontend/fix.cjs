const fs = require('fs');
let appJsx = fs.readFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'utf8');

appJsx = appJsx.replace(
  "display: isVisualBuilder ? 'inline-block' : 'inherit',",
  "display: isVisualBuilder ? 'inline-block' : (style && style.display ? style.display : undefined),"
);

const searchUl = "<ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0 }}>";
const replaceUl = "<ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, listStyleType: 'none' }}>";

// Wait! If I add listStyleType: 'disc', it will conflict with display: 'flex'.
// Because flex items don't have list markers! Wait!
// If I remove display: 'flex' from the UL, the list items will render normally with bullets!
// Let's replace the flex styling on the UL so it behaves correctly.

const newUl = "<ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>";
appJsx = appJsx.split(searchUl).join(newUl);

// Also add a global style for these list items or just gap. Without flex, margin-bottom on li is better.
// Actually, I can just add a gap-equivalent margin to the li in CSS later.
// Or I can add a small padding-bottom to the li manually, or just use flex but with block inside.
// Wait, if EditableText has display: undefined, the li will be display: list-item.
// If the UL has display: flex and flex-direction: column, the li items will become flex children! And flex children lose their list markers (bullets disappear)!
// So I MUST remove display: flex from the UL to keep the bullets if we want bullets.
// If we don't want bullets, we can keep flex. But the screenshot shows the text is squished.
// If I remove display: flex, it becomes a block element. `gap: 12px` won't work on block elements (except in modern CSS where gap works on flex, grid, and multi-column, wait, it works on block now? No, gap works on block in very recent browsers, maybe not reliable).
// Let's just remove display: flex, flexDirection, gap, and add listStyleType: 'none'. Wait, if we use listStyleType: 'none', we don't have bullets. The user's screenshot didn't have bullets. The squishing was because of `display: flex` on the `<li>` (inherited from parent).
// Let's just change `EditableText` first!
// If we only change `EditableText`, the `<li>` will fall back to `display: list-item`.
// Let's write the updated appJsx to disk and see.

fs.writeFileSync('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', appJsx);
console.log('Fixed flex text issue in App.jsx');
