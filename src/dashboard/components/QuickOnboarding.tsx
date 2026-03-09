'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ALL_AGENTS, type DefaultAgentDef } from '../lib/agent-config';

// ─── Types ───

interface QuickOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface GoalOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  agentId: string;
  description: string;
}

// ─── Goal Options ───

const GOALS: GoalOption[] = [
  {
    id: 'productivity',
    label: 'Productivité',
    icon: 'speed',
    color: '#22c55e',
    agentId: 'fz-assistante',
    description: 'Organisez votre temps, vos tâches et vos projets efficacement.',
  },
  {
    id: 'sales',
    label: 'Ventes & Commercial',
    icon: 'trending_up',
    color: '#3b82f6',
    agentId: 'fz-commercial',
    description: 'Boostez vos ventes, prospectez et concluez plus de deals.',
  },
  {
    id: 'creation',
    label: 'Création & Communication',
    icon: 'palette',
    color: '#8b5cf6',
    agentId: 'fz-communication',
    description: 'Créez du contenu percutant et gérez votre image de marque.',
  },
  {
    id: 'personal',
    label: 'Gestion Personnelle',
    icon: 'person',
    color: '#f97316',
    agentId: 'fz-budget',
    description: 'Gérez votre budget, vos finances et votre vie quotidienne.',
  },
];

// ─── Agent Welcome Messages ───

const WELCOME_MESSAGES: Record<string, string> = {
  'fz-assistante': 'Bonjour ! Je suis Inès, votre Assistante Exécutive. Je suis là pour organiser votre quotidien, gérer vos tâches et vous faire gagner un temps précieux. Qu\'est-ce que je peux faire pour vous aujourd\'hui ?',
  'fz-commercial': 'Salut ! Moi c\'est Sacha, votre Directeur Commercial. Que vous soyez en B2B ou B2C, je vais vous aider à vendre mieux et plus. Dites-moi, quel est votre plus gros défi commercial en ce moment ?',
  'fz-communication': 'Bonjour ! Je suis Lina, Directrice de la Communication. Ensemble, on va construire une image de marque forte et cohérente. Parlez-moi de votre projet ou de votre entreprise !',
  'fz-budget': 'Bonjour ! Je suis Yasmine, votre coach budget. Mon rôle, c\'est de vous aider à y voir clair dans vos finances — sans jugement, avec des conseils concrets. Qu\'est-ce qui vous préoccupe côté argent ?',
};

// ─── Agent Simulated Responses ───

const SIMULATED_RESPONSES: Record<string, string> = {
  'fz-assistante': 'Parfait ! Je vais commencer par organiser votre semaine. Voici ce que je vous propose :\n\n1. On identifie vos 3 priorités de la semaine\n2. Je crée un planning optimisé\n3. On met en place des rappels intelligents\n\nVous allez voir, avec une bonne organisation, tout devient plus simple ! 🎯',
  'fz-commercial': 'Excellent ! Voici mon plan d\'action pour vous :\n\n1. Analyse de votre pipeline actuel\n2. Identification des opportunités à fort potentiel\n3. Création de templates de prospection personnalisés\n\nOn va transformer vos prospects en clients fidèles ! 💪',
  'fz-communication': 'Super ! Voici comment on va procéder :\n\n1. Audit rapide de votre communication actuelle\n2. Définition de votre ton de voix et messages clés\n3. Création d\'un calendrier éditorial sur mesure\n\nVotre marque va rayonner comme jamais ! ✨',
  'fz-budget': 'Très bien ! Voici ce que je vous propose de faire ensemble :\n\n1. On fait le point sur vos revenus et dépenses\n2. J\'identifie les économies possibles immédiatement\n3. On crée un plan d\'épargne réaliste et motivant\n\nChaque euro compte, et on va optimiser les vôtres ! 💰',
};

// ─── Confetti Animation ───

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
}

function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#eab308'];
    const particles: Particle[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 18 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 1,
      });
    }
    particlesRef.current = particles;

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4;
        p.rotation += p.rotationSpeed;
        p.life -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (alive) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    }
    animate();

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [canvasRef]);

  return launch;
}

// ─── Component ───

export default function QuickOnboarding({ onComplete, onSkip }: QuickOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption | null>(null);
  const [agent, setAgent] = useState<DefaultAgentDef | null>(null);
  const [messages, setMessages] = useState<{ role: 'agent' | 'user'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [hasReplied, setHasReplied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const launchConfetti = useConfetti(confettiRef);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle goal selection → go to step 2
  function selectGoal(goal: GoalOption) {
    setSelectedGoal(goal);
    localStorage.setItem('fz_onboarding_goal', goal.id);

    const found = ALL_AGENTS.find(a => a.id === goal.agentId) ?? null;
    setAgent(found);
    setStep(2);
  }

  // Go to step 3 → init chat
  function startChat() {
    if (!selectedGoal) return;
    const welcomeMsg = WELCOME_MESSAGES[selectedGoal.agentId] || 'Bonjour ! Comment puis-je vous aider ?';
    setMessages([{ role: 'agent', text: welcomeMsg }]);
    setStep(3);
  }

  // Send user message → simulate agent response
  function sendMessage() {
    if (!inputText.trim() || !selectedGoal || hasReplied) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = SIMULATED_RESPONSES[selectedGoal.agentId] || 'Très bien, je vais m\'en occuper !';
      setMessages(prev => [...prev, { role: 'agent', text: response }]);
      setIsTyping(false);
      setHasReplied(true);

      // Trigger confetti after a short delay
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => launchConfetti(), 100);
      }, 800);
    }, 1500);
  }

  // Complete onboarding
  function finish() {
    localStorage.setItem('fz_quick_onboarding_done', 'true');
    onComplete();
  }

  // Handle enter key
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ─── Render ───

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10001,
        }}
      />

      {/* Modal Container */}
      <div style={{
        width: '100%',
        maxWidth: 640,
        background: '#0a0a0f',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 32 : 10,
                height: 10,
                borderRadius: 5,
                background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.12)',
                transition: 'all 0.3s ease',
              }} />
            ))}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginLeft: 8 }}>
              {step}/3
            </span>
          </div>

          {/* Skip button */}
          <button
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 14,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            Passer
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 28px 28px', flex: 1, overflowY: 'auto' }}>

          {/* ─── STEP 1: Choose Goal ─── */}
          {step === 1 && (
            <div>
              <h2 style={{
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 6,
                marginTop: 0,
              }}>
                Quel est votre objectif principal ?
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 15,
                marginBottom: 24,
                lineHeight: 1.5,
              }}>
                Choisissez ce qui vous correspond le mieux. On vous suggérera l&apos;agent idéal.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {GOALS.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => selectGoal(goal)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14,
                      padding: '20px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = goal.color;
                      (e.currentTarget as HTMLElement).style.background = `${goal.color}11`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${goal.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 24, color: goal.color }}>
                        {goal.icon}
                      </span>
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                        {goal.label}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.4 }}>
                        {goal.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 2: Meet Your Agent ─── */}
          {step === 2 && agent && selectedGoal && (
            <div>
              <h2 style={{
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 6,
                marginTop: 0,
              }}>
                Rencontrez votre premier agent
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 15,
                marginBottom: 24,
                lineHeight: 1.5,
              }}>
                Voici l&apos;agent parfait pour votre objectif. Il est prêt à vous aider !
              </p>

              {/* Agent Card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${agent.color}40`,
                borderRadius: 16,
                padding: '28px 24px',
                marginBottom: 24,
              }}>
                {/* Agent header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `${agent.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${agent.color}40`,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28, color: agent.color }}>
                      {agent.materialIcon}
                    </span>
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>
                      {agent.emoji} {agent.name}
                    </div>
                    <div style={{ color: agent.color, fontSize: 14, fontWeight: 500 }}>
                      {agent.role}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: 20,
                  marginTop: 0,
                }}>
                  {agent.description}
                </p>

                {/* Capabilities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {agent.capabilities.map((cap, i) => (
                    <span key={i} style={{
                      background: `${agent.color}15`,
                      color: agent.color,
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: `1px solid ${agent.color}25`,
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Chat Button */}
              <button
                onClick={startChat}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: agent.color,
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                Commencer à discuter
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
              </button>

              {/* Back link */}
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  cursor: 'pointer',
                  marginTop: 16,
                  display: 'block',
                  margin: '16px auto 0',
                }}
              >
                ← Choisir un autre objectif
              </button>
            </div>
          )}

          {/* ─── STEP 3: Mini Chat ─── */}
          {step === 3 && agent && selectedGoal && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 4,
                marginTop: 0,
              }}>
                Envoyez votre premier message
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 14,
                marginBottom: 20,
                lineHeight: 1.5,
              }}>
                Discutez avec {agent.name} pour découvrir comment {agent.gender === 'F' ? 'elle' : 'il'} peut vous aider.
              </p>

              {/* Chat area */}
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.06)',
                padding: 16,
                marginBottom: 16,
                minHeight: 220,
                maxHeight: 320,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: 10,
                      maxWidth: '85%',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                    }}>
                      {msg.role === 'agent' && (
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${agent.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 18, color: agent.color }}>
                            {agent.materialIcon}
                          </span>
                        </div>
                      )}
                      <div style={{
                        background: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        color: '#fff',
                        fontSize: 14,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: `${agent.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18, color: agent.color }}>
                        {agent.materialIcon}
                      </span>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 14,
                      display: 'flex',
                      gap: 4,
                    }}>
                      <span style={{ animation: 'blink 1.4s infinite 0s' }}>●</span>
                      <span style={{ animation: 'blink 1.4s infinite 0.2s' }}>●</span>
                      <span style={{ animation: 'blink 1.4s infinite 0.4s' }}>●</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Confetti success state */}
              {showConfetti && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px 0 8px',
                }}>
                  <div style={{
                    fontSize: 42,
                    marginBottom: 10,
                  }}>
                    🎉
                  </div>
                  <h3 style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 6,
                    marginTop: 0,
                  }}>
                    Bravo ! Vous êtes prêt.
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: 14,
                    marginBottom: 20,
                    marginTop: 0,
                  }}>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>+10 crédits</span> offerts pour votre premier échange !
                  </p>
                  <button
                    onClick={finish}
                    style={{
                      padding: '14px 36px',
                      background: '#6366f1',
                      border: 'none',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  >
                    Accéder au tableau de bord
                    <span className="material-symbols-rounded" style={{ fontSize: 20 }}>arrow_forward</span>
                  </button>
                </div>
              )}

              {/* Input bar (hidden after reply) */}
              {!showConfetti && (
                <div style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-end',
                }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={hasReplied || isTyping}
                    placeholder={hasReplied ? 'Message envoyé !' : 'Écrivez votre message...'}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || hasReplied || isTyping}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: inputText.trim() && !hasReplied && !isTyping ? '#6366f1' : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      cursor: inputText.trim() && !hasReplied && !isTyping ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.2s',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{
                      fontSize: 20,
                      color: inputText.trim() && !hasReplied && !isTyping ? '#fff' : 'rgba(255,255,255,0.3)',
                    }}>
                      send
                    </span>
                  </button>
                </div>
              )}

              {/* Blink keyframes via style tag */}
              <style>{`
                @keyframes blink {
                  0%, 100% { opacity: 0.2; }
                  50% { opacity: 1; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
