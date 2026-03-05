// ═══════════════════════════════════════════════════════
// Freenzy.io — Studio Creatif: Costs & Pricing
// ═══════════════════════════════════════════════════════

export interface CostItem {
  label: string;
  credits: number;
  provider: string;
  available: boolean;
}

export const STUDIO_COSTS: Record<string, CostItem> = {
  // Available now
  'did-talking-head': { label: 'Video D-ID (talking head)', credits: 25, provider: 'D-ID', available: true },
  'deepgram-tts': { label: 'Synthese vocale Deepgram', credits: 0.5, provider: 'Deepgram', available: true },
  'elevenlabs-tts': { label: 'Synthese vocale ElevenLabs (Premium)', credits: 2, provider: 'ElevenLabs', available: true },
  'claude-message': { label: 'Message IA (Claude)', credits: 1.5, provider: 'Anthropic', available: true },

  // fal.ai
  'fal-ai-image': { label: 'Generation image (fal.ai Flux Schnell)', credits: 8, provider: 'fal.ai', available: true },
  'fal-ai-image-hd': { label: 'Generation image HD (fal.ai Flux Dev)', credits: 12, provider: 'fal.ai', available: true },
  'fal-ai-video': { label: 'Video generative (fal.ai LTX Video)', credits: 20, provider: 'fal.ai', available: true },

  // Roadmap
  'heygen-avatar': { label: 'Avatar HeyGen', credits: 30, provider: 'HeyGen', available: false },
  'midjourney': { label: 'Generation image (Midjourney)', credits: 15, provider: 'Midjourney', available: false },
  'runway-video': { label: 'Video generative (Runway)', credits: 35, provider: 'Runway', available: false },
};

export function estimateWorkflowCost(steps: string[]): { items: CostItem[]; total: number } {
  const items: CostItem[] = [];
  let total = 0;

  for (const step of steps) {
    const cost = STUDIO_COSTS[step];
    if (cost) {
      items.push(cost);
      total += cost.credits;
    }
  }

  // Always add a few Claude messages for guidance
  const claudeCost = STUDIO_COSTS['claude-message']!;
  const messageCount = 5;
  items.push({ ...claudeCost, label: `~${messageCount} messages IA (guidage)`, credits: claudeCost.credits * messageCount });
  total += claudeCost.credits * messageCount;

  return { items, total };
}

export function formatCredits(credits: number): string {
  if (credits < 1) return `${(credits * 100).toFixed(0)} centi-credits`;
  return `${credits.toFixed(1)} credits`;
}
