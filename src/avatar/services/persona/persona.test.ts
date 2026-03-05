import { PersonaManager } from './persona.service';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Mock avatar registry
const mockPresets = [
  {
    baseName: 'sarah' as const,
    displayName: 'Sarah',
    gender: 'female' as const,
    title: 'Directrice Générale virtuelle',
    personality: 'Charismatique, empathique',
    defaultGreeting: 'Bonjour !',
    systemPrompt: 'Tu es Sarah, la DG de Freenzy.io.',
    voiceProfile: { provider: 'telnyx' as const, voiceId: 'sarah-fr-female-01', language: 'fr-FR', speed: 1.0, pitch: 1.0, style: 'warm-professional' },
    didConfig: { sourceUrl: '', driverId: '', sessionConfig: { quality: 'high' } },
  },
  {
    baseName: 'emmanuel' as const,
    displayName: 'Emmanuel',
    gender: 'male' as const,
    title: 'CEO et fondateur',
    personality: 'Posé, visionnaire',
    defaultGreeting: 'Bonjour, je suis Emmanuel.',
    systemPrompt: 'Tu es Emmanuel, le CEO de Freenzy.io.',
    voiceProfile: { provider: 'telnyx' as const, voiceId: 'emmanuel-fr-male-01', language: 'fr-FR', speed: 0.95, pitch: 0.9, style: 'authoritative-calm' },
    didConfig: { sourceUrl: '', driverId: '', sessionConfig: { quality: 'high' } },
  },
];

const mockRegistry = {
  getAllPresets: jest.fn().mockReturnValue(mockPresets),
  getPreset: jest.fn().mockImplementation((base: string) => mockPresets.find((p) => p.baseName === base)),
  buildClientSystemPrompt: jest.fn().mockReturnValue('Tu es ClientBot pour TechCorp.'),
  registerClientConfig: jest.fn(),
  getClientConfig: jest.fn(),
  getClientConfigsByBase: jest.fn(),
  getActiveClientCount: jest.fn(),
};

describe('PersonaManager', () => {
  let manager: PersonaManager;

  beforeEach(() => {
    manager = new PersonaManager(mockRegistry as any);
    manager.initializeFounderPersonas();
    jest.clearAllMocks();
  });

  it('initializes founder personas from registry', () => {
    expect(manager.getAllPersonas()).toHaveLength(2);
  });

  it('getPersona returns sarah persona', () => {
    const sarah = manager.getPersona('persona-sarah');
    expect(sarah).toBeDefined();
    expect(sarah!.displayName).toBe('Sarah');
    expect(sarah!.type).toBe('founder');
    expect(sarah!.avatarBase).toBe('sarah');
  });

  it('getPersona returns emmanuel persona', () => {
    const emmanuel = manager.getPersona('persona-emmanuel');
    expect(emmanuel).toBeDefined();
    expect(emmanuel!.displayName).toBe('Emmanuel');
    expect(emmanuel!.type).toBe('founder');
  });

  it('getPersona returns undefined for non-existent id', () => {
    expect(manager.getPersona('persona-unknown')).toBeUndefined();
  });

  it('getAllPersonas returns both founder personas', () => {
    const all = manager.getAllPersonas();
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.displayName).sort()).toEqual(['Emmanuel', 'Sarah']);
  });

  it('getPersonasByType returns only founder type', () => {
    const founders = manager.getPersonasByType('founder');
    expect(founders).toHaveLength(2);
    expect(founders.every((p) => p.type === 'founder')).toBe(true);
  });

  it('createClientPersona creates persona from ClientAvatarConfig', () => {
    const clientConfig = {
      id: 'client-tc-1',
      clientId: 'techcorp',
      avatarBase: 'sarah' as const,
      avatarType: 'standard' as const,
      avatarName: 'TechBot',
      companyName: 'TechCorp',
      industry: 'SaaS',
      isActive: true,
      customAvatarAssets: null,
    };

    const persona = manager.createClientPersona(clientConfig);
    expect(persona.id).toBe('persona-client-client-tc-1');
    expect(persona.type).toBe('client');
    expect(persona.displayName).toBe('TechBot');
    expect(persona.avatarBase).toBe('sarah');
    expect(persona.isActive).toBe(true);
    expect(manager.getAllPersonas()).toHaveLength(3);
  });

  it('removePersona removes existing persona', () => {
    expect(manager.removePersona('persona-sarah')).toBe(true);
    expect(manager.getAllPersonas()).toHaveLength(1);
    expect(manager.removePersona('persona-unknown')).toBe(false);
  });

  it('bindToSession creates session binding', () => {
    const binding = manager.bindToSession('sess-1', 'persona-sarah');
    expect(binding.sessionId).toBe('sess-1');
    expect(binding.personaId).toBe('persona-sarah');
    expect(binding.conversationHistory).toEqual([]);
  });

  it('getSessionBinding returns existing binding', () => {
    manager.bindToSession('sess-1', 'persona-sarah');
    const found = manager.getSessionBinding('sess-1');
    expect(found).toBeDefined();
    expect(found!.personaId).toBe('persona-sarah');
  });

  it('unbindSession removes binding', () => {
    manager.bindToSession('sess-1', 'persona-sarah');
    manager.unbindSession('sess-1');
    expect(manager.getSessionBinding('sess-1')).toBeUndefined();
  });

  it('switchPersona changes persona for a session', async () => {
    manager.bindToSession('sess-1', 'persona-sarah');
    const result = await manager.switchPersona({
      sessionId: 'sess-1',
      fromPersonaId: 'persona-sarah',
      toPersonaId: 'persona-emmanuel',
      reason: 'Client demande le CEO',
    });

    expect(result.success).toBe(true);
    expect(result.previousPersonaId).toBe('persona-sarah');
    expect(result.newPersonaId).toBe('persona-emmanuel');
    expect(result.transitionMessage).toContain('Sarah');
    expect(result.transitionMessage).toContain('Emmanuel');

    const binding = manager.getSessionBinding('sess-1');
    expect(binding!.personaId).toBe('persona-emmanuel');
  });

  it('buildEnrichedSystemPrompt includes context and persona prompt', () => {
    manager.updatePersonaContext('persona-sarah', {
      recentTopics: ['pricing', 'demo'],
      sessionCount: 5,
    });

    const prompt = manager.buildEnrichedSystemPrompt('persona-sarah', 'sess-1');
    expect(prompt).toContain('Tu es Sarah');
    expect(prompt).toContain('pricing');
    expect(prompt).toContain('demo');
    expect(prompt).toContain('5');
  });
});
