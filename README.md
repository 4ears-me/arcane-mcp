# Arcane MCP

A Model Context Protocol (MCP) server for controlling [Arcane](https://github.com/getarcaneapp/arcane/) Docker Management. This server provides comprehensive access to the Arcane API, enabling AI assistants to manage Docker containers, images, volumes, networks, and compose projects through the MCP protocol.

## Features

- **Container Management**: List, create, start, stop, restart, and delete containers
- **Image Management**: List, pull, remove, and prune images
- **Volume Management**: Full volume lifecycle including backups, restores, and file browsing
- **Network Management**: Create, list, and remove Docker networks
- **Project/Compose Support**: Deploy and manage Docker Compose projects
- **Environment Management**: Multi-environment support with connection testing
- **System Monitoring**: Health checks, version info, and system-wide operations

## Prerequisites

- Node.js 18 or higher
- An Arcane instance running and accessible
- Either an API key or username/password credentials for authentication

## Installation

```bash
npm install
npm run build
```

## Configuration

The server is configured via environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ARCANE_API_URL` | Yes | Base URL of the Arcane API (e.g., `https://arcane.example.com`) |
| `ARCANE_API_KEY` | No* | API key for authentication |
| `ARCANE_USERNAME` | No* | Username for login |
| `ARCANE_PASSWORD` | No* | Password for login |

*Either `ARCANE_API_KEY` or both `ARCANE_USERNAME` and `ARCANE_PASSWORD` must be provided.

## Usage

```bash
npm start
```

For development with hot reload:

```bash
npm run dev
```

## Integration with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "arcane": {
      "command": "node",
      "args": ["/path/to/arcane-mcp/dist/index.js"],
      "env": {
        "ARCANE_API_URL": "https://arcane.example.com",
        "ARCANE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "arcane": {
      "command": "node",
      "args": ["/path/to/arcane-mcp/dist/index.js"],
      "env": {
        "ARCANE_API_URL": "https://arcane.example.com",
        "ARCANE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Using with npx

```json
{
  "mcpServers": {
    "arcane": {
      "command": "npx",
      "args": ["-y", "arcane-mcp"],
      "env": {
        "ARCANE_API_URL": "https://arcane.example.com",
        "ARCANE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### Environment Tools (6 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_environments` | List all environments with optional search filter |
| `arcane_get_environment` | Get details for a specific environment by ID |
| `arcane_create_environment` | Create a new environment |
| `arcane_update_environment` | Update an existing environment |
| `arcane_delete_environment` | Delete an environment by ID |
| `arcane_test_environment` | Test the connection to an environment |

### Container Tools (8 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_containers` | List containers in an environment |
| `arcane_get_container` | Get details of a specific container |
| `arcane_create_container` | Create a new container with full configuration options |
| `arcane_start_container` | Start a container |
| `arcane_stop_container` | Stop a container |
| `arcane_restart_container` | Restart a container |
| `arcane_delete_container` | Delete/remove a container |
| `arcane_get_container_counts` | Get container status counts for an environment |

### Image Tools (6 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_images` | List images in an environment |
| `arcane_get_image` | Get details of a specific image |
| `arcane_pull_image` | Pull an image from a registry |
| `arcane_remove_image` | Remove an image from the environment |
| `arcane_prune_images` | Prune unused images from the environment |
| `arcane_get_image_counts` | Get image usage counts for an environment |

### Volume Tools (11 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_volumes` | List all volumes in an environment |
| `arcane_get_volume` | Get details of a specific volume |
| `arcane_create_volume` | Create a new volume |
| `arcane_remove_volume` | Remove a volume from an environment |
| `arcane_prune_volumes` | Prune unused volumes in an environment |
| `arcane_browse_volume` | Browse files in a volume |
| `arcane_get_volume_file` | Get content of a file from a volume |
| `arcane_get_volume_sizes` | Get disk sizes for all volumes |
| `arcane_list_volume_backups` | List backups for a volume |
| `arcane_create_volume_backup` | Create a backup of a volume |
| `arcane_restore_volume_backup` | Restore a volume from a backup |

### Network Tools (5 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_networks` | List networks in an environment |
| `arcane_get_network` | Get details of a specific network |
| `arcane_create_network` | Create a new network |
| `arcane_remove_network` | Remove a network from an environment |
| `arcane_prune_networks` | Prune unused networks from an environment |

### Project Tools (11 tools)

| Tool | Description |
|------|-------------|
| `arcane_list_projects` | List Docker Compose projects in an environment |
| `arcane_get_project` | Get details of a specific project |
| `arcane_create_project` | Create a new Docker Compose project |
| `arcane_update_project` | Update an existing project |
| `arcane_delete_project` | Delete/destroy a project |
| `arcane_deploy_project` | Deploy a project (docker-compose up) |
| `arcane_stop_project` | Stop/bring down a project |
| `arcane_restart_project` | Restart a project |
| `arcane_redeploy_project` | Redeploy a project |
| `arcane_pull_project_images` | Pull images for a project |
| `arcane_get_project_counts` | Get project status counts for an environment |

### System Tools (5 tools)

| Tool | Description |
|------|-------------|
| `arcane_get_system_info` | Get Arcane system information |
| `arcane_get_docker_info` | Get Docker daemon information for an environment |
| `arcane_prune_system` | Perform system-wide prune on an environment |
| `arcane_get_health` | Check the health status of the Arcane API |
| `arcane_get_version` | Get the Arcane version information |

## Development

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run in development mode with tsx |
| `npm start` | Run the compiled server |

## License

MIT