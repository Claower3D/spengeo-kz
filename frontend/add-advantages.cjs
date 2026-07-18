const fs = require('fs');
const pathJSX = 'c:/Users/SystemX/Documents/строй/frontend/src/App.jsx';
let jsx = fs.readFileSync(pathJSX, 'utf8');

const advantagesSection = `
            {/* ==================== PAGE: ADVANTAGES (KARGIIZ STYLE) ==================== */}
            <section style={{ marginBottom: '80px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
                
                {/* Card 1 */}
                <div style={{ backgroundColor: '#091524', border: '1px solid rgba(255,255,255,0.05)', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255, 213, 0, 0.1)', border: '1px solid rgba(255, 213, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={24} color="var(--color-accent)" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, textTransform: 'uppercase' }}>Комплексный подход «под ключ»</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Мы берем на себя все этапы инженерных изысканий — от предварительных консультаций до подготовки итоговой документации. Это избавляет клиента от необходимости привлекать множество подрядчиков, экономит время и средства, а также гарантирует целостность и согласованность результатов.
                  </p>
                </div>

                {/* Card 2 (Yellow border accent) */}
                <div style={{ backgroundColor: '#091524', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid var(--color-accent)', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255, 213, 0, 0.1)', border: '1px solid rgba(255, 213, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={24} color="var(--color-accent)" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, textTransform: 'uppercase' }}>Выгода для клиента:</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Экономия времени и бюджета</strong>
                      <span>— за счет оптимизации процессов и отсутствия лишних звеньев в цепочке.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Гарантия соответствия нормативам</strong>
                      <span>— все работы ведутся в строгом соответствии со СНиП, СП и другими стандартами РК.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Индивидуальный подход</strong>
                      <span>— адаптируем решения под задачи конкретного проекта, будь то жилое строительство, промышленный объект или инфраструктура.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Оперативность</strong>
                      <span>— гибкая логистика и мобильные бригады позволяют нам работать в любом регионе страны, включая труднодоступные районы.</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div style={{ backgroundColor: '#091524', border: '1px solid rgba(255,255,255,0.05)', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255, 213, 0, 0.1)', border: '1px solid rgba(255, 213, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} color="var(--color-accent)" />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, textTransform: 'uppercase' }}>Качество как основа</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '10px' }}>
                    Мы используем современное оборудование, новейшие методы исследований и цифровую обработку данных. Команда инженеров, геологов и изыскателей проходит постоянное повышение квалификации. Это обеспечивает:
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Точность данных</strong>
                      <span>— минимизация рисков при проектировании и строительстве.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Надежность решений</strong>
                      <span>— позволяет избежать ошибок, ведущих к дополнительным расходам.</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px' }}>
                      <strong style={{ color: '#fff' }}>Долгосрочное сотрудничество</strong>
                      <span>— наша репутация строится на качестве и доверии.</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
`;

const insertMarker = '</section>';
const bentoGridEndIndex = jsx.indexOf(insertMarker, jsx.indexOf('className="bento-grid"'));

if (bentoGridEndIndex !== -1) {
    jsx = jsx.substring(0, bentoGridEndIndex + insertMarker.length) + '\n' + advantagesSection + jsx.substring(bentoGridEndIndex + insertMarker.length);
    fs.writeFileSync(pathJSX, jsx, 'utf8');
}
console.log('Advantages section added!');
