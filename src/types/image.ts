export interface ImageSummary {
  id: string;
  repoTags: string[];
  repoDigests: string[];
  size: number;
  created: string;
  createdAt: string;
}

export interface ImageDetails extends ImageSummary {
  environmentId: string;
  architecture: string;
  os: string;
  author: string;
  labels: Record<string, string>;
  containerCount: number;
}

export interface PullImageOptions {
  image: string;
  registry?: string;
  tag?: string;
  platform?: string;
}

export interface ImagePruneReport {
  deleted: string[];
  spaceReclaimed: number;
}