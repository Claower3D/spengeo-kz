import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                {adminData.services.map((item, index) => {
                  const key = item.id;
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
                })}"""

new_block = """                {adminData.services.map((item, index) => {
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
                })}"""

content = content.replace(old_block, new_block)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed services icon and title rendering!")
