import { logger } from '../../../../utils/logger';
import type { AITool } from './cineaste.types';

/**
 * Comprehensive catalog of AI filmmaking tools organized by category.
 * Each tool includes description, URL, pricing tier, and best use case.
 */
export const AI_TOOLS_CATALOG: AITool[] = [
  // --- IMAGE GENERATION (Storyboard & Concept Art) ---
  {
    name: 'Midjourney',
    category: 'image',
    description: 'Generation d\'images IA de haute qualite via Discord. Excellent pour concept art, storyboards et character design cinematographique.',
    url: 'https://www.midjourney.com',
    pricing: 'paid',
    bestFor: 'Storyboards photo-realistes, concept art, ambiances cinematographiques',
  },
  {
    name: 'DALL-E 3',
    category: 'image',
    description: 'Generation d\'images OpenAI integree a ChatGPT. Tres bon suivi des prompts, excellent pour les textes dans les images.',
    url: 'https://openai.com/dall-e-3',
    pricing: 'freemium',
    bestFor: 'Storyboards avec texte, concept art precis, iterations rapides',
  },
  {
    name: 'Stable Diffusion',
    category: 'image',
    description: 'Modele open-source de generation d\'images. Hautement personnalisable avec LoRA, ControlNet, IP-Adapter.',
    url: 'https://stability.ai',
    pricing: 'free',
    bestFor: 'Workflows personnalises, coherence de personnage via LoRA, storyboards en batch',
  },
  {
    name: 'Leonardo AI',
    category: 'image',
    description: 'Plateforme de generation d\'images avec modeles specialises cinema et jeux video.',
    url: 'https://leonardo.ai',
    pricing: 'freemium',
    bestFor: 'Character design, environnements, assets de production',
  },

  // --- VIDEO GENERATION ---
  {
    name: 'Runway ML Gen-3 Alpha',
    category: 'video',
    description: 'Leader de la generation video IA. Text-to-video, image-to-video, motion brush, camera controls avances.',
    url: 'https://runwayml.com',
    pricing: 'freemium',
    bestFor: 'Plans cinematographiques, mouvements de camera, img2vid haute qualite',
  },
  {
    name: 'OpenAI Sora',
    category: 'video',
    description: 'Modele de generation video d\'OpenAI. Videos longues, physique realiste, comprehension du monde.',
    url: 'https://openai.com/sora',
    pricing: 'paid',
    bestFor: 'Videos longues, scenes complexes, physique realiste',
  },
  {
    name: 'Pika Labs',
    category: 'video',
    description: 'Generation video stylisee avec effets speciaux, lip sync et transformations creatives.',
    url: 'https://pika.art',
    pricing: 'freemium',
    bestFor: 'Effets speciaux, lip sync, style artistique, videos courtes',
  },
  {
    name: 'Kling AI',
    category: 'video',
    description: 'Modele video chinois avec excellente gestion des mouvements complexes et scenes d\'action.',
    url: 'https://klingai.com',
    pricing: 'freemium',
    bestFor: 'Mouvements complexes, scenes d\'action, plans de 10+ secondes',
  },
  {
    name: 'Luma Dream Machine',
    category: 'video',
    description: 'Generation video avec rendu 3D realiste, excellent pour la profondeur et les mouvements de camera.',
    url: 'https://lumalabs.ai/dream-machine',
    pricing: 'freemium',
    bestFor: 'Rendu 3D, mouvements de camera fluides, environnements',
  },
  {
    name: 'Stable Video Diffusion',
    category: 'video',
    description: 'Modele video open-source de Stability AI. Image-to-video avec controle de mouvement.',
    url: 'https://stability.ai/stable-video',
    pricing: 'free',
    bestFor: 'Workflows open-source, img2vid batch, experimentation',
  },

  // --- AUDIO / VOICEOVER ---
  {
    name: 'ElevenLabs',
    category: 'voiceover',
    description: 'Synthese vocale IA de qualite studio. Clonage vocal, multilangue, emotions controllables.',
    url: 'https://elevenlabs.io',
    pricing: 'freemium',
    bestFor: 'Voix off professionnelle, narration, doublage multilangue',
  },
  {
    name: 'Bark',
    category: 'voiceover',
    description: 'Text-to-speech open-source multilangue par Suno. Supporte rires, pauses, emotions.',
    url: 'https://github.com/suno-ai/bark',
    pricing: 'free',
    bestFor: 'TTS open-source, expressions non-verbales, experimentation',
  },

  // --- MUSIC ---
  {
    name: 'Suno AI',
    category: 'music',
    description: 'Generation de musique complete par prompt. Chant, instruments, paroles auto-generees ou fournies.',
    url: 'https://suno.com',
    pricing: 'freemium',
    bestFor: 'Bandes originales, musique avec paroles, jingles, ambiance',
  },
  {
    name: 'Udio',
    category: 'music',
    description: 'Generation musicale IA alternative a Suno. Excellent pour electro, ambient, instrumentaux.',
    url: 'https://udio.com',
    pricing: 'freemium',
    bestFor: 'Musique electronique, ambient, instrumentaux, sound design',
  },

  // --- EDITING ---
  {
    name: 'DaVinci Resolve',
    category: 'editing',
    description: 'Suite de post-production professionnelle gratuite. Montage, etalonnage (referentiel mondial), Fusion VFX, Fairlight audio.',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    pricing: 'freemium',
    bestFor: 'Montage pro, color grading avance, VFX, mixage audio',
  },
  {
    name: 'CapCut',
    category: 'editing',
    description: 'Editeur video gratuit avec sous-titres auto, effets tendance, templates. Ideal pour contenu reseaux sociaux.',
    url: 'https://www.capcut.com',
    pricing: 'free',
    bestFor: 'Montage rapide, sous-titres automatiques, contenu social media',
  },
  {
    name: 'Adobe Premiere Pro',
    category: 'editing',
    description: 'Standard industrie pour le montage video. Integration After Effects, Audition, plugins IA.',
    url: 'https://www.adobe.com/products/premiere.html',
    pricing: 'paid',
    bestFor: 'Montage professionnel, pipeline Adobe, projets collaboratifs',
  },

  // --- DISTRIBUTION ---
  {
    name: 'TubeBuddy',
    category: 'distribution',
    description: 'Outil d\'optimisation YouTube : SEO video, A/B testing miniatures, analytics avances.',
    url: 'https://www.tubebuddy.com',
    pricing: 'freemium',
    bestFor: 'SEO YouTube, optimisation miniatures, analytics',
  },
  {
    name: 'FilmFreeway',
    category: 'distribution',
    description: 'Plateforme de soumission a des festivals de cinema dans le monde entier.',
    url: 'https://filmfreeway.com',
    pricing: 'freemium',
    bestFor: 'Soumission festivals, distribution circuit court, networking',
  },

  // --- SCRIPT ---
  {
    name: 'Final Draft',
    category: 'script',
    description: 'Logiciel de reference pour l\'ecriture de scenarios. Format standard industrie.',
    url: 'https://www.finaldraft.com',
    pricing: 'paid',
    bestFor: 'Ecriture scenario professionnelle, format standard, collaboration',
  },
  {
    name: 'WriterSolo',
    category: 'script',
    description: 'Outil d\'ecriture de scenario avec assistant IA integre.',
    url: 'https://writersolo.com',
    pricing: 'freemium',
    bestFor: 'Ecriture assistee IA, structure narrative, brainstorming',
  },
];

/**
 * Returns tools filtered by category.
 */
export function getToolsByCategory(category: AITool['category']): AITool[] {
  const filtered = AI_TOOLS_CATALOG.filter((tool) => tool.category === category);
  logger.info('Tools filtered by category', { category, count: filtered.length });
  return filtered;
}

/**
 * Returns tools filtered by pricing tier.
 */
export function getToolsByPricing(pricing: AITool['pricing']): AITool[] {
  return AI_TOOLS_CATALOG.filter((tool) => tool.pricing === pricing);
}

/**
 * Returns a formatted list of recommended tools for a specific filmmaking phase.
 */
export function getToolsForPhase(phase: 'script' | 'storyboard' | 'production' | 'post' | 'distribute'): AITool[] {
  const phaseCategories: Record<string, AITool['category'][]> = {
    script: ['script'],
    storyboard: ['image'],
    production: ['video'],
    post: ['editing', 'voiceover', 'music', 'audio' as AITool['category']],
    distribute: ['distribution'],
  };

  const categories = phaseCategories[phase] ?? [];
  const tools = AI_TOOLS_CATALOG.filter((tool) => categories.includes(tool.category));

  logger.info('Tools for phase', { phase, count: tools.length });
  return tools;
}

/**
 * Formats the tool catalog as a readable string for LLM context injection.
 */
export function formatToolCatalogForPrompt(tools?: AITool[]): string {
  const catalog = tools ?? AI_TOOLS_CATALOG;

  const grouped = new Map<string, AITool[]>();
  for (const tool of catalog) {
    const existing = grouped.get(tool.category) ?? [];
    existing.push(tool);
    grouped.set(tool.category, existing);
  }

  const lines: string[] = ['=== CATALOGUE DES OUTILS IA POUR LE CINEMA ===\n'];

  for (const [category, categoryTools] of grouped) {
    lines.push(`## ${category.toUpperCase()}`);
    for (const tool of categoryTools) {
      lines.push(`- **${tool.name}** (${tool.pricing}) : ${tool.description}`);
      lines.push(`  URL: ${tool.url} | Ideal pour: ${tool.bestFor}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
