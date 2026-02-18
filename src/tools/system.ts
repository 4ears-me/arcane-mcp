import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SystemApi } from '../api/index.js';
import type { ArcaneClient } from '../api/index.js';

export function registerSystemTools(server: McpServer, client: ArcaneClient): void {
  const systemApi = new SystemApi(client);

  server.tool(
    'arcane_get_system_info',
    'Get Arcane system information including version, uptime, and resource counts',
    {},
    async () => {
      const info = await systemApi.getInfo();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_docker_info',
    'Get Docker daemon information for a specific environment',
    {
      environmentId: z.string().describe('The environment ID'),
    },
    async ({ environmentId }) => {
      const info = await systemApi.getDockerInfo(environmentId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_prune_system',
    'Perform system-wide prune on an environment to clean up unused resources',
    {
      environmentId: z.string().describe('The environment ID'),
    },
    async ({ environmentId }) => {
      const result = await systemApi.prune(environmentId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_health',
    'Check the health status of the Arcane API',
    {},
    async () => {
      const health = await systemApi.getHealth();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(health, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_version',
    'Get the Arcane version information',
    {},
    async () => {
      const version = await systemApi.getVersion();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(version, null, 2),
          },
        ],
      };
    }
  );
}
