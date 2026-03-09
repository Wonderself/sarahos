// ═══════════════════════════════════════════════════
//   FREENZY.IO — Widget Configuration
//   Embeddable chat widget types and defaults
// ═══════════════════════════════════════════════════

export interface WidgetConfig {
  agentId: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  headerTitle: string;
  borderRadius: number;
  width: number;
  height: number;
}

const STORAGE_KEY = 'fz_widget_config';

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  agentId: 'fz-repondeur',
  primaryColor: '#5b6cf7',
  position: 'bottom-right',
  welcomeMessage: 'Bonjour ! Comment puis-je vous aider ?',
  headerTitle: 'Assistant Freenzy',
  borderRadius: 16,
  width: 380,
  height: 520,
};

export function loadWidgetConfig(): WidgetConfig {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_WIDGET_CONFIG;
    return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(stored) };
  } catch { return DEFAULT_WIDGET_CONFIG; }
}

export function saveWidgetConfig(config: WidgetConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateEmbedCode(config: WidgetConfig, baseUrl: string = 'https://freenzy.io'): string {
  // Validate baseUrl is a proper https URL
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      baseUrl = 'https://freenzy.io';
    }
  } catch {
    baseUrl = 'https://freenzy.io';
  }
  return `<script src="${escapeAttr(baseUrl)}/embed/chat.js" data-agent="${escapeAttr(config.agentId)}" data-color="${escapeAttr(config.primaryColor)}" data-position="${escapeAttr(config.position)}" data-welcome="${escapeAttr(config.welcomeMessage)}" data-title="${escapeAttr(config.headerTitle)}" data-radius="${config.borderRadius}" data-width="${config.width}" data-height="${config.height}"></script>`;
}
