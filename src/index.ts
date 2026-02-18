#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config, validateConfig } from './config.js';
import { createApiClient } from './api/index.js';
import {
  registerEnvironmentTools,
  registerContainerTools,
  registerImageTools,
  registerVolumeTools,
  registerNetworkTools,
  registerProjectTools,
  registerSystemTools,
} from './tools/index.js';

async function main(): Promise<void> {
  try {
    validateConfig();

    const apiClient = createApiClient(config);

    if (!config.apiKey && config.username && config.password) {
      await apiClient.client.authenticate();
    }

    const server = new McpServer({
      name: 'arcane',
      version: '1.0.0',
    });

    registerEnvironmentTools(server, apiClient.client);
    registerContainerTools(server, apiClient.client);
    registerImageTools(server, apiClient.client);
    registerVolumeTools(server, apiClient.client);
    registerNetworkTools(server, apiClient.client);
    registerProjectTools(server, apiClient.client);
    registerSystemTools(server, apiClient.client);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Arcane MCP server started successfully');
  } catch (error) {
    console.error('Failed to start Arcane MCP server:', error);
    process.exit(1);
  }
}

main();
