import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace root variables
content = content.replace('--color-accent: #FFD500;', '--color-accent: #3b82f6;')
content = content.replace('--color-accent-glow: rgba(255, 213, 0, 0.25);', '--color-accent-glow: rgba(59, 130, 246, 0.25);')
content = content.replace('--color-cyan: #FFD500;', '--color-cyan: #0ea5e9;')
content = content.replace('--color-cyan-glow: rgba(255, 213, 0, 0.25);', '--color-cyan-glow: rgba(14, 165, 233, 0.25);')
content = content.replace('--border-accent: rgba(255, 213, 0, 0.3);', '--border-accent: rgba(59, 130, 246, 0.3);')

# Replace theme variables (amber to blue)
content = content.replace('--color-accent: #f59e0b;', '--color-accent: #3b82f6;')
content = content.replace('--color-accent: #d97706;', '--color-accent: #2563eb;')
content = content.replace('rgba(245, 158, 11', 'rgba(59, 130, 246')
content = content.replace('#fbbf24', '#60a5fa')

# For anything explicitly yellow in CSS:
# "yellow", "amber" (just in case they are used as class names, but likely not).

with open('c:/Users/SystemX/Documents/строй/frontend/src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced yellow/amber colors with premium blue colors!")
