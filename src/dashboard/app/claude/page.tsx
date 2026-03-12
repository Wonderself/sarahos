'use client';

import Link from 'next/link';
import { DEFAULT_AGENTS } from '../../lib/agent-config';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ── Simplified Claude icon ── */
function ClaudeIcon({ size = 24, color = '#1d1d1f' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill={`${color}12`} />
      <path d="M8 8l4 8 4-8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Opus agents (strategic, extended thinking) ── */
const OPUS_AGENT_IDS = ['fz-dev', 'fz-dg'];

export default function ClaudePage() {
  const sonnetAgents = DEFAULT_AGENTS.filter(a => !OPUS_AGENT_IDS.includes(a.id));
  const opusAgents = DEFAULT_AGENTS.filter(a => OPUS_AGENT_IDS.includes(a.id));

  return (
    <main aria-label="Technologie Claude AI d'Anthropic utilisée par Freenzy.io" style={{ background: '#fff', color: '#1d1d1f', minHeight: '100vh' }}>

      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section className="claude-hero" aria-label="Présentation de Claude AI par Anthropic" style={{
        textAlign: 'center',
        maxWidth: 680, margin: '0 auto', padding: '88px 24px 40px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          background: '#f5f5f7', color: '#86868b', marginBottom: 24,
        }}>
          <ClaudeIcon size={14} color="#86868b" /> Propulse par Anthropic
        </div>

        <h1 className="claude-hero-title" style={{
          fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em',
          lineHeight: 1.1, marginBottom: 16, color: '#1d1d1f',
        }}>
          L&apos;IA la plus avancee
          <br />
          propulse vos agents
        </h1>

        <p style={{
          fontSize: 17, color: '#86868b', lineHeight: 1.6,
          maxWidth: 520, margin: '0 auto 32px',
        }}>
          Freenzy.io utilise exclusivement les modeles Claude d&apos;Anthropic — reconnus comme les plus performants,
          les plus surs et les plus alignes du marche.
        </p>

        <Link href="/client/dashboard" style={{
          display: 'inline-block', padding: '12px 32px', fontSize: 15, fontWeight: 600,
          borderRadius: 12, background: '#1d1d1f', color: '#fff',
          textDecoration: 'none', transition: 'opacity 0.2s',
        }}>
          Acceder a Freenzy
        </Link>
      </section>

      {/* sr-only SEO text */}
      <div className="sr-only" aria-hidden="false">
        <p>Freenzy.io est propulsé exclusivement par les modèles Claude d&apos;Anthropic, reconnus comme les plus performants et les plus sûrs du marché. L&apos;architecture IA de Freenzy.io repose sur deux modèles : Claude Sonnet pour les tâches quotidiennes rapides (emails, documents, analyses) et Claude Opus avec Extended Thinking pour les décisions stratégiques complexes. Anthropic est le leader mondial en sécurité IA avec Constitutional AI, RLHF et alignement éthique. Claude excelle en français avec une compréhension native des nuances professionnelles. Fenêtre de contexte de 200K tokens.</p>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px' }}>

        {/* ═══ Pourquoi Claude ═══ */}
        <section aria-label="Avantages de Claude AI pour les entreprises" style={{ padding: '48px 0' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Technologie</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: 8 }}>
              Pourquoi Claude AI ?
            </h2>
            <p style={{ fontSize: 15, color: '#86868b', lineHeight: 1.6, maxWidth: 520 }}>
              Le choix de l&apos;IA qui propulse votre entreprise n&apos;est pas anodin.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: 16,
          }}>
            {[
              { icon: '🛡️', title: 'Securite #1 mondiale', desc: 'Anthropic est le leader mondial en securite IA. Constitutional AI, RLHF, alignement. Vos donnees ne sont jamais utilisees pour l\'entrainement.' },
              { icon: '⚡', title: 'Performance de pointe', desc: 'Claude surpasse GPT-4 et Gemini sur les benchmarks de raisonnement, codage et comprehension de texte.' },
              { icon: '🧠', title: 'Comprehension profonde', desc: 'Fenetre de contexte de 200K tokens. Claude comprend des documents entiers et le contexte de votre entreprise.' },
              { icon: '🇫🇷', title: 'Excellent en francais', desc: 'Claude excelle en francais avec une comprehension native des nuances et du vocabulaire professionnel.' },
            ].map(c => (
              <div key={c.title} style={{
                padding: 24, borderRadius: 12,
                background: '#f5f5f7',
              }}>
                <div role="img" aria-label={c.title} style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Deux modeles ═══ */}
        <section aria-label="Architecture deux modèles — Claude Sonnet et Claude Opus" style={{ padding: '48px 0' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Architecture</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f' }}>
              Deux modeles, deux forces
            </h2>
          </div>
          <div className="claude-models-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16, maxWidth: 780, margin: '0 auto',
          }}>
            {/* Sonnet */}
            <div className="claude-model-card" style={{
              padding: 32, borderRadius: 12, border: '1px solid #f5f5f7',
              background: '#fff',
            }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: '#f5f5f7', color: '#86868b',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16,
              }}>
                CLAUDE SONNET
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em', marginBottom: 8 }}>
                Rapide &amp; Efficace
              </div>
              <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.6, marginBottom: 20 }}>
                Le moteur de vos {sonnetAgents.length} agents du quotidien. Reponses en quelques secondes pour les emails,
                analyses, documents et taches courantes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                  'Temps de reponse ultra-rapide (2-5s)',
                  'Cout optimise par action',
                  'Ideal pour les taches courantes',
                  'Comprehension contextuelle avancee',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#86868b' }}>
                    <span style={{ fontSize: 14 }}>✅</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f5f5f7', paddingTop: 14, fontSize: 12, color: '#86868b' }}>
                Agents : {sonnetAgents.map(a => a.name).join(', ')}
              </div>
            </div>

            {/* Opus */}
            <div className="claude-model-card" style={{
              padding: 32, borderRadius: 12, border: '1px solid #1d1d1f',
              background: '#fff',
            }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: '#1d1d1f', color: '#fff',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16,
              }}>
                CLAUDE OPUS
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em', marginBottom: 8 }}>
                Strategique &amp; Profond
              </div>
              <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.6, marginBottom: 20 }}>
                Reserve aux decisions strategiques et problemes complexes. Extended Thinking pour
                une reflexion approfondie avant chaque reponse.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {[
                  'Extended Thinking (reflexion profonde)',
                  'Analyse multi-dimensionnelle',
                  'Decisions strategiques a long terme',
                  'Le modele le plus puissant d\'Anthropic',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#86868b' }}>
                    <span style={{ fontSize: 14 }}>✅</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #f5f5f7', paddingTop: 14, fontSize: 12, color: '#86868b' }}>
                Agents : {opusAgents.map(a => `${a.name} (${a.role})`).join(', ')}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Extended Thinking ═══ */}
        <section aria-label="Extended Thinking — raisonnement profond de Claude Opus" style={{ padding: '48px 0', maxWidth: 780, margin: '0 auto' }}>
          <div className="claude-thinking-box" style={{
            padding: 40, borderRadius: 12, background: '#f5f5f7',
          }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: '#fff', color: '#86868b', border: '1px solid rgba(0,0,0,0.08)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16,
              }}>
                EXCLUSIF
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: 8 }}>
                Quand l&apos;IA reflechit avant de repondre
              </h2>
            </div>
            <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.7, marginBottom: 28, maxWidth: 560 }}>
              Claude Opus dispose de l&apos;<strong style={{ color: '#1d1d1f' }}>Extended Thinking</strong> — une capacite unique qui lui permet de
              developper un raisonnement interne structure avant de formuler sa reponse. Comme un dirigeant
              qui pese le pour et le contre.
            </p>
            <div className="claude-thinking-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            }}>
              {[
                { icon: '🔍', title: 'Analyse', desc: 'Decompose le probleme en sous-elements' },
                { icon: '⚖️', title: 'Evaluation', desc: 'Compare les scenarios et leurs impacts' },
                { icon: '🎯', title: 'Decision', desc: 'Formule une recommandation argumentee' },
              ].map(s => (
                <div key={s.title} style={{
                  textAlign: 'center', padding: 16, borderRadius: 10,
                  background: '#fff',
                }}>
                  <div role="img" aria-label={s.title} style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: '#86868b', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Repartition agents ═══ */}
        <section aria-label="Répartition des agents IA par modèle Claude" style={{ padding: '48px 0' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Repartition</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f' }}>
              Quel agent utilise quel modele
            </h2>
          </div>
          <div className="claude-agents-list" style={{ maxWidth: 680, borderRadius: 12, border: '1px solid #f5f5f7', overflow: 'hidden' }}>
            {DEFAULT_AGENTS.map((agent, i) => {
              const isOpus = OPUS_AGENT_IDS.includes(agent.id);
              return (
                <div key={agent.id} style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, padding: '14px 20px',
                  borderBottom: i < DEFAULT_AGENTS.length - 1 ? '1px solid #f5f5f7' : 'none',
                  background: '#fff',
                }}>
                  <div style={{ fontSize: 20 }}>{agent.emoji || '🤖'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{agent.name}</div>
                    <div style={{ fontSize: 12, color: '#86868b' }}>{agent.role}</div>
                  </div>
                  <div style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: isOpus ? '#1d1d1f' : '#f5f5f7',
                    color: isOpus ? '#fff' : '#86868b',
                  }}>
                    {isOpus ? 'Opus' : 'Sonnet'}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Securite & Ethique ═══ */}
        <section aria-label="Sécurité et éthique de Claude AI — Constitutional AI et RGPD" style={{ padding: '48px 0' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Confiance</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f' }}>
              Securite et ethique au coeur
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {[
              { icon: '🏛️', title: 'Constitutional AI', desc: 'Systeme d\'auto-regulation qui garantit des reponses sures, honnetes et utiles. Principes ethiques stricts.' },
              { icon: '🔒', title: 'Donnees protegees', desc: 'Zero retention de donnees. Chiffrement en transit et au repos. Conforme RGPD.' },
              { icon: '⚖️', title: 'Alignement IA', desc: 'Leader mondial en alignement IA. L\'IA agit dans l\'interet de l\'utilisateur. Audits independants.' },
              { icon: '🏆', title: 'Benchmarks #1', desc: 'Classe #1 sur MMLU, HumanEval, GSM8K. Le plus performant en raisonnement et comprehension.' },
            ].map(c => (
              <div key={c.title} style={{
                padding: 24, borderRadius: 12, background: '#f5f5f7',
              }}>
                <div role="img" aria-label={c.title} style={{ fontSize: 24, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ Ecosysteme ═══ */}
        <section aria-label="Écosystème d'intégrations autour de Claude AI" style={{ padding: '48px 0' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 6 }}>Integrations</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f' }}>
              Un ecosysteme complet autour de Claude
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: 16,
          }}>
            {[
              { icon: '💬', title: 'WhatsApp', desc: 'Parlez a vos agents par WhatsApp et notes vocales', href: '/whatsapp', linkTitle: 'Découvrir l\'intégration WhatsApp Business de Freenzy.io' },
              { icon: '🔊', title: 'ElevenLabs', desc: 'Voix ultra-realistes Flash v2.5 pour les reponses vocales', href: '#', linkTitle: 'Synthèse vocale ElevenLabs premium' },
              { icon: '📅', title: 'Google Calendar', desc: 'Synchronisation agenda et planification automatique', href: '#', linkTitle: 'Intégration Google Calendar' },
              { icon: '🎤', title: 'Deepgram', desc: 'Transcription vocale Nova-2 avec 98% de precision', href: '#', linkTitle: 'Transcription vocale Deepgram Nova-2' },
            ].map(t => (
              <Link key={t.title} href={t.href} title={t.linkTitle} style={{
                textDecoration: 'none', color: 'inherit',
                padding: 24, display: 'block', borderRadius: 12,
                border: '1px solid #f5f5f7', background: '#fff',
                transition: 'background 0.2s',
              }}>
                <div role="img" aria-label={t.title} style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.6 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ CTA Final ═══ */}
        <section aria-label="Inscription gratuite pour tester Claude Sonnet et Opus" style={{
          padding: '48px 32px', borderRadius: 12,
          background: '#f5f5f7', textAlign: 'center', marginBottom: 48,
        }}>
          <ClaudeIcon size={36} color="#1d1d1f" />
          <h2 style={{
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em',
            color: '#1d1d1f', marginTop: 16, marginBottom: 10,
          }}>
            Pret a decouvrir la puissance de Claude AI ?
          </h2>
          <p style={{ fontSize: 15, color: '#86868b', maxWidth: 440, margin: '0 auto 24px' }}>
            Testez Sonnet et Opus — accès gratuit, 0% de commission
          </p>
          <Link href="/client/dashboard" style={{
            display: 'inline-block', padding: '12px 32px', fontSize: 15, fontWeight: 600,
            borderRadius: 12, background: '#1d1d1f', color: '#fff',
            textDecoration: 'none', transition: 'opacity 0.2s',
          }}>
            Explorer le Dashboard
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 16 }}>
            {['Claude Sonnet & Opus', `${DEFAULT_AGENTS.length} agents IA`, 'Extended Thinking'].map(t => (
              <span key={t} style={{ fontSize: 12, color: '#86868b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14 }}>✅</span> {t}
              </span>
            ))}
          </div>
        </section>

      </div>

      {/* Internal links SEO */}
      <nav aria-label="Pages associées à la technologie Claude AI" style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 48px', borderTop: '1px solid #f2f2f2' }}>
        <div className="sr-only"><h2>Liens utiles</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link href="/plans" title="Voir les tarifs détaillés et crédits IA de Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Tarifs et crédits
          </Link>
          <Link href="/vs-alternatives" title="Comparer Freenzy.io avec ChatGPT Plus, Make, Zapier et les agences" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Freenzy vs Alternatives
          </Link>
          <Link href="/whatsapp" title="Gérer votre entreprise par WhatsApp avec les agents IA Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Agents IA sur WhatsApp
          </Link>
          <Link href="/demo" title="Voir la démonstration de la plateforme Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Démonstration
          </Link>
        </div>
      </nav>

      <PublicFooter />
    </main>
  );
}
