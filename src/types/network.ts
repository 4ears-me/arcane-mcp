export interface NetworkSummary {
  id: string;
  name: string;
  driver: string;
  scope: string;
  createdAt: string;
}

export interface NetworkDetails extends NetworkSummary {
  environmentId: string;
  subnet: string;
  gateway: string;
  labels: Record<string, string>;
  containers: Record<string, { name: string; ipAddress: string }>;
}

export interface CreateNetwork {
  name: string;
  driver?: string;
  subnet?: string;
  gateway?: string;
  labels?: Record<string, string>;
}