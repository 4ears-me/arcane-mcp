import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ArcaneClient } from "../api/client.js";
import { VolumesApi } from "../api/volumes.js";

export function registerVolumeTools(server: McpServer, client: ArcaneClient): void {
  const volumesApi = new VolumesApi(client);

  server.tool(
    "arcane_list_volumes",
    "List all volumes in an environment",
    {
      environmentId: z.string().describe("The environment ID"),
      search: z.string().optional().describe("Search filter for volume names"),
    },
    async ({ environmentId, search }) => {
      const volumes = await volumesApi.list(environmentId, search ? { search } : undefined);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(volumes, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_get_volume",
    "Get details of a specific volume",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
    },
    async ({ environmentId, volumeName }) => {
      const volume = await volumesApi.get(environmentId, volumeName);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(volume, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_create_volume",
    "Create a new volume in an environment",
    {
      environmentId: z.string().describe("The environment ID"),
      name: z.string().describe("The volume name"),
      driver: z.string().optional().describe("The volume driver (default: local)"),
      driverOpts: z.record(z.string()).optional().describe("Driver options as key-value pairs"),
      labels: z.record(z.string()).optional().describe("Labels to apply to the volume"),
    },
    async ({ environmentId, name, driver, driverOpts, labels }) => {
      const volume = await volumesApi.create(environmentId, { name, driver, driverOpts, labels });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(volume, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_remove_volume",
    "Remove a volume from an environment",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name to remove"),
    },
    async ({ environmentId, volumeName }) => {
      await volumesApi.remove(environmentId, volumeName);
      return {
        content: [
          {
            type: "text" as const,
            text: `Volume "${volumeName}" removed successfully`,
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_prune_volumes",
    "Prune unused volumes in an environment",
    {
      environmentId: z.string().describe("The environment ID"),
    },
    async ({ environmentId }) => {
      const result = await volumesApi.prune(environmentId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_browse_volume",
    "Browse files in a volume",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
      path: z.string().optional().describe("The path to browse (default: root)"),
    },
    async ({ environmentId, volumeName, path }) => {
      const files = await volumesApi.browse(environmentId, volumeName, path);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_get_volume_file",
    "Get content of a file from a volume",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
      filePath: z.string().describe("The path to the file"),
    },
    async ({ environmentId, volumeName, filePath }) => {
      const content = await volumesApi.getFileContent(environmentId, volumeName, filePath);
      return {
        content: [
          {
            type: "text" as const,
            text: content,
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_get_volume_sizes",
    "Get disk sizes for all volumes in an environment",
    {
      environmentId: z.string().describe("The environment ID"),
    },
    async ({ environmentId }) => {
      const sizes = await volumesApi.getSizes(environmentId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(sizes, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_list_volume_backups",
    "List backups for a volume",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
    },
    async ({ environmentId, volumeName }) => {
      const backups = await volumesApi.listBackups(environmentId, volumeName);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(backups, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_create_volume_backup",
    "Create a backup of a volume",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
    },
    async ({ environmentId, volumeName }) => {
      const backup = await volumesApi.createBackup(environmentId, volumeName);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(backup, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "arcane_restore_volume_backup",
    "Restore a volume from a backup",
    {
      environmentId: z.string().describe("The environment ID"),
      volumeName: z.string().describe("The volume name"),
      backupId: z.string().describe("The backup ID to restore"),
    },
    async ({ environmentId, volumeName, backupId }) => {
      await volumesApi.restoreBackup(environmentId, volumeName, backupId);
      return {
        content: [
          {
            type: "text" as const,
            text: `Volume "${volumeName}" restored from backup "${backupId}" successfully`,
          },
        ],
      };
    }
  );
}
