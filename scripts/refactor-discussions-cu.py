import re

filepath = 'src/dashboard/app/client/discussions/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── Replace var(--fz-*) CSS variable fallback patterns ───
# var(--fz-text, #1E293B)  →  CU.text  (note: #1E293B ≈ #1A1A1A)
content = content.replace("'var(--fz-text, #1E293B)'", "CU.text")
content = content.replace("var(--fz-text, #1E293B)", "#1A1A1A")

# var(--fz-text-secondary, #64748B)  →  CU.textSecondary
content = content.replace("var(--fz-text-secondary, #64748B)", "#6B6B6B")

# var(--fz-text-muted, #94A3B8)  →  CU.textMuted
content = content.replace("var(--fz-text-muted, #94A3B8)", "#9B9B9B")

# var(--fz-bg, #FFFFFF)
content = content.replace("var(--fz-bg, #FFFFFF)", "#fff")

# var(--fz-bg-secondary, #F8FAFC)
content = content.replace("var(--fz-bg-secondary, #F8FAFC)", CU_BG_SEC := "#FAFAFA")

# var(--fz-border, #E2E8F0)
content = content.replace("var(--fz-border, #E2E8F0)", "#E5E5E5")

# borderRadius: 12 → 8 (only for card-like elements, be careful)
# Only replace exact borderRadius: 12 occurrences
content = content.replace("borderRadius: 12,", "borderRadius: 8,")
content = content.replace("borderRadius: 12 ", "borderRadius: 8 ")

# Replace borderRadius: isMobile ? 12 : 16 in wizard
content = content.replace("borderRadius: isMobile ? 12 : 16", "borderRadius: isMobile ? 8 : 12")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Discussions page replacements done')
remaining_vars = len(re.findall(r'var\(--fz-', content))
print(f'Remaining var(--fz-*) refs: {remaining_vars}')
remaining_classnames = len(re.findall(r'className=', content))
print(f'Remaining className refs: {remaining_classnames}')
