import { z } from 'zod/v4';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProjectsApi } from '../api/projects.js';
import type { ArcaneClient } from '../api/client.js';

export function registerProjectTools(server: McpServer, client: ArcaneClient): void {
  const api = new ProjectsApi(client);

  server.tool(
    'arcane_list_projects',
    'List Docker Compose projects in an environment',
    {
      environmentId: z.string(),
      search: z.string().optional(),
    },
    async ({ environmentId, search }) => {
      const projects = await api.list(environmentId, { search });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(projects, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_project',
    'Get details of a specific Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      const project = await api.get(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_create_project',
    'Create a new Docker Compose project',
    {
      environmentId: z.string(),
      name: z.string(),
      composeFile: z.string(),
      gitRepoId: z.string().optional(),
      path: z.string().optional(),
    },
    async ({ environmentId, name, composeFile, gitRepoId, path }) => {
      const project = await api.create(environmentId, {
        name,
        environmentId,
        composeFile,
        gitRepoId,
        path,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_update_project',
    'Update an existing Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
      name: z.string().optional(),
      composeFile: z.string().optional(),
      gitRepoId: z.string().optional(),
      path: z.string().optional(),
    },
    async ({ environmentId, projectId, name, composeFile, gitRepoId, path }) => {
      const project = await api.update(environmentId, projectId, {
        name,
        composeFile,
        gitRepoId,
        path,
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(project, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_delete_project',
    'Delete/destroy a Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.delete(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Project ${projectId} deleted successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_deploy_project',
    'Deploy a Docker Compose project (docker-compose up)',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.deploy(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Project ${projectId} deployed successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_stop_project',
    'Stop/bring down a Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.stop(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Project ${projectId} stopped successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_restart_project',
    'Restart a Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.restart(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Project ${projectId} restarted successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_redeploy_project',
    'Redeploy a Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.redeploy(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Project ${projectId} redeployed successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_pull_project_images',
    'Pull images for a Docker Compose project',
    {
      environmentId: z.string(),
      projectId: z.string(),
    },
    async ({ environmentId, projectId }) => {
      await api.pullImages(environmentId, projectId);
      return {
        content: [
          {
            type: 'text',
            text: `Images pulled for project ${projectId} successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_project_counts',
    'Get Docker Compose project status counts for an environment',
    {
      environmentId: z.string(),
    },
    async ({ environmentId }) => {
      const counts = await api.getCounts(environmentId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(counts, null, 2),
          },
        ],
      };
    }
  );
}