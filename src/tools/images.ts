import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ArcaneClient } from '../api/client.js';
import { ImagesApi } from '../api/images.js';

export function registerImageTools(server: McpServer, client: ArcaneClient): void {
  const imagesApi = new ImagesApi(client);

  server.tool(
    'arcane_list_images',
    'List images in an environment',
    {
      environmentId: z.string().describe('The environment ID'),
      search: z.string().optional().describe('Search filter for images'),
    },
    async ({ environmentId, search }) => {
      const images = await imagesApi.list(environmentId, { search });
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(images, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_get_image',
    'Get details of a specific image',
    {
      environmentId: z.string().describe('The environment ID'),
      imageId: z.string().describe('The image ID'),
    },
    async ({ environmentId, imageId }) => {
      const image = await imagesApi.get(environmentId, imageId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(image, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_pull_image',
    'Pull an image from a registry',
    {
      environmentId: z.string().describe('The environment ID'),
      image: z.string().describe('The image name to pull'),
      registry: z.string().optional().describe('The registry to pull from'),
      tag: z.string().optional().describe('The image tag'),
      platform: z.string().optional().describe('The platform (e.g., linux/amd64)'),
    },
    async ({ environmentId, image, registry, tag, platform }) => {
      const stream = await imagesApi.pull(environmentId, { image, registry, tag, platform });
      const chunks: string[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: chunks.join(''),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_remove_image',
    'Remove an image from the environment',
    {
      environmentId: z.string().describe('The environment ID'),
      imageId: z.string().describe('The image ID to remove'),
    },
    async ({ environmentId, imageId }) => {
      await imagesApi.remove(environmentId, imageId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ success: true, message: `Image ${imageId} removed successfully` }),
          },
        ],
      };
    }
  );

  server.tool(
    'arcane_prune_images',
    'Prune unused images from the environment',
    {
      environmentId: z.string().describe('The environment ID'),
    },
    async ({ environmentId }) => {
      const result = await imagesApi.prune(environmentId);
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
    'arcane_get_image_counts',
    'Get image usage counts for an environment',
    {
      environmentId: z.string().describe('The environment ID'),
    },
    async ({ environmentId }) => {
      const counts = await imagesApi.getCounts(environmentId);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(counts, null, 2),
          },
        ],
      };
    }
  );
}
