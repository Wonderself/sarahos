export type AgentStatusValue = 'IDLE' | 'BUSY' | 'ERROR' | 'DISABLED';

export interface AgentState {
  id: string;
  name: string;
  status: AgentStatusValue;
  lastActivity: string | null;
}

export interface AvatarPresetState {
  status: 'active' | 'not_deployed' | 'disabled';
  sessions_today: number;
}

export interface AvatarSystemState {
  founder_avatars: {
    sarah: AvatarPresetState;
    emmanuel: AvatarPresetState;
  };
  client_avatars_deployed: number;
  cache_hit_rate_by_preset: Record<string, number>;
  did_api_usage_today: number;
  tts_api_usage_today: number;
  asr_requests_today: number;
  active_calls: number;
  active_conversations: number;
  pipeline_latency_avg_ms: number;
}

export interface InfrastructureState {
  docker_containers: Record<string, string>;
  database_size_mb: number;
  redis_memory_mb: number;
  uptime_hours: number;
}

export interface TokenBurnRate {
  daily_average: number;
  by_agent: Record<string, number>;
  budget_remaining: number;
}

export interface SystemState {
  timestamp: string;
  current_phase: number;
  active_agents: string[];
  disabled_agents: string[];
  unfinished_systems: string[];
  known_bugs: string[];
  security_risk_vectors: string[];
  api_token_burn_rate: TokenBurnRate;
  avatar_system: AvatarSystemState;
  infrastructure: InfrastructureState;
  tasks_in_progress: string[];
  blocked_tasks: string[];
  last_self_improvement_cycle: string | null;
  autonomy_score: number;
}

export interface TaskState {
  task_id: string;
  title: string;
  status: string;
  priority: string;
  phase: number;
}
