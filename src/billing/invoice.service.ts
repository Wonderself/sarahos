import { dbClient } from '../infra';
import { logger } from '../utils/logger';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  userName: string;
  userEmail: string;
  transactionId: string;
  transactionType: string;
  amount: number; // micro-credits
  amountCredits: number;
  balanceAfter: number;
  description: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class InvoiceService {
  async getInvoiceData(transactionId: string, userId: string): Promise<InvoiceData | null> {
    if (!dbClient.isConnected()) return null;

    const result = await dbClient.query(
      `SELECT wt.*, u.display_name, u.email
       FROM wallet_transactions wt
       JOIN users u ON u.id = wt.user_id
       WHERE wt.id = $1 AND wt.user_id = $2`,
      [transactionId, userId],
    );

    if (!result.rows[0]) return null;
    const row = result.rows[0] as Record<string, unknown>;

    const date = new Date(row['created_at'] as string);
    const invoiceNumber = `FZ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${(row['id'] as string).substring(0, 8).toUpperCase()}`;

    logger.debug('Invoice data retrieved', { invoiceNumber, transactionId, userId });

    return {
      invoiceNumber,
      date: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
      userName: row['display_name'] as string,
      userEmail: row['email'] as string,
      transactionId: row['id'] as string,
      transactionType: row['type'] as string,
      amount: Math.abs(Number(row['amount'])),
      amountCredits: Math.abs(Number(row['amount'])) / 1_000_000,
      balanceAfter: Number(row['balance_after']) / 1_000_000,
      description: row['description'] as string,
    };
  }

  generateHtmlInvoice(data: InvoiceData): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #6c5ce7; }
    .logo { font-size: 28px; font-weight: 700; color: #6c5ce7; }
    .logo small { display: block; font-size: 12px; color: #666; font-weight: 400; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; color: #6c5ce7; margin-bottom: 5px; }
    .invoice-info p { color: #666; font-size: 14px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party h3 { font-size: 14px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px; }
    .party p { font-size: 14px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #6c5ce7; color: white; padding: 12px 15px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
    tr:nth-child(even) { background: #f8f9fa; }
    .totals { text-align: right; margin-bottom: 40px; }
    .totals .row { display: flex; justify-content: flex-end; padding: 8px 0; }
    .totals .label { width: 200px; text-align: right; padding-right: 20px; color: #666; }
    .totals .value { width: 150px; text-align: right; font-weight: 600; }
    .totals .total { border-top: 2px solid #6c5ce7; font-size: 18px; color: #6c5ce7; padding-top: 12px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FREENZY.IO<small>AI-powered autonomous business management</small></div>
    <div class="invoice-info">
      <h2>FACTURE</h2>
      <p>${escapeHtml(data.invoiceNumber)}</p>
      <p>${escapeHtml(data.date)}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Emetteur</h3>
      <p><strong>FREENZY.IO SAS</strong><br>Intelligence Artificielle<br>Netanya, Israel<br>contact@freenzy.io</p>
    </div>
    <div class="party">
      <h3>Client</h3>
      <p><strong>${escapeHtml(data.userName)}</strong><br>${escapeHtml(data.userEmail)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Type</th>
        <th>Reference</th>
        <th style="text-align:right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${escapeHtml(data.description)}</td>
        <td>${data.transactionType === 'deposit' ? 'Credit' : data.transactionType === 'withdrawal' ? 'Debit' : data.transactionType}</td>
        <td style="font-family:monospace;font-size:12px">${data.transactionId.substring(0, 8)}</td>
        <td style="text-align:right">${data.amountCredits.toFixed(2)} credits</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span class="label">Sous-total</span><span class="value">${data.amountCredits.toFixed(2)} credits</span></div>
    <div class="row"><span class="label">TVA (0%)</span><span class="value">0.00 credits</span></div>
    <div class="row total"><span class="label">Total</span><span class="value">${data.amountCredits.toFixed(2)} credits</span></div>
  </div>

  <p style="margin-bottom:20px;color:#666;font-size:13px"><strong>Solde apres operation :</strong> ${data.balanceAfter.toFixed(2)} credits</p>

  <div class="footer">
    <p>FREENZY.IO — Intelligence Artificielle au service de votre entreprise</p>
    <p>Ce document a ete genere automatiquement et ne constitue pas une facture fiscale.</p>
  </div>
</body>
</html>`;
  }

  async listUserInvoices(userId: string, limit = 50): Promise<Array<{ id: string; date: string; type: string; amount: number; description: string }>> {
    if (!dbClient.isConnected()) return [];

    const result = await dbClient.query(
      `SELECT id, type, amount, description, created_at FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );

    return result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row['id'] as string,
        date: new Date(row['created_at'] as string).toLocaleDateString('fr-FR'),
        type: row['type'] as string,
        amount: Math.abs(Number(row['amount'])) / 1_000_000,
        description: row['description'] as string,
      };
    });
  }
}

export const invoiceService = new InvoiceService();
