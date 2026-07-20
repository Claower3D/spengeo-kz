import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Ensure parsed data includes articles
old_bot_check = """      if (!parsed.bot) {
        parsed.bot = { name: 'SPENGEO_ASSISTANT', welcomeMsg: 'Здравствуйте! Я автоматический ассистент СпецИнжГео. Чем могу помочь?', active: true, scenarios: [{ id: Date.now().toString(), keywords: 'цена, стоимость, прайс', answer: 'Для уточнения стоимости инженерных изысканий оставьте заявку, наш специалист свяжется с вами.' }] };
      }"""
new_bot_check = """      if (!parsed.bot) {
        parsed.bot = { name: 'SPENGEO_ASSISTANT', welcomeMsg: 'Здравствуйте! Я автоматический ассистент СпецИнжГео. Чем могу помочь?', active: true, scenarios: [{ id: Date.now().toString(), keywords: 'цена, стоимость, прайс', answer: 'Для уточнения стоимости инженерных изысканий оставьте заявку, наш специалист свяжется с вами.' }] };
      }
      if (!parsed.articles) {
        parsed.articles = BLOG_POSTS;
      }"""
content = content.replace(old_bot_check, new_bot_check)

# Fix 2: Safety guard in the articles form mapping
content = content.replace("{adminData.articles.map((article, i) => (", "{(adminData.articles || []).map((article, i) => (")
# Safety guard in the public articles list
content = content.replace("{adminData.articles.map(post => (", "{(adminData.articles || []).map(post => (")

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed state initialization to include missing articles field for cached localStorage data")
