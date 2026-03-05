// ===============================================================
// Comptable Agent — "Mon Comptable" (Freelance Accountant)
// ===============================================================

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  COMPTABLE_SYSTEM_PROMPT,
  COMPTABLE_DISCLAIMER,
  INVOICE_PROMPT,
  EXPENSE_PROMPT,
  QUARTERLY_PROMPT,
  URSSAF_PROMPT,
} from './comptable.prompts';
import {
  getRecords,
  createRecord,
  getReminders,
  getQuarterlySummary,
  formatInvoice,
  computeInvoiceTotals,
} from './comptable.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  ComptableTaskType,
  InvoicePayload,
  ExpensePayload,
  QuarterlyPayload,
  UrssafPayload,
  InvoiceLineItem,
} from './comptable.types';

export const COMPTABLE_AGENT_CONFIG: AgentConfig = {
  id: 'comptable-agent',
  name: 'Comptable Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: [
    'invoice-generation',
    'expense-tracking',
    'quarterly-report',
    'urssaf-reminders',
  ],
  systemPrompt: COMPTABLE_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

export class ComptableAgent extends BaseAgent {
  constructor(config: AgentConfig = COMPTABLE_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('FreelanceReminderDue', async (event) => {
      await this.handleReminderEvent(event);
    }, this.id);

    this.logger.info('Comptable Agent initialized — freelance accounting ready');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as ComptableTaskType | undefined) ?? 'expense';

    switch (taskType) {
      case 'invoice':
        return this.handleInvoice(task);
      case 'expense':
        return this.handleExpense(task);
      case 'quarterly':
        return this.handleQuarterly(task);
      case 'urssaf':
        return this.handleUrssaf(task);
      default:
        return {
          error: `Unknown comptable task type: ${String(taskType)}`,
          disclaimer: COMPTABLE_DISCLAIMER,
        };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    if (event.type === 'FreelanceReminderDue') {
      await this.handleReminderEvent(event);
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('FreelanceReminderDue', this.id);
    this.logger.info('Comptable Agent shut down');
  }

  // ── Invoice Generation ──

  private async handleInvoice(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as InvoicePayload;
    const userId = payload.userId;

    const lineItems: InvoiceLineItem[] = payload.lineItems ?? [];
    const totals = computeInvoiceTotals(lineItems);

    // Generate invoice number from existing records count
    const existingRecords = await getRecords(userId, 'revenue', 1000);
    const invoiceCount = existingRecords.filter((r) => r.invoiceNumber).length;
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      clientName: payload.clientName,
      clientAddress: null,
      clientSiret: null,
      freelanceName: 'Freelance',
      freelanceAddress: null,
      freelanceSiret: null,
      lineItems,
      ...totals,
      paymentTerms: 'Paiement a 30 jours',
      notes: payload.notes ?? null,
    };

    const formattedInvoice = formatInvoice(invoiceData);

    // Use LLM for enhanced invoice analysis
    const prompt = INVOICE_PROMPT
      .replace('{clientInfo}', payload.clientName)
      .replace('{lineItems}', JSON.stringify(lineItems))
      .replace('{notes}', payload.notes ?? 'Aucune');

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: COMPTABLE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Record the revenue
    if (totals.totalHtCents > 0) {
      await createRecord(userId, {
        type: 'revenue',
        amountCents: totals.totalHtCents,
        tvaRate: lineItems[0]?.tvaRate ?? 0,
        tvaCents: totals.totalTvaCents,
        description: `Facture ${invoiceNumber} — ${payload.clientName}`,
        clientName: payload.clientName,
        invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        paymentStatus: 'pending',
        fiscalQuarter: getCurrentQuarter(),
      });
    }

    // Store in memory
    await memoryManager.store({
      content: `Facture ${invoiceNumber} generee pour ${payload.clientName}: ${formattedInvoice.slice(0, 200)}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'invoice', clientName: payload.clientName, invoiceNumber },
    });

    return {
      invoice: invoiceData,
      formattedInvoice,
      llmAnalysis: llmResponse.content,
      disclaimer: COMPTABLE_DISCLAIMER,
    };
  }

  // ── Expense Recording ──

  private async handleExpense(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ExpensePayload;

    const prompt = EXPENSE_PROMPT
      .replace('{description}', payload.description)
      .replace('{amount}', String(payload.amountCents))
      .replace('{category}', payload.category)
      .replace('{tvaRate}', String(payload.tvaRate ?? 0));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: COMPTABLE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    const record = await createRecord(payload.userId, {
      type: 'expense',
      amountCents: payload.amountCents,
      tvaRate: payload.tvaRate ?? 0,
      description: payload.description,
      category: payload.category,
      fiscalQuarter: getCurrentQuarter(),
    });

    return {
      record,
      llmAnalysis: llmResponse.content,
      disclaimer: COMPTABLE_DISCLAIMER,
    };
  }

  // ── Quarterly Report ──

  private async handleQuarterly(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as QuarterlyPayload;
    const summary = await getQuarterlySummary(payload.userId, payload.quarter, payload.year);

    const prompt = QUARTERLY_PROMPT
      .replace('{quarter}', payload.quarter)
      .replace('{year}', String(payload.year))
      .replace('{data}', JSON.stringify(summary));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: COMPTABLE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    return {
      summary,
      llmAnalysis: llmResponse.content,
      disclaimer: COMPTABLE_DISCLAIMER,
    };
  }

  // ── URSSAF / TVA ──

  private async handleUrssaf(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as UrssafPayload;

    const reminders = await getReminders(payload.userId, true);
    const records = await getRecords(payload.userId, 'revenue', 500);

    const prompt = URSSAF_PROMPT
      .replace('{action}', payload.action)
      .replace('{userData}', JSON.stringify({
        pendingReminders: reminders,
        recentRecords: records.slice(0, 20),
        totalRevenue: records.reduce((sum, r) => sum + r.amountCents, 0),
      }));

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: COMPTABLE_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    // Check for upcoming reminders and publish events
    const upcomingReminders = reminders.filter((r) => {
      const due = new Date(r.dueDate);
      const now = new Date();
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && diffDays >= 0;
    });

    for (const reminder of upcomingReminders) {
      await eventBus.publish('FreelanceReminderDue', this.id, {
        userId: payload.userId,
        reminderId: reminder.id,
        reminderType: reminder.type,
        title: reminder.title,
        dueDate: reminder.dueDate,
      });
    }

    return {
      reminders,
      upcomingReminders,
      llmAnalysis: llmResponse.content,
      disclaimer: COMPTABLE_DISCLAIMER,
    };
  }

  // ── Event Handlers ──

  private async handleReminderEvent(event: SystemEvent): Promise<void> {
    this.logger.info('Freelance reminder due', {
      userId: event.payload['userId'],
      reminderType: event.payload['reminderType'],
      title: event.payload['title'],
    });
  }
}

// ── Helpers ──

function getCurrentQuarter(): string {
  const month = new Date().getMonth() + 1;
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}
