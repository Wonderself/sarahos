'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/client-fetch';
import { styles, formatCredits, formatDate, WalletData } from './styles';

// ═══════════════════════════════════════════════════
//   TAB 2: WALLET
// ═══════════════════════════════════════════════════

export default function UserWalletTab({ userId, data, loading, showToast, onRefresh }: {
  userId: string;
  data: WalletData | null;
  loading: boolean;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onRefresh: () => Promise<void>;
}) {
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDesc, setDepositDesc] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundDesc, setRefundDesc] = useState('');
  const [submitting, setSubmitting] = useState<'deposit' | 'refund' | null>(null);

  if (loading) {
    return <div style={styles.loadingSpinner}>Chargement du wallet...</div>;
  }

  const wallet = data?.wallet;
  const transactions = data?.recentTransactions || [];

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      showToast('Montant invalide', 'error');
      return;
    }
    setSubmitting('deposit');
    try {
      await apiFetch(`/admin/users/${userId}/deposit`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amount * 1_000_000,
          description: depositDesc || 'Depot admin',
        }),
      });
      showToast(`${amount} credits deposes avec succes`, 'success');
      setDepositAmount('');
      setDepositDesc('');
      await onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur de depot', 'error');
    } finally {
      setSubmitting(null);
    }
  };

  const handleRefund = async () => {
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      showToast('Montant invalide', 'error');
      return;
    }
    setSubmitting('refund');
    try {
      await apiFetch(`/admin/users/${userId}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amount * 1_000_000,
          description: refundDesc || 'Remboursement admin',
        }),
      });
      showToast(`${amount} credits rembourses avec succes`, 'success');
      setRefundAmount('');
      setRefundDesc('');
      await onRefresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur de remboursement', 'error');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div>
      {/* KPI Cards */}
      <div style={styles.grid4}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Solde</span>
          <span style={{ ...styles.kpiValue, color: 'var(--accent)' }}>
            {wallet ? formatCredits(wallet.balanceCredits) : '0.00'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>credits</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total depose</span>
          <span style={{ ...styles.kpiValue, color: 'var(--success)' }}>
            {wallet ? formatCredits(wallet.totalDeposited) : '0.00'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>credits</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total depense</span>
          <span style={{ ...styles.kpiValue, color: 'var(--danger)' }}>
            {wallet ? formatCredits(wallet.totalSpent) : '0.00'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>credits</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Auto-topup</span>
          <span style={{ ...styles.kpiValue, fontSize: 22 }}>
            {wallet?.autoTopupEnabled ? 'Actif' : 'Inactif'}
          </span>
        </div>
      </div>

      {/* Deposit & Refund Forms */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>savings</span> Deposer des credits</div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Montant (en credits)</label>
            <input
              style={styles.input}
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Ex: 100"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <input
              style={styles.input}
              placeholder="Raison du depot"
              value={depositDesc}
              onChange={e => setDepositDesc(e.target.value)}
            />
          </div>
          <button
            style={{ ...styles.btnPrimary, opacity: submitting === 'deposit' ? 0.6 : 1, width: '100%' }}
            onClick={handleDeposit}
            disabled={submitting === 'deposit'}
          >
            {submitting === 'deposit' ? 'Depot en cours...' : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>savings</span> Deposer</>}
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>refresh</span> Rembourser</div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Montant (en credits)</label>
            <input
              style={styles.input}
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Ex: 50"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <input
              style={styles.input}
              placeholder="Raison du remboursement"
              value={refundDesc}
              onChange={e => setRefundDesc(e.target.value)}
            />
          </div>
          <button
            style={{ ...styles.btnSecondary, width: '100%', opacity: submitting === 'refund' ? 0.6 : 1 }}
            onClick={handleRefund}
            disabled={submitting === 'refund'}
          >
            {submitting === 'refund' ? 'Remboursement en cours...' : <><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>refresh</span> Rembourser</>}
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={styles.cardTitle}><span className="material-symbols-rounded" style={{ fontSize: 18, verticalAlign: 'middle' }}>receipt_long</span> Historique des transactions (20 dernieres)</div>
          <button style={styles.btnSecondary} onClick={onRefresh}><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>refresh</span> Rafraichir</button>
        </div>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30, fontSize: 14 }}>
            Aucune transaction
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Montant</th>
                  <th style={styles.th}>Solde apres</th>
                  <th style={styles.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id}>
                    <td style={styles.td(i)}>{formatDate(tx.createdAt)}</td>
                    <td style={styles.td(i)}>
                      <span style={styles.badge(
                        tx.type === 'deposit' || tx.type === 'credit' ? '#16a34a'
                          : tx.type === 'refund' ? '#2563eb'
                          : tx.type === 'debit' || tx.type === 'charge' ? '#dc2626'
                          : '#6b7280'
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{
                      ...styles.td(i),
                      fontWeight: 600,
                      color: tx.amount >= 0 ? 'var(--success)' : 'var(--danger)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {tx.amount >= 0 ? '+' : ''}{formatCredits(tx.amount)} cr
                    </td>
                    <td style={{ ...styles.td(i), fontFamily: 'var(--font-mono)' }}>
                      {formatCredits(tx.balanceAfter)} cr
                    </td>
                    <td style={{ ...styles.td(i), fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
