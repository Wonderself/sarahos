export class SarahError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context: Record<string, unknown>;

  constructor(message: string, code: string, statusCode = 500, context: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

export class AgentError extends SarahError {
  public readonly agentId: string;

  constructor(agentId: string, message: string, context: Record<string, unknown> = {}) {
    super(message, 'AGENT_ERROR', 500, { agentId, ...context });
    this.agentId = agentId;
  }
}

export class ValidationError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'VALIDATION_ERROR', 400, context);
  }
}

export class LLMError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'LLM_ERROR', 502, context);
  }
}

export class DatabaseError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'DATABASE_ERROR', 500, context);
  }
}

export class EventBusError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'EVENT_BUS_ERROR', 500, context);
  }
}

export class ApprovalRequiredError extends SarahError {
  public readonly approvalType: string;

  constructor(approvalType: string, message: string, context: Record<string, unknown> = {}) {
    super(message, 'APPROVAL_REQUIRED', 403, { approvalType, ...context });
    this.approvalType = approvalType;
  }
}

export class ConfigurationError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'CONFIGURATION_ERROR', 500, context);
  }
}

export class AvatarPipelineError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'AVATAR_PIPELINE_ERROR', 500, context);
  }
}

export class BudgetExceededError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'BUDGET_EXCEEDED', 429, context);
  }
}

export class CircuitBreakerOpenError extends SarahError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 'CIRCUIT_BREAKER_OPEN', 503, context);
  }
}
