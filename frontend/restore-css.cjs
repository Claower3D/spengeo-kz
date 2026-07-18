const fs = require('fs');
const path = 'c:/Users/SystemX/Documents/строй/frontend/src/index.css';
let css = fs.readFileSync(path, 'utf8');

const appendCss = `
/* ========================================= */
/* RESTORED UI COMPONENTS */
/* ========================================= */

.sidebar-nav-btn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 20px;
  color: var(--color-text-secondary);
  text-align: left;
  border-radius: var(--border-radius-md);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
}

.sidebar-nav-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(3px);
}

.sidebar-nav-btn.active {
  background: var(--bg-hover);
  color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: inset 3px 0 0 var(--color-accent), 0 4px 15px rgba(245, 158, 11, 0.15);
  font-weight: 500;
}

/* MARQUEE */
.marquee-container {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.marquee-container::before,
.marquee-container::after {
  content: "";
  position: absolute;
  top: 0;
  width: 150px;
  height: 100%;
  z-index: 2;
}
.marquee-container::before {
  left: 0;
  background: linear-gradient(to right, var(--bg-dark), transparent);
}
.marquee-container::after {
  right: 0;
  background: linear-gradient(to left, var(--bg-dark), transparent);
}

.marquee-content {
  display: flex;
  animation: marquee-scroll 35s linear infinite;
  padding-block: 20px;
  gap: 30px;
}
.marquee-content:hover {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.client-card-premium {
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.client-card-premium:hover {
  border-color: var(--color-accent);
  background: rgba(245, 158, 11, 0.05);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.15);
  transform: translateY(-5px);
}

.client-name-gradient {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(90deg, #fff, #999);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}
.client-card-premium:hover .client-name-gradient {
  background: linear-gradient(90deg, var(--color-accent), #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* CALCULATOR */
.calc-form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
}
.calc-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  font-weight: 500;
}
.calc-label span:last-child {
  color: var(--color-accent);
  font-family: var(--font-mono);
}

.soil-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}
.soil-btn {
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.soil-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}
.soil-btn.active {
  background: var(--bg-hover);
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent), 0 4px 15px rgba(245, 158, 11, 0.15);
}

.equip-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 40px;
}
.equip-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.equip-item-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.equip-item-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  transform: translateX(3px);
}
.equip-item-btn.active {
  background: var(--bg-hover);
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: inset 3px 0 0 var(--color-accent);
}

.soil-parameter-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.soil-parameter-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.soil-parameter-label {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.soil-parameter-value {
  color: var(--color-text-primary);
  font-weight: 500;
  text-align: right;
  max-width: 60%;
}
`;

if (!css.includes('.sidebar-nav-btn')) {
  fs.appendFileSync(path, appendCss, 'utf8');
  console.log('Restored missing CSS for sidebar, marquee, and calculator.');
} else {
  console.log('CSS already exists.');
}
