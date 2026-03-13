import re

filepath = 'src/dashboard/app/client/discussions/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# borderRadius: 10 → 8 (card-like elements)
content = content.replace("borderRadius: 10,", "borderRadius: 8,")
content = content.replace("borderRadius: 10 ", "borderRadius: 8 ")
content = content.replace("borderRadius: 10,", "borderRadius: 8,")

# Replace color: 'var(--fz-text, #1E293B)' leftovers that became CU.text
# (the first script turned the var() into #1A1A1A, which is fine)

# Replace remaining hardcoded colors that should use CU references
# '#1E293B' → CU.text (already converted by var replacement)

# Left panel background
content = content.replace(
    "background: '#FAFAFA',",
    "background: CU.bgSecondary,",
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Discussions page borderRadius + color fixes done')
