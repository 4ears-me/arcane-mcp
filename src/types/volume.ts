export interface VolumeSummary {
  name: string;
  driver: string;
  scope: string;
  createdAt: string;
}

export interface VolumeDetails extends VolumeSummary {
  environmentId: string;
  mountpoint: string;
  labels: Record<string, string>;
  options: Record<string, string>;
  usageData?: {
    size: number;
    refCount: number;
  };
}

export interface CreateVolume {
  name: string;
  driver?: string;
  driverOpts?: Record<string, string>;
  labels?: Record<string, string>;
}

export interface VolumeBackup {
  id: string;
  volumeName: string;
  size: number;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifiedAt: string;
}