import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function TokensPage() {
  let pricing: Record<string, unknown>[] = [];
  try {
    const res = await api.getPricing();
    const list = (res as Record<string, unknown>)?.['pricing'];
    if (Array.isArray(list)) pricing = list;
    else if (Array.isArray(res)) pricing = res;
  } catch { /* fallback to static */ }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tokens & Coûts</h1>
        <p className="page-subtitle">Comprendre et optimiser la consommation de tokens</p>
      </div>

      {/* ═══ How it works ═══ */}
      <section className="section">
        <h2 className="section-title">Comment fonctionne la facturation</h2>
        <div className="card p-24">
          <div className="flex flex-wrap gap-8 flex-center">
            {[
              { icon: '💬', label: 'Votre message', desc: 'Texte envoyé' },
              { icon: '→', label: '', desc: '' },
              { icon: '📥', label: 'Tokens input', desc: 'Message + contexte' },
              { icon: '→', label: '', desc: '' },
              { icon: '🤖', label: 'LLM génère', desc: 'Claude répond' },
              { icon: '→', label: '', desc: '' },
              { icon: '📤', label: 'Tokens output', desc: 'Réponse générée' },
              { icon: '→', label: '', desc: '' },
              { icon: '💰', label: 'Coût calculé', desc: 'Crédits déduits' },
            ].map((s, i) => (
              s.label ? (
                <div key={i} className="text-center bg-secondary rounded-md" style={{ padding: '12px 16px', minWidth: 90 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                  <div className="text-sm font-bold">{s.label}</div>
                  <div style={{ fontSize: 10 }} className="text-muted">{s.desc}</div>
                </div>
              ) : (
                <div key={i} className="text-xl text-muted" style={{ padding: '0 4px' }}>→</div>
              )
            ))}
          </div>
          <div className="mt-16 bg-secondary rounded-sm text-md text-secondary leading-relaxed" style={{ padding: '12px 16px' }}>
            <strong>Formule :</strong> Coût = (tokens_input x prix_input / 1M) + (tokens_output x prix_output / 1M)
            <br />Les tokens input incluent le message, le system prompt, et le contexte de conversation.
            Les tokens output sont la réponse générée par l&apos;IA.
          </div>
        </div>
      </section>

      {/* ═══ Current pricing ═══ */}
      <section className="section">
        <h2 className="section-title">Tarifs actuels</h2>
        <div className="card table-responsive" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Modèle</th>
                <th>Provider</th>
                <th>Input / 1M tokens</th>
                <th>Output / 1M tokens</th>
                <th>Ratio output/input</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Claude Sonnet</strong> <span className="badge badge-info">Rapide</span></td>
                <td>Anthropic</td>
                <td>300 credits (~3$ USD)</td>
                <td>1 500 credits (~15$ USD)</td>
                <td>5x</td>
              </tr>
              <tr>
                <td><strong>Claude Opus</strong> <span className="badge badge-warning">Avancé</span></td>
                <td>Anthropic</td>
                <td>1 500 credits (~15$ USD)</td>
                <td>7 500 credits (~75$ USD)</td>
                <td>5x</td>
              </tr>
              {pricing.length > 0 && pricing.map((p, i) => {
                const model = String(p['model'] ?? '');
                if (model === 'claude-sonnet-4-20250514' || model === 'claude-opus-4-6') return null;
                return (
                  <tr key={i}>
                    <td><strong>{model}</strong></td>
                    <td>{String(p['provider'] ?? 'unknown')}</td>
                    <td>{Number(p['inputCostPerMillion'] ?? 0) / 1_000_000} credits</td>
                    <td>{Number(p['outputCostPerMillion'] ?? 0) / 1_000_000} credits</td>
                    <td>-</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-muted mt-8">
          Marge = 0% par token. La marge est capturée au niveau de l&apos;achat du pack de crédits (10-20%).
        </div>
      </section>

      {/* ═══ Cout par action ═══ */}
      <section className="section">
        <h2 className="section-title">Coût moyen par action</h2>
        <div className="grid-2 gap-16">
          <div className="card p-20">
            <h3 className="text-base font-bold mb-12 text-accent">Actions Sonnet (standard)</h3>
            {[
              { action: 'Chat simple', input: 800, output: 300, cost: '0.69' },
              { action: 'Email rédigé', input: 1200, output: 600, cost: '1.26' },
              { action: 'Analyse marketing', input: 2000, output: 1200, cost: '2.40' },
              { action: 'Briefing du jour', input: 1500, output: 1500, cost: '2.70' },
              { action: 'Document généré', input: 1500, output: 2000, cost: '3.45' },
              { action: 'Campagne complète', input: 3000, output: 3000, cost: '5.40' },
              { action: 'Réunion (3 agents x 4 tours)', input: 9600, output: 3600, cost: '8.28' },
            ].map(a => (
              <div key={a.action} className="flex flex-between text-md" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span>{a.action} <span className="text-muted" style={{ fontSize: 10 }}>({a.input}in/{a.output}out)</span></span>
                <strong className="text-accent">{a.cost} cr</strong>
              </div>
            ))}
          </div>
          <div className="card p-20">
            <h3 className="text-base font-bold mb-12" style={{ color: '#f59e0b' }}>Actions Opus (avancé)</h3>
            {[
              { action: 'Conseil stratégique', input: 1500, output: 800, cost: '8.25' },
              { action: 'Analyse financière détaillée', input: 3000, output: 2000, cost: '19.50' },
              { action: 'Plan business complet', input: 2000, output: 5000, cost: '40.50' },
            ].map(a => (
              <div key={a.action} className="flex flex-between text-md" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span>{a.action} <span className="text-muted" style={{ fontSize: 10 }}>({a.input}in/{a.output}out)</span></span>
                <strong style={{ color: '#f59e0b' }}>{a.cost} cr</strong>
              </div>
            ))}
            <div className="mt-12 text-sm text-muted" style={{ lineHeight: 1.5 }}>
              Opus est 5x plus cher que Sonnet. À utiliser uniquement pour les décisions stratégiques majeures.
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Optimization strategies ═══ */}
      <section className="section">
        <h2 className="section-title">Stratégies d&apos;optimisation</h2>
        <div className="grid-2 gap-16">
          {[
            {
              icon: '🎯',
              title: 'Utiliser Sonnet par défaut',
              desc: 'Sonnet est 5x moins cher qu\'Opus pour une qualité excellente. Réservez Opus aux décisions stratégiques critiques.',
              saving: 'Économie : ~80% par rapport à Opus',
              color: '#22c55e',
            },
            {
              icon: '📏',
              title: 'Configurer la concision des agents',
              desc: 'Dans Agent Studio, réglez "Longueur de réponse" à 0-30 (concis). Moins de tokens output = moins de crédits.',
              saving: 'Économie : jusqu\'à -60% output tokens',
              color: '#6366f1',
            },
            {
              icon: '🏢',
              title: 'Remplir le profil entreprise',
              desc: 'Un profil complet évite les questions de clarification. L\'agent comprend directement le contexte = moins d\'échanges.',
              saving: 'Économie : -30% d\'échanges en moyenne',
              color: '#a855f7',
            },
            {
              icon: '☀️',
              title: 'Utiliser les briefings quotidiens',
              desc: 'Un seul briefing résume toutes les infos importantes. Plus efficace que 5 chats séparés.',
              saving: 'Économie : ~2.70 cr au lieu de ~3.45 cr (5 chats)',
              color: '#f59e0b',
            },
            {
              icon: '📋',
              title: 'Préférer les campagnes structurées',
              desc: 'Les campagnes guident l\'agent avec des templates. Moins d\'allers-retours, moins de tokens gaspillés.',
              saving: 'Économie : -25% par rapport à du chat libre',
              color: '#ec4899',
            },
            {
              icon: '🔄',
              title: 'Éviter les conversations trop longues',
              desc: 'Le contexte s\'accumule à chaque message (tokens input augmentent). Commencez une nouvelle conversation régulièrement.',
              saving: 'Économie : -40% sur les conversations longues',
              color: '#14b8a6',
            },
          ].map(s => (
            <div key={s.title} className="card card-lift p-20" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="flex items-center gap-8 mb-8">
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div className="text-base font-bold">{s.title}</div>
              </div>
              <div className="text-md text-secondary mb-8" style={{ lineHeight: 1.5 }}>{s.desc}</div>
              <div className="text-sm font-semibold" style={{ color: s.color }}>{s.saving}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Comparaison Sonnet vs Opus ═══ */}
      <section className="section">
        <h2 className="section-title">Sonnet vs Opus — Quand utiliser chaque modèle ?</h2>
        <div className="grid-2 gap-16">
          <div className="card p-20" style={{ borderTop: '3px solid var(--accent)' }}>
            <div className="text-lg font-bold text-accent mb-12">Claude Sonnet</div>
            <div className="text-md text-secondary leading-relaxed">
              <strong>Utiliser pour :</strong>
              <ul style={{ paddingLeft: 16, margin: '8px 0' }}>
                <li>Conversations quotidiennes</li>
                <li>Rédaction d&apos;emails et documents</li>
                <li>Analyses marketing standards</li>
                <li>Briefings et comptes-rendus</li>
                <li>Réponses clients</li>
                <li>Réunions multi-agents</li>
              </ul>
              <div className="text-sm text-muted">
                Exemple : email rédigé = <strong>1.26 cr</strong>
              </div>
            </div>
          </div>
          <div className="card p-20" style={{ borderTop: '3px solid #f59e0b' }}>
            <div className="text-lg font-bold mb-12" style={{ color: '#f59e0b' }}>Claude Opus</div>
            <div className="text-md text-secondary leading-relaxed">
              <strong>Utiliser pour :</strong>
              <ul style={{ paddingLeft: 16, margin: '8px 0' }}>
                <li>Décisions stratégiques majeures</li>
                <li>Analyses financières complexes</li>
                <li>Plans business détaillés</li>
                <li>Raisonnement approfondi</li>
              </ul>
              <div className="text-sm text-muted">
                Exemple : même email = <strong>8.25 cr</strong> (6.5x plus cher)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Courbe de consommation ═══ */}
      <section className="section">
        <h2 className="section-title">Pourquoi la consommation baisse avec le temps</h2>
        <div className="card p-24">
          <div className="alert alert-info mb-16">
            <strong>Bonne nouvelle :</strong> Plus un utilisateur utilise SARAH, moins chaque interaction coûte. Voici pourquoi.
          </div>

          {/* Visual consumption curve */}
          <div className="flex gap-4 mb-16" style={{ alignItems: 'flex-end', height: 120, padding: '0 20px' }}>
            {[
              { label: 'Sem. 1', height: 100, color: '#ef4444' },
              { label: 'Sem. 2', height: 75, color: '#f59e0b' },
              { label: 'Sem. 3', height: 55, color: '#f59e0b' },
              { label: 'Sem. 4', height: 40, color: '#22c55e' },
              { label: 'Sem. 5', height: 30, color: '#22c55e' },
              { label: 'Sem. 6', height: 25, color: '#22c55e' },
              { label: 'Sem. 7', height: 22, color: '#22c55e' },
              { label: 'Sem. 8+', height: 20, color: '#22c55e' },
            ].map(bar => (
              <div key={bar.label} className="flex-1 text-center">
                <div style={{
                  height: bar.height, background: bar.color + '33', border: `2px solid ${bar.color}`,
                  borderRadius: '4px 4px 0 0',
                }} />
                <div className="text-muted" style={{ fontSize: 9, marginTop: 4 }}>{bar.label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-center text-muted" style={{ marginBottom: 20 }}>
            Coût moyen par interaction (en tokens) — diminue de ~80% entre la semaine 1 et la semaine 8
          </div>

          <div className="flex flex-col gap-16">
            {[
              {
                phase: 'Phase 1 — Découverte (Semaines 1-2)',
                icon: '🔴',
                tokens: 'Coûteux',
                desc: 'L\'agent envoie le profil entreprise complet + le system prompt + le contexte de personnalisation à chaque message. C\'est normal : Sarah apprend à vous connaître.',
                detail: 'Le premier message d\'une conversation est le plus cher car il inclut tout le contexte (~500-700 tokens de system prompt). Les crédits de bienvenue couvrent cette phase d\'apprentissage.',
              },
              {
                phase: 'Phase 2 — Optimisation (Semaines 3-4)',
                icon: '🟡',
                tokens: 'Modéré',
                desc: 'Les conversations longues sont tronquées automatiquement (seuls les 8 derniers messages sont envoyés). L\'utilisateur commence à sauvegarder les réponses fréquentes en FAQ.',
                detail: 'La troncation automatique empêche les coûts de monter linéairement. Une conversation de 50 messages coûte pareil qu\'une de 8 messages.',
              },
              {
                phase: 'Phase 3 — Maturité (Semaines 5+)',
                icon: '🟢',
                tokens: 'Économique',
                desc: 'La base FAQ grandit : les questions courantes ont des réponses instantanées (0 token). L\'utilisateur a déjà configuré ses agents — moins de tâtonnements.',
                detail: 'Chaque réponse FAQ évitée = 0.69 à 2.40 crédits économisés. Après 1 mois, un utilisateur actif a typiquement 20-30 FAQs qui couvrent 40-60% de ses questions récurrentes.',
              },
            ].map(p => (
              <div key={p.phase} className="bg-secondary rounded-md border" style={{ padding: '12px 16px' }}>
                <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-base font-bold">{p.phase}</span>
                  <span className="badge badge-neutral" style={{ fontSize: 10 }}>{p.tokens}</span>
                </div>
                <div className="text-md text-secondary leading-relaxed" style={{ marginBottom: 6 }}>{p.desc}</div>
                <div className="text-xs text-muted" style={{ lineHeight: 1.5, fontStyle: 'italic' }}>{p.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-sm" style={{ padding: '12px 16px', background: '#22c55e08', border: '1px solid #22c55e22' }}>
            <div className="text-md font-semibold" style={{ color: '#22c55e', marginBottom: 4 }}>Mécanismes d&apos;optimisation actifs</div>
            <ul className="text-sm text-secondary" style={{ lineHeight: 1.8, paddingLeft: 16, margin: 0 }}>
              <li><strong>Troncation automatique</strong> : Seuls les 8 derniers messages sont envoyés à l&apos;API (au lieu de tout l&apos;historique)</li>
              <li><strong>Système FAQ</strong> : Les utilisateurs sauvegardent les Q&amp;A fréquentes — réponse instantanée, 0 token</li>
              <li><strong>Profil pré-rempli</strong> : Le onboarding (rempli 1 seule fois) enrichit chaque réponse sans échanges supplémentaires</li>
              <li><strong>Plans d&apos;attaque</strong> : Les formulaires de stratégie par agent évitent les aller-retours de clarification</li>
              <li><strong>Budget quotidien</strong> : Limite configurable par utilisateur pour éviter les surcoûts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ Budget alerts ═══ */}
      <section className="section">
        <h2 className="section-title">Alertes de budget</h2>
        <div className="card p-20">
          <div className="text-md text-secondary leading-relaxed">
            Le système dispose de protections automatiques pour éviter les surcoûts :
          </div>
          <div className="flex flex-col gap-12 mt-16">
            {[
              { label: 'Budget quotidien', desc: 'Limite de dépenses par jour par utilisateur (configurable)', icon: '📊' },
              { label: 'Circuit breaker', desc: 'Coupe automatiquement les appels API si les erreurs sont trop fréquentes', icon: '🔌' },
              { label: 'Alerte solde bas', desc: 'Notification quand le solde de crédits passe sous le seuil', icon: '⚠️' },
              { label: 'Rate limiting', desc: 'Limite le nombre de requêtes par minute par utilisateur', icon: '🚦' },
            ].map(a => (
              <div key={a.label} className="flex gap-12" style={{ alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span className="text-xl">{a.icon}</span>
                <div>
                  <div className="text-md font-semibold">{a.label}</div>
                  <div className="text-sm text-muted">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
