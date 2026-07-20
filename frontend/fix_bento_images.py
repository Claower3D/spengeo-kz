import re

try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        content = f.read()

# Replace bento card images
content = re.sub(
    r'<img src="/images/services/([a-z]+)\.jpg"',
    r'<img src={adminData.services.find(s => s.id === \'\1\')?.image || "/images/services/\1.jpg"}',
    content
)

# Replace detail view image
old_detail_img = '''                  {(activeServiceTab === 'geodesy' || activeServiceTab === 'laboratory') && (
                    <div className="service-img-wrapper">
                      <img src={`/images/${activeServiceTab === 'geodesy' ? 'geodesy.png' : 'lab.png'}`} alt={activeServiceTab} />
                      <div className="service-img-overlay"></div>
                    </div>
                  )}'''

new_detail_img = '''                  {((adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).image) && (
                    <div className="service-img-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
                      <img src={(adminData.services.find(s => s.id === activeServiceTab) || adminData.services[0]).image} alt={activeServiceTab} style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                      <div className="service-img-overlay"></div>
                    </div>
                  )}'''

content = content.replace(old_detail_img, new_detail_img)

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
