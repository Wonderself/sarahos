import re
import sys

filepath = 'src/dashboard/app/client/social/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace className='fz-card' style={{ ... }} patterns
content = re.sub(
    r'className="fz-card" style=\{\{',
    r'style={{ ...CU.card,',
    content
)

# className='fz-card fz-card-hover' style={{ ... }}
content = re.sub(
    r'className="fz-card fz-card-hover" style=\{\{',
    r'style={{ ...CU.cardHoverable,',
    content
)

# standalone className='fz-card'>
content = re.sub(
    r'className="fz-card">',
    r'style={CU.card}>',
    content
)

# className='fz-empty'>
content = re.sub(
    r'className="fz-empty">',
    r'style={CU.emptyState}>',
    content
)
content = re.sub(
    r'className="fz-empty-icon">',
    r'style={CU.emptyEmoji}>',
    content
)
content = re.sub(
    r'className="fz-empty-title">',
    r'style={CU.emptyTitle}>',
    content
)
content = re.sub(
    r'className="fz-empty-desc">',
    r'style={CU.emptyDesc}>',
    content
)

# className='fz-input' with style
content = re.sub(
    r'className="fz-input"\s*style=\{\{',
    r'style={{ ...CU.input,',
    content
)
# standalone
content = re.sub(
    r'className="fz-input"',
    r'style={CU.input}',
    content
)

# className='fz-textarea' with style
content = re.sub(
    r'className="fz-textarea"\s*style=\{\{',
    r'style={{ ...CU.textarea,',
    content
)
content = re.sub(
    r'className="fz-textarea"',
    r'style={CU.textarea}',
    content
)

# className='fz-select' with style
content = re.sub(
    r'className="fz-select" style=\{\{',
    r'style={{ ...CU.select,',
    content
)
content = re.sub(
    r'className="fz-select">',
    r'style={CU.select}>',
    content
)

# fz-section-title
content = re.sub(
    r'className="fz-section-title" style=\{\{',
    r'style={{ ...CU.sectionTitle,',
    content
)
content = re.sub(
    r'className="fz-section-title">',
    r'style={CU.sectionTitle}>',
    content
)

# fz-section-desc
content = re.sub(
    r'className="fz-section-desc" style=\{\{',
    r'style={{ ...CU.label,',
    content
)
content = re.sub(
    r'className="fz-section-desc">',
    r'style={CU.label}>',
    content
)

# fz-divider
content = re.sub(
    r'className="fz-divider" style=\{\{',
    r'style={{ ...CU.divider,',
    content
)

# Buttons: fz-btn fz-btn-primary fz-btn-sm with style
content = re.sub(
    r'className="fz-btn fz-btn-primary fz-btn-sm" style=\{\{',
    r'style={{ ...CU.btnPrimary, ...CU.btnSmall,',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-primary" style=\{\{',
    r'style={{ ...CU.btnPrimary,',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-primary fz-btn-sm">',
    r'style={{...CU.btnPrimary, ...CU.btnSmall}}>',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-primary">',
    r'style={CU.btnPrimary}>',
    content
)

# fz-btn-danger
content = re.sub(
    r'className="fz-btn fz-btn-danger fz-btn-sm">',
    r'style={{...CU.btnDanger, ...CU.btnSmall}}>',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-danger fz-btn-sm"',
    r'style={{...CU.btnDanger, ...CU.btnSmall}}',
    content
)

# fz-btn-secondary / fz-btn-ghost with sm
content = re.sub(
    r'className="fz-btn fz-btn-secondary fz-btn-sm" style=\{\{',
    r'style={{ ...CU.btnSmall,',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-secondary fz-btn-sm">',
    r'style={CU.btnSmall}>',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-secondary" style=\{\{',
    r'style={{ ...CU.btnGhost,',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-secondary">',
    r'style={CU.btnGhost}>',
    content
)

content = re.sub(
    r'className="fz-btn fz-btn-ghost fz-btn-sm" style=\{\{',
    r'style={{ ...CU.btnSmall,',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-ghost fz-btn-sm">',
    r'style={CU.btnSmall}>',
    content
)
content = re.sub(
    r'className="fz-btn fz-btn-ghost" style=\{\{',
    r'style={{ ...CU.btnGhost,',
    content
)

# fz-btn-success (copy button)
content = re.sub(
    r'''className=\{`fz-btn \$\{copySuccess \? 'fz-btn-success' : 'fz-btn-secondary'\} fz-btn-sm`\}''',
    r'style={copySuccess ? {...CU.btnSmall, background: CU.success, color: "#fff", border: "none"} : CU.btnSmall}',
    content
)

# fz-btn fz-btn-sm with inline style
content = re.sub(
    r'className="fz-btn fz-btn-sm" style=\{\{',
    r'style={{ ...CU.btnSmall,',
    content
)

# fz-badge with style
content = re.sub(
    r'className="fz-badge" style=\{\{',
    r'style={{ ...CU.badge,',
    content
)
content = re.sub(
    r'className="fz-badge">',
    r'style={CU.badge}>',
    content
)
content = re.sub(
    r'className="fz-badge fz-badge-accent">',
    r'style={CU.badge}>',
    content
)

# Dynamic badge classNames for platform connections
content = re.sub(
    r'''className=\{`fz-badge \$\{platformKeys\.linkedin\?\.connected \? 'fz-badge-success' : ''\}`\}''',
    r'style={platformKeys.linkedin?.connected ? CU.badgeSuccess : CU.badge}',
    content
)
content = re.sub(
    r'''className=\{`fz-badge \$\{platformKeys\.facebook\?\.connected \? 'fz-badge-success' : ''\}`\}''',
    r'style={platformKeys.facebook?.connected ? CU.badgeSuccess : CU.badge}',
    content
)
content = re.sub(
    r'''className=\{`fz-badge \$\{platformKeys\.twitter\?\.connected \? 'fz-badge-success' : ''\}`\}''',
    r'style={platformKeys.twitter?.connected ? CU.badgeSuccess : CU.badge}',
    content
)
content = re.sub(
    r'''className=\{`fz-badge \$\{platformKeys\.facebook\?\.connected \? 'fz-badge-info' : ''\}`\}''',
    r'style={platformKeys.facebook?.connected ? CU.badgeSuccess : CU.badge}',
    content
)
content = re.sub(
    r'className="fz-badge fz-badge-warning">',
    r'style={CU.badgeWarning}>',
    content
)
content = re.sub(
    r'className="fz-badge fz-badge-success">',
    r'style={CU.badgeSuccess}>',
    content
)

# fz-info-box patterns
content = re.sub(
    r'className="fz-info-box fz-info-box-accent" style=\{\{',
    r'style={{ ...CU.card, borderLeft: "3px solid " + CU.accent, background: CU.accentLight,',
    content
)
content = re.sub(
    r'className="fz-info-box fz-info-box-success" style=\{\{',
    r'style={{ ...CU.card, borderLeft: "3px solid " + CU.success, background: "#F0FFF4",',
    content
)
content = re.sub(
    r'className="fz-info-box" style=\{\{',
    r'style={{ ...CU.card,',
    content
)
content = re.sub(
    r'className="fz-info-box-icon">',
    r'style={{ flexShrink: 0 }}>',
    content
)

# stat grids / stats
content = re.sub(
    r'className="fz-stat-grid" style=\{\{',
    r'style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12,',
    content
)
content = re.sub(
    r'className="fz-stat">',
    r'style={{ ...CU.card, textAlign: "center" as const }}>',
    content
)
content = re.sub(
    r'className="fz-stat" style=\{\{',
    r'style={{ ...CU.card, textAlign: "center" as const,',
    content
)
content = re.sub(
    r'className="fz-stat-label">',
    r'style={CU.statLabel}>',
    content
)
content = re.sub(
    r'className="fz-stat-value">',
    r'style={CU.statValue}>',
    content
)
content = re.sub(
    r'className="fz-stat-value" style=\{\{',
    r'style={{ ...CU.statValue,',
    content
)
content = re.sub(
    r'className="fz-stat-sub">',
    r'style={{ fontSize: 11, color: CU.textMuted, marginTop: 2 }}>',
    content
)

# section
content = re.sub(
    r'className="fz-section" style=\{\{',
    r'style={{',
    content
)
content = re.sub(
    r'className="fz-section">',
    r'>',
    content
)

# grid patterns
content = re.sub(
    r'className="fz-grid-2" style=\{\{',
    r'style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",',
    content
)
content = re.sub(
    r'className="fz-grid-2">',
    r'style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>',
    content
)
content = re.sub(
    r'className="fz-grid-3" style=\{\{',
    r'style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",',
    content
)

# isComparing button pattern
content = re.sub(
    r'''className=\{`fz-btn fz-btn-sm \$\{isComparing \? 'fz-btn-primary' : 'fz-btn-secondary'\}`\}''',
    r'style={isComparing ? {...CU.btnPrimary, ...CU.btnSmall} : CU.btnSmall}',
    content
)

# var(--radius-sm) and var(--radius-md)
content = content.replace("var(--radius-sm)", "4")
content = content.replace("var(--radius-md)", "8")

# fz-pill patterns (pill group / pill / pill-active) — convert to inline
content = re.sub(
    r'className="fz-pill-group" style=\{\{',
    r'style={{ display: "flex", gap: 6, flexWrap: "wrap" as const,',
    content
)
content = re.sub(
    r'className="fz-pill-group">',
    r'style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>',
    content
)

# fz-pill with active and style
content = re.sub(
    r'''className=\{`fz-pill \$\{([^}]+) \? 'fz-pill-active' : ''\}`\}\s*style=\{\{''',
    r'style={{ ...CU.btnSmall, fontWeight: \1 ? 600 : 400, borderColor: \1 ? CU.accent : CU.border, background: \1 ? CU.accentLight : CU.bg,',
    content
)

# fz-pill with active, no extra style
content = re.sub(
    r'''className=\{`fz-pill \$\{([^}]+) \? 'fz-pill-active' : ''\}`\}''',
    r'style={\1 ? {...CU.btnSmall, fontWeight: 600, borderColor: CU.accent, background: CU.accentLight} : CU.btnSmall}',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Social page replacements done')
print(f'Remaining className refs: {len(re.findall(r"className=", content))}')
