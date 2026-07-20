import re

try:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'r', encoding='utf-16') as f:
        content = f.read()

content = content.replace("s.id === \\'geology\\'", "s.id === 'geology'")
content = content.replace("s.id === \\'geodesy\\'", "s.id === 'geodesy'")
content = content.replace("s.id === \\'cpt\\'", "s.id === 'cpt'")
content = content.replace("s.id === \\'piles\\'", "s.id === 'piles'")
content = content.replace("s.id === \\'plates\\'", "s.id === 'plates'")
content = content.replace("s.id === \\'laboratory\\'", "s.id === 'laboratory'")

with open('c:\\Users\\SystemX\\Documents\\строй\\frontend\\src\\App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed JSX escaping errors!')
