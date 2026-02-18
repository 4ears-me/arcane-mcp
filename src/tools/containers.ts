import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ContainersApi } from '../api/containers.js';
import { ArcaneClient } from '../api/client.js';
import type { CreateContainer, PortMapping, VolumeMount } from '../types/container.js';

const PortMappingSchema = z.object({
  containerPort: z.number().describe('Port inside the container'),
  hostPort: z.number().optional().describe('Port on the host'),
  protocol: z.enum(['tcp', 'udp']).optional().describe('Protocol (tcp or udp)'),
});

const VolumeMountSchema = z.object({
  source: z.string().describe('Source path or volume name'),
  target: z.string().describe('Destination path inside container'),
  readOnly: z.boolean().optional().describe('Mount read-only'),
});

export function registerContainerTools(server: McpServer, client: ArcaneClient): void {
  const api = new ContainersApi(client);

  server.registerTool(
    'arcane_list_containers',
    {
      description: 'List containers in an environment',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        search: z.string().optional().describe('Search filter for containers'),
      },
    },
    async (args) => {
      const result = await api.list(args.environmentId, args.search ? { search: args.search } : undefined);
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

  server.registerTool(
    'arcane_get_container',
    {
      description: 'Get details of a specific container',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        containerId: z.string().describe('The container ID'),
      },
    },
    async (args) => {
      const result = await api.get(args.environmentId, args.containerId);
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

  server.registerTool(
    'arcane_create_container',
    {
      description: 'Create a new container in an environment',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        image: z.string().describe('Docker image to use'),
        name: z.string().optional().describe('Container name'),
        command: z.string().optional().describe('Command to run'),
        env: z.record(z.string(), z.string()).optional().describe('Environment variables'),
        ports: z.array(PortMappingSchema).optional().describe('Port mappings'),
        volumes: z.array(VolumeMountSchema).optional().describe('Volume mounts'),
        networks: z.array(z.string()).optional().describe('Networks to connect'),
        labels: z.record(z.string(), z.string()).optional().describe('Container labels'),
        hostname: z.string().optional().describe('Container hostname'),
        privileged: z.boolean().optional().describe('Run in privileged mode'),
        autoRemove: z.boolean().optional().describe('Auto-remove container on exit'),
        restartPolicy: z.enum(['no', 'always', 'on-failure', 'unless-stopped']).optional().describe('Restart policy'),
        memory: z.number().optional().describe('Memory limit in bytes'),
        cpuShares: z.number().optional().describe('CPU shares'),
      },
    },
    async (args) => {
      const createData: CreateContainer = {
        image: args.image,
        name: args.name,
        command: args.command,
        environment: args.env,
        ports: args.ports as PortMapping[] | undefined,
        volumes: args.volumes as VolumeMount[] | undefined,
        networks: args.networks,
        labels: args.labels,
        hostname: args.hostname,
        privileged: args.privileged,
        autoRemove: args.autoRemove,
        restartPolicy: args.restartPolicy,
        memory: args.memory,
        cpuShares: args.cpuShares,
      };
      const result = await api.create(args.environmentId, createData);
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

  server.registerTool(
    'arcane_start_container',
    {
      description: 'Start a container',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        containerId: z.string().describe('The container ID'),
      },
    },
    async (args) => {
      await api.start(args.environmentId, args.containerId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Container ${args.containerId} started` }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'arcane_stop_container',
    {
      description: 'Stop a container',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        containerId: z.string().describe('The container ID'),
      },
    },
    async (args) => {
      await api.stop(args.environmentId, args.containerId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Container ${args.containerId} stopped` }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'arcane_restart_container',
    {
      description: 'Restart a container',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        containerId: z.string().describe('The container ID'),
      },
    },
    async (args) => {
      await api.restart(args.environmentId, args.containerId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Container ${args.containerId} restarted` }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'arcane_delete_container',
    {
      description: 'Delete/remove a container',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
        containerId: z.string().describe('The container ID'),
      },
    },
    async (args) => {
      await api.delete(args.environmentId, args.containerId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Container ${args.containerId} deleted` }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'arcane_get_container_counts',
    {
      description: 'Get container status counts for an environment',
      inputSchema: {
        environmentId: z.string().describe('The environment ID'),
      },
    },
    async (args) => {
      const result = await api.getCounts(args.environmentId);
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