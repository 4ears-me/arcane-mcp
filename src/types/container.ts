export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'exited' | 'paused' | 'created' | 'dead';
  createdAt: string;
  ports: PortMapping[];
  labels: Record<string, string>;
}

export interface ContainerDetails extends ContainerSummary {
  environmentId: string;
  command: string;
  environmentVars: string[];
  mounts: Mount[];
  networks: string[];
  ipAddress?: string;
  restartPolicy: string;
  created: string;
}

export interface CreateContainer {
  image: string;
  name?: string;
  command?: string;
  environment?: Record<string, string>;
  ports?: PortMapping[];
  volumes?: VolumeMount[];
  networks?: string[];
  labels?: Record<string, string>;
  hostname?: string;
  privileged?: boolean;
  autoRemove?: boolean;
  restartPolicy?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  memory?: number;
  cpuShares?: number;
}

export interface PortMapping {
  containerPort: number;
  hostPort?: number;
  protocol?: 'tcp' | 'udp';
}

export interface VolumeMount {
  source: string;
  target: string;
  readOnly?: boolean;
}

export interface Mount {
  type: 'bind' | 'volume' | 'tmpfs';
  source: string;
  destination: string;
  mode?: string;
  rw: boolean;
}

export interface ContainerStatusCounts {
  running: number;
  exited: number;
  paused: number;
  total: number;
}