export interface SystemInfo {
  version: string;
  uptime: number;
  environmentCount: number;
  containerCount: number;
  imageCount: number;
  volumeCount: number;
  networkCount: number;
}

export interface DockerInfo {
  containers: number;
  containersRunning: number;
  containersStopped: number;
  images: number;
  memTotal: number;
  operatingSystem: string;
  architecture: string;
  kernelVersion: string;
  dockerVersion: string;
}

export interface PruneResult {
  containersDeleted: string[];
  imagesDeleted: string[];
  volumesDeleted: string[];
  networksDeleted: string[];
  spaceReclaimed: number;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface VersionInfo {
  version: string;
  commit: string;
  buildDate: string;
}