import re

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DRILLING_RIGS map
old_rigs_map = """                  {DRILLING_RIGS.map((rig, idx) => ("""
new_rigs_map = """                  {(adminData.dynamicLists?.['equipment_rigs_0'] || DRILLING_RIGS).map((rig, idx) => ("""
content = content.replace(old_rigs_map, new_rigs_map)

# Replace LAB_EQUIP map
old_lab_map = """                  {LAB_EQUIP.map((lab, idx) => ("""
new_lab_map = """                  {(adminData.dynamicLists?.['equipment_lab_2'] || LAB_EQUIP).map((lab, idx) => ("""
content = content.replace(old_lab_map, new_lab_map)

with open('c:/Users/SystemX/Documents/строй/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated mapping logic!")
