# API Reference

Stargate Portal provides a comprehensive REST API for integrating with external services and building custom workflows.

## Base URL

```
Development: http://localhost:5000/api
Production: https://stargate-linux.azurewebsites.net/api
```

## Authentication

Currently, development mode uses auto-authentication. Production will support:

- API Keys
- OAuth 2.0
- JWT tokens

## Endpoints

### Health & Status

#### GET /api/health
Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-22T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### GET /api/health/apis
Check external API connectivity.

**Response:**
```json
{
  "timestamp": "2024-12-22T10:30:00.000Z",
  "apis": {
    "googleSearch": { "configured": true },
    "leonardoAI": { "configured": true },
    "openai": { "configured": true }
  }
}
```

---

### Templates

#### GET /api/templates
List all available templates.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| pageSize | number | 20 | Items per page |
| industry | string | - | Filter by industry |
| category | string | - | Filter by category |

**Response:**
```json
{
  "success": true,
  "templates": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 33,
    "totalPages": 2
  }
}
```

#### GET /api/templates/:id
Get template details.

#### GET /api/templates/:id/preview
Get template preview HTML.

#### GET /api/templates/:id/assets/:path
Serve template static assets.

---

### Projects

#### GET /api/projects
List user projects.

#### POST /api/projects
Create new project.

**Request Body:**
```json
{
  "name": "My Website",
  "templateId": "template-id",
  "industry": "Technology"
}
```

#### GET /api/projects/:id
Get project details.

#### PUT /api/projects/:id
Update project.

#### DELETE /api/projects/:id
Delete project.

---

### AI Services

#### POST /api/ai/generate
Generate content using AI.

**Request Body:**
```json
{
  "prompt": "Write a hero section headline for a tech startup",
  "type": "text",
  "agent": "SAGE"
}
```

#### POST /api/ai/image
Generate image using Leonardo AI.

**Request Body:**
```json
{
  "prompt": "Modern office building, glass facade, sunset",
  "width": 1024,
  "height": 768,
  "style": "photorealistic"
}
```

---

### Merlin Wizard

#### POST /api/merlin7/start
Start the Merlin wizard flow.

**Request Body:**
```json
{
  "businessName": "Acme Corp",
  "industry": "Technology",
  "businessType": "B2B SaaS"
}
```

#### POST /api/merlin7/generate
Generate website content.

#### GET /api/merlin7/status/:sessionId
Check generation status.

---

## Error Handling

All errors return a consistent format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Permission denied |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

## Rate Limiting

API requests are rate limited:

- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- AI endpoints: 50 requests/hour

## Webhooks

Configure webhooks for real-time notifications:

```json
POST /api/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["project.created", "project.deployed"]
}
```

## SDK & Libraries

Coming soon:
- JavaScript/TypeScript SDK
- Python SDK
- CLI tool

## Changelog

### v1.0.0 (2024-12-22)
- Initial API release
- Core endpoints for templates, projects, and AI services
