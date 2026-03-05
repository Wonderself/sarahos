export type CineasteTaskType = 'script' | 'storyboard' | 'production' | 'post' | 'distribute';

export interface AITool {
  name: string;
  category: 'image' | 'video' | 'audio' | 'music' | 'editing' | 'voiceover' | 'script' | 'distribution';
  description: string;
  url: string;
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  bestFor: string;
}

export interface ScriptStructure {
  title: string;
  logline: string;
  genre: string;
  duration: string;
  acts: ScriptAct[];
  characters: ScriptCharacter[];
  notes: string;
}

export interface ScriptAct {
  act: number;
  title: string;
  description: string;
  scenes: ScriptScene[];
}

export interface ScriptScene {
  number: number;
  location: string;
  timeOfDay: string;
  action: string;
  dialogue: string[];
}

export interface ScriptCharacter {
  name: string;
  role: string;
  description: string;
  arc: string;
}

export interface StoryboardPanel {
  panel: number;
  scene: number;
  description: string;
  cameraAngle: string;
  aiPrompt: string;
  suggestedTool: string;
  duration: string;
  notes: string;
}

export interface ProductionPlan {
  phase: string;
  tool: string;
  settings: Record<string, string>;
  prompt: string;
  tips: string[];
  estimatedTime: string;
}

export interface PostProductionStep {
  step: number;
  task: string;
  tool: string;
  instructions: string;
  tips: string[];
}

export interface DistributionPlan {
  platform: string;
  format: string;
  resolution: string;
  aspectRatio: string;
  maxDuration: string;
  optimizationTips: string[];
  bestTimeToPost: string;
}

export interface CineasteResult {
  type: CineasteTaskType;
  content: string;
  tokensUsed: number;
  toolsRecommended?: string[];
  metadata?: Record<string, unknown>;
}
