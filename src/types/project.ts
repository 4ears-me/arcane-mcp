export interface ProjectSummary {
  id: string;
  name: string;
  environmentId: string;
  status: 'running' | 'stopped' | 'partial' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends ProjectSummary {
  composeFile: string;
  services: ProjectService[];
  gitRepoId?: string;
  path: string;
}

export interface ProjectService {
  name: string;
  containerId?: string;
  status: string;
  ports: string[];
}

export interface CreateProject {
  name: string;
  environmentId: string;
  composeFile: string;
  gitRepoId?: string;
  path?: string;
}

export interface ProjectStatusCounts {
  running: number;
  stopped: number;
  partial: number;
  error: number;
  total: number;
}