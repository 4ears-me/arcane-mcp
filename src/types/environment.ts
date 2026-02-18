export interface Environment {
  id: string;
  name: string;
  description?: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironment {
  name: string;
  description?: string;
  url: string;
}

export interface UpdateEnvironment {
  name?: string;
  description?: string;
  url?: string;
}