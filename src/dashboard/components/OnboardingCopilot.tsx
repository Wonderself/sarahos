'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CopilotTip {
  id: string;
  emoji: string;
  title: string;
  message: string;
  action?: { label: string; href: string };
  pages?: string[];
  condition?: () => boolean;
  priority: number;
}

// ─── Guided Interview Questions (fill profile directly) ──────────────────────

interface InterviewQuestion {
  id: string;
  field: string;          // key in fz_company_profile
  emoji: string;
  question: string;       // what the copilot asks (aeronautical)
  placeholder: string;
  type: 'text' | 'textarea';
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q_name',
    field: 'companyName',
    emoji: '🏢',
    question: 'Avant tout, identifions votre appareil. Quel est le nom de votre entreprise, capitaine ?',
    placeholder: 'Ex: Acme SAS',
    type: 'text',
  },
  {
    id: 'q_industry',
    field: 'industry',
    emoji: '🧭',
    question: 'Roger. Dans quel secteur naviguez-vous ? Quel est votre espace aerien ?',
    placeholder: 'Ex: Tech, Sante, Finance, Commerce...',
    type: 'text',
  },
  {
    id: 'q_location',
    field: 'location',
    emoji: '📍',
    question: 'Coordonnees de la base ? D\'ou operez-vous ?',
    placeholder: 'Ex: Paris, France',
    type: 'text',
  },
  {
    id: 'q_employees',
    field: 'employeeCount',
    emoji: '👥',
    question: 'Combien de membres dans votre equipage ?',
    placeholder: 'Ex: 1-10, 11-50, 51-200...',
    type: 'text',
  },
  {
    id: 'q_mission',
    field: 'mission',
    emoji: '🎯',
    question: 'Quelle est la mission de vol de votre entreprise ? Pourquoi existez-vous ?',
    placeholder: 'Ex: Notre mission est de...',
    type: 'textarea',
  },
  {
    id: 'q_audience',
    field: 'targetAudience',
    emoji: '📡',
    question: 'Qui recoit vos transmissions ? Decrivez votre public cible.',
    placeholder: 'Ex: PME tech entre 10-100 employes...',
    type: 'textarea',
  },
  {
    id: 'q_challenges',
    field: 'mainChallenges',
    emoji: '⚠️',
    question: 'Quelles sont les turbulences actuelles ? Vos principaux defis ?',
    placeholder: 'Ex: Acquisition client, croissance, visibilite...',
    type: 'textarea',
  },
  {
    id: 'q_goals',
    field: 'shortTermGoals',
    emoji: '🛫',
    question: 'Derniere question ! Quelle est votre destination a court terme ? Vos objectifs pour les 3-6 prochains mois ?',
    placeholder: 'Ex: Lancer le produit, doubler les clients...',
    type: 'textarea',
  },
];

// ─── Aeronautical Tips ───────────────────────────────────────────────────────

const COPILOT_TIPS: CopilotTip[] = [
  {
    id: 'welcome',
    emoji: '🧑‍✈️',
    title: 'Bienvenue a bord, capitaine !',
    message: 'Ici votre commandant de bord. Je suis la pour vous guider dans le cockpit de Freenzy. On peut commencer par remplir votre plan de vol — ca prend 2 minutes et vos assistants seront beaucoup plus efficaces. On y va ?',
    pages: ['/client/dashboard'],
    priority: 0,
  },
  {
    id: 'profile_incomplete',
    emoji: '📋',
    title: 'Plan de vol incomplet',
    message: 'Tour de controle ici : votre profil n\'est rempli qu\'en partie. Sans plan de vol complet, vos assistants naviguent a vue. Je peux vous poser quelques questions rapides pour completer le tout ?',
    condition: () => {
      try { return !localStorage.getItem('fz_company_profile'); } catch { return true; }
    },
    priority: 1,
  },
  {
    id: 'documents_ready',
    emoji: '✅',
    title: 'Cargo charge et verifie !',
    message: 'Vos documents sont pre-remplis avec vos informations. Choisissez un modele — contrats, factures, rapports — tout est pret comme un equipage bien rode.',
    pages: ['/client/documents'],
    condition: () => {
      try { return !!localStorage.getItem('fz_company_profile'); } catch { return false; }
    },
    priority: 5,
  },
  {
    id: 'documents_need_profile',
    emoji: '📦',
    title: 'Chargement du cargo en attente',
    message: 'Vos 50 modeles de documents attendent vos coordonnees. Voulez-vous que je vous pose quelques questions rapides pour tout personnaliser automatiquement ?',
    pages: ['/client/documents'],
    condition: () => {
      try { return !localStorage.getItem('fz_company_profile'); } catch { return true; }
    },
    priority: 2,
  },
  {
    id: 'chat_intro',
    emoji: '💬',
    title: 'Communication avec l\'equipage',
    message: 'La radio est ouverte ! Parlez a n\'importe quel assistant. Ils comprennent le contexte de votre entreprise et s\'adaptent a votre style.',
    pages: ['/client/chat'],
    priority: 6,
  },
  {
    id: 'studio_intro',
    emoji: '🎬',
    title: 'Atelier photo sur le tarmac',
    message: 'Creez des photos et videos en quelques secondes. Decrivez ce que vous voulez, l\'IA fait le reste !',
    pages: ['/client/studio'],
    priority: 7,
  },
  {
    id: 'repondeur_intro',
    emoji: '📞',
    title: 'Pilote automatique active',
    message: 'Le repondeur gere vos appels quand vous etes en vol. Configurez le style et il prend les messages, filtre les urgences.',
    pages: ['/client/repondeur'],
    priority: 7,
  },
  {
    id: 'social_intro',
    emoji: '📱',
    title: 'Diffusion sur toutes les frequences',
    message: 'Publiez sur tous vos reseaux depuis un seul cockpit. Un seul tableau de bord pour tout piloter.',
    pages: ['/client/social'],
    priority: 7,
  },
  {
    id: 'strategy_intro',
    emoji: '🎯',
    title: 'Cap et trajectoire',
    message: 'Definissez vos objectifs — c\'est votre plan de vol strategique. Vos assistants proposeront des actions concretes.',
    pages: ['/client/strategy'],
    priority: 7,
  },
  {
    id: 'reveil_intro',
    emoji: '☕',
    title: 'Briefing avant decollage',
    message: 'Chaque matin, recevez votre briefing personnalise : meteo business, taches du jour, news importantes.',
    pages: ['/client/reveil'],
    priority: 7,
  },
  {
    id: 'discussions_intro',
    emoji: '🧠',
    title: 'Conversations en altitude',
    message: 'Des discussions profondes sur des sujets complexes. Le moteur le plus puissant (Opus) pour des echanges d\'altitude.',
    pages: ['/client/discussions'],
    priority: 7,
  },
  {
    id: 'agents_intro',
    emoji: '🤖',
    title: 'Votre equipage au complet',
    message: 'Voici tous les assistants disponibles. Activez ceux dont vous avez besoin, comme un commandant qui compose son equipage.',
    pages: ['/client/agents', '/client/personal'],
    priority: 6,
  },
  {
    id: 'credits_low',
    emoji: '⛽',
    title: 'Niveau de carburant bas',
    message: 'Attention capitaine, vos credits sont presque epuises. Rechargez pour continuer a voler !',
    action: { label: 'Ravitaillement', href: '/client/finances' },
    condition: () => {
      try {
        const s = localStorage.getItem('fz_session');
        if (!s) return false;
        const d = JSON.parse(s);
        return typeof d.credits === 'number' && d.credits < 5;
      } catch { return false; }
    },
    priority: 1,
  },
  {
    id: 'explore',
    emoji: '🗺️',
    title: 'Nouvelles routes a explorer',
    message: 'Vous n\'avez pas encore essaye toutes les fonctionnalites. Le Studio, les Discussions, le Repondeur... chaque instrument merite un essai !',
    pages: ['/client/dashboard'],
    priority: 10,
  },
];

// ─── Profile helpers ─────────────────────────────────────────────────────────

function loadProfile(): Record<string, string> {
  try {
    const raw = localStorage.getItem('fz_company_profile');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProfile(profile: Record<string, string>) {
  try { localStorage.setItem('fz_company_profile', JSON.stringify(profile)); } catch { /* */ }
}

function getProfileCompletion(): { filled: number; total: number; missing: string[] } {
  const profile = loadProfile();
  const fields = ['companyName', 'industry', 'location', 'employeeCount', 'mission', 'targetAudience', 'mainChallenges', 'shortTermGoals'];
  const missing = fields.filter(f => !profile[f]?.trim());
  return { filled: fields.length - missing.length, total: fields.length, missing };
}

// ─── Copilot congratulations ────────────────────────────────────────────────

const CONGRATULATIONS = [
  'Bien recu ! Information enregistree dans le manifeste de vol. ✅',
  'Roger ! C\'est note. On continue la checklist. 📋',
  'Parfait, capitaine ! Un champ de plus dans le plan de vol. 🛫',
  'Affirmatif ! Vos assistants vont adorer cette info. ✅',
  'Excellent ! Le profil se complete. On avance ! 📡',
  'C\'est dans la boite noire ! Question suivante. 🧑‍✈️',
  'Copie conforme ! On enchaine. ✈️',
  'Bravo capitaine ! Encore quelques coordonnees et on decolle. 🚀',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingCopilot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [seenTips, setSeenTips] = useState<string[]>([]);
  const [isHidden, setIsHidden] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'copilot'; text: string }>>([]);

  // Interview mode
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load state
  useEffect(() => {
    try {
      const seen = localStorage.getItem('fz_copilot_seen');
      if (seen) setSeenTips(JSON.parse(seen));
      const hidden = localStorage.getItem('fz_copilot_hidden');
      if (hidden === 'true') setIsHidden(true);
    } catch { /* silent */ }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, interviewStep]);

  // Get relevant tips
  const getRelevantTips = useCallback((): CopilotTip[] => {
    return COPILOT_TIPS
      .filter(tip => {
        if (tip.pages && tip.pages.length > 0) {
          if (!tip.pages.some(p => pathname.startsWith(p))) return false;
        }
        if (tip.condition && !tip.condition()) return false;
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }, [pathname]);

  const relevantTips = getRelevantTips();
  const unseenTips = relevantTips.filter(t => !seenTips.includes(t.id));
  const currentTip = isOpen ? (relevantTips[currentTipIndex] || relevantTips[0]) : null;

  const markSeen = (tipId: string) => {
    const updated = [...seenTips, tipId].filter((v, i, a) => a.indexOf(v) === i);
    setSeenTips(updated);
    try { localStorage.setItem('fz_copilot_seen', JSON.stringify(updated)); } catch { /* */ }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentTipIndex(0);
    setChatMessages([]);
    setInterviewMode(false);
    if (relevantTips[0]) markSeen(relevantTips[0].id);
  };

  const handleClose = () => {
    setIsOpen(false);
    setChatMessages([]);
    setQuestion('');
    setInterviewMode(false);
    setInterviewAnswer('');
  };

  const handleNext = () => {
    const next = currentTipIndex + 1;
    if (next < relevantTips.length) {
      setCurrentTipIndex(next);
      markSeen(relevantTips[next].id);
    } else {
      setCurrentTipIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentTipIndex > 0) setCurrentTipIndex(currentTipIndex - 1);
  };

  const handleHideGlobally = () => {
    setIsHidden(true);
    setIsOpen(false);
    try { localStorage.setItem('fz_copilot_hidden', 'true'); } catch { /* */ }
  };

  const handleDismissTip = () => {
    if (currentTip) markSeen(currentTip.id);
    handleNext();
  };

  // ─── Start guided interview ────────────────────────────────────────────────

  const startInterview = () => {
    setInterviewMode(true);
    const { missing } = getProfileCompletion();
    // Find the first unanswered question
    const firstQ = INTERVIEW_QUESTIONS.findIndex(q => missing.includes(q.field));
    setInterviewStep(firstQ >= 0 ? firstQ : 0);
    setChatMessages([{
      role: 'copilot',
      text: '🧑‍✈️ Parfait capitaine ! Briefing express — je vous pose quelques questions rapides pour completer votre plan de vol. Vos reponses sont enregistrees directement. C\'est parti !',
    }]);
    // Ask first question
    const q = INTERVIEW_QUESTIONS[firstQ >= 0 ? firstQ : 0];
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'copilot',
        text: `${q.emoji} ${q.question}`,
      }]);
    }, 800);
  };

  // ─── Submit interview answer ───────────────────────────────────────────────

  const submitInterviewAnswer = () => {
    if (!interviewAnswer.trim()) return;
    const answer = interviewAnswer.trim();
    setInterviewAnswer('');

    const currentQ = INTERVIEW_QUESTIONS[interviewStep];
    if (!currentQ) return;

    // Save to profile
    const profile = loadProfile();
    profile[currentQ.field] = answer;
    saveProfile(profile);

    // Show user message
    setChatMessages(prev => [...prev, { role: 'user', text: answer }]);

    // Find next unanswered question
    const { missing } = getProfileCompletion();
    // Remove current field from missing since we just filled it
    const remainingMissing = missing.filter(f => f !== currentQ.field);

    if (remainingMissing.length === 0) {
      // All done!
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'copilot',
          text: '🧑‍✈️ Plan de vol COMPLET ! Tous les systemes sont au vert. Vos assistants ont maintenant toutes les coordonnees pour vous servir parfaitement. Autorise au decollage, capitaine ! 🚀✅',
        }]);
        setInterviewMode(false);
      }, 600);
    } else {
      // Congratulate and ask next
      const congrats = CONGRATULATIONS[Math.floor(Math.random() * CONGRATULATIONS.length)];
      const nextQIndex = INTERVIEW_QUESTIONS.findIndex(q => remainingMissing.includes(q.field));

      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'copilot', text: `🧑‍✈️ ${congrats}` }]);
      }, 500);

      if (nextQIndex >= 0) {
        const nextQ = INTERVIEW_QUESTIONS[nextQIndex];
        setInterviewStep(nextQIndex);
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            role: 'copilot',
            text: `${nextQ.emoji} ${nextQ.question}`,
          }]);
        }, 1200);
      }
    }
  };

  // ─── Handle free-form questions ────────────────────────────────────────────

  const handleQuestion = () => {
    if (!question.trim()) return;
    const q = question.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
    setQuestion('');

    const lower = q.toLowerCase();
    let answer = '';

    // Detect if user wants to start the interview
    if (lower.includes('oui') || lower.includes('ok') || lower.includes('allons-y') || lower.includes('on y va') || lower.includes('go') || lower.includes('pret') || lower.includes('commencer') || lower.includes('briefing')) {
      const { missing } = getProfileCompletion();
      if (missing.length > 0) {
        setTimeout(() => startInterview(), 400);
        return;
      }
    }

    if (lower.includes('credit') || lower.includes('carburant') || lower.includes('prix') || lower.includes('cout')) {
      answer = '⛽ Roger ! Vos credits sont votre carburant. Chaque action IA consomme 1 a 20 credits selon la puissance. Rendez-vous dans Finances pour faire le plein !';
    } else if (lower.includes('profil') || lower.includes('entreprise') || lower.includes('info') || lower.includes('plan de vol')) {
      const { missing, filled, total } = getProfileCompletion();
      if (missing.length > 0) {
        answer = `📋 Votre plan de vol est a ${filled}/${total}. Je peux vous poser les questions manquantes ici meme — repondez "oui" et c\'est parti !`;
      } else {
        answer = '✅ Plan de vol complet ! Tous vos assistants ont acces a vos informations. Bon vol, capitaine !';
      }
    } else if (lower.includes('document') || lower.includes('contrat') || lower.includes('facture')) {
      answer = '📄 Affirmatif ! Allez dans Documents — 50 modeles vous attendent. Si votre profil est rempli, ils sont deja pre-personnalises.';
    } else if (lower.includes('aide') || lower.includes('help') || lower.includes('comment')) {
      answer = '📡 Tour de controle a l\'ecoute ! Commencez par remplir votre profil (dites "briefing"), puis testez le Chat. Je suis la sur chaque page avec des conseils.';
    } else if (lower.includes('assistant') || lower.includes('agent') || lower.includes('equipe')) {
      answer = '👥 Votre equipage compte plus de 30 assistants specialises. Direction "Mes Assistants" pour activer ceux dont vous avez besoin !';
    } else if (lower.includes('studio') || lower.includes('photo') || lower.includes('video')) {
      answer = '🎬 Le Studio est votre atelier creatif ! Decrivez ce que vous voulez et l\'IA genere le resultat. Photos ~8 credits, videos ~20.';
    } else if (lower.includes('merci') || lower.includes('super') || lower.includes('genial') || lower.includes('top')) {
      answer = 'C\'est un plaisir, capitaine ! Bon vol avec Freenzy. Over and out ! 🫡';
    } else {
      const { missing } = getProfileCompletion();
      if (missing.length > 0) {
        answer = `🧑‍✈️ Bien recu ! Au fait, votre plan de vol n'est pas encore complet (${missing.length} info${missing.length > 1 ? 's' : ''} manquante${missing.length > 1 ? 's' : ''}). Dites "briefing" et on remplit ca ensemble en 2 minutes !`;
      } else {
        answer = '🧑‍✈️ Bien recu ! Explorez les fonctionnalites — je suis la sur chaque page. Bon vol ! ✈️';
      }
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'copilot', text: answer }]);
    }, 600);
  };

  // Don't render if hidden or on admin pages
  if (isHidden) return null;
  if (pathname.startsWith('/admin')) return null;

  const { missing } = getProfileCompletion();
  const showInterviewCTA = missing.length > 0 && !interviewMode && chatMessages.length === 0;

  return (
    <>
      {/* Avatar */}
      <div
        className="fz-copilot-avatar"
        onClick={isOpen ? handleClose : handleOpen}
        title="Votre commandant de bord"
      >
        <span className="fz-copilot-avatar-emoji">🧑‍✈️</span>
        {(unseenTips.length > 0 || missing.length > 0) && !isOpen && (
          <span className="fz-copilot-badge" />
        )}
      </div>

      {/* Popup */}
      {isOpen && (
        <div className="fz-copilot-popup">
          {/* Header */}
          <div className="fz-copilot-header">
            <span className="fz-copilot-header-title">
              🧑‍✈️ Commandant de bord
            </span>
            <button className="fz-copilot-close" onClick={handleClose}>✕</button>
          </div>

          {/* Body */}
          <div className="fz-copilot-body">
            {/* Tips mode (no chat yet) */}
            {chatMessages.length === 0 && !interviewMode && currentTip ? (
              <div className="fz-copilot-tip">
                <div className="fz-copilot-tip-title">
                  <span>{currentTip.emoji}</span>
                  {currentTip.title}
                </div>
                <div className="fz-copilot-tip-message">
                  {currentTip.message}
                </div>
                {/* Interview CTA when profile incomplete */}
                {showInterviewCTA && (
                  <button
                    className="fz-copilot-tip-action"
                    onClick={startInterview}
                    style={{ marginTop: 4 }}
                  >
                    🛫 Remplir le plan de vol (2 min)
                  </button>
                )}
                {currentTip.action && !showInterviewCTA && (
                  <Link
                    href={currentTip.action.href}
                    className="fz-copilot-tip-action"
                    onClick={handleClose}
                  >
                    {currentTip.action.label} →
                  </Link>
                )}
              </div>
            ) : chatMessages.length === 0 && !interviewMode ? (
              <div className="fz-copilot-tip">
                <div className="fz-copilot-tip-title">
                  <span>🧑‍✈️</span>
                  Tout est nominal !
                </div>
                <div className="fz-copilot-tip-message">
                  {missing.length > 0
                    ? `Votre plan de vol est incomplet (${missing.length} champ${missing.length > 1 ? 's' : ''} manquant${missing.length > 1 ? 's' : ''}). On le complete ensemble ?`
                    : 'Pas de conseil specifique pour cette page. Posez-moi une question !'}
                </div>
                {missing.length > 0 && (
                  <button className="fz-copilot-tip-action" onClick={startInterview}>
                    🛫 Completer le plan de vol
                  </button>
                )}
              </div>
            ) : (
              /* Chat / Interview messages */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: msg.role === 'user'
                      ? 'var(--fz-accent, #7c3aed)'
                      : 'var(--fz-bg-secondary, #F8FAFC)',
                    color: msg.role === 'user' ? '#fff' : 'var(--fz-text, #1E293B)',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Navigation footer — tips mode only */}
          {chatMessages.length === 0 && !interviewMode && relevantTips.length > 1 && (
            <div className="fz-copilot-footer">
              <button onClick={handleDismissTip}>Compris !</button>
              <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                {currentTipIndex + 1} / {relevantTips.length}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={handlePrev} disabled={currentTipIndex === 0}>←</button>
                <button onClick={handleNext}>→</button>
              </div>
            </div>
          )}

          {/* Interview progress bar */}
          {interviewMode && (
            <div style={{
              padding: '6px 16px',
              borderTop: '1px solid var(--fz-border, #E2E8F0)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', whiteSpace: 'nowrap' }}>
                Plan de vol
              </span>
              <div style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: 'var(--fz-border, #E2E8F0)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: 2,
                  background: 'var(--fz-accent, #7c3aed)',
                  width: `${((8 - missing.length) / 8) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', whiteSpace: 'nowrap' }}>
                {8 - missing.length}/8
              </span>
            </div>
          )}

          {/* Input — interview mode or free-form */}
          <div className="fz-copilot-input-row">
            {interviewMode ? (
              <>
                {INTERVIEW_QUESTIONS[interviewStep]?.type === 'textarea' ? (
                  <textarea
                    value={interviewAnswer}
                    onChange={e => setInterviewAnswer(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInterviewAnswer(); } }}
                    placeholder={INTERVIEW_QUESTIONS[interviewStep]?.placeholder || ''}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--fz-border, #E2E8F0)',
                      borderRadius: 8,
                      fontSize: 13,
                      background: 'var(--fz-bg, #FFFFFF)',
                      color: 'var(--fz-text, #1E293B)',
                      outline: 'none',
                      resize: 'none',
                      minHeight: 40,
                      maxHeight: 80,
                      fontFamily: 'inherit',
                    }}
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    value={interviewAnswer}
                    onChange={e => setInterviewAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitInterviewAnswer()}
                    placeholder={INTERVIEW_QUESTIONS[interviewStep]?.placeholder || ''}
                  />
                )}
                <button onClick={submitInterviewAnswer}>📤</button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleQuestion()}
                  placeholder="Une question, capitaine ?"
                />
                <button onClick={handleQuestion}>📤</button>
              </>
            )}
          </div>

          {/* Global hide — only in tips mode */}
          {chatMessages.length === 0 && !interviewMode && (
            <div style={{
              textAlign: 'center',
              padding: '6px 16px 10px',
              borderTop: '1px solid var(--fz-border, #E2E8F0)',
            }}>
              <button
                onClick={handleHideGlobally}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 11,
                  color: 'var(--fz-text-muted, #94A3B8)',
                  cursor: 'pointer',
                }}
              >
                Masquer le commandant de bord
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
