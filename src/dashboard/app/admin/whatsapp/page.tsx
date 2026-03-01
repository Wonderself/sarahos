'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

interface WhatsAppStats {
  totalPhoneLinks: number;
  verifiedLinks: number;
  activeConversations: number;
  totalMessages: number;
  messagesToday: number;
  whatsappConfigured: boolean;
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sarah_token') || '';
  }
  return '';
}

async function apiFetch(path: string) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.json();
}

export default function AdminWhatsAppPage() {
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await apiFetch('/whatsapp/admin/stats');
      setStats(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading) {
    return (
      <div className="p-24 text-center">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp — Administration</h1>
          <p className="page-subtitle">
            Configuration et statistiques de l&apos;integration WhatsApp Business.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="section">
        {stats?.whatsappConfigured ? (
          <div className="info-card info-card-success">
            <div className="flex items-center gap-12">
              <span className="dot dot-lg dot-success" />
              <span className="text-lg font-semibold">WhatsApp Business connecte</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span className="dot dot-lg dot-warning" />
            <div>
              <span className="font-semibold text-lg">WhatsApp non configure</span>
              <p className="mt-4 text-md">
                Pour activer WhatsApp, configurez les variables d&apos;environnement :
                WHATSAPP_PHONE_NUMBER_ID et WHATSAPP_ACCESS_TOKEN dans le fichier .env
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="section">
        <div className="grid-auto">
          {[
            { label: 'Numeros lies', value: stats?.totalPhoneLinks ?? 0, cls: 'text-info' },
            { label: 'Numeros verifies', value: stats?.verifiedLinks ?? 0, cls: 'text-success' },
            { label: 'Conversations actives', value: stats?.activeConversations ?? 0, cls: 'text-warning' },
            { label: 'Messages total', value: stats?.totalMessages ?? 0, cls: '' },
            { label: 'Messages aujourd\'hui', value: stats?.messagesToday ?? 0, cls: 'text-danger' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card text-center">
              <div className={`stat-value ${stat.cls}`}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Guide */}
      <div className="section">
        <div className="card p-24">
          <h2 className="section-title">Guide de configuration</h2>
          <ol className="leading-relaxed pl-20">
            <li>Creer un compte <strong>Meta Business</strong> sur business.facebook.com</li>
            <li>Activer l&apos;<strong>API WhatsApp Business</strong> dans les parametres</li>
            <li>Obtenir le <strong>Phone Number ID</strong> et le <strong>Access Token</strong></li>
            <li>Configurer le <strong>Webhook URL</strong> : <code className="text-mono text-sm">{`${API}/webhook/whatsapp`}</code></li>
            <li>Utiliser le <strong>Verify Token</strong> : <code className="text-mono text-sm">sarah-os-webhook-verify-2026</code></li>
            <li>Mettre a jour le fichier <code className="text-mono text-sm">.env</code> avec les identifiants</li>
            <li>Redemarrer le serveur</li>
          </ol>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="section">
        <div className="card p-24">
          <h2 className="section-title">Tarification</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th className="text-right">Cout</th>
              </tr>
            </thead>
            <tbody>
              {[
                { service: 'Message LLM (Sonnet)', cost: '~300-1500 credits/requete' },
                { service: 'Transcription vocale (STT)', cost: '50 credits/minute' },
                { service: 'Synthese vocale (TTS)', cost: '150 credits/1000 caracteres' },
                { service: 'Fenetre conversation 24h (Meta)', cost: '~500 credits' },
              ].map((row) => (
                <tr key={row.service}>
                  <td>{row.service}</td>
                  <td className="text-right text-mono">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted text-md mt-8">
            Les couts sont debites du portefeuille client. La marge est captee au niveau des packs de credits.
          </p>
        </div>
      </div>
    </div>
  );
}
