// Team Management — localStorage-based system
// Keys: fz_teams, fz_groups, fz_communities, fz_joined_communities

// ─── Interfaces ──────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  emoji: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'online' | 'away' | 'busy' | 'offline';
  joinedAt: string;
  lastSeen: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  members: TeamMember[];
  createdAt: string;
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    maxMembers: number; // 0 = unlimited
  };
}

export interface Group {
  id: string;
  name: string;
  teamId: string;
  emoji: string;
  color: string;
  description: string;
  members: string[];
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  memberCount: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  ownerId: string;
  rules: string;
}

// ─── Constants ───────────────────────────────────────────────

const KEY_TEAMS = 'fz_teams';
const KEY_GROUPS = 'fz_groups';
const KEY_COMMUNITIES = 'fz_communities';
const KEY_JOINED_COMMUNITIES = 'fz_joined_communities';
const KEY_SESSION = 'fz_session';

// ─── Helpers ─────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCurrentUser(): { id: string; name: string; email: string; emoji: string } {
  try {
    const raw = localStorage.getItem(KEY_SESSION);
    if (raw) {
      const session = JSON.parse(raw) as Record<string, unknown>;
      return {
        id: String(session['id'] ?? 'user-1'),
        name: String(session['name'] ?? 'Utilisateur'),
        email: String(session['email'] ?? 'user@freenzy.io'),
        emoji: '👤',
      };
    }
  } catch {
    // fall through to default
  }
  return { id: 'user-1', name: 'Utilisateur', email: 'user@freenzy.io', emoji: '👤' };
}

// ─── Teams ───────────────────────────────────────────────────

export function getTeams(): Team[] {
  try {
    const raw = localStorage.getItem(KEY_TEAMS);
    if (raw) {
      const parsed = JSON.parse(raw) as Team[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // seed below
  }
  seedDefaults();
  try {
    const raw = localStorage.getItem(KEY_TEAMS);
    if (raw) return JSON.parse(raw) as Team[];
  } catch {
    // return empty
  }
  return [];
}

export function saveTeams(teams: Team[]): void {
  try {
    localStorage.setItem(KEY_TEAMS, JSON.stringify(teams));
  } catch {
    // storage full or unavailable
  }
}

export function createTeam(name: string, description: string, emoji: string, color: string): Team {
  const user = getCurrentUser();
  const now = new Date().toISOString();
  const team: Team = {
    id: generateId(),
    name,
    description,
    emoji,
    color,
    members: [
      {
        id: user.id,
        name: user.name,
        email: user.email,
        emoji: user.emoji,
        role: 'owner',
        status: 'online',
        joinedAt: now,
        lastSeen: now,
      },
    ],
    createdAt: now,
    settings: {
      isPublic: false,
      allowInvites: true,
      maxMembers: 0,
    },
  };
  const teams = getTeams();
  teams.push(team);
  saveTeams(teams);
  return team;
}

export function updateTeam(teamId: string, updates: Partial<Team>): void {
  const teams = getTeams();
  const idx = teams.findIndex((t) => t.id === teamId);
  if (idx === -1) return;
  teams[idx] = { ...teams[idx], ...updates, id: teamId };
  saveTeams(teams);
}

export function deleteTeam(teamId: string): void {
  const teams = getTeams().filter((t) => t.id !== teamId);
  saveTeams(teams);
}

export function getTeamById(teamId: string): Team | undefined {
  return getTeams().find((t) => t.id === teamId);
}

// ─── Members ─────────────────────────────────────────────────

export function addMember(
  teamId: string,
  member: Omit<TeamMember, 'joinedAt' | 'lastSeen'>
): void {
  const teams = getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  const now = new Date().toISOString();
  team.members.push({ ...member, joinedAt: now, lastSeen: now });
  saveTeams(teams);
}

export function removeMember(teamId: string, memberId: string): void {
  const teams = getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  team.members = team.members.filter((m) => m.id !== memberId);
  saveTeams(teams);
}

export function updateMemberRole(
  teamId: string,
  memberId: string,
  role: TeamMember['role']
): void {
  const teams = getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  const member = team.members.find((m) => m.id === memberId);
  if (!member) return;
  member.role = role;
  saveTeams(teams);
}

export function updateMemberStatus(
  teamId: string,
  memberId: string,
  status: TeamMember['status']
): void {
  const teams = getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  const member = team.members.find((m) => m.id === memberId);
  if (!member) return;
  member.status = status;
  member.lastSeen = new Date().toISOString();
  saveTeams(teams);
}

export function getOnlineMembers(teamId: string): TeamMember[] {
  const team = getTeamById(teamId);
  if (!team) return [];
  return team.members.filter((m) => m.status !== 'offline');
}

export function searchMembers(teamId: string, query: string): TeamMember[] {
  const team = getTeamById(teamId);
  if (!team) return [];
  const q = query.toLowerCase();
  return team.members.filter(
    (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );
}

export function getMemberStats(teamId: string): { total: number; online: number; admins: number } {
  const team = getTeamById(teamId);
  if (!team) return { total: 0, online: 0, admins: 0 };
  return {
    total: team.members.length,
    online: team.members.filter((m) => m.status !== 'offline').length,
    admins: team.members.filter((m) => m.role === 'admin' || m.role === 'owner').length,
  };
}

export function inviteMember(
  teamId: string,
  email: string,
  role: TeamMember['role']
): TeamMember {
  const now = new Date().toISOString();
  const member: TeamMember = {
    id: generateId(),
    name: email.split('@')[0] ?? 'Invité',
    email,
    emoji: '✉️',
    role,
    status: 'offline',
    joinedAt: now,
    lastSeen: now,
  };
  const teams = getTeams();
  const team = teams.find((t) => t.id === teamId);
  if (team) {
    team.members.push(member);
    saveTeams(teams);
  }
  return member;
}

// ─── Groups ──────────────────────────────────────────────────

export function getGroups(): Group[] {
  try {
    const raw = localStorage.getItem(KEY_GROUPS);
    if (raw) {
      const parsed = JSON.parse(raw) as Group[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // seed below
  }
  seedDefaults();
  try {
    const raw = localStorage.getItem(KEY_GROUPS);
    if (raw) return JSON.parse(raw) as Group[];
  } catch {
    // return empty
  }
  return [];
}

export function saveGroups(groups: Group[]): void {
  try {
    localStorage.setItem(KEY_GROUPS, JSON.stringify(groups));
  } catch {
    // storage full or unavailable
  }
}

export function createGroup(
  name: string,
  teamId: string,
  emoji: string,
  color: string,
  description: string
): Group {
  const group: Group = {
    id: generateId(),
    name,
    teamId,
    emoji,
    color,
    description,
    members: [],
    createdAt: new Date().toISOString(),
  };
  const groups = getGroups();
  groups.push(group);
  saveGroups(groups);
  return group;
}

export function updateGroup(groupId: string, updates: Partial<Group>): void {
  const groups = getGroups();
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return;
  groups[idx] = { ...groups[idx], ...updates, id: groupId };
  saveGroups(groups);
}

export function deleteGroup(groupId: string): void {
  const groups = getGroups().filter((g) => g.id !== groupId);
  saveGroups(groups);
}

export function addGroupMember(groupId: string, memberId: string): void {
  const groups = getGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  if (!group.members.includes(memberId)) {
    group.members.push(memberId);
    saveGroups(groups);
  }
}

export function removeGroupMember(groupId: string, memberId: string): void {
  const groups = getGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  group.members = group.members.filter((id) => id !== memberId);
  saveGroups(groups);
}

// ─── Communities ─────────────────────────────────────────────

export function getCommunities(): Community[] {
  try {
    const raw = localStorage.getItem(KEY_COMMUNITIES);
    if (raw) {
      const parsed = JSON.parse(raw) as Community[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // seed below
  }
  seedDefaults();
  try {
    const raw = localStorage.getItem(KEY_COMMUNITIES);
    if (raw) return JSON.parse(raw) as Community[];
  } catch {
    // return empty
  }
  return [];
}

export function saveCommunities(communities: Community[]): void {
  try {
    localStorage.setItem(KEY_COMMUNITIES, JSON.stringify(communities));
  } catch {
    // storage full or unavailable
  }
}

export function createCommunity(
  name: string,
  description: string,
  emoji: string,
  color: string,
  tags: string[],
  isPublic: boolean,
  rules: string,
  ownerId: string
): Community {
  const community: Community = {
    id: generateId(),
    name,
    description,
    emoji,
    color,
    memberCount: 1,
    isPublic,
    tags,
    createdAt: new Date().toISOString(),
    ownerId,
    rules,
  };
  const communities = getCommunities();
  communities.push(community);
  saveCommunities(communities);
  return community;
}

export function updateCommunity(communityId: string, updates: Partial<Community>): void {
  const communities = getCommunities();
  const idx = communities.findIndex((c) => c.id === communityId);
  if (idx === -1) return;
  communities[idx] = { ...communities[idx], ...updates, id: communityId };
  saveCommunities(communities);
}

export function deleteCommunity(communityId: string): void {
  const communities = getCommunities().filter((c) => c.id !== communityId);
  saveCommunities(communities);
}

export function getJoinedCommunities(): string[] {
  try {
    const raw = localStorage.getItem(KEY_JOINED_COMMUNITIES);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // return empty
  }
  return [];
}

function saveJoinedCommunities(ids: string[]): void {
  try {
    localStorage.setItem(KEY_JOINED_COMMUNITIES, JSON.stringify(ids));
  } catch {
    // storage full or unavailable
  }
}

export function isJoined(communityId: string): boolean {
  return getJoinedCommunities().includes(communityId);
}

export function joinCommunity(communityId: string): void {
  const joined = getJoinedCommunities();
  if (joined.includes(communityId)) return;
  joined.push(communityId);
  saveJoinedCommunities(joined);

  const communities = getCommunities();
  const community = communities.find((c) => c.id === communityId);
  if (community) {
    community.memberCount += 1;
    saveCommunities(communities);
  }
}

export function leaveCommunity(communityId: string): void {
  const joined = getJoinedCommunities().filter((id) => id !== communityId);
  saveJoinedCommunities(joined);

  const communities = getCommunities();
  const community = communities.find((c) => c.id === communityId);
  if (community && community.memberCount > 0) {
    community.memberCount -= 1;
    saveCommunities(communities);
  }
}

export function searchCommunities(query: string): Community[] {
  const q = query.toLowerCase();
  return getCommunities().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

// ─── Seed Defaults ───────────────────────────────────────────

export function seedDefaults(): void {
  const now = new Date().toISOString();
  const user = getCurrentUser();

  // Seed teams if empty
  try {
    const existingTeams = localStorage.getItem(KEY_TEAMS);
    if (!existingTeams || JSON.parse(existingTeams).length === 0) {
      const teamId = 'team-default-1';
      const demoMembers: TeamMember[] = [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          emoji: user.emoji,
          role: 'owner',
          status: 'online',
          joinedAt: now,
          lastSeen: now,
        },
        {
          id: 'member-alice',
          name: 'Alice Martin',
          email: 'alice.martin@freenzy.io',
          emoji: '👩‍💻',
          role: 'admin',
          status: 'online',
          joinedAt: now,
          lastSeen: now,
        },
        {
          id: 'member-bob',
          name: 'Bob Dupont',
          email: 'bob.dupont@freenzy.io',
          emoji: '👨‍🎨',
          role: 'member',
          status: 'away',
          joinedAt: now,
          lastSeen: now,
        },
        {
          id: 'member-clara',
          name: 'Clara Durand',
          email: 'clara.durand@freenzy.io',
          emoji: '👩‍🔬',
          role: 'member',
          status: 'offline',
          joinedAt: now,
          lastSeen: now,
        },
        {
          id: 'member-david',
          name: 'David Chen',
          email: 'david.chen@freenzy.io',
          emoji: '👨‍💼',
          role: 'viewer',
          status: 'online',
          joinedAt: now,
          lastSeen: now,
        },
        {
          id: 'member-emma',
          name: 'Emma Laurent',
          email: 'emma.laurent@freenzy.io',
          emoji: '👩‍🏫',
          role: 'member',
          status: 'offline',
          joinedAt: now,
          lastSeen: now,
        },
      ];

      const defaultTeam: Team = {
        id: teamId,
        name: 'Mon équipe',
        description: 'Équipe principale de travail',
        emoji: '🏢',
        color: '#0EA5E9',
        members: demoMembers,
        createdAt: now,
        settings: {
          isPublic: false,
          allowInvites: true,
          maxMembers: 0,
        },
      };
      localStorage.setItem(KEY_TEAMS, JSON.stringify([defaultTeam]));

      // Seed groups (depends on team)
      const existingGroups = localStorage.getItem(KEY_GROUPS);
      if (!existingGroups || JSON.parse(existingGroups).length === 0) {
        const defaultGroups: Group[] = [
          {
            id: 'group-direction',
            name: 'Direction',
            teamId,
            emoji: '👔',
            color: '#D97706',
            description: 'Décisions stratégiques',
            members: [user.id, 'member-alice', 'member-david'],
            createdAt: now,
          },
          {
            id: 'group-technique',
            name: 'Technique',
            teamId,
            emoji: '💻',
            color: '#16A34A',
            description: 'Dev & infrastructure',
            members: ['member-alice', 'member-bob', 'member-clara'],
            createdAt: now,
          },
        ];
        localStorage.setItem(KEY_GROUPS, JSON.stringify(defaultGroups));
      }
    }
  } catch {
    // localStorage unavailable
  }

  // Seed communities if empty
  try {
    const existingCommunities = localStorage.getItem(KEY_COMMUNITIES);
    if (!existingCommunities || JSON.parse(existingCommunities).length === 0) {
      const defaultCommunities: Community[] = [
        {
          id: 'community-entrepreneurs',
          name: 'Entrepreneurs FR',
          description: 'Communauté des entrepreneurs francophones',
          emoji: '🚀',
          color: '#7C3AED',
          memberCount: 234,
          isPublic: true,
          tags: ['startup', 'business', 'france'],
          createdAt: now,
          ownerId: 'system',
          rules: 'Respect mutuel, pas de spam, entraide encouragée.',
        },
        {
          id: 'community-ia',
          name: 'IA & Automatisation',
          description: 'Échanges sur l\'intelligence artificielle et l\'automatisation',
          emoji: '🤖',
          color: '#0EA5E9',
          memberCount: 567,
          isPublic: true,
          tags: ['ia', 'automation', 'tech'],
          createdAt: now,
          ownerId: 'system',
          rules: 'Partagez vos découvertes, questions bienvenues.',
        },
        {
          id: 'community-marketing',
          name: 'Marketing Digital',
          description: 'Stratégies marketing et croissance digitale',
          emoji: '📈',
          color: '#DC2626',
          memberCount: 189,
          isPublic: true,
          tags: ['marketing', 'growth'],
          createdAt: now,
          ownerId: 'system',
          rules: 'Contenu de qualité uniquement, pas d\'auto-promotion abusive.',
        },
        {
          id: 'community-design',
          name: 'Design & UX',
          description: 'Design d\'interface et expérience utilisateur',
          emoji: '🎨',
          color: '#E11D48',
          memberCount: 312,
          isPublic: true,
          tags: ['design', 'ux', 'ui'],
          createdAt: now,
          ownerId: 'system',
          rules: 'Critiques constructives, ressources partagées.',
        },
        {
          id: 'community-freelance',
          name: 'Freelance & Indépendants',
          description: 'Entraide pour freelances et travailleurs indépendants',
          emoji: '💰',
          color: '#16A34A',
          memberCount: 445,
          isPublic: true,
          tags: ['freelance', 'independant'],
          createdAt: now,
          ownerId: 'system',
          rules: 'Bienveillance, partage d\'expérience, offres de mission bienvenues.',
        },
      ];
      localStorage.setItem(KEY_COMMUNITIES, JSON.stringify(defaultCommunities));

      // Pre-join user to first 2 communities
      const joined = getJoinedCommunities();
      if (joined.length === 0) {
        saveJoinedCommunities(['community-entrepreneurs', 'community-ia']);
      }
    }
  } catch {
    // localStorage unavailable
  }
}
