import { z } from 'zod';

// ── Agent-related schemas ──

export const agentLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const agentStatusSchema = z.enum(['IDLE', 'BUSY', 'ERROR', 'DISABLED']);

export const modelTierSchema = z.enum(['fast', 'standard', 'advanced']);

// ── Task-related schemas ──

export const taskStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
  'NEEDS_REVIEW',
  'NEEDS_REFACTOR',
]);

export const taskPrioritySchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const taskImpactSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const autonomyLevelSchema = z.enum(['NONE', 'ASSISTED', 'SEMI_AUTONOMOUS', 'AUTONOMOUS']);

export const effortSchema = z.enum(['XS', 'S', 'M', 'L', 'XL']);

export const taskMetadataSchema = z.object({
  task_id: z.string().regex(/^TASK-\d{3,}$/),
  title: z.string().min(1),
  description: z.string().min(1),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  impact: taskImpactSchema,
  autonomy_level_unlocked: autonomyLevelSchema,
  assigned_agent: z.string(),
  dependencies: z.array(z.string()),
  phase: z.number().int().positive(),
  estimated_effort: effortSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});

// ── Event-related schemas ──

export const eventTypeSchema = z.enum([
  'TaskCreated',
  'TaskAssigned',
  'TaskCompleted',
  'TaskFailed',
  'AgentResponse',
  'DirectiveIssued',
  'MessageReceived',
  'MessageSent',
  'ContextRequest',
  'ContextRetrieved',
  'MeetingScheduled',
  'ContentGenerated',
  'PostPublished',
  'MetricLogged',
  'ThresholdBreached',
  'HealthReport',
  'GrowthReport',
  'TechDebtReport',
  'GlobalStateUpdate',
  'EscalationToHuman',
  'ApprovalRequested',
  'ApprovalGranted',
  'ApprovalDenied',
  'OptimizationProposed',
  'AutonomyBlockerFound',
]);

// ── Avatar-related schemas ──

export const avatarBaseSchema = z.enum(['sarah', 'emmanuel']);

export const avatarTypeSchema = z.enum(['standard', 'custom']);

export const clientAvatarConfigSchema = z.object({
  avatar_base: avatarBaseSchema,
  avatar_name: z.string().min(1).max(50),
  company_name: z.string().min(1),
  industry: z.string().optional(),
  greeting_message: z.string().optional(),
  tone_override: z.string().optional(),
  brand_colors: z
    .object({
      primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    })
    .optional(),
});

// ── Approval schemas ──

export const approvalStatusSchema = z.enum(['PENDING', 'APPROVED', 'DENIED', 'EXPIRED']);

export const overrideLevelSchema = z.enum(['FINANCIAL', 'INFRASTRUCTURE', 'STRATEGIC', 'SECURITY']);

export type TaskMetadata = z.infer<typeof taskMetadataSchema>;
export type ClientAvatarConfig = z.infer<typeof clientAvatarConfigSchema>;
