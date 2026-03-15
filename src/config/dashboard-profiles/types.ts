/**
 * Dashboard Profile Configuration Types
 */

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  description?: string;
}

export interface DashboardSection {
  id: string;
  type: 'agents' | 'approvals' | 'metrics' | 'automations' | 'team_overview' | 'credit_pool' | 'team_activity';
  title: string;
  visible: boolean;
  order: number;
  min_role?: 'viewer' | 'member' | 'admin' | 'owner';
}

export interface DashboardConfig {
  profil: string;
  layout: 'standard' | 'agency' | 'ecommerce' | 'medical' | 'minimal' | 'manager';
  hero: {
    greeting_template: string;
    subtitle_template: string;
    data_source: string;
    accent_color: string;
    accent_gradient: string;
  };
  priority_agents: string[];
  hidden_agents: string[];
  quick_actions: QuickAction[];
  sections: DashboardSection[];
  tooltips_level: 'high' | 'medium' | 'low';
  onboarding_checklist: {
    enabled: boolean;
    hide_after_completion: boolean;
    steps: string[];
  };
  team_sections?: {
    show_team_usage: boolean;
    show_team_approvals: boolean;
    show_credit_pool: boolean;
    show_member_activity: boolean;
  };
}
