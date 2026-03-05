// ═══════════════════════════════════════════════════════
// CV Agent — Tools & Repository (DAO)
// ═══════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../../../../infra';
import { logger } from '../../../../utils/logger';
import type {
  CVProfile,
  CVContactInfo,
  CVSkill,
  CVExperience,
  CVEducation,
  CVCertification,
  CVLanguage,
} from './cv.types';

// ── Get Profile ──

export async function getProfile(userId: string): Promise<CVProfile | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const result = await dbClient.query(
      'SELECT * FROM cv_profiles WHERE user_id = $1',
      [userId],
    );
    if (result.rows.length === 0) return null;
    return rowToProfile(result.rows[0] as Record<string, unknown>);
  } catch (err) {
    logger.error('Failed to get CV profile', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Upsert Profile ──

export async function upsertProfile(
  userId: string,
  data: Partial<CVProfile>,
): Promise<CVProfile | null> {
  if (!dbClient.isConnected()) return null;
  try {
    const existing = await getProfile(userId);

    if (existing) {
      // UPDATE
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      const mappable: Array<[string, unknown]> = [
        ['full_name', data.fullName],
        ['title', data.title],
        ['summary', data.summary],
        ['career_goals', data.careerGoals],
        ['interests', data.interests],
        ['target_roles', data.targetRoles],
      ];

      for (const [col, val] of mappable) {
        if (val !== undefined) {
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      // JSONB fields
      const jsonbMappable: Array<[string, unknown]> = [
        ['contact_info', data.contactInfo],
        ['skills', data.skills],
        ['experiences', data.experiences],
        ['education', data.education],
        ['certifications', data.certifications],
        ['languages', data.languages],
        ['last_ai_analysis', data.lastAiAnalysis],
      ];

      for (const [col, val] of jsonbMappable) {
        if (val !== undefined) {
          fields.push(`${col} = $${idx++}`);
          values.push(JSON.stringify(val));
        }
      }

      if (fields.length === 0) return existing;

      fields.push(`version = version + 1`);
      fields.push(`updated_at = NOW()`);
      values.push(userId);

      const result = await dbClient.query(
        `UPDATE cv_profiles SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
        values,
      );
      if (result.rows.length === 0) return null;
      return rowToProfile(result.rows[0] as Record<string, unknown>);
    } else {
      // INSERT
      const id = uuidv4();
      const result = await dbClient.query(
        `INSERT INTO cv_profiles
         (id, user_id, full_name, title, summary, contact_info, skills,
          experiences, education, certifications, languages, interests,
          career_goals, target_roles, last_ai_analysis, version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,1)
         RETURNING *`,
        [
          id,
          userId,
          data.fullName ?? null,
          data.title ?? null,
          data.summary ?? null,
          JSON.stringify(data.contactInfo ?? {}),
          JSON.stringify(data.skills ?? []),
          JSON.stringify(data.experiences ?? []),
          JSON.stringify(data.education ?? []),
          JSON.stringify(data.certifications ?? []),
          JSON.stringify(data.languages ?? []),
          data.interests ?? [],
          data.careerGoals ?? null,
          data.targetRoles ?? [],
          JSON.stringify(data.lastAiAnalysis ?? null),
        ],
      );
      return rowToProfile(result.rows[0] as Record<string, unknown>);
    }
  } catch (err) {
    logger.error('Failed to upsert CV profile', {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ── Format CV Text ──

export function formatCVText(profile: CVProfile): string {
  const lines: string[] = [];

  // Header
  if (profile.fullName) lines.push(`# ${profile.fullName}`);
  if (profile.title) lines.push(`**${profile.title}**`);
  lines.push('');

  // Contact
  const contact = profile.contactInfo;
  const contactParts: string[] = [];
  if (contact.email) contactParts.push(contact.email);
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.city && contact.country) contactParts.push(`${contact.city}, ${contact.country}`);
  else if (contact.city) contactParts.push(contact.city);
  if (contact.linkedin) contactParts.push(contact.linkedin);
  if (contact.github) contactParts.push(contact.github);
  if (contact.website) contactParts.push(contact.website);
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
    lines.push('');
  }

  // Summary
  if (profile.summary) {
    lines.push('## Resume professionnel');
    lines.push(profile.summary);
    lines.push('');
  }

  // Experience
  if (profile.experiences.length > 0) {
    lines.push('## Experiences professionnelles');
    for (const exp of profile.experiences) {
      const period = exp.current
        ? `${exp.startDate} - Actuel`
        : `${exp.startDate} - ${exp.endDate ?? ''}`;
      lines.push(`### ${exp.role} — ${exp.company} (${period})`);
      if (exp.location) lines.push(`*${exp.location}*`);
      if (exp.description) lines.push(exp.description);
      for (const achievement of exp.achievements) {
        lines.push(`- ${achievement}`);
      }
      if (exp.technologies.length > 0) {
        lines.push(`Technologies : ${exp.technologies.join(', ')}`);
      }
      lines.push('');
    }
  }

  // Skills
  if (profile.skills.length > 0) {
    lines.push('## Competences');
    const byCategory = new Map<string, CVSkill[]>();
    for (const skill of profile.skills) {
      const cat = skill.category;
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(skill);
    }
    for (const [category, skills] of byCategory) {
      lines.push(`**${category}** : ${skills.map(s => `${s.name} (${s.level})`).join(', ')}`);
    }
    lines.push('');
  }

  // Education
  if (profile.education.length > 0) {
    lines.push('## Formation');
    for (const edu of profile.education) {
      const period = edu.current
        ? `${edu.startYear} - En cours`
        : `${edu.startYear} - ${edu.endYear ?? ''}`;
      lines.push(`**${edu.degree}** — ${edu.institution} (${period})`);
      if (edu.field) lines.push(`Domaine : ${edu.field}`);
      if (edu.honors) lines.push(`Mention : ${edu.honors}`);
    }
    lines.push('');
  }

  // Certifications
  if (profile.certifications.length > 0) {
    lines.push('## Certifications');
    for (const cert of profile.certifications) {
      lines.push(`- **${cert.name}** — ${cert.issuer} (${cert.date})`);
    }
    lines.push('');
  }

  // Languages
  if (profile.languages.length > 0) {
    lines.push('## Langues');
    for (const lang of profile.languages) {
      lines.push(`- ${lang.language} : ${lang.level}`);
    }
    lines.push('');
  }

  // Interests
  if (profile.interests.length > 0) {
    lines.push('## Centres d\'interet');
    lines.push(profile.interests.join(', '));
    lines.push('');
  }

  return lines.join('\n');
}

// ── Row Mapper ──

function rowToProfile(row: Record<string, unknown>): CVProfile {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    fullName: (row['full_name'] as string) ?? null,
    title: (row['title'] as string) ?? null,
    summary: (row['summary'] as string) ?? null,
    contactInfo: (row['contact_info'] as CVContactInfo) ?? {
      email: null, phone: null, linkedin: null, github: null, website: null, city: null, country: null,
    },
    skills: (row['skills'] as CVSkill[]) ?? [],
    experiences: (row['experiences'] as CVExperience[]) ?? [],
    education: (row['education'] as CVEducation[]) ?? [],
    certifications: (row['certifications'] as CVCertification[]) ?? [],
    languages: (row['languages'] as CVLanguage[]) ?? [],
    interests: (row['interests'] as string[]) ?? [],
    careerGoals: (row['career_goals'] as string) ?? null,
    targetRoles: (row['target_roles'] as string[]) ?? [],
    lastAiAnalysis: (row['last_ai_analysis'] as Record<string, unknown>) ?? null,
    version: (row['version'] as number) ?? 1,
    createdAt: new Date(row['created_at'] as string),
    updatedAt: new Date(row['updated_at'] as string),
  };
}
