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
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
      return session.token || '';
    } catch { return ''; }
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
            Configuration et statistiques de l&apos;intégration WhatsApp Business.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="section">
        {stats?.whatsappConfigured ? (
          <div className="info-card info-card-success">
            <div className="flex items-center gap-12">
              <span className="dot dot-lg dot-success" />
              <span className="text-lg font-semibold">WhatsApp Business connecté</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span className="dot dot-lg dot-warning" />
            <div>
              <span className="font-semibold text-lg">WhatsApp non configuré</span>
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
            { label: 'Numéros liés', value: stats?.totalPhoneLinks ?? 0, cls: 'text-info' },
            { label: 'Numéros vérifiés', value: stats?.verifiedLinks ?? 0, cls: 'text-success' },
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
            <li>Créer un compte <strong>Meta Business</strong> sur business.facebook.com</li>
            <li>Activer l&apos;<strong>API WhatsApp Business</strong> dans les paramètres</li>
            <li>Obtenir le <strong>Phone Number ID</strong> et le <strong>Access Token</strong></li>
            <li>Configurer le <strong>Webhook URL</strong> : <code className="text-mono text-sm">{`${API}/webhook/whatsapp`}</code></li>
            <li>Utiliser le <strong>Verify Token</strong> : <code className="text-mono text-sm">freenzy-webhook-verify-2026</code></li>
            <li>Mettre à jour le fichier <code className="text-mono text-sm">.env</code> avec les identifiants</li>
            <li>Redémarrer le serveur</li>
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
                <th className="text-right">Coût</th>
              </tr>
            </thead>
            <tbody>
              {[
                { service: 'Message LLM (Sonnet)', cost: '~300-1500 crédits/requête' },
                { service: 'Transcription vocale (STT)', cost: '50 crédits/minute' },
                { service: 'Synthèse vocale (TTS)', cost: '150 crédits/1000 caractères' },
                { service: 'Fenêtre conversation 24h (Meta)', cost: '~500 crédits' },
              ].map((row) => (
                <tr key={row.service}>
                  <td>{row.service}</td>
                  <td className="text-right text-mono">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-muted text-md mt-8">
            Les coûts sont débités du portefeuille client. La marge est captée au niveau des packs de crédits.
          </p>
        </div>
      </div>
    </div>
  );
}
