/**
 * OpenAPI/Swagger Documentation Generator
 * Auto-generates API documentation from routes
 */

import type { Express } from 'express';

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

/**
 * Generate OpenAPI spec from Express routes
 */
export function generateOpenAPISpec(app: Express): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'StargatePortal API',
      version: '1.0.0',
      description: 'API documentation for StargatePortal website builder',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    paths: {},
    components: {
      schemas: {},
    },
  };

  // Extract routes from Express app
  // Note: This is a simplified version - full implementation would parse routes
  const routes = extractRoutes(app);
  
  // Add common paths
  spec.paths['/api/health'] = {
    get: {
      summary: 'Health check',
      description: 'Returns server health status',
      responses: {
        '200': {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                },
              },
            },
          },
        },
      },
    },
  };

  spec.paths['/api/templates'] = {
    get: {
      summary: 'List templates',
      description: 'Get list of available templates',
      parameters: [
        {
          name: 'category',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter by category',
        },
      ],
      responses: {
        '200': {
          description: 'List of templates',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  templates: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Template' },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  spec.paths['/api/website-builder/generate'] = {
    post: {
      summary: 'Generate website',
      description: 'Generate a website from requirements',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/WebsiteRequirements' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Website generation started',
          content: {
            'text/event-stream': {
              schema: {
                type: 'string',
                description: 'Server-Sent Events stream',
              },
            },
          },
        },
        '400': {
          description: 'Invalid request',
        },
      },
    },
  };

  // Add schemas
  spec.components.schemas.Template = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      category: { type: 'string' },
      isDesignQuality: { type: 'boolean' },
      isContentQuality: { type: 'boolean' },
    },
  };

  spec.components.schemas.WebsiteRequirements = {
    type: 'object',
    required: ['businessName', 'industry'],
    properties: {
      businessName: { type: 'string' },
      industry: { type: 'string' },
      location: {
        type: 'object',
        properties: {
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
        },
      },
      services: {
        type: 'array',
        items: { type: 'string' },
      },
      pages: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  };

  return spec;
}

/**
 * Extract routes from Express app (simplified)
 */
function extractRoutes(app: Express): any[] {
  // This would need to traverse Express router stack
  // For now, return empty array - routes are manually documented
  return [];
}

