# Projects API

Manage website projects.

## Endpoints

### List Projects

```http
GET /api/projects
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| status | string | Filter by status |

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_abc123",
        "name": "My Coffee Shop",
        "slug": "my-coffee-shop",
        "status": "published",
        "template": "restaurant-modern",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-15T12:00:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pages": 2
  }
}
```

### Get Single Project

```http
GET /api/projects/:id
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "name": "My Coffee Shop",
    "slug": "my-coffee-shop",
    "description": "A modern coffee shop website",
    "pages": [
      {
        "id": "page_1",
        "name": "Home",
        "path": "/",
        "sections": [...]
      }
    ],
    "theme": {
      "primaryColor": "#8B4513",
      "font": "Inter"
    },
    "settings": {
      "seoEnabled": true,
      "analyticsId": "GA-123456"
    }
  }
}
```

### Create Project

```http
POST /api/projects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "My New Website",
  "template": "business-modern",
  "description": "A professional business website"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_def456",
    "name": "My New Website",
    "slug": "my-new-website",
    "status": "draft"
  }
}
```

### Update Project

```http
PATCH /api/projects/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "theme": {
    "primaryColor": "#2563eb"
  }
}
```

### Delete Project

```http
DELETE /api/projects/:id
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Publish Project

```http
POST /api/projects/:id/publish
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_abc123",
    "status": "published",
    "url": "https://my-coffee-shop.stargate.app"
  }
}
```

### Export Project

```http
GET /api/projects/:id/export
Authorization: Bearer YOUR_TOKEN
```

Returns a ZIP file containing the complete website.

**Query Parameters:**
| Param | Type | Options |
|-------|------|---------|
| format | string | html, nextjs, wordpress |

## Project Pages

### Add Page

```http
POST /api/projects/:id/pages
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "About Us",
  "path": "/about",
  "template": "about-page"
}
```

### Update Page

```http
PATCH /api/projects/:id/pages/:pageId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "sections": [
    {
      "type": "hero",
      "content": {...}
    }
  ]
}
```

### Delete Page

```http
DELETE /api/projects/:id/pages/:pageId
Authorization: Bearer YOUR_TOKEN
```

## Error Codes

| Code | Description |
|------|-------------|
| PROJECT_NOT_FOUND | Project doesn't exist |
| UNAUTHORIZED | No access to project |
| LIMIT_REACHED | Max projects for plan |
| INVALID_TEMPLATE | Template not found |
