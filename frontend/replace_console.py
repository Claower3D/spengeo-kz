import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                {/* System Console Monitor */}
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
                </div>"""

new_block = """                {/* System Info Block */}
                <div style={{ marginBottom: '20px', padding: '20px', background: theme === 'white' ? '#f8fafc' : 'rgba(30, 41, 59, 0.5)', borderRadius: 'var(--border-radius-md)', border: theme === 'white' ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                  <span className="spec-label" style={{ color: 'var(--color-cyan)', marginBottom: '10px', display: 'block' }}>Добро пожаловать</span>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                    Вы находитесь в защищенной панели управления платформой ТОО «СпецИнжГео». Здесь вы можете редактировать контент сайта, добавлять новые услуги, управлять базой проектов и оборудования, а также отслеживать аналитику.
                  </p>
                </div>"""

content = content.replace(old_block, new_block)

# Also remove systemLogs state to clean up
old_logs_state = """  const [systemLogs, setSystemLogs] = useState([
    { time: '02:02:10', type: 'info', text: 'SPENGEO CLI Engine initialized successfully.' },
    { time: '02:02:12', type: 'success', text: 'Structure modernized: 7 Services, 50+ Projects, 100+ Blog posts active.' },
    { time: '02:02:15', type: 'info', text: 'Established link to Go DB at port 8083.' }
  ]);"""

content = content.replace(old_logs_state, "")

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced console monitor with welcome text!")
