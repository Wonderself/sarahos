/**
 * FEATURE 8 — Mémoire longue durée (MEMORY.md)
 * Persistance des décisions, bugs, insights dans un fichier Markdown
 */
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';
const MEMORY_PATH = path.join(PROJECT_ROOT, 'MEMORY.md');

const INITIAL_CONTENT = `# Mémoire Freenzy.io — Journal de bord Claude

## À propos de ce fichier
Ce fichier est mis à jour automatiquement par Claude Code.
Il contient les décisions prises, bugs résolus, features rejetées,
et insights importants sur Freenzy.io.
Il est injecté dans chaque conversation pour éviter de répéter les mêmes erreurs.

## Décisions d'architecture

## Bugs résolus

## Features rejetées et pourquoi

## Insights utilisateurs

## Notes stratégiques
`;

const SECTION_MAP: Record<string, string> = {
  decision: '## Décisions d\'architecture',
  bug: '## Bugs résolus',
  rejected: '## Features rejetées et pourquoi',
  insight: '## Insights utilisateurs',
  strategic: '## Notes stratégiques',
};

function ensureFile(): void {
  if (!fs.existsSync(MEMORY_PATH)) {
    fs.writeFileSync(MEMORY_PATH, INITIAL_CONTENT, 'utf-8');
  }
}

export const Memory = {
  /**
   * Save an entry to the appropriate section of MEMORY.md
   */
  async save(category: string, content: string): Promise<void> {
    ensureFile();
    const sectionHeader = SECTION_MAP[category] || SECTION_MAP.strategic;
    const date = new Date().toISOString().split('T')[0];
    const entry = `\n- **${date}** — ${content}`;

    let file = fs.readFileSync(MEMORY_PATH, 'utf-8');
    const sectionIdx = file.indexOf(sectionHeader);
    if (sectionIdx === -1) {
      // Section not found, append at end
      file += `\n${sectionHeader}\n${entry}\n`;
    } else {
      // Find next section or end of file
      const afterSection = sectionIdx + sectionHeader.length;
      const nextSectionIdx = file.indexOf('\n## ', afterSection + 1);
      const insertAt = nextSectionIdx !== -1 ? nextSectionIdx : file.length;
      file = file.slice(0, insertAt) + entry + '\n' + file.slice(insertAt);
    }
    fs.writeFileSync(MEMORY_PATH, file, 'utf-8');
  },

  /**
   * Read MEMORY.md (first ~3000 tokens ≈ 12000 chars)
   */
  async read(): Promise<string> {
    ensureFile();
    const content = fs.readFileSync(MEMORY_PATH, 'utf-8');
    return content.slice(0, 12000);
  },

  /**
   * Search MEMORY.md for relevant passages
   */
  async search(query: string): Promise<string> {
    ensureFile();
    const content = fs.readFileSync(MEMORY_PATH, 'utf-8');
    const lines = content.split('\n');
    const queryLower = query.toLowerCase();
    const matches = lines.filter(line => line.toLowerCase().includes(queryLower));
    if (matches.length === 0) return 'Aucun résultat trouvé dans la mémoire.';
    return matches.slice(0, 20).join('\n');
  },
};
