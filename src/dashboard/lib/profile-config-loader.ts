/**
 * Profile Config Loader
 *
 * Loads and merges dashboard configuration from multiple layers:
 *   1. Profile defaults (based on profession)
 *   2. Org-level config (if user belongs to an org)
 *   3. User-level config (personal overrides)
 *
 * Merge priority: user > org > profile defaults
 */

// ─── Types ──────────────────────────────────────────────────
export interface DashboardSectionConfig {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  props: Record<string, unknown>;
}

export interface DashboardProfileConfig {
  greeting: string;
  subtitle: string;
  accentColor: string;
  sections: DashboardSectionConfig[];
}

// ─── Profile defaults ───────────────────────────────────────
const PROFILE_DEFAULTS: Record<string, DashboardProfileConfig> = {
  default: {
    greeting: 'Bonjour',
    subtitle: 'Votre tableau de bord Freenzy',
    accentColor: '#1A1A1A',
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0, props: {} },
      { id: 'quick-actions', type: 'quick-actions', visible: true, order: 1, props: {} },
      { id: 'metrics', type: 'metrics', visible: true, order: 2, props: {} },
      { id: 'agents', type: 'agents', visible: true, order: 3, props: {} },
      { id: 'approvals', type: 'approvals', visible: true, order: 4, props: {} },
      { id: 'onboarding', type: 'onboarding', visible: true, order: 5, props: {} },
    ],
  },
  restaurant: {
    greeting: 'Bonjour Chef',
    subtitle: 'Gestion de votre restaurant',
    accentColor: '#1A1A1A',
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0, props: {} },
      { id: 'quick-actions', type: 'quick-actions', visible: true, order: 1, props: {} },
      { id: 'metrics', type: 'metrics', visible: true, order: 2, props: {} },
      { id: 'agents', type: 'agents', visible: true, order: 3, props: {} },
      { id: 'approvals', type: 'approvals', visible: true, order: 4, props: {} },
    ],
  },
  immobilier: {
    greeting: 'Bonjour',
    subtitle: 'Votre agence immobiliere',
    accentColor: '#1A1A1A',
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0, props: {} },
      { id: 'metrics', type: 'metrics', visible: true, order: 1, props: {} },
      { id: 'quick-actions', type: 'quick-actions', visible: true, order: 2, props: {} },
      { id: 'agents', type: 'agents', visible: true, order: 3, props: {} },
      { id: 'approvals', type: 'approvals', visible: true, order: 4, props: {} },
    ],
  },
  cabinet: {
    greeting: 'Bonjour Maitre',
    subtitle: 'Votre cabinet',
    accentColor: '#1A1A1A',
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0, props: {} },
      { id: 'approvals', type: 'approvals', visible: true, order: 1, props: {} },
      { id: 'metrics', type: 'metrics', visible: true, order: 2, props: {} },
      { id: 'agents', type: 'agents', visible: true, order: 3, props: {} },
      { id: 'quick-actions', type: 'quick-actions', visible: true, order: 4, props: {} },
    ],
  },
};

// ─── Merge logic ────────────────────────────────────────────
function mergeSections(
  base: DashboardSectionConfig[],
  override: Partial<DashboardSectionConfig>[]
): DashboardSectionConfig[] {
  const merged = [...base];

  for (const ov of override) {
    if (!ov.id) continue;
    const idx = merged.findIndex((s) => s.id === ov.id);
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], ...ov, props: { ...merged[idx].props, ...(ov.props ?? {}) } };
    } else {
      merged.push({
        id: ov.id,
        type: ov.type ?? ov.id,
        visible: ov.visible ?? true,
        order: ov.order ?? merged.length,
        props: ov.props ?? {},
      });
    }
  }

  return merged.sort((a, b) => a.order - b.order);
}

function mergeConfig(
  base: DashboardProfileConfig,
  override: Partial<DashboardProfileConfig>
): DashboardProfileConfig {
  return {
    greeting: override.greeting ?? base.greeting,
    subtitle: override.subtitle ?? base.subtitle,
    accentColor: override.accentColor ?? base.accentColor,
    sections: override.sections
      ? mergeSections(base.sections, override.sections)
      : base.sections,
  };
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Get merged dashboard config for a user.
 * Priority: userConfig > orgConfig > profile defaults
 */
export function getProfileConfig(
  profession: string,
  userConfig?: Partial<DashboardProfileConfig>,
  orgConfig?: Partial<DashboardProfileConfig>
): DashboardProfileConfig {
  const profileKey = Object.keys(PROFILE_DEFAULTS).includes(profession) ? profession : 'default';
  let config = { ...PROFILE_DEFAULTS[profileKey] };

  if (orgConfig) {
    config = mergeConfig(config, orgConfig);
  }
  if (userConfig) {
    config = mergeConfig(config, userConfig);
  }

  return config;
}

/**
 * Fetch dashboard data for a user (server-side).
 * In a real implementation, this would query PostgreSQL.
 * For now, returns merged config from defaults + localStorage-based overrides.
 */
export async function getDashboardData(
  userId: string,
  profession: string,
  orgId?: string
): Promise<{
  config: DashboardProfileConfig;
  userConfig: Partial<DashboardProfileConfig> | null;
  orgConfig: Partial<DashboardProfileConfig> | null;
}> {
  // TODO: Replace with actual DB queries
  // const userConfig = await db.query('SELECT dashboard_config FROM users WHERE id = $1', [userId]);
  // const orgConfig = orgId ? await db.query('SELECT dashboard_config FROM orgs WHERE id = $1', [orgId]) : null;

  const userConfig: Partial<DashboardProfileConfig> | null = null;
  const orgConfig: Partial<DashboardProfileConfig> | null = null;

  // Suppress unused variable warnings — these params will be used when DB is connected
  void userId;
  void orgId;

  const config = getProfileConfig(profession, userConfig ?? undefined, orgConfig ?? undefined);

  return { config, userConfig, orgConfig };
}
