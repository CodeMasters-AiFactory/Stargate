# Templates API

Access and manage website templates.

## Endpoints

### List Templates

```http
GET /api/templates
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | Filter by category |
| style | string | Filter by style |
| search | string | Search by name |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "tpl_modern_saas",
        "name": "Modern SaaS",
        "category": "technology",
        "style": "modern",
        "thumbnail": "/templates/modern-saas/thumb.png",
        "preview": "/templates/modern-saas/preview",
        "pages": 5,
        "features": ["hero", "features", "pricing", "testimonials", "cta"]
      }
    ],
    "total": 50,
    "categories": ["business", "technology", "restaurant", "creative"]
  }
}
```

### Get Template Details

```http
GET /api/templates/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "tpl_modern_saas",
    "name": "Modern SaaS",
    "description": "A modern template for SaaS products",
    "category": "technology",
    "style": "modern",
    "colorScheme": ["#6366f1", "#4f46e5", "#1e1b4b"],
    "fonts": {
      "heading": "Inter",
      "body": "system-ui"
    },
    "pages": [
      {
        "name": "Home",
        "sections": ["hero", "features", "pricing", "testimonials", "cta"]
      },
      {
        "name": "About",
        "sections": ["team", "story", "values"]
      }
    ],
    "preview": "/templates/modern-saas/preview",
    "downloadCount": 1250
  }
}
```

### Get Template Categories

```http
GET /api/templates/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "business",
      "name": "Business & Corporate",
      "count": 12
    },
    {
      "id": "technology",
      "name": "Technology & SaaS",
      "count": 8
    },
    {
      "id": "restaurant",
      "name": "Food & Hospitality",
      "count": 10
    }
  ]
}
```

### Get Template Preview

```http
GET /api/templates/:id/preview
```

Returns HTML preview of the template.

### Download Template

```http
GET /api/templates/:id/download
Authorization: Bearer YOUR_TOKEN
```

Returns template files as ZIP.

## Template Sections

### List Section Types

```http
GET /api/templates/sections
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hero",
      "name": "Hero Section",
      "variants": ["center", "left", "split", "video"]
    },
    {
      "id": "features",
      "name": "Features Grid",
      "variants": ["3-column", "4-column", "list"]
    }
  ]
}
```

### Get Section Variants

```http
GET /api/templates/sections/:type/variants
```

Returns available variants for a section type.

## Custom Templates

### Upload Custom Template

```http
POST /api/templates/custom
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

{
  "name": "My Custom Template",
  "category": "custom",
  "files": [template.zip]
}
```

### Update Custom Template

```http
PATCH /api/templates/custom/:id
Authorization: Bearer YOUR_TOKEN
```

### Delete Custom Template

```http
DELETE /api/templates/custom/:id
Authorization: Bearer YOUR_TOKEN
```

## Template Validation

Templates must include:
- `config.json` - Template metadata
- `index.html` - Main template file
- `thumbnail.png` - Preview image (400x300)
- `sections/` - Section HTML files
