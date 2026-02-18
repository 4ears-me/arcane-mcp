import type { ArcaneConfig } from '../config.js';
import { ArcaneClient, ArcaneApiError } from './client.js';
import { EnvironmentsApi } from './environments.js';
import { ContainersApi } from './containers.js';
import { ImagesApi } from './images.js';
import { VolumesApi } from './volumes.js';
import { NetworksApi } from './networks.js';
import { ProjectsApi } from './projects.js';
import { SystemApi } from './system.js';

export { ArcaneClient, ArcaneApiError } from './client.js';
export { EnvironmentsApi } from './environments.js';
export { ContainersApi } from './containers.js';
export { ImagesApi } from './images.js';
export { VolumesApi } from './volumes.js';
export { NetworksApi } from './networks.js';
export { ProjectsApi } from './projects.js';
export { SystemApi } from './system.js';

export interface ArcaneApiClient {
  client: ArcaneClient;
  environments: EnvironmentsApi;
  containers: ContainersApi;
  images: ImagesApi;
  volumes: VolumesApi;
  networks: NetworksApi;
  projects: ProjectsApi;
  system: SystemApi;
}

export function createApiClient(config: ArcaneConfig): ArcaneApiClient {
  const client = new ArcaneClient(config);

  return {
    client,
    environments: new EnvironmentsApi(client),
    containers: new ContainersApi(client),
    images: new ImagesApi(client),
    volumes: new VolumesApi(client),
    networks: new NetworksApi(client),
    projects: new ProjectsApi(client),
    system: new SystemApi(client),
  };
}