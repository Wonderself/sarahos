export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
  isActive?: boolean;
}
