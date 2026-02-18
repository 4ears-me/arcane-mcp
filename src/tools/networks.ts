import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { NetworksApi } from '../api/index.js';
import type { ArcaneClient } from '../api/index.js';

export function registerNetworkTools(server: McpServer, client: ArcaneClient): void {
  const networksApi = new NetworksApi(client);

  server.tool(
    'arcane_list_networks',
    'List networks in an environment',
    {
      environmentId: z.string().describe('The environment ID'),
      search: z.string().optional().describe('Search filter for network name'),
    },
    async ({ environmentId, search }) => {
      const networks = await networksApi.list(environmentId, { search });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(networks, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_network',
    'Get details of a specific network',
    {
      environmentId: z.string().describe('The environment ID'),
      networkId: z.string().describe('The network ID'),
    },
    async ({ environmentId, networkId }) => {
      const network = await networksApi.get(environmentId, networkId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(network, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_create_network',
    'Create a new network in an environment',
    {
      environmentId: z.string().describe('The environment ID'),
      name: z.string().describe('The network name'),
      driver: z.string().optional().describe('Network driver (e.g., bridge, overlay)'),
      subnet: z.string().optional().describe('Subnet CIDR (e.g., 172.20.0.0/16)'),
      gateway: z.string().optional().describe('Gateway IP address'),
      labels: z.record(z.string()).optional().describe('Labels to apply to the network'),
    },
    async ({ environmentId, name, driver, subnet, gateway, labels }) => {
      const network = await networksApi.create(environmentId, {
        name,
        driver,
        subnet,
        gateway,
        labels,
      });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(network, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_remove_network',
    'Remove a network from an environment',
    {
      environmentId: z.string().describe('The environment ID'),
      networkId: z.string().describe('The network ID'),
    },
    async ({ environmentId, networkId }) => {
      await networksApi.remove(environmentId, networkId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Network ${networkId} removed` }),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_prune_networks',
    'Prune unused networks from an environment',
    {
      environmentId: z.string().describe('The environment ID'),
    },
    async ({ environmentId }) => {
      const result = await networksApi.prune(environmentId);
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
}
