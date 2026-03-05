'use client';

import { styles, formatCredits, UsageData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 5: USAGE
// ═══════════════════════════════════════════════════

export default function UserUsageTab({ data, loading }: {
  data: UsageData['usage'];
  loading: boolean;
}) {
  if (loading) {
    return <div style={styles.loadingSpinner}>Chargement de l&apos;usage...</div>;
  }

  if (!data) {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40, fontSize: 14 }}>
          Aucune donnee d&apos;utilisation disponible
        </div>
      </div>
    );
  }

  const byModel = data.byModel || {};
  const modelEntries = Object.entries(byModel);

  return (
    <div>
      {/* KPI Cards */}
      <div style={styles.grid4}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total requetes</span>
          <span style={{ ...styles.kpiValue, color: 'var(--accent)' }}>
            {(data.totalRequests ?? 0).toLocaleString()}
          </span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Tokens entrants</span>
          <span style={{ ...styles.kpiValue, color: 'var(--info)' }}>
            {(data.inputTokens ?? 0).toLocaleString()}
          </span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Tokens sortants</span>
          <span style={{ ...styles.kpiValue, color: 'var(--purple)' }}>
            {(data.outputTokens ?? 0).toLocaleString()}
          </span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Cout total</span>
          <span style={{ ...styles.kpiValue, color: 'var(--danger)' }}>
            {formatCredits(data.totalCost ?? 0)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>credits</span>
        </div>
      </div>

      {/* By Model Breakdown */}
      {modelEntries.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 Ventilation par modele</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Modele</th>
                  <th style={styles.th}>Requetes</th>
                  <th style={styles.th}>Tokens entrants</th>
                  <th style={styles.th}>Tokens sortants</th>
                  <th style={styles.th}>Cout (credits)</th>
                </tr>
              </thead>
              <tbody>
                {modelEntries.map(([model, stats], i) => (
                  <tr key={model}>
                    <td style={{ ...styles.td(i), fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                      {model}
                    </td>
                    <td style={styles.td(i)}>{(stats.requests ?? 0).toLocaleString()}</td>
                    <td style={styles.td(i)}>{(stats.inputTokens ?? 0).toLocaleString()}</td>
                    <td style={styles.td(i)}>{(stats.outputTokens ?? 0).toLocaleString()}</td>
                    <td style={{ ...styles.td(i), fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {formatCredits(stats.cost ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modelEntries.length === 0 && (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30, fontSize: 14 }}>
            Pas de ventilation par modele disponible
          </div>
        </div>
      )}
    </div>
  );
}
