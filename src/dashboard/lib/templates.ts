// ─── Template System ──────────────────────────────────────
// Manages reusable templates in localStorage for projects,
// invoices, emails, and meetings.

const STORAGE_KEY = 'sarah_templates';

// ─── Types ────────────────────────────────────────────────

export type TemplateType = 'project' | 'invoice' | 'email' | 'meeting';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  data: Record<string, unknown>;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────

function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function loadAllTemplates(): Template[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Template[];
  } catch {
    return [];
  }
}

function persistTemplates(templates: Template[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Storage full or unavailable
  }
}

// ─── Public API ───────────────────────────────────────────

/**
 * Save a new template to localStorage.
 * Automatically assigns an `id` and `createdAt` timestamp.
 * Returns the newly created template.
 */
export function saveTemplate(
  template: Omit<Template, 'id' | 'createdAt'>,
): Template {
  const templates = loadAllTemplates();

  const newTemplate: Template = {
    ...template,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  templates.push(newTemplate);
  persistTemplates(templates);

  return newTemplate;
}

/**
 * Get all templates, optionally filtered by type.
 * Returns templates sorted by creation date (newest first).
 */
export function getTemplates(type?: TemplateType): Template[] {
  const templates = loadAllTemplates();

  const filtered = type
    ? templates.filter((t) => t.type === type)
    : templates;

  // Sort newest first
  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Delete a template by its ID.
 * Returns true if the template was found and deleted, false otherwise.
 */
export function deleteTemplate(id: string): boolean {
  const templates = loadAllTemplates();
  const index = templates.findIndex((t) => t.id === id);

  if (index === -1) return false;

  templates.splice(index, 1);
  persistTemplates(templates);

  return true;
}

/**
 * Apply a template by returning its data.
 * Returns the template data object, or null if not found.
 */
export function applyTemplate(templateId: string): Record<string, unknown> | null {
  const templates = loadAllTemplates();
  const template = templates.find((t) => t.id === templateId);

  if (!template) return null;

  // Return a copy to avoid mutation
  return { ...template.data };
}
