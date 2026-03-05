import type { Express } from 'express';
import { createAuthRouter } from '../auth.routes';
import { createHealthRouter } from './health.routes';
import { createStateRouter } from './state.routes';
import { createApprovalRouter } from './approval.routes';
import { createAgentRouter } from './agent.routes';
import { createFinancialRouter } from './financial.routes';
import { createAvatarRouter } from './avatar.routes';
import { createTokenRouter } from './token.routes';
import { createAutonomyRouter } from './autonomy.routes';
import { createEventsRouter } from './events.routes';
import { createTaskRouter } from './task.routes';
import { createAgentControlRouter } from './agent-control.routes';
import { createMemoryRouter } from './memory.routes';
import { createStreamRouter } from './stream.routes';
import { createAdminRouter } from './admin.routes';
import { createPromoRouter } from './promo.routes';
import { createBillingRouter } from './billing.routes';
import { createCampaignRouter } from './campaign.routes';
import { createNotificationRouter } from './notification.routes';
import { createNotificationStreamRouter } from './notification-stream.routes';
import { createClientPortalRouter } from './client-portal.routes';
import { createWhatsAppWebhookRouter } from './whatsapp-webhook.routes';
import { createTwilioWebhookRouter } from './twilio-webhook.routes';
import { createWhatsAppRouter } from './whatsapp.routes';
import { createRepondeurRouter } from './repondeur.routes';
import { createEnterpriseRouter } from './enterprise.routes';
import { createPersonalAgentsRouter } from './personal-agents.routes';
import { createCustomCreationRouter } from './custom-creation.routes';
import { createDocumentRouter } from './document.routes';
import { createAnalyticsRouter } from './analytics.routes';
import { createStudioAdminRouter } from './studio-admin.routes';
import { createAlarmRouter } from './alarm.routes';
import { createProjectRouter } from './project.routes';
import { createUserDataRouter } from './user-data.routes';
import { createCustomAgentsRouter } from './custom-agents.routes';
import { createModuleRouter } from './module.routes';
import { createActionRouter } from './action.routes';
import { createWorkspaceRouter } from './workspace.routes';
import { createAutopilotRouter } from './autopilot.routes';
import { createGuardrailsRouter } from './guardrails.routes';
import { globalErrorHandler } from '../error-handler.middleware';

export function registerAllRoutes(app: Express): void {
  // Public routes (no auth)
  app.use(createAuthRouter());
  app.use(createHealthRouter());
  app.use(createWhatsAppWebhookRouter());
  app.use(createTwilioWebhookRouter());

  // Protected routes
  app.use(createStateRouter());
  app.use(createApprovalRouter());
  app.use(createAgentRouter());
  app.use(createAgentControlRouter());
  app.use(createFinancialRouter());
  app.use(createAvatarRouter());
  app.use(createTokenRouter());
  app.use(createAutonomyRouter());
  app.use(createEventsRouter());
  app.use(createTaskRouter());
  app.use(createMemoryRouter());
  app.use(createStreamRouter());
  app.use(createAdminRouter());
  app.use(createPromoRouter());

  // Phase 9: Billing, Campaigns, Notifications, Client Portal
  app.use(createBillingRouter());
  app.use(createCampaignRouter());
  app.use(createNotificationRouter());
  app.use(createNotificationStreamRouter());
  app.use(createClientPortalRouter());

  // Phase 11: WhatsApp + Voice
  app.use(createWhatsAppRouter());

  // Repondeur Agent
  app.use(createRepondeurRouter());

  // Personal Agents (budget, comptable, chasseur, cv, ceremonie, ecrivain)
  app.use(createPersonalAgentsRouter());

  // Enterprise quotes (POST is public, GET/PATCH are admin-only)
  app.use(createEnterpriseRouter());

  // Custom Creation quotes (POST authenticated, GET/PATCH admin-only)
  app.use(createCustomCreationRouter());

  // User Documents (upload, list, delete)
  app.use(createDocumentRouter());

  // Analytics (admin-only)
  app.use(createAnalyticsRouter());

  // Studio fal.ai admin (admin-only)
  app.use(createStudioAdminRouter());

  // Réveil Intelligent (alarm CRUD)
  app.use(createAlarmRouter());

  // Multi-Projects
  app.use(createProjectRouter());

  // User Data Persistence (localStorage → DB)
  app.use(createUserDataRouter());

  // Custom user-created agents
  app.use(createCustomAgentsRouter());

  // User module builder (forms, CRM, agents, dashboards)
  app.use(createModuleRouter());

  // Actions pipeline (conversation → action)
  app.use(createActionRouter());

  // Workspaces & Team collaboration
  app.use(createWorkspaceRouter());

  // Autopilot — Admin governance via WA + Dashboard
  app.use(createAutopilotRouter());

  // Guardrails monitoring & agent mode toggle
  app.use(createGuardrailsRouter());

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Global error handler (must be last)
  app.use(globalErrorHandler);
}
