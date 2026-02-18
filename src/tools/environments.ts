import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { EnvironmentsApi } from '../api/index.js';
import type { ArcaneClient } from '../api/client.js';

export function registerEnvironmentTools(server: McpServer, client: ArcaneClient): void {
  const api = new EnvironmentsApi(client);

  server.tool(
    'arcane_list_environments',
    'List all environments. Optionally filter by search term.',
    {
      search: z.string().optional().describe('Search term to filter environments by name or description'),
    },
    async (input) => {
      const environments = await api.list(input.search ? { search: input.search } : undefined);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(environments, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_environment',
    'Get details for a specific environment by ID.',
    {
      id: z.string().describe('The unique identifier of the environment'),
    },
    async (input) => {
      const environment = await api.get(input.id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(environment, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_create_environment',
    'Create a new environment.',
    {
      name: z.string().describe('Name of the environment'),
      description: z.string().optional().describe('Description of the environment'),
      url: z.string().describe('URL endpoint for the environment'),
    },
    async (input) => {
      const environment = await api.create({
        name: input.name,
        description: input.description,
        url: input.url,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(environment, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_update_environment',
    'Update an existing environment.',
    {
      id: z.string().describe('The unique identifier of the environment to update'),
      name: z.string().optional().describe('New name for the environment'),
      description: z.string().optional().describe('New description for the environment'),
      url: z.string().optional().describe('New URL endpoint for the environment'),
    },
    async (input) => {
      const environment = await api.update(input.id, {
        name: input.name,
        description: input.description,
        url: input.url,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(environment, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_delete_environment',
    'Delete an environment by ID.',
    {
      id: z.string().describe('The unique identifier of the environment to delete'),
    },
    async (input) => {
      await api.delete(input.id);
      return {
        content: [
          {
            type: 'text',
            text: `Environment ${input.id} deleted successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_test_environment',
    'Test the connection to an environment.',
    {
      id: z.string().describe('The unique identifier of the environment to test'),
    },
    async (input) => {
      const result = await api.testConnection(input.id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}