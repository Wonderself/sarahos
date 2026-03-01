export type EventType =
  | 'TaskCreated'
  | 'TaskAssigned'
  | 'TaskCompleted'
  | 'TaskFailed'
  | 'AgentResponse'
  | 'DirectiveIssued'
  | 'MessageReceived'
  | 'MessageSent'
  | 'TranslationCompleted'
  | 'ContextRequest'
  | 'ContextRetrieved'
  | 'KnowledgeNotFound'
  | 'MeetingScheduled'
  | 'ConflictDetected'
  | 'ReminderSent'
  | 'ContentGenerated'
  | 'ContentApproved'
  | 'BrandViolation'
  | 'PostPublished'
  | 'EngagementReport'
  | 'ViralAlert'
  | 'MetricLogged'
  | 'ThresholdBreached'
  | 'HealthReport'
  | 'TaskDecomposed'
  | 'SubtasksAssigned'
  | 'OperationReport'
  | 'GrowthReport'
  | 'OpportunityDetected'
  | 'ABTestResult'
  | 'TechDebtReport'
  | 'InfraUpgradeNeeded'
  | 'PerformanceAlert'
  | 'DataIngested'
  | 'EmbeddingsDeprecated'
  | 'KnowledgeAuditComplete'
  | 'GlobalStateUpdate'
  | 'EscalationToHuman'
  | 'StrategyProposal'
  | 'MarketAnalysis'
  | 'PivotRecommendation'
  | 'OptimizationProposed'
  | 'CodeSubmitted'
  | 'AutomationCreated'
  | 'AutonomyBlockerFound'
  | 'UpgradeDrafted'
  | 'AutonomyLevelIncreased'
  | 'ApprovalRequested'
  | 'ApprovalGranted'
  | 'ApprovalDenied'
  | 'ScriptExecuted'
  | 'ASRTranscriptionCompleted'
  | 'ASRTranscriptionFailed'
  | 'TTSSynthesisCompleted'
  | 'TTSSynthesisFailed'
  | 'VideoFrameGenerated'
  | 'VideoSessionStarted'
  | 'VideoSessionEnded'
  | 'TelephonyCallStarted'
  | 'TelephonyCallEnded'
  | 'ConversationTurnCompleted';

export interface SystemEvent {
  id: string;
  type: EventType;
  sourceAgent: string;
  targetAgent?: string;
  payload: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;
}

export type EventHandler = (event: SystemEvent) => Promise<void>;

export interface EventSubscription {
  eventType: EventType;
  handler: EventHandler;
  subscriberId: string;
}
