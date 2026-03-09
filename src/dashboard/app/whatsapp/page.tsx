'use client';

import Link from 'next/link';
import { DEFAULT_AGENTS } from '../../lib/agent-config';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ── WhatsApp SVG icon ── */
function WaIcon({ size = 24, color = '#25D366' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function WhatsAppPage() {
  return (
    <div style={{ background: '#fff', color: '#1a0e3a', minHeight: '100vh' }}>

      <PublicNav />

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 88, paddingBottom: 40,
        textAlign: 'center', maxWidth: 700, margin: '0 auto', padding: '88px 24px 40px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          background: '#f5f5f7', color: '#86868b',
          marginBottom: 28,
        }}>
          <WaIcon size={15} color="#86868b" /> WhatsApp Business
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.03em',
          lineHeight: 1.08, marginBottom: 20, color: '#1a0e3a',
        }}>
          Vos agents IA, directement
          <br />
          sur WhatsApp
        </h1>

        <p style={{
          fontSize: 17, lineHeight: 1.6, color: '#86868b',
          maxWidth: 520, margin: '0 auto 32px',
        }}>
          Envoyez un message texte ou une note vocale a n&apos;importe lequel de vos {DEFAULT_AGENTS.length} agents IA.
          Recevez briefings, alertes et rapports directement dans votre WhatsApp.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 36 }}>
          <Link href="/login?mode=register" style={{
            padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 12,
            background: '#1a0e3a', color: '#fff', textDecoration: 'none',
            display: 'inline-block', transition: 'opacity 0.2s',
          }}>
            Essayer gratuitement
          </Link>
          <Link href="/demo" style={{
            padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 12,
            background: '#f5f5f7', color: '#1a0e3a', textDecoration: 'none',
            display: 'inline-block', transition: 'opacity 0.2s',
          }}>
            Voir la demo
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['WhatsApp inclus', 'Notes vocales', 'Repondeur IA', `${DEFAULT_AGENTS.length} agents`].map(t => (
            <span key={t} style={{
              fontSize: 13, color: '#86868b', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span className="material-symbols-rounded" style={{ color: '#1a0e3a', fontSize: 11 }}>check</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* ── Content wrapper ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Comment ca marche ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fonctionnement</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a', marginBottom: 8 }}>
              Comment ca marche
            </h2>
            <p style={{ fontSize: 15, color: '#86868b' }}>3 etapes, 2 minutes</p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              { step: '01', title: 'Ajoutez le numero', desc: 'Ajoutez le numero WhatsApp Business de Freenzy.io dans vos contacts. Vous le recevez a l\'inscription.' },
              { step: '02', title: 'Envoyez un message', desc: 'Ecrivez un texte ou enregistrez une note vocale. Precisez l\'agent que vous voulez contacter.' },
              { step: '03', title: 'L\'agent repond', desc: 'Votre agent IA analyse votre demande et repond directement dans WhatsApp. Les notes vocales sont transcrites automatiquement.' },
            ].map(s => (
              <div key={s.step} style={{
                padding: 28, borderRadius: 12,
                background: '#f5f5f7',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 14 }}>{s.step}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a0e3a', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#86868b', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Fonctionnalites ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fonctionnalites</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a' }}>
              Tout ce que vous pouvez faire
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              { icon: 'chat', title: 'Messages texte', desc: 'Ecrivez naturellement a n\'importe quel agent. Il comprend le contexte de votre entreprise.' },
              { icon: 'mic', title: 'Notes vocales', desc: 'Enregistrez une note vocale. Deepgram la transcrit instantanement, l\'agent agit.' },
              { icon: 'wb_sunny', title: 'Briefing quotidien', desc: 'Chaque matin a 8h, recevez un resume de vos taches, alertes et insights dans WhatsApp.' },
              { icon: 'notifications', title: 'Alertes en temps reel', desc: 'Prospect chaud, facture en retard, deadline proche... vos agents vous alertent proactivement.' },
              { icon: 'group', title: 'Multi-agents', desc: 'Parlez a Lea pour un email, Thomas pour une offre, Manon pour un post social. Tout dans WhatsApp.' },
              { icon: 'call', title: 'Repondeur IA', desc: 'Ne manquez plus un appel. Le repondeur intelligent qualifie et transmet les messages sur WhatsApp.' },
            ].map(f => (
              <div key={f.title} style={{
                padding: 24, borderRadius: 12,
                border: '1px solid #f5f5f7',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 28 }}>{f.icon}</span></div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a0e3a', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#86868b', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Agents disponibles ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Agents</div>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a', marginBottom: 8 }}>
              {DEFAULT_AGENTS.length} agents disponibles sur WhatsApp
            </h2>
            <p style={{ fontSize: 15, color: '#86868b' }}>
              Chaque agent est expert dans son domaine et propulse par Claude AI d&apos;Anthropic
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
            maxWidth: 700, margin: '0 auto',
          }}>
            {DEFAULT_AGENTS.map(agent => (
              <div key={agent.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 10,
                border: '1px solid #f5f5f7',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#f5f5f7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a0e3a' }}>{agent.name}</div>
                  <div style={{ fontSize: 13, color: '#86868b' }}>{agent.role}</div>
                </div>
                <div style={{ opacity: 0.3, flexShrink: 0 }}>
                  <WaIcon size={16} color="#86868b" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Notes vocales & Pipeline ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: '#f5f5f7', color: '#86868b',
                marginBottom: 18,
              }}>
                <WaIcon size={14} color="#86868b" /> Notes vocales
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a', marginBottom: 14 }}>
                Parlez, vos agents comprennent
              </h2>
              <p style={{ fontSize: 15, color: '#86868b', lineHeight: 1.65, marginBottom: 24 }}>
                Enregistrez une note vocale WhatsApp comme vous le feriez avec un collegue.
                Notre pipeline vocal transforme votre voix en action.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Transcription instantanee', desc: 'Deepgram Nova-2 transcrit votre voix en texte avec 98% de precision' },
                  { label: 'Comprehension contextuelle', desc: 'Claude AI comprend votre intention et le contexte de votre entreprise' },
                  { label: 'Action immediate', desc: 'L\'agent execute : email envoye, document cree, analyse lancee' },
                  { label: 'Reponse vocale', desc: 'ElevenLabs Flash v2.5 vous repond avec une voix ultra-realiste (optionnel)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', marginTop: 8, flexShrink: 0,
                      background: '#1a0e3a',
                    }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a0e3a' }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: '#f5f5f7', borderRadius: 12, padding: 32,
              display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', justifyContent: 'center',
              minHeight: 320,
            }}>
              <div style={{ fontSize: 48, lineHeight: 1 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>mic</span></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1a0e3a', textAlign: 'center' }}>Pipeline vocal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {['Voix', 'Deepgram', 'Claude AI', 'Action'].map((step, i) => (
                  <div key={step} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8, background: '#fff',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#86868b', width: 20 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0e3a' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Repondeur IA ── */}
        <section style={{ padding: '48px 0' }}>
          <div style={{
            padding: 40, borderRadius: 12, background: '#f5f5f7',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: '#fff', color: '#86868b',
                marginBottom: 16,
              }}>
                Nouveau : Repondeur IA
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a', marginBottom: 10 }}>
                Ne manquez plus aucun appel
              </h2>
              <p style={{ fontSize: 15, color: '#86868b', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                Le repondeur intelligent de Freenzy.io repond a vos appels manques, qualifie les prospects
                et vous transmet un resume structure directement sur WhatsApp.
              </p>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              maxWidth: 640, margin: '0 auto',
            }}>
              {[
                { icon: 'call', title: 'Repond 24/7', desc: 'Jamais d\'appel manque, meme la nuit et le week-end' },
                { icon: 'target', title: 'Qualifie', desc: 'Identifie le besoin, le budget et l\'urgence du prospect' },
                { icon: 'phone_iphone', title: 'Notifie sur WhatsApp', desc: 'Resume structure envoye instantanement sur votre WhatsApp' },
              ].map(s => (
                <div key={s.title} style={{
                  textAlign: 'center', padding: 20, borderRadius: 10, background: '#fff',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{s.icon}</span></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a0e3a', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Securite ── */}
        <section style={{ padding: '48px 0', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#86868b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confiance</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#1a0e3a' }}>
              Securite et confidentialite
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          }}>
            {[
              { icon: 'lock', title: 'Chiffrement', desc: 'WhatsApp chiffre vos messages de bout en bout. Vos donnees sont protegees en transit.' },
              { icon: 'flag', title: 'RGPD', desc: 'Conforme au RGPD. Vos donnees sont hebergees en Europe. Droit a l\'oubli garanti.' },
              { icon: 'mic', title: 'Pas de stockage vocal', desc: 'Vos notes vocales sont transcrites puis supprimees. Aucun enregistrement conserve.' },
            ].map(s => (
              <div key={s.title} style={{
                padding: 24, borderRadius: 12,
                border: '1px solid #f5f5f7',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}><span className="material-symbols-rounded" style={{ fontSize: 24 }}>{s.icon}</span></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a0e3a', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#86868b', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section style={{
          padding: '48px 24px', textAlign: 'center',
          marginBottom: 48,
        }}>
          <WaIcon size={36} color="#86868b" />
          <h2 style={{
            fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, letterSpacing: '-0.03em',
            color: '#1a0e3a', marginTop: 16, marginBottom: 12,
          }}>
            Pret a parler a vos agents sur WhatsApp ?
          </h2>
          <p style={{ fontSize: 15, color: '#86868b', maxWidth: 420, margin: '0 auto 24px' }}>
            Accès gratuit — 0% de commission sur toutes vos actions
          </p>
          <Link href="/login?mode=register" style={{
            display: 'inline-block', padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 12,
            background: '#1a0e3a', color: '#fff', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}>
            Essayer gratuitement
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginTop: 18 }}>
            {['WhatsApp inclus', 'Notes vocales', 'Repondeur IA', `${DEFAULT_AGENTS.length} agents`].map(t => (
              <span key={t} style={{ fontSize: 13, color: '#86868b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className="material-symbols-rounded" style={{ color: '#1a0e3a', fontSize: 11 }}>check</span> {t}
              </span>
            ))}
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
