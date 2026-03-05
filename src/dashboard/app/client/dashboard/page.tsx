'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { loadAgentConfigs, DEFAULT_AGENTS, getAgentsForTier, getActiveAgentIds, toggleAgent } from '../../../lib/agent-config';
import type { AgentTypeId } from '../../../lib/agent-config';
import FreenzyWelcome from '../../../components/FreenzyWelcome';
import { useToast } from '../../../components/Toast';

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  totalMessages: number;
  totalDocuments: number;
  totalMeetings: number;
  streak: number;
  level: number;
  xp: number;
  xpToNext: number;
  achievements: string[];
}

interface WeeklySummary {
  day: string;
  messages: number;
  tokens: number;
}

export default function ClientDashboard() {
  const { showError } = useToast();
  const [stats, setStats] = useState<UsageStats>({
    totalTokens: 0, totalCost: 0, totalMessages: 0, totalDocuments: 0,
    totalMeetings: 0, streak: 0, level: 1, xp: 0, xpToNext: 100, achievements: [],
  });
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [teamSize, setTeamSize] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasCustomAgents, setHasCustomAgents] = useState(false);
  const [aiTip, setAiTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [briefing, setBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingLoaded, setBriefingLoaded] = useState(false);
  const [briefingGeneratedAt, setBriefingGeneratedAt] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeAgentIds, setActiveAgentIds] = useState<AgentTypeId[]>(['fz-repondeur']);

  useEffect(() => {
    loadStats();
    loadWallet();
    loadTeam();
    checkProfile();
    checkCustomAgents();
    checkWelcome();
    setActiveAgentIds(getActiveAgentIds());
    loadBriefingWithCache();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function getSession() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
  }

  function checkWelcome() {
    try {
      const pending = localStorage.getItem('fz_welcome_pending');
      if (pending === 'true') {
        setShowWelcome(true);
        localStorage.removeItem('fz_welcome_pending');
      }
    } catch { /* */ }
  }

  function dismissWelcome() {
    setShowWelcome(false);
  }

  function loadStats() {
    try {
      const gam = JSON.parse(localStorage.getItem('fz_gamification') ?? '{}');
      const docs = JSON.parse(localStorage.getItem('fz_docs') ?? '[]');

      setStats({
        totalTokens: gam.totalTokens ?? 0,
        totalCost: gam.totalCost ?? 0,
        totalMessages: gam.totalMessages ?? 0,
        totalDocuments: docs.length ?? 0,
        totalMeetings: gam.totalMeetings ?? 0,
        streak: gam.streak ?? 0,
        level: gam.level ?? 1,
        xp: gam.xp ?? 0,
        xpToNext: gam.xpToNext ?? 100,
        achievements: gam.achievements ?? [],
      });

      const weekly: WeeklySummary[] = [];
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        const dayData = gam.dailyStats?.[key] ?? { messages: 0, tokens: 0 };
        weekly.push({ day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], messages: dayData.messages, tokens: dayData.tokens });
      }
      setWeeklyData(weekly);
    } catch { /* */ }
  }

  async function loadWallet() {
    const session = getSession();
    if (!session.token) return;
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/wallet', token: session.token, method: 'GET' }),
      });
      const data = await res.json();
      setWalletBalance(data.balance ?? data.wallet?.balance ?? 0);
    } catch (e) { showError(e instanceof Error ? e.message : 'Impossible de charger le solde'); }
  }

  function loadTeam() {
    try {
      const team = JSON.parse(localStorage.getItem('fz_team') ?? '[]');
      setTeamSize(team.length);
    } catch { /* */ }
  }

  function checkProfile() {
    try {
      const profile = localStorage.getItem('fz_company_profile');
      setHasProfile(!!profile && profile !== '{}');
    } catch { /* */ }
  }

  function checkCustomAgents() {
    try {
      const configs = loadAgentConfigs();
      setHasCustomAgents(Object.keys(configs.configs).length > 0);
    } catch { /* */ }
  }

  async function getAiTip() {
    const session = getSession();
    if (!session.token) return;
    setTipLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Tu es ${DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name}, ${DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.role}. Donne UN conseil personnalisé et actionnable pour améliorer la productivité aujourd'hui. Le client a ${stats.totalMessages} messages, ${stats.totalDocuments} documents générés, une équipe de ${teamSize} agents, et un streak de ${stats.streak} jours. Réponse en 2 phrases max, en français.` }],
          maxTokens: 256,
          agentName: 'fz-assistante',
        }),
      });
      if (!res.ok) { setAiTip('Service temporairement indisponible.'); return; }
      const data = await res.json();
      setAiTip(data.content ?? data.text ?? 'Pas de conseil disponible.');
    } catch { setAiTip('Connectez-vous à internet pour recevoir des conseils personnalisés.'); }
    finally { setTipLoading(false); }
  }

  // ─── Briefing cache helpers ─────────────────────────────────────────────────
  const BRIEFING_CACHE_KEY = 'fz_briefing_cache';

  function loadBriefingWithCache() {
    const s = getSession();
    if (!s.token) return;
    const todayKey = new Date().toISOString().split('T')[0];
    try {
      const cached = JSON.parse(localStorage.getItem(BRIEFING_CACHE_KEY) ?? '{}');
      if (cached.date === todayKey && cached.content) {
        setBriefing(cached.content);
        setBriefingLoaded(true);
        setBriefingGeneratedAt(cached.generatedAt || '');
        return; // Utilise le cache
      }
    } catch { /* */ }
    loadBriefing(); // Génère automatiquement si pas de cache valide
  }

  async function loadBriefing() {
    const s = getSession();
    if (!s.token) return;
    setBriefingLoading(true);
    try {
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const companyProfile = localStorage.getItem('fz_company_profile') || 'Non renseigné';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: s.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Tu es Maëva, directrice générale IA de Freenzy. Nous sommes le ${today}. Génère un briefing du jour concis et actionnable pour le client. Contexte entreprise: ${companyProfile}. Stats: ${stats.totalMessages} messages, ${stats.totalDocuments} documents, streak de ${stats.streak} jours, ${activeAgents.length} agents actifs. Structure ton briefing ainsi:
1. **Salutation personnalisée** (1 ligne)
2. **Priorités du jour** (3 actions concrètes à faire aujourd'hui)
3. **Insight business** (1 observation ou tendance basée sur l'activité)
4. **Conseil du jour** (1 astuce productivité)
Sois concise, percutante et bienveillante. Réponds en français.` }],
          maxTokens: 512,
          agentName: 'fz-dg',
        }),
      });
      if (!res.ok) { setBriefing('Service temporairement indisponible.'); return; }
      const data = await res.json();
      const content = data.content ?? data.text ?? '';
      setBriefing(content);
      setBriefingLoaded(true);
      // Sauvegarder dans le cache
      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setBriefingGeneratedAt(timeStr);
      try {
        localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({
          date: now.toISOString().split('T')[0],
          content,
          generatedAt: timeStr,
        }));
      } catch { /* */ }
    } catch { setBriefing('Connectez-vous pour recevoir votre briefing personnalisé.'); }
    finally { setBriefingLoading(false); }
  }

  function refreshBriefing() {
    // Efface le cache et re-génère
    try { localStorage.removeItem(BRIEFING_CACHE_KEY); } catch { /* */ }
    setBriefingLoaded(false);
    setBriefingGeneratedAt('');
    loadBriefing();
  }

  const session = getSession();
  const userName = session.name || session.email?.split('@')[0] || '';
  const tier = session.tier || 'guest';
  const maxWeeklyMessages = Math.max(...weeklyData.map(d => d.messages), 1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const availableAgents = getAgentsForTier(tier);
  const agentDetails = availableAgents.map(id => DEFAULT_AGENTS.find(a => a.id === id)!).filter(Boolean);

  // Split agents into active (user-selected) and inactive
  const activeAgents = agentDetails.filter(a => activeAgentIds.includes(a.id));
  const inactiveAgents = agentDetails.filter(a => !activeAgentIds.includes(a.id));

  // Agent usage from chat history for personalization
  const agentUsage: Record<string, number> = {};
  try {
    const chatHistory = JSON.parse(localStorage.getItem('fz_chat_history') ?? '[]');
    for (const entry of chatHistory) {
      if (entry.agentId) agentUsage[entry.agentId] = (agentUsage[entry.agentId] ?? 0) + 1;
    }
  } catch { /* */ }

  function handleActivateAgent(agentId: AgentTypeId) {
    const updated = toggleAgent(agentId);
    setActiveAgentIds([...updated]);
    // Persist to backend
    const s = getSession();
    if (s.token) {
      fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/active-agents', token: s.token, method: 'POST', data: { agents: updated } }),
      }).catch(() => {});
    }
  }

  // Checklist items
  const checklistItems = [
    { id: 'account', label: 'Créer votre compte', done: !!session.token, href: '/login', icon: '✅' },
    { id: 'profile', label: 'Compléter le profil entreprise', done: hasProfile, href: '/client/onboarding', icon: '🏢' },
    { id: 'agent', label: 'Recruter votre premier agent', done: teamSize > 0, href: '/client/team', icon: '👥' },
    { id: 'customize', label: 'Personnaliser un agent', done: hasCustomAgents, href: '/client/agents/customize', icon: '🎨' },
    { id: 'message', label: 'Envoyer votre premier message', done: stats.totalMessages > 0, href: '/client/chat', icon: '💬' },
  ];
  const checklistDone = checklistItems.filter(c => c.done).length;
  const isNewUser = checklistDone < 5;

  const LEVEL_TITLES: Record<number, string> = {
    1: 'Débutant', 2: 'Apprenti', 3: 'Explorateur', 4: 'Collaborateur',
    5: 'Professionnel', 6: 'Expert', 7: 'Maître', 8: 'Visionnaire',
    9: 'Légende', 10: 'Transcendant',
  };

  return (
    <div>
      {/* Freenzy Welcome Modal */}
      {showWelcome && (
        <FreenzyWelcome userName={userName} tier={tier} onDismiss={dismissWelcome} />
      )}

      {/* Onboarding Priority Banner */}
      {!hasProfile && (
        <div className="card section flex items-center flex-wrap gap-16" style={{
          background: 'linear-gradient(135deg, #6366f10d, #a855f708)',
          border: '2px solid #6366f130',
          padding: '16px 20px',
        }}>
          <span style={{ fontSize: 36 }}>🏢</span>
          <div className="flex-1" style={{ minWidth: 200 }}>
            <div className="text-lg font-bold mb-4">
              Présentez votre entreprise à vos agents
            </div>
            <div className="text-md text-secondary" style={{ lineHeight: 1.5 }}>
              Complétez votre profil pour que vos agents IA comprennent parfaitement vos besoins.
              Plus de contexte = des réponses bien meilleures.
            </div>
          </div>
          <Link href="/client/onboarding" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Configurer maintenant
          </Link>
        </div>
      )}

      {/* Greeting Card */}
      <div className="card section flex items-center flex-wrap gap-16" style={{
        background: 'linear-gradient(135deg, #6366f10a, #a855f708)',
        border: '1px solid #6366f122',
        padding: '16px 20px',
      }}>
        <div className="flex-center" style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: 'white', fontSize: 24, fontWeight: 800, flexShrink: 0,
        }}>
          S
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold mb-4">
            {greeting}, {userName || 'cher client'} !
          </div>
          <div className="text-md text-secondary" style={{ lineHeight: 1.5 }}>
            {stats.totalMessages === 0
              ? `Bienvenue chez Freenzy.io ! Vos ${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''} actif${activeAgents.length > 1 ? 's' : ''} ${activeAgents.length > 1 ? 'sont prêts' : 'est prêt'} à travailler.`
              : stats.streak > 7
                ? `Impressionnant, ${stats.streak} jours consécutifs ! Votre équipe de ${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''} est en pleine forme.`
                : `Votre équipe de ${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''} est prête. ${stats.totalMessages} message${stats.totalMessages > 1 ? 's' : ''} échangé${stats.totalMessages > 1 ? 's' : ''} jusqu'ici.`
            }
          </div>
        </div>
        <div className="flex gap-6" style={{ flexShrink: 0 }}>
          {activeAgents.slice(0, 4).map(a => (
            <div key={a.id} title={a.role} className="flex-center" style={{
              width: 32, height: 32, borderRadius: 10,
              background: a.color + '22', border: `1px solid ${a.color}44`, fontSize: 16,
            }}>
              {a.emoji}
            </div>
          ))}
          {activeAgents.length > 4 && (
            <div className="flex-center text-xs font-bold text-muted" style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--bg-tertiary)',
            }}>
              +{activeAgents.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Modele 100% gratuit — info banner */}
      <div className="card section flex items-center flex-wrap gap-16" style={{
        background: 'linear-gradient(135deg, #10b98108, #06b6d408)',
        border: '1px solid #10b98122',
        padding: '12px 20px',
      }}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="text-sm font-bold" style={{ color: '#059669', marginBottom: 2 }}>
            Plateforme 100% gratuite — 0% de commission
          </div>
          <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
            Vos agents IA tournent au prix coûtant officiel Anthropic. Aucun markup, aucun abonnement caché.
            Vous ne payez que les tokens que vous consommez réellement.
          </div>
        </div>
        <div className="flex gap-6" style={{ flexShrink: 0, flexWrap: 'wrap' }}>
          {['Prix officiel Anthropic', '0% commission', 'Sans abonnement'].map(badge => (
            <span key={badge} style={{
              fontSize: 10, fontWeight: 600, color: '#059669',
              background: '#10b98112', border: '1px solid #10b98130',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Briefing du jour — integrated */}
      <div className="card section" style={{
        background: 'linear-gradient(135deg, #f59e0b08, #f9731608)',
        border: '1px solid #f59e0b22',
      }}>
        <div className="flex-between items-center mb-12">
          <div className="flex items-center gap-8">
            <span style={{ fontSize: 24 }}>☀️</span>
            <div>
              <div className="text-base font-bold">Briefing du jour</div>
              <div className="text-xs text-muted">
                {briefingGeneratedAt
                  ? `Généré aujourd'hui à ${briefingGeneratedAt}`
                  : new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
          <button onClick={refreshBriefing} disabled={briefingLoading} className="btn btn-ghost btn-sm">
            {briefingLoading ? '⏳ Génération...' : briefingLoaded ? '🔄 Rafraîchir' : '✨ Générer mon briefing'}
          </button>
        </div>
        {briefing ? (
          <div className="text-sm text-secondary" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {briefing}
          </div>
        ) : briefingLoading ? (
          <div className="text-sm text-muted" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
            ⏳ Votre briefing est en cours de génération...
          </div>
        ) : (
          <div className="text-sm text-muted" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
            Votre briefing personnalisé du jour est en cours de chargement...
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid-4 section" style={{ gap: 10 }}>
        <div className="stat-card">
          <div className="stat-label">Messages échangés</div>
          <div className="stat-value">{stats.totalMessages}</div>
          <div className="text-xs text-muted mt-4">+10 XP par message</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Documents générés</div>
          <div className="stat-value">{stats.totalDocuments}</div>
          <div className="text-xs text-muted mt-4">+25 XP par document</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Agents actifs</div>
          <div className="stat-value">{activeAgents.length}</div>
          <div className="text-xs text-muted mt-4">
            sur {DEFAULT_AGENTS.length} disponibles
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Crédits restants</div>
          <div className="stat-value" style={{ color: walletBalance > 50_000_000 ? 'var(--success)' : walletBalance > 10_000_000 ? '#f59e0b' : '#ef4444' }}>
            {(walletBalance / 1_000_000).toFixed(1)}
          </div>
          <div className="text-xs text-muted mt-4">crédits disponibles</div>
        </div>
      </div>

      {/* Agent Activity Summary — Active vs Inactive */}
      <div className="card section">
        <div className="flex-between items-center mb-16">
          <div className="section-title" style={{ marginBottom: 0 }}>
            Mon équipe IA
            <span className="text-sm text-muted font-normal" style={{ marginLeft: 8 }}>
              {activeAgents.length} actif{activeAgents.length > 1 ? 's' : ''}
            </span>
          </div>
          <Link href="/client/team" className="text-sm font-semibold text-accent" style={{ textDecoration: 'none' }}>
            Gérer l&apos;équipe &rarr;
          </Link>
        </div>

        {/* Active agents — full cards */}
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {activeAgents.map(agent => (
            <Link key={agent.id} href="/client/chat" className="flex items-center gap-8 bg-secondary rounded-md" style={{
              padding: '8px 10px',
              border: `1px solid ${agent.color}33`, textDecoration: 'none', color: 'inherit',
              transition: 'border-color 0.15s ease',
            }}>
              <div className="flex-center" style={{
                width: 36, height: 36, borderRadius: 10,
                background: agent.color + '22', border: `1px solid ${agent.color}44`, fontSize: 18,
              }}>
                {agent.emoji}
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="text-sm font-bold truncate">{agent.name}</div>
                <div className="text-xs text-muted">{agent.role}</div>
              </div>
              {agentUsage[agent.id] && (
                <div className="text-xs text-muted">{agentUsage[agent.id]}x</div>
              )}
              <div className="dot dot-success" title="En ligne 24/7" />
            </Link>
          ))}
        </div>

        {/* Inactive agents — compact, grayed out */}
        {inactiveAgents.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="text-sm font-semibold text-muted mb-8">
              Agents disponibles
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {inactiveAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => handleActivateAgent(agent.id)}
                  className="flex items-center gap-6 rounded-md"
                  style={{
                    padding: '5px 10px', border: '1px dashed var(--border-secondary)',
                    background: 'transparent', cursor: 'pointer',
                    opacity: 0.5, transition: 'opacity 0.15s',
                    fontFamily: 'var(--font-sans)',
                  }}
                  title={`Activer ${agent.name}`}
                >
                  <span style={{ fontSize: 14 }}>{agent.emoji}</span>
                  <span className="text-xs text-secondary">{agent.name}</span>
                  <span className="text-xs text-accent font-semibold">+</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New User Checklist */}
      {isNewUser && (
        <div className="card section" style={{ borderColor: '#6366f133' }}>
          <div className="flex-between items-center mb-16">
            <div>
              <div className="section-title" style={{ marginBottom: 4 }}>Démarrage rapide</div>
              <div className="text-sm text-muted">
                {checklistDone}/5 étapes complétées
              </div>
            </div>
            <div className="progress-bar" style={{ width: 100 }}>
              <div className="progress-fill" style={{ width: `${(checklistDone / 5) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {checklistItems.map(item => (
              <Link
                key={item.id}
                href={item.done ? '#' : item.href}
                className={`checklist-item${item.done ? ' checklist-item-done' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={item.done ? (e) => e.preventDefault() : undefined}
              >
                <span className="text-center" style={{ fontSize: 18, width: 28 }}>
                  {item.done ? '✅' : item.icon}
                </span>
                <span className="text-md" style={{
                  fontWeight: item.done ? 400 : 600,
                  textDecoration: item.done ? 'line-through' : 'none',
                  color: item.done ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>
                  {item.label}
                </span>
                {!item.done && (
                  <span className="text-xs text-accent font-semibold" style={{ marginLeft: 'auto' }}>
                    Commencer &rarr;
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Streak + AI Tip */}
      <div className="grid-2 section gap-12">
        <div className="card" style={{ borderColor: stats.streak > 0 ? '#f59e0b' : 'var(--border-primary)' }}>
          <div className="flex items-center gap-16">
            <div style={{ fontSize: 48 }}>{stats.streak > 0 ? '🔥' : '❄️'}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stats.streak > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                {stats.streak}
              </div>
              <div className="text-md text-secondary">jours consécutifs</div>
              <div className="text-xs text-muted mt-4">
                {stats.streak === 0 ? 'Envoyez un message pour commencer votre streak!' :
                  stats.streak >= 30 ? 'Impressionnant! Vous êtes un utilisateur fidèle.' :
                    stats.streak >= 7 ? 'Belle semaine! Continuez!' : 'Bon début, gardez le rythme!'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between items-center mb-12">
            <div className="text-base font-bold">Conseil de {DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name}</div>
            <button onClick={getAiTip} disabled={tipLoading} className="btn btn-ghost btn-sm">
              {tipLoading ? '...' : '✨ Nouveau conseil'}
            </button>
          </div>
          <div className="text-md text-secondary" style={{ lineHeight: 1.6, fontStyle: aiTip ? 'normal' : 'italic' }}>
            {aiTip || `Cliquez sur "Nouveau conseil" pour recevoir un conseil personnalisé de ${DEFAULT_AGENTS.find(a => a.id === 'fz-assistante')!.name}.`}
          </div>
        </div>
      </div>

      {/* Weekly Activity — recharts */}
      <div className="card section">
        <div className="section-title mb-16">Activité de la semaine</div>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#86868b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#a1a1a6' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} />
              <Bar dataKey="messages" fill="#6366f1" radius={[4, 4, 0, 0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-muted" style={{ textAlign: 'center', padding: '30px 0' }}>
            Pas encore de données cette semaine
          </div>
        )}
      </div>

      {/* Credit Gauge + Usage Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="text-md font-bold">Solde crédits</div>
            <Link href="/client/account" className="text-xs text-accent font-semibold" style={{ textDecoration: 'none' }}>
              Recharger →
            </Link>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1, marginBottom: 10 }}>
            {(walletBalance / 1_000_000).toFixed(1)} <span style={{ fontSize: 13, fontWeight: 600, color: '#86868b' }}>crédits</span>
          </div>
          {/* Barre de progression */}
          {(() => {
            const credits = walletBalance / 1_000_000;
            const max = Math.max(credits, 50); // scale relative to 50 credits or current balance
            const pct = Math.min((credits / max) * 100, 100);
            const barColor = credits > 30 ? '#22c55e' : credits > 10 ? '#f59e0b' : '#ef4444';
            return (
              <div>
                <div style={{
                  width: '100%', height: 8, background: '#f0f0f3',
                  borderRadius: 6, overflow: 'hidden', marginBottom: 8,
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                    borderRadius: 6, transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                  <span>≈ {Math.round(credits / 0.69)} chats · {Math.round(credits / 1.1)} emails · {Math.round(credits / 5)} appels</span>
                  <span style={{ color: barColor, fontWeight: 700 }}>
                    {credits > 30 ? 'Confortable' : credits > 10 ? 'Modéré' : 'Faible'}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="text-md font-bold mb-8">Usage par type</div>
          {stats.totalMessages > 0 || stats.totalDocuments > 0 || stats.totalMeetings > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Messages', value: Math.max(stats.totalMessages, 1), fill: '#6366f1' },
                    { name: 'Documents', value: Math.max(stats.totalDocuments, 1), fill: '#a855f7' },
                    { name: 'Réunions', value: Math.max(stats.totalMeetings, 1), fill: '#10b981' },
                  ]}
                  cx="50%" cy="50%" innerRadius={30} outerRadius={50}
                  dataKey="value" paddingAngle={2}
                >
                  {[{ fill: '#6366f1' }, { fill: '#a855f7' }, { fill: '#10b981' }].map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-sm text-muted" style={{ padding: '30px 0' }}>Pas encore de données</div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', fontSize: 10, color: '#86868b' }}>
            <span><span style={{ color: '#6366f1' }}>&#9632;</span> Chat</span>
            <span><span style={{ color: '#a855f7' }}>&#9632;</span> Docs</span>
            <span><span style={{ color: '#10b981' }}>&#9632;</span> Réunions</span>
          </div>
        </div>
      </div>

      {/* Actions Widget */}
      <Link href="/client/actions" className="card section flex items-center flex-wrap gap-16" style={{
        background: 'linear-gradient(135deg, #f59e0b08, #ef444408)',
        border: '1px solid #f59e0b22', padding: '14px 20px',
        textDecoration: 'none', color: 'inherit', cursor: 'pointer',
      }}>
        <span style={{ fontSize: 32 }}>⚡</span>
        <div className="flex-1" style={{ minWidth: 200 }}>
          <div className="text-base font-bold mb-2">Centre d&apos;actions</div>
          <div className="text-sm text-secondary">
            Retrouvez toutes les actions proposées par vos agents : tâches, appels, emails, publications...
          </div>
        </div>
        <span className="btn btn-sm" style={{ flexShrink: 0, background: '#F59E0B', color: 'white', borderColor: '#F59E0B' }}>
          Voir mes actions
        </span>
      </Link>

      {/* Referral Widget */}
      <div className="card section flex items-center flex-wrap gap-16" style={{
        background: 'linear-gradient(135deg, #6366f10a, #a855f708)',
        border: '1px solid #6366f122', padding: '14px 20px',
      }}>
        <span style={{ fontSize: 32 }}>🎁</span>
        <div className="flex-1" style={{ minWidth: 200 }}>
          <div className="text-base font-bold mb-2">Invitez vos amis, gagnez 20 EUR de crédits</div>
          <div className="text-sm text-secondary">Partagez votre lien de parrainage et recevez des crédits gratuits.</div>
        </div>
        <Link href="/client/referrals" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          Mon lien de parrainage
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <div className="section-title">Actions recommandées</div>
        <div className="grid-2" style={{ gap: 10 }}>
          {!hasProfile && (
            <Link href="/client/onboarding" className="card card-lift flex items-center gap-12 pointer" style={{
              padding: 14, textDecoration: 'none', color: 'inherit',
              borderColor: 'var(--accent)', background: 'var(--accent-muted)',
            }}>
              <span style={{ fontSize: 28 }}>📋</span>
              <div>
                <div className="text-base font-bold">Complétez votre profil entreprise</div>
                <div className="text-sm text-secondary">Vos agents vous donneront de meilleurs conseils avec plus de contexte.</div>
              </div>
            </Link>
          )}
          {!hasCustomAgents && (
            <Link href="/client/agents/customize" className="card card-lift flex items-center gap-12 pointer" style={{
              padding: 14, textDecoration: 'none', color: 'inherit',
              borderColor: '#a855f7', background: '#a855f715',
            }}>
              <span style={{ fontSize: 28 }}>🎨</span>
              <div>
                <div className="text-base font-bold">Personnalisez vos agents</div>
                <div className="text-sm text-secondary">Configurez la personnalité, l&apos;expertise et les instructions de chaque agent.</div>
              </div>
            </Link>
          )}
          <Link href="/client/marketplace" className="card card-lift flex items-center gap-12 pointer" style={{
            padding: 14, textDecoration: 'none', color: 'inherit',
          }}>
            <span style={{ fontSize: 28 }}>🛒</span>
            <div>
              <div className="text-base font-bold">Marketplace d&apos;agents</div>
              <div className="text-sm text-secondary">Découvrez et installez de nouveaux agents spécialisés.</div>
            </div>
          </Link>
          <Link href="/client/meeting" className="card card-lift flex items-center gap-12 pointer" style={{
            padding: 14, textDecoration: 'none', color: 'inherit',
          }}>
            <span style={{ fontSize: 28 }}>🏛️</span>
            <div>
              <div className="text-base font-bold">Lancer une réunion stratégique</div>
              <div className="text-sm text-secondary">Réunissez vos agents pour brainstormer ensemble.</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Achievements */}
      <div className="section">
        <div className="section-title">Succès & Récompenses</div>
        <div className="grid-3" style={{ gap: 10 }}>
          {[
            { icon: '🎯', title: 'Premier Pas', desc: 'Envoyez votre premier message', unlocked: stats.totalMessages >= 1 },
            { icon: '💬', title: 'Bavard', desc: '10 messages envoyés', unlocked: stats.totalMessages >= 10 },
            { icon: '🗣️', title: 'Grand Orateur', desc: '50 messages envoyés', unlocked: stats.totalMessages >= 50 },
            { icon: '📄', title: 'Rédacteur', desc: 'Générez votre premier document', unlocked: stats.totalDocuments >= 1 },
            { icon: '📚', title: 'Auteur', desc: '5 documents générés', unlocked: stats.totalDocuments >= 5 },
            { icon: '👥', title: 'Recruteur', desc: 'Recrutez votre premier agent', unlocked: teamSize >= 1 },
            { icon: '🏢', title: 'Manager', desc: 'Équipe de 3+ agents', unlocked: teamSize >= 3 },
            { icon: '🔥', title: 'Assidu', desc: 'Streak de 7 jours', unlocked: stats.streak >= 7 },
            { icon: '💎', title: 'Expert', desc: 'Atteignez le niveau 5', unlocked: stats.level >= 5 },
            { icon: '📋', title: 'Organisé', desc: 'Complétez votre profil entreprise', unlocked: hasProfile },
            { icon: '🤝', title: 'Collaborateur', desc: 'Lancez une réunion multi-agents', unlocked: stats.totalMeetings >= 1 },
            { icon: '🎨', title: 'Personnalisateur', desc: 'Personnalisez votre premier agent', unlocked: hasCustomAgents },
            { icon: '⭐', title: 'Légende', desc: 'Atteignez le niveau 10', unlocked: stats.level >= 10 },
          ].map(a => (
            <div key={a.title} className="card text-center p-12" style={{
              opacity: a.unlocked ? 1 : 0.4,
              borderColor: a.unlocked ? 'var(--accent)' : 'var(--border-primary)',
              background: a.unlocked ? 'var(--accent-muted)' : 'var(--bg-secondary)',
            }}>
              <div style={{ fontSize: 32 }} className="mb-4">{a.icon}</div>
              <div className="text-md font-bold" style={{ marginBottom: 2 }}>{a.title}</div>
              <div className="text-xs text-muted">{a.desc}</div>
              {a.unlocked && <div className="text-xs text-accent font-semibold" style={{ marginTop: 6 }}>DÉBLOQUÉ</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Level badge bottom-right */}
      <div className="level-badge-fixed flex items-center gap-8 text-sm font-bold" style={{
        position: 'fixed', bottom: 20, right: 20,
        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        borderRadius: 16, padding: '6px 12px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        zIndex: 50,
      }}>
        <span>Nv.{stats.level}</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span>{LEVEL_TITLES[stats.level] ?? 'Maître'}</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span>{stats.xp}/{stats.xpToNext} XP</span>
      </div>
    </div>
  );
}
