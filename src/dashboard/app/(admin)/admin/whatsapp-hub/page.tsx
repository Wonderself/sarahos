'use client';

import { useState, useEffect } from 'react';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3010';

interface WAConversation {
  phone: string;
  contactName: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  unread: number;
}

interface WAConfig {
  phoneNumberId: string;
  verifyToken: string;
  webhookUrl: string;
  isConfigured: boolean;
}

interface AutopilotCommand {
  command: string;
  description: string;
}

const AP_COMMANDS: AutopilotCommand[] = [
  { command: '/ap list', description: 'Lister les propositions en attente' },
  { command: '/ap approve {id}', description: 'Approuver une proposition' },
  { command: '/ap deny {id} {raison}', description: 'Refuser une proposition' },
  { command: '/ap rollback {id}', description: 'Annuler une action exécutée' },
  { command: '/ap audit', description: 'Lancer un audit combiné (santé + business + sécurité)' },
];

export default function WhatsAppHubPage() {
  const [tab, setTab] = useState<'conversations' | 'config' | 'autopilot'>('conversations');
  const [conversations, setConversations] = useState<WAConversation[]>([]);
  const [config, setConfig] = useState<WAConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [convRes, cfgRes] = await Promise.allSettled([
        fetch(`${API_BASE}/whatsapp/conversations?limit=50`, { headers }),
        fetch(`${API_BASE}/whatsapp/config`, { headers }),
      ]);

      if (convRes.status === 'fulfilled' && convRes.value.ok) {
        const data = await convRes.value.json() as { conversations?: WAConversation[] };
        setConversations(data.conversations ?? []);
      }

      if (cfgRes.status === 'fulfilled' && cfgRes.value.ok) {
        const data = await cfgRes.value.json() as WAConfig;
        setConfig(data);
      } else {
        setConfig({ phoneNumberId: '-', verifyToken: '-', webhookUrl: '-', isConfigured: false });
      }
    } catch {
      // fail gracefully
    }
    setLoading(false);
  };

  const TABS = [
    { id: 'conversations', label: 'Conversations', icon: '💬' },
    { id: 'config', label: 'Configuration', icon: '⚙️' },
    { id: 'autopilot', label: 'Commandes Autopilot', icon: '🤖' },
  ] as const;

  return (
    <div className="space-y-6 admin-page-scrollable">
      <div>
        <h1 className="text-2xl font-bold text-white">WhatsApp Hub</h1>
        <p className="text-gray-400 mt-1">Conversations, configuration et commandes autopilot</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === t.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F7] text-gray-400'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-[#F7F7F7]/50 rounded-xl p-12 text-center text-gray-500 border border-[rgba(0,0,0,0.06)]">Chargement...</div>
      ) : (
        <>
          {/* Conversations */}
          {tab === 'conversations' && (
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="bg-[#F7F7F7]/50 rounded-xl p-12 text-center text-gray-500 border border-[rgba(0,0,0,0.06)]">
                  Aucune conversation WhatsApp
                </div>
              ) : conversations.map((c, i) => (
                <div key={i} className="bg-[#F7F7F7] rounded-xl p-4 border border-[rgba(0,0,0,0.08)] flex items-center justify-between hover:border-[rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-[#1A1A1A] text-lg">📱</div>
                    <div>
                      <p className="text-white text-sm font-medium">{c.contactName || c.phone}</p>
                      <p className="text-gray-500 text-xs mt-0.5 max-w-md truncate">{c.lastMessage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500">{c.messageCount} msgs</span>
                    {c.unread > 0 && <span className="bg-[#1A1A1A] text-white px-2 py-0.5 rounded-full">{c.unread}</span>}
                    <span className="text-gray-600">{new Date(c.lastMessageAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Config */}
          {tab === 'config' && config && (
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[rgba(0,0,0,0.08)] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${config.isConfigured ? 'bg-[#1A1A1A]' : 'bg-[#DC2626]'}`} />
                <span className="text-white font-medium">{config.isConfigured ? 'WhatsApp configuré' : 'WhatsApp non configuré'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone Number ID</p>
                  <p className="text-sm text-gray-300 font-mono mt-1">{config.phoneNumberId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Verify Token</p>
                  <p className="text-sm text-gray-300 font-mono mt-1">{config.verifyToken}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Webhook URL</p>
                  <p className="text-sm text-gray-300 font-mono mt-1">{config.webhookUrl}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <h4 className="text-white text-sm font-medium mb-2">Variables d&apos;environnement requises</h4>
                <div className="bg-[#EEEEEE] rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
                  <p>WHATSAPP_PHONE_NUMBER_ID=...</p>
                  <p>WHATSAPP_ACCESS_TOKEN=...</p>
                  <p>WHATSAPP_VERIFY_TOKEN=...</p>
                  <p>WHATSAPP_APP_SECRET=...</p>
                  <p>ADMIN_WHATSAPP_PHONE=+972...</p>
                </div>
              </div>
            </div>
          )}

          {/* Autopilot commands */}
          {tab === 'autopilot' && (
            <div className="space-y-4">
              <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[rgba(0,0,0,0.08)]">
                <h3 className="text-white font-medium mb-4">Commandes WhatsApp Autopilot</h3>
                <p className="text-gray-400 text-sm mb-4">
                  L&apos;admin peut envoyer ces commandes via WhatsApp pour piloter le système autopilot.
                  Le numéro admin est configuré via <code className="bg-[#EEEEEE] px-1 rounded text-xs">ADMIN_WHATSAPP_PHONE</code>.
                </p>
                <div className="space-y-2">
                  {AP_COMMANDS.map(cmd => (
                    <div key={cmd.command} className="flex items-center gap-4 bg-[#EEEEEE] rounded-lg p-3">
                      <code className="text-[#1A1A1A] text-sm font-mono whitespace-nowrap">{cmd.command}</code>
                      <span className="text-gray-400 text-sm">{cmd.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[rgba(0,0,0,0.08)]">
                <h3 className="text-white font-medium mb-4">Boutons interactifs</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Quand un agent propose une action, l&apos;admin reçoit un message WhatsApp avec 3 boutons :
                </p>
                <div className="flex gap-3">
                  <div className="bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.08)] rounded-lg p-3 text-center flex-1">
                    <span className="text-[#1A1A1A] text-sm font-medium">Approuver</span>
                    <p className="text-gray-500 text-xs mt-1">Exécute l&apos;action proposée</p>
                  </div>
                  <div className="bg-[rgba(220,38,38,0.04)] border border-[rgba(220,38,38,0.2)] rounded-lg p-3 text-center flex-1">
                    <span className="text-[#DC2626] text-sm font-medium">Refuser</span>
                    <p className="text-gray-500 text-xs mt-1">Rejette la proposition</p>
                  </div>
                  <div className="bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.08)] rounded-lg p-3 text-center flex-1">
                    <span className="text-[#6B6B6B] text-sm font-medium">Détails</span>
                    <p className="text-gray-500 text-xs mt-1">Affiche les détails complets</p>
                  </div>
                </div>
              </div>

              <a href="/admin/autopilot" className="block bg-[rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.08)] rounded-xl p-4 text-center hover:bg-[rgba(0,0,0,0.06)] transition-colors">
                <span className="text-[#1A1A1A] font-medium">Voir le tableau de bord Autopilot complet</span>
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
