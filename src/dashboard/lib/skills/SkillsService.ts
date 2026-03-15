// ═══════════════════════════════════════════════════
//   FREENZY.IO — Skills Service
//   Manages installed skills via localStorage
// ═══════════════════════════════════════════════════

import {
  Skill,
  SKILLS_CATALOG,
  getSkillById,
  getSkillsByProfile,
} from './skills-data';

const INSTALLED_SKILLS_KEY = 'fz_installed_skills';
const SKILL_USAGE_KEY = 'fz_skill_usage';

interface SkillUsageMap {
  [skillId: string]: number;
}

function readInstalledIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INSTALLED_SKILLS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function writeInstalledIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INSTALLED_SKILLS_KEY, JSON.stringify(ids));
}

function readUsageMap(): SkillUsageMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SKILL_USAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as SkillUsageMap;
  } catch {
    return {};
  }
}

function writeUsageMap(map: SkillUsageMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SKILL_USAGE_KEY, JSON.stringify(map));
}

export const SkillsService = {
  /**
   * Returns an array of installed skill IDs.
   */
  getInstalledSkills(): string[] {
    return readInstalledIds();
  },

  /**
   * Installs a skill by adding its ID to the installed list.
   * No-op if already installed or if skill ID does not exist in catalog.
   */
  installSkill(skillId: string): void {
    if (!getSkillById(skillId)) return;
    const ids = readInstalledIds();
    if (ids.includes(skillId)) return;
    ids.push(skillId);
    writeInstalledIds(ids);
  },

  /**
   * Uninstalls a skill by removing its ID from the installed list.
   */
  uninstallSkill(skillId: string): void {
    const ids = readInstalledIds();
    const filtered = ids.filter((id) => id !== skillId);
    writeInstalledIds(filtered);
  },

  /**
   * Returns true if the given skill ID is currently installed.
   */
  isInstalled(skillId: string): boolean {
    return readInstalledIds().includes(skillId);
  },

  /**
   * Returns the number of times a skill has been used.
   */
  getUsageCount(skillId: string): number {
    const map = readUsageMap();
    return map[skillId] ?? 0;
  },

  /**
   * Increments the usage counter for a skill.
   */
  trackUsage(skillId: string): void {
    const map = readUsageMap();
    map[skillId] = (map[skillId] ?? 0) + 1;
    writeUsageMap(map);
  },

  /**
   * Returns the full Skill objects for all installed skills.
   * Filters out any IDs that no longer exist in the catalog.
   */
  getInstalledSkillsData(): Skill[] {
    const ids = readInstalledIds();
    const skills: Skill[] = [];
    for (const id of ids) {
      const skill = getSkillById(id);
      if (skill) {
        skills.push(skill);
      }
    }
    return skills;
  },

  /**
   * Recommends skills based on a profession, excluding already-installed skills.
   * Returns up to 10 recommendations sorted by popularity.
   */
  getRecommendedSkills(profession: string, installedIds: string[]): Skill[] {
    const installedSet = new Set(installedIds);

    // Get skills matching the profession
    const profileMatches = getSkillsByProfile(profession).filter(
      (s) => !installedSet.has(s.id)
    );

    // If we have enough profile matches, return them sorted by popularity
    if (profileMatches.length >= 10) {
      return profileMatches
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 10);
    }

    // Otherwise, fill with popular skills not yet installed
    const matchIds = new Set(profileMatches.map((s) => s.id));
    const fillers = SKILLS_CATALOG.filter(
      (s) => !installedSet.has(s.id) && !matchIds.has(s.id)
    ).sort((a, b) => b.popularity - a.popularity);

    const combined = [...profileMatches, ...fillers];
    return combined
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);
  },
};
