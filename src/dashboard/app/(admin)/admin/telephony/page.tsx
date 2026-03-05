'use client';

import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════
   Admin — Telephonie & Communications (Twilio)
   ═══════════════════════════════════════════════════════ */

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

interface TwilioCapability {
  icon: string;
  title: string;
  description: string;
  status: 'active' | 'configure' | 'bientot';
  features: string[];
}

const CAPABILITIES: TwilioCapability[] = [
  {
    icon: '📱',
    title: 'SMS',
    description: 'Envoi et reception de SMS. Notifications automatiques, codes de verification, campagnes marketing.',
    status: 'configure',
    features: ['Envoi en masse', 'Codes OTP', 'Notifications', 'Reponse automatique'],
  },
  {
    icon: '📞',
    title: 'Appels Vocaux',
    description: 'Appels sortants programmatiques, IVR (repondeur intelligent), enregistrement et transcription.',
    status: 'configure',
    features: ['Appels sortants', 'IVR / SVI', 'Enregistrement', 'Transcription'],
  },
  {
    icon: '💬',
    title: 'WhatsApp Business',
    description: 'Messages WhatsApp via l\'API Twilio. Templates pre-approuves, envoi de medias, conversations.',
    status: 'configure',
    features: ['Templates', 'Medias', 'Conversations', 'Notifications'],
  },
  {
    icon: '🎥',
    title: 'Twilio Video',
    description: 'Visioconference integree. Rooms multi-participants, enregistrement video, partage d\'ecran.',
    status: 'bientot',
    features: ['Rooms', 'Enregistrement', 'Partage ecran', 'Multi-participants'],
  },
  {
    icon: '🔐',
    title: 'Twilio Verify',
    description: 'Verification d\'identite multi-canal. 2FA par SMS, email, push ou TOTP.',
    status: 'configure',
    features: ['SMS OTP', 'Email OTP', 'Push', 'TOTP'],
  },
  {
    icon: '💬',
    title: 'Twilio Conversations',
    description: 'Messagerie omnicanale unifiee. Combinez SMS, WhatsApp et chat web dans une seule interface.',
    status: 'bientot',
    features: ['SMS + WhatsApp', 'Chat web', 'Historique unifie', 'Webhooks'],
  },
  {
    icon: '📧',
    title: 'SendGrid (Email)',
    description: 'Emails transactionnels et marketing via SendGrid (filiale Twilio). Templates, analytics, deliverability.',
    status: 'bientot',
    features: ['Transactionnel', 'Marketing', 'Templates', 'Analytics'],
  },
  {
    icon: '📊',
    title: 'Twilio Segment',
    description: 'Customer Data Platform. Analytics client, tracking d\'evenements, unification de donnees.',
    status: 'bientot',
    features: ['CDP', 'Tracking', 'Audiences', 'Integrations'],
  },
  {
    icon: '🤖',
    title: 'Twilio Flex',
    description: 'Centre de contact cloud personnalisable. Agent desktop, routage intelligent, reporting.',
    status: 'bientot',
    features: ['Agent desktop', 'Routage', 'Reporting', 'Plugins'],
  },
  {
    icon: '📍',
    title: 'Twilio Lookup',
    description: 'Verification et enrichissement de numeros de telephone. Detection de fraude, info operateur.',
    status: 'configure',
    features: ['Validation numero', 'Info operateur', 'Detection fraude', 'Portabilite'],
  },
];

interface EnvVar {
  name: string;
  masked: string;
  configured: boolean;
}

const ENV_VARS: EnvVar[] = [
  { name: 'TWILIO_ACCOUNT_SID', masked: 'AC27a3...', configured: true },
  { name: 'TWILIO_AUTH_TOKEN', masked: '1mpA...', configured: true },
  { name: 'TWILIO_PHONE_NUMBER', masked: '', configured: false },
  { name: 'TWILIO_WHATSAPP_FROM', masked: '', configured: false },
];

interface SetupStep {
  step: number;
  title: string;
  description: string;
  done: boolean;
}

const SETUP_STEPS: SetupStep[] = [
  {
    step: 1,
    title: 'Creer un compte Twilio',
    description: 'Rendez-vous sur console.twilio.com et creez un compte gratuit (trial).',
    done: true,
  },
  {
    step: 2,
    title: 'Acheter un numero de telephone',
    description: 'Achetez un numero avec capacites SMS + Voice dans la console Twilio.',
    done: false,
  },
  {
    step: 3,
    title: 'Configurer TWILIO_PHONE_NUMBER',
    description: 'Ajoutez le numero achete dans votre fichier .env (format: +33XXXXXXXXX).',
    done: false,
  },
  {
    step: 4,
    title: 'Configurer WhatsApp (optionnel)',
    description: 'Pour WhatsApp: configurez TWILIO_WHATSAPP_FROM dans .env (format: whatsapp:+14155238886).',
    done: false,
  },
  {
    step: 5,
    title: 'Configurer les webhooks',
    description: 'Dans la console Twilio, pointez les webhook URLs vers votre backend Freenzy.io.',
    done: false,
  },
];

interface PricingItem {
  service: string;
  priceUS: string;
  priceFR: string;
}

const PRICING: PricingItem[] = [
  { service: 'SMS sortant', priceUS: '~$0.0079/msg', priceFR: '~0.06 EUR/msg' },
  { service: 'SMS entrant', priceUS: '~$0.0075/msg', priceFR: '~0.005 EUR/msg' },
  { service: 'Appel vocal', priceUS: '~$0.013/min', priceFR: '~0.02 EUR/min' },
  { service: 'WhatsApp', priceUS: '~$0.005/msg', priceFR: '~$0.005/msg' },
  { service: 'Numero local', priceUS: '$1.00/mois', priceFR: '~1.00 EUR/mois' },
  { service: 'Verify (SMS)', priceUS: '$0.05/verif', priceFR: '$0.05/verif' },
];

export default function TelephonyPage() {
  const [testPhone, setTestPhone] = useState('');
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setHealthStatus('ok');
      } else {
        setHealthStatus('error');
      }
    } catch {
      setHealthStatus('error');
    }
  }

  const hasPhoneNumber = ENV_VARS.find(v => v.name === 'TWILIO_PHONE_NUMBER')?.configured ?? false;

  // Connection status derived from env vars
  const sidConfigured = ENV_VARS.find(v => v.name === 'TWILIO_ACCOUNT_SID')?.configured ?? false;
  const tokenConfigured = ENV_VARS.find(v => v.name === 'TWILIO_AUTH_TOKEN')?.configured ?? false;
  const connectionStatus: 'connected' | 'partial' | 'missing' =
    sidConfigured && tokenConfigured ? 'connected' :
    sidConfigured || tokenConfigured ? 'partial' : 'missing';

  function getStatusBadge(status: 'active' | 'configure' | 'bientot') {
    switch (status) {
      case 'active':
        return (
          <span style={{
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            background: 'rgba(22,163,74,0.1)',
            color: 'var(--success)',
            border: '1px solid rgba(22,163,74,0.2)',
          }}>
            Actif
          </span>
        );
      case 'configure':
        return (
          <span style={{
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            background: 'rgba(217,119,6,0.1)',
            color: 'var(--warning)',
            border: '1px solid rgba(217,119,6,0.2)',
          }}>
            A configurer
          </span>
        );
      case 'bientot':
        return (
          <span style={{
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            background: 'rgba(99,102,241,0.1)',
            color: 'var(--accent)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            Bientot
          </span>
        );
    }
  }

  function getConnectionBadge() {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'var(--success)', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)', label: 'Connecte' };
      case 'partial':
        return { color: 'var(--warning)', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)', label: 'Partiel' };
      case 'missing':
        return { color: 'var(--danger)', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', label: 'Non configure' };
    }
  }

  const connBadge = getConnectionBadge();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ─── Header ─── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          📞 Telephonie & Communications (Twilio)
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          Gerez les communications vocales, SMS, WhatsApp et plus via Twilio
        </p>
      </div>

      {/* ─── Status Cards ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {/* Connection */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${connBadge.border}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Connexion Twilio
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: connBadge.color,
              boxShadow: connectionStatus === 'connected' ? `0 0 8px ${connBadge.color}` : 'none',
            }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: connBadge.color }}>
              {connBadge.label}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            SID + Auth Token
          </span>
        </div>

        {/* Phone Number */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${hasPhoneNumber ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Numero de telephone
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: hasPhoneNumber ? 'var(--success)' : 'var(--danger)' }}>
            {hasPhoneNumber ? 'Configure' : 'Non configure'}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {hasPhoneNumber ? 'SMS + Voice actifs' : 'Achetez un numero sur console.twilio.com'}
          </span>
        </div>

        {/* API Version */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            API Version
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            2010-04-01
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Twilio REST API
          </span>
        </div>

        {/* Backend */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${healthStatus === 'ok' ? 'rgba(22,163,74,0.25)' : 'var(--border-primary)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Backend Freenzy.io
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: healthStatus === 'ok' ? 'var(--success)' : healthStatus === 'loading' ? 'var(--warning)' : 'var(--danger)',
            }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {healthStatus === 'ok' ? 'En ligne' : healthStatus === 'loading' ? 'Verification...' : 'Hors ligne'}
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Port 3010
          </span>
        </div>
      </div>

      {/* ─── Capabilities Grid ─── */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          Fonctionnalites Twilio
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 14,
        }}>
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-secondary)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-primary)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{cap.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{cap.title}</span>
                </div>
                {getStatusBadge(cap.status)}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {cap.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cap.features.map(f => (
                  <span key={f} style={{
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 500,
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-tertiary)',
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              <button
                style={{
                  marginTop: 'auto',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid var(--border-secondary)',
                  background: cap.status === 'active' ? 'var(--accent)' : 'transparent',
                  color: cap.status === 'active' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onClick={() => {
                  if (cap.status !== 'bientot') {
                    window.open('https://console.twilio.com', '_blank');
                  }
                }}
                onMouseEnter={e => {
                  if (cap.status !== 'active') {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  }
                }}
                onMouseLeave={e => {
                  if (cap.status !== 'active') {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-secondary)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {cap.status === 'bientot' ? 'En savoir plus' : 'Configurer'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Configuration Guide ─── */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          Guide de configuration
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Steps */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Etapes de mise en route
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SETUP_STEPS.map(s => (
                <div key={s.step} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: s.done ? 'rgba(22,163,74,0.04)' : 'transparent',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    background: s.done ? 'var(--success)' : 'var(--bg-tertiary)',
                    color: s.done ? '#fff' : 'var(--text-tertiary)',
                  }}>
                    {s.done ? '✓' : s.step}
                  </span>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: s.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: s.done ? 'line-through' : 'none',
                    }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Env Variables */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
              Variables d'environnement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ENV_VARS.map(v => (
                <div key={v.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {v.name}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: v.configured ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                  }}>
                    {v.configured ? (
                      <>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{v.masked}</span>
                        ✅ Configure
                      </>
                    ) : (
                      '❌ Non configure'
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Test Section ─── */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          Tester les communications
        </h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          opacity: hasPhoneNumber ? 1 : 0.6,
        }}>
          {!hasPhoneNumber && (
            <div style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(217,119,6,0.08)',
              border: '1px solid rgba(217,119,6,0.2)',
              color: 'var(--warning)',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 16,
            }}>
              ⚠️ Configurez un numero Twilio pour activer les tests
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Numero de test :
            </label>
            <input
              type="tel"
              placeholder="+33612345678"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              disabled={!hasPhoneNumber}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'var(--font-mono)',
                width: 180,
              }}
            />
            <button
              disabled={!hasPhoneNumber}
              title={!hasPhoneNumber ? 'Configurez un numero Twilio d\'abord' : 'Envoyer un SMS de test'}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                background: hasPhoneNumber ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: hasPhoneNumber ? '#fff' : 'var(--text-muted)',
                cursor: hasPhoneNumber ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-sans)',
              }}
            >
              📱 Envoyer SMS Test
            </button>
            <button
              disabled={!hasPhoneNumber}
              title={!hasPhoneNumber ? 'Configurez un numero Twilio d\'abord' : 'Effectuer un appel de test'}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                background: hasPhoneNumber ? 'var(--success)' : 'var(--bg-tertiary)',
                color: hasPhoneNumber ? '#fff' : 'var(--text-muted)',
                cursor: hasPhoneNumber ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-sans)',
              }}
            >
              📞 Appel Test
            </button>
          </div>
        </div>
      </div>

      {/* ─── Pricing ─── */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          Tarifs Twilio (indicatifs)
        </h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{
                  textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700,
                  color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderBottom: '1px solid var(--border-primary)',
                }}>
                  Service
                </th>
                <th style={{
                  textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700,
                  color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderBottom: '1px solid var(--border-primary)',
                }}>
                  Prix US
                </th>
                <th style={{
                  textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700,
                  color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderBottom: '1px solid var(--border-primary)',
                }}>
                  Prix France
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICING.map((p, i) => (
                <tr key={p.service} style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
                }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {p.service}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {p.priceUS}
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {p.priceFR}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          marginTop: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(37,99,235,0.06)',
          border: '1px solid rgba(37,99,235,0.15)',
          fontSize: 11,
          color: 'var(--info)',
          lineHeight: 1.5,
        }}>
          💡 Les couts Twilio sont factures separement de vos credits Freenzy.io. Twilio facture directement sur votre compte Twilio.
          Les tarifs ci-dessus sont indicatifs et peuvent varier selon le volume et la region.
        </div>
      </div>

    </div>
  );
}
