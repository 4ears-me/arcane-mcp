# Arcane MCP

## Purpose

An MCP (Model Context Protocol) server for controlling [Arcane](https://github.com/getarcaneapp/arcane/) Docker Management. It provides comprehensive access to the Arcane API, enabling AI assistants to manage Docker containers, images, volumes, networks, and compose projects.

## Project Structure

```
@4ears-me/arcane-mcp/
├── src/
│   ├── api/                    # Arcane API client layer
│   │   ├── client.ts           # Main ArcaneClient class with auth & request handling
│   │   ├── containers.ts       # Container API methods
│   │   ├── environments.ts     # Environment API methods
│   │   ├── images.ts           # Image API methods
│   │   ├── index.ts            # Exports createApiClient factory
│   │   ├── networks.ts         # Network API methods
│   │   ├── projects.ts         # Docker Compose project API methods
│   │   ├── system.ts           # System info/health API methods
│   │   └── volumes.ts          # Volume API methods (including backups)
│   ├── tools/                  # MCP tool implementations
│   │   ├── containers.ts       # Container management tools
│   │   ├── environments.ts     # Environment management tools
│   │   ├── images.ts           # Image management tools
│   │   ├── index.ts            # Exports all register functions
│   │   ├── networks.ts         # Network management tools
│   │   ├── projects.ts         # Project/Compose management tools
│   │   ├── system.ts           # System monitoring tools
│   │   └── volumes.ts          # Volume management tools
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Authentication types
│   │   ├── common.ts           # Shared types (ApiResponse, Pagination)
│   │   ├── container.ts        # Container types
│   │   ├── environment.ts      # Environment types
│   │   ├── image.ts            # Image types
│   │   ├── index.ts            # Re-exports all types
│   │   ├── network.ts          # Network types
│   │   ├── project.ts          # Project/Compose types
│   │   ├── system.ts           # System info types
│   │   └── volume.ts           # Volume types
│   ├── config.ts               # Environment configuration
│   └── index.ts                # Server entry point (with shebang)
├── dist/                       # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## Architecture

### Layer Separation

1. **Types Layer** (`src/types/`): Pure TypeScript interfaces/types matching Arcane API responses
2. **API Layer** (`src/api/`): HTTP client with authentication, makes requests to Arcane
3. **Tools Layer** (`src/tools/`): MCP tool implementations, calls API layer
4. **Server** (`src/index.ts`): Wires everything together, registers tools with MCP server

### Data Flow

```
MCP Client (Claude/Cursor)
        │
        ▼
    MCP Server (StdioTransport)
        │
        ▼
    Tool Handlers (src/tools/)
        │
        ▼
    API Client (src/api/)
        │
        ▼
    Arcane API (HTTP)
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `ARCANE_API_URL` | Yes | Base URL of Arcane API (e.g., `https://arcane.example.com/api`) |
| `ARCANE_API_KEY` | No* | API key for X-API-Key authentication |
| `ARCANE_USERNAME` | No* | Username for JWT authentication |
| `ARCANE_PASSWORD` | No* | Password for JWT authentication |

*Either `ARCANE_API_KEY` OR (`ARCANE_USERNAME` + `ARCANE_PASSWORD`) must be provided.

## Code Conventions

### TypeScript

- **ES Modules**: `type: "module"` in package.json
- **Extension imports**: Use `.js` extensions in imports (e.g., `from './config.js'`)
- **Strict mode**: Enabled in tsconfig.json
- **No `any`**: Use proper types from `src/types/`

### MCP Tools

Each tool file exports a `register*Tools(server, client)` function:

```typescript
export function registerContainerTools(server: McpServer, client: ArcaneClient): void {
  server.tool(
    'arcane_tool_name',           // Tool name (prefixed with arcane_)
    'Tool description',           // Description
    {                             // Input schema (zod)
      param: z.string().describe('Parameter description'),
    },
    async (params) => {           // Handler
      const result = await client.method(params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
```

### API Client

Each API file extends the client with domain methods:

```typescript
export function createContainerApi(client: ArcaneClient) {
  return {
    async listContainers(environmentId: string, params?: PaginationParams) {
      return client.get<ContainerSummary[]>(`/environments/${environmentId}/containers`, params);
    },
    // ... other methods
  };
}
```

### Error Handling

- Use try/catch in tool handlers
- Return error messages as text content
- Log errors to stderr (console.error) - NEVER to stdout

### Logging

- **NEVER** use `console.log()` - it writes to stdout and interferes with MCP protocol
- Use `console.error()` for logging - writes to stderr, safe for MCP servers

## Available Tools Summary

| Category | Count | File |
|----------|-------|------|
| Environments | 6 | `src/tools/environments.ts` |
| Containers | 8 | `src/tools/containers.ts` |
| Images | 6 | `src/tools/images.ts` |
| Volumes | 11 | `src/tools/volumes.ts` |
| Networks | 5 | `src/tools/networks.ts` |
| Projects | 11 | `src/tools/projects.ts` |
| System | 5 | `src/tools/system.ts` |
| **Total** | **52** | |

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run dev` | Run with tsx (development) |
| `npm start` | Run compiled server |
| `npx .` | Run via npx locally |

## Adding New Tools

1. Add types to `src/types/` if needed
2. Add API method to appropriate file in `src/api/`
3. Add tool to appropriate file in `src/tools/`
4. Register in `src/index.ts` if new file

## Arcane API Reference

- OpenAPI spec: `{ARCANE_API_URL}/api/openapi.json`
- API docs: `{ARCANE_API_URL}/api/docs` (Scalar UI)
- GitHub: https://github.com/getarcaneapp/arcane

## Publishing

1. Update version in `package.json`
2. Run `npm run build`
3. Run `npm publish`

The `prepublishOnly` script ensures build runs before publish.

## Development Workflow

All changes must be made through pull requests:

1. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push your branch** and create a PR:
   ```bash
   git push -u origin your-branch-name
   gh pr create --title "Your PR title" --body "Description"
   ```

4. **Wait for CI checks** to pass (build and test)

5. **Merge** after approval (or admin merge if required)

Direct pushes to `main` are not allowed - all changes require a PR.
