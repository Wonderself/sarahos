import * as fs from 'fs';
import * as path from 'path';

/**
 * Freenzy.io — Email Template Renderer
 *
 * Reads HTML template files, replaces {{VARIABLE}} placeholders,
 * wraps content in the base layout, and escapes dangerous characters.
 */

const TEMPLATES_DIR = path.resolve(__dirname);

/** Characters that should be escaped in user-supplied variable values */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Safe variable names that contain pre-rendered HTML and should NOT be escaped */
const HTML_SAFE_VARIABLES = new Set([
  'CONTENT',
  'FOOTER_TEXT',
]);

/**
 * Replaces all {{VARIABLE}} occurrences in a template string.
 * Logs warnings for missing variables but never crashes.
 */
function replaceVariables(
  template: string,
  variables: Record<string, string>,
  templateName: string
): string {
  // Find all variable placeholders
  const placeholderRegex = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g;
  const foundPlaceholders = new Set<string>();

  const result = template.replace(placeholderRegex, (_match, varName: string) => {
    foundPlaceholders.add(varName);

    if (varName in variables) {
      const value = variables[varName];
      // Skip escaping for known HTML-safe variables
      if (HTML_SAFE_VARIABLES.has(varName)) {
        return value;
      }
      return escapeHtml(value);
    }

    // Log missing variable but keep the placeholder visible for debugging
    console.warn(
      JSON.stringify({
        level: 'warn',
        service: 'email-renderer',
        action: 'missing_variable',
        template: templateName,
        variable: varName,
        timestamp: new Date().toISOString(),
      })
    );
    return `{{${varName}}}`;
  });

  return result;
}

/**
 * Reads an HTML template file from the templates directory.
 * Returns null if the file does not exist.
 */
function readTemplate(templateName: string): string | null {
  const filePath = path.join(TEMPLATES_DIR, templateName);

  if (!fs.existsSync(filePath)) {
    console.error(
      JSON.stringify({
        level: 'error',
        service: 'email-renderer',
        action: 'template_not_found',
        template: templateName,
        path: filePath,
        timestamp: new Date().toISOString(),
      })
    );
    return null;
  }

  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Default values for base layout variables.
 */
const BASE_DEFAULTS: Record<string, string> = {
  ACCENT_COLOR: '#1A1A1A',
  LOGO_TEXT: 'FREENZY.IO',
  FOOTER_TEXT: 'Freenzy.io &mdash; Votre &eacute;quipe IA autonome.',
  UNSUBSCRIBE_URL: 'https://freenzy.io/unsubscribe',
  PREVIEW_TEXT: '',
  SUBJECT: 'Freenzy.io',
};

/**
 * Renders a complete email by:
 * 1. Reading the content template (e.g. welcome-artisan.html)
 * 2. Replacing variables in the content template
 * 3. Wrapping the rendered content in the base layout
 * 4. Replacing base layout variables
 *
 * @param templateName - The filename of the content template (e.g. "welcome-artisan.html")
 * @param variables - Key-value pairs for all {{VARIABLE}} placeholders
 * @returns The fully rendered HTML string, or an empty string on failure
 */
export function renderEmail(
  templateName: string,
  variables: Record<string, string>
): string {
  // Read content template
  const contentTemplate = readTemplate(templateName);
  if (!contentTemplate) {
    return '';
  }

  // Read base layout
  const baseLayout = readTemplate('base-layout.html');
  if (!baseLayout) {
    // If no base layout, render content standalone
    return replaceVariables(contentTemplate, variables, templateName);
  }

  // Merge defaults with provided variables
  const mergedVars: Record<string, string> = {
    ...BASE_DEFAULTS,
    ...variables,
  };

  // First pass: replace variables in the content template
  const renderedContent = replaceVariables(contentTemplate, mergedVars, templateName);

  // Inject rendered content into base layout
  mergedVars['CONTENT'] = renderedContent;

  // Second pass: replace variables in the base layout (including {{CONTENT}})
  const finalHtml = replaceVariables(baseLayout, mergedVars, 'base-layout.html');

  return finalHtml;
}

/**
 * Renders a content template WITHOUT wrapping in the base layout.
 * Useful for templates that include their own full HTML structure.
 */
export function renderEmailStandalone(
  templateName: string,
  variables: Record<string, string>
): string {
  const contentTemplate = readTemplate(templateName);
  if (!contentTemplate) {
    return '';
  }

  const mergedVars: Record<string, string> = {
    ...BASE_DEFAULTS,
    ...variables,
  };

  return replaceVariables(contentTemplate, mergedVars, templateName);
}

export { escapeHtml, replaceVariables, readTemplate };
