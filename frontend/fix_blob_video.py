import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix video rendering
old_video_condition = "item.image.startsWith('data:video/') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') ?"
new_video_condition = "item.image.startsWith('data:video/') || item.image.startsWith('blob:') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') || activeSubPage === 'videos' ?"

content = content.replace(old_video_condition, new_video_condition)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed blob URL video rendering!")
