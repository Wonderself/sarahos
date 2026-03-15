// ═══════════════════════════════════════════════════
//   FREENZY.IO — Skills Module (barrel export)
// ═══════════════════════════════════════════════════

export type { Skill, SkillCategory, SkillCategoryMeta } from './skills-data';

export {
  SKILLS_CATALOG,
  SKILL_CATEGORIES,
  getSkillById,
  getSkillsByCategory,
  getSkillsByProfile,
  getPopularSkills,
  getNewSkills,
} from './skills-data';

export { SkillsService } from './SkillsService';
