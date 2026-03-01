import { logger } from '../../utils/logger';
import { sarahConfig } from './sarah.config';
import { emmanuelConfig } from './emmanuel.config';
import type { AvatarPreset, AvatarBase, ClientAvatarConfig } from './avatar.types';

export class AvatarRegistry {
  private presets = new Map<AvatarBase, AvatarPreset>();
  private clientConfigs = new Map<string, ClientAvatarConfig>();

  constructor() {
    this.presets.set('sarah', sarahConfig);
    this.presets.set('emmanuel', emmanuelConfig);
    logger.debug('Avatar presets loaded', { count: this.presets.size });
  }

  getPreset(base: AvatarBase): AvatarPreset | undefined {
    return this.presets.get(base);
  }

  getAllPresets(): AvatarPreset[] {
    return Array.from(this.presets.values());
  }

  registerClientConfig(config: ClientAvatarConfig): void {
    this.clientConfigs.set(config.id, config);
    logger.info('Client avatar config registered', {
      id: config.id,
      clientId: config.clientId,
      base: config.avatarBase,
      name: config.avatarName,
    });
  }

  getClientConfig(configId: string): ClientAvatarConfig | undefined {
    return this.clientConfigs.get(configId);
  }

  getClientConfigsByBase(base: AvatarBase): ClientAvatarConfig[] {
    return Array.from(this.clientConfigs.values()).filter((c) => c.avatarBase === base);
  }

  getActiveClientCount(): number {
    return Array.from(this.clientConfigs.values()).filter((c) => c.isActive).length;
  }

  buildClientSystemPrompt(config: ClientAvatarConfig): string {
    const preset = this.presets.get(config.avatarBase);
    if (!preset) {
      throw new Error(`Unknown avatar base: ${config.avatarBase}`);
    }

    let prompt = preset.systemPrompt;

    prompt = prompt.replace(
      /Tu es (Sarah|Emmanuel)/,
      `Tu es ${config.avatarName}`
    );

    prompt += `\n\nCONTEXTE CLIENT :`;
    prompt += `\n- Tu travailles pour : ${config.companyName}`;
    if (config.industry) {
      prompt += `\n- Secteur : ${config.industry}`;
    }
    if (config.toneOverride) {
      prompt += `\n- Instructions de ton : ${config.toneOverride}`;
    }
    if (config.greetingMessage) {
      prompt += `\n- Message d'accueil : ${config.greetingMessage}`;
    }

    return prompt;
  }
}

export const avatarRegistry = new AvatarRegistry();
