import re

filepath = 'src/dashboard/app/client/social/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Multiline patterns: className="fz-btn fz-btn-ghost"\n ... style
content = re.sub(
    r'className="fz-btn fz-btn-ghost"\n',
    r'style={CU.btnGhost}\n',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-primary"\n',
    r'style={CU.btnPrimary}\n',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-secondary fz-btn-sm"\n',
    r'style={CU.btnSmall}\n',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-ghost fz-btn-sm"\n',
    r'style={CU.btnSmall}\n',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-primary fz-btn-sm"\n',
    r'style={{...CU.btnPrimary, ...CU.btnSmall}}\n',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

remaining = len(re.findall(r'className=', content))
print(f'Done. Remaining className refs: {remaining}')
