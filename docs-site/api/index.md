# API Reference

Complete API documentation for Stargate Portal.

## Base URL

All API endpoints are relative to your server:

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. See [Authentication](/api/auth) for details.

## Available Endpoints

### Core APIs

| Endpoint | Description |
|----------|-------------|
| [Authentication](/api/auth) | User login, registration, tokens |
| [Projects](/api/projects) | Website project management |
| [Templates](/api/templates) | Template library access |
| [AI Generation](/api/ai-generation) | Content & website generation |
| [Images](/api/images) | Leonardo AI image generation |

### Quick Examples

#### Generate a Website

```bash
curl -X POST http://localhost:5000/api/website-builder/generate \
  -H "Content-Type: application/json" \
  -d '{
    "package": "professional",
    "businessName": "My Coffee Shop",
    "businessType": "restaurant",
    "location": "Cape Town, SA"
  }'
```

#### Get All Projects

```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Generate an Image

```bash
curl -X POST http://localhost:5000/api/leonardo/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern coffee shop interior with warm lighting",
    "style": "PHOTOGRAPHY"
  }'
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Standard users**: 100 requests/minute
- **Pro users**: 500 requests/minute
- **Enterprise**: Unlimited

## Server-Sent Events (SSE)

The website generation endpoint uses SSE for real-time progress:

```javascript
const eventSource = new EventSource('/api/website-builder/generate');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data.progress);
};
```
