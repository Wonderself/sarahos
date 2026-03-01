import { logger } from '../../../utils/logger';
import { avatarRegistry as defaultRegistry } from '../../config/avatar-registry';
import type { AvatarRegistry } from '../../config/avatar-registry';
import type { ClientAvatarConfig } from '../../config/avatar.types';
import type {
  Persona,
  PersonaType,
  PersonaContext,
  PersonaSwitchRequest,
  PersonaSwitchResult,
  PersonaSessionBinding,
} from './persona.types';

export class PersonaManager {
  private personas = new Map<string, Persona>();
  private sessionBindings = new Map<string, PersonaSessionBinding>();
  private readonly registry: AvatarRegistry;

  constructor(registry?: AvatarRegistry) {
    this.registry = registry ?? defaultRegistry;
    logger.info('Persona Manager initialized');
  }

  initializeFounderPersonas(): void {
    const presets = this.registry.getAllPresets();

    for (const preset of presets) {
      const persona: Persona = {
        id: `persona-${preset.baseName}`,
        type: 'founder',
        avatarBase: preset.baseName,
        displayName: preset.displayName,
        systemPrompt: preset.systemPrompt,
        voiceProfile: preset.voiceProfile,
        didConfig: preset.didConfig,
        context: {
          recentTopics: [],
          userPreferences: {},
          sessionCount: 0,
          lastInteraction: null,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      this.personas.set(persona.id, persona);
    }

    logger.info('Founder personas initialized', {
      count: presets.length,
      names: presets.map((p) => p.displayName),
    });
  }

  getPersona(personaId: string): Persona | undefined {
    return this.personas.get(personaId);
  }

  getAllPersonas(): Persona[] {
    return Array.from(this.personas.values());
  }

  getPersonasByType(type: PersonaType): Persona[] {
    return Array.from(this.personas.values()).filter((p) => p.type === type);
  }

  createClientPersona(clientConfig: ClientAvatarConfig): Persona {
    const preset = this.registry.getPreset(clientConfig.avatarBase);
    const systemPrompt = this.registry.buildClientSystemPrompt(clientConfig);

    const persona: Persona = {
      id: `persona-client-${clientConfig.id}`,
      type: 'client',
      avatarBase: clientConfig.avatarBase,
      displayName: clientConfig.avatarName,
      systemPrompt,
      voiceProfile: preset?.voiceProfile ?? {
        provider: 'telnyx',
        voiceId: 'default-voice',
        language: 'fr-FR',
        speed: 1.0,
        pitch: 1.0,
        style: 'professional',
      },
      didConfig: preset?.didConfig ?? {
        sourceUrl: '',
        driverId: '',
        sessionConfig: {},
      },
      context: {
        recentTopics: [],
        userPreferences: {},
        sessionCount: 0,
        lastInteraction: null,
      },
      isActive: clientConfig.isActive,
      createdAt: new Date().toISOString(),
    };

    this.personas.set(persona.id, persona);
    logger.info('Client persona created', { personaId: persona.id, clientId: clientConfig.clientId });
    return persona;
  }

  removePersona(personaId: string): boolean {
    const removed = this.personas.delete(personaId);
    if (removed) {
      logger.info('Persona removed', { personaId });
    }
    return removed;
  }

  bindToSession(sessionId: string, personaId: string): PersonaSessionBinding {
    const binding: PersonaSessionBinding = {
      sessionId,
      personaId,
      boundAt: new Date().toISOString(),
      conversationHistory: [],
    };

    this.sessionBindings.set(sessionId, binding);

    // Incrémenter le compteur de sessions du persona
    const persona = this.personas.get(personaId);
    if (persona) {
      persona.context.sessionCount++;
      persona.context.lastInteraction = new Date().toISOString();
    }

    logger.debug('Persona bound to session', { sessionId, personaId });
    return binding;
  }

  getSessionBinding(sessionId: string): PersonaSessionBinding | undefined {
    return this.sessionBindings.get(sessionId);
  }

  unbindSession(sessionId: string): void {
    this.sessionBindings.delete(sessionId);
    logger.debug('Session unbound', { sessionId });
  }

  async switchPersona(request: PersonaSwitchRequest): Promise<PersonaSwitchResult> {
    const fromPersona = this.personas.get(request.fromPersonaId);
    const toPersona = this.personas.get(request.toPersonaId);

    if (!toPersona) {
      return {
        sessionId: request.sessionId,
        previousPersonaId: request.fromPersonaId,
        newPersonaId: request.toPersonaId,
        transitionMessage: '',
        success: false,
      };
    }

    // Mettre à jour la liaison de session
    const binding = this.sessionBindings.get(request.sessionId);
    if (binding) {
      binding.personaId = request.toPersonaId;
    }

    const transitionMessage = fromPersona
      ? `${fromPersona.displayName} passe la main à ${toPersona.displayName}. ${request.reason}`
      : `${toPersona.displayName} prend la conversation en charge.`;

    logger.info('Persona switched', {
      sessionId: request.sessionId,
      from: request.fromPersonaId,
      to: request.toPersonaId,
      reason: request.reason,
    });

    return {
      sessionId: request.sessionId,
      previousPersonaId: request.fromPersonaId,
      newPersonaId: request.toPersonaId,
      transitionMessage,
      success: true,
    };
  }

  buildEnrichedSystemPrompt(personaId: string, _sessionId: string): string {
    const persona = this.personas.get(personaId);
    if (!persona) return '';

    let prompt = persona.systemPrompt;

    // Enrichir avec le contexte
    if (persona.context.recentTopics.length > 0) {
      prompt += `\n\nSujets récents abordés : ${persona.context.recentTopics.join(', ')}`;
    }

    if (persona.context.sessionCount > 0) {
      prompt += `\nNombre de sessions précédentes : ${persona.context.sessionCount}`;
    }

    if (persona.context.lastInteraction) {
      prompt += `\nDernière interaction : ${persona.context.lastInteraction}`;
    }

    return prompt;
  }

  updatePersonaContext(personaId: string, updates: Partial<PersonaContext>): void {
    const persona = this.personas.get(personaId);
    if (!persona) return;

    if (updates.recentTopics) persona.context.recentTopics = updates.recentTopics;
    if (updates.userPreferences) persona.context.userPreferences = { ...persona.context.userPreferences, ...updates.userPreferences };
    if (updates.sessionCount !== undefined) persona.context.sessionCount = updates.sessionCount;
    if (updates.lastInteraction !== undefined) persona.context.lastInteraction = updates.lastInteraction;
  }
}

export const personaManager = new PersonaManager();
