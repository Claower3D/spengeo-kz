import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the width of content to prevent overlapping with image
content = content.replace("width: 65%;", "width: 55%;")

# Fix light theme text color and font weight
content = content.replace(
    '[data-theme="white"] .service-bento-list li {\n  color: #334155;\n}',
    '[data-theme="white"] .service-bento-list li {\n  color: #0f172a;\n  font-weight: 500;\n  font-size: 1rem;\n}'
)

# Fix the opacity bug in light theme
content = content.replace(
    '[data-theme="white"] .service-bento-bg {\n  opacity: 0.3;\n}',
    '[data-theme="white"] .service-bento-bg {\n  opacity: 0.15 !important;\n}'
)
content = content.replace(
    '[data-theme="white"] .service-bento-card:hover .service-bento-bg {\n  opacity: 0.5;\n}',
    '[data-theme="white"] .service-bento-card:hover .service-bento-bg {\n  opacity: 0.3 !important;\n}'
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed bento cards visibility")
