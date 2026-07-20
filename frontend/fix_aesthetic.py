import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the bad opacity overrides for light theme
content = content.replace(
    '[data-theme="white"] .service-bento-bg {\n  opacity: 0.15 !important;\n}',
    ''
)
content = content.replace(
    '[data-theme="white"] .service-bento-card:hover .service-bento-bg {\n  opacity: 0.3 !important;\n}',
    ''
)

# Make the overlay solid white in light theme
content = content.replace(
    '[data-theme="white"] .service-bento-overlay {\n  background: rgba(255, 255, 255, 0.95);\n}',
    '[data-theme="white"] .service-bento-overlay {\n  background: #ffffff;\n}'
)

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted to cool aesthetic and made overlay solid white")
