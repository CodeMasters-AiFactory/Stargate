/**
 * API Documentation Routes
 * Serves OpenAPI/Swagger documentation
 */

import type { Express, Request, Response } from 'express';
import { generateOpenAPISpec } from '../utils/openapi';

export function registerDocsRoutes(app: Express): void {
  /**
   * GET /api/docs/openapi.json
   * Returns OpenAPI specification
   */
  app.get('/api/docs/openapi.json', (req: Request, res: Response) => {
    try {
      const spec = generateOpenAPISpec(app);
      res.json(spec);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate OpenAPI spec' });
    }
  });

  /**
   * GET /api/docs
   * Returns Swagger UI HTML
   */
  app.get('/api/docs', (req: Request, res: Response) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>StargatePortal API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/openapi.json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ]
    });
  </script>
</body>
</html>
    `;
    res.send(html);
  });
}

