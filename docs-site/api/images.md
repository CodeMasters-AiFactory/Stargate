# Image Generation API

Leonardo AI integration for generating website images.

## Endpoints

### Generate Image

```http
POST /api/leonardo/generate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "prompt": "Modern coffee shop interior with warm lighting",
  "style": "PHOTOGRAPHY",
  "width": 1024,
  "height": 576,
  "count": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generationId": "gen_abc123",
    "status": "pending",
    "estimatedTime": 30
  }
}
```

### Check Generation Status

```http
GET /api/leonardo/status/:generationId
Authorization: Bearer YOUR_TOKEN
```

**Response (Pending):**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 60
  }
}
```

**Response (Complete):**
```json
{
  "success": true,
  "data": {
    "status": "complete",
    "images": [
      {
        "id": "img_xyz789",
        "url": "https://cdn.leonardo.ai/...",
        "width": 1024,
        "height": 576
      }
    ]
  }
}
```

### Get Generation History

```http
GET /api/leonardo/history
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| projectId | string | Filter by project |
| limit | number | Max results |
| offset | number | Pagination offset |

## Style Options

### Photography Styles

| Style | Description |
|-------|-------------|
| PHOTOGRAPHY | Realistic photos |
| CINEMATIC | Movie-like lighting |
| PRODUCT_PHOTOGRAPHY | Clean product shots |
| PORTRAIT | Professional headshots |
| FOOD_PHOTOGRAPHY | Food styling |

### Art Styles

| Style | Description |
|-------|-------------|
| ILLUSTRATION | Digital illustration |
| 3D_RENDER | 3D rendered graphics |
| WATERCOLOR | Painted effect |
| SKETCH | Pencil sketch |
| ANIME | Anime/manga style |

### Presets

| Preset | Effect |
|--------|--------|
| DYNAMIC | High contrast |
| VIBRANT | Saturated colors |
| FILM_NOIR | Black and white |
| RETRO | Vintage look |
| NONE | Prompt only |

## Dimensions

### Recommended Sizes

| Use Case | Width | Height | Ratio |
|----------|-------|--------|-------|
| Hero banner | 1920 | 1080 | 16:9 |
| Feature image | 1024 | 768 | 4:3 |
| Square | 1024 | 1024 | 1:1 |
| Portrait | 768 | 1024 | 3:4 |
| Thumbnail | 400 | 300 | 4:3 |

### Constraints

- Minimum: 512x512
- Maximum: 2048x2048
- Must be divisible by 8

## Save to Project

### Save Generated Image

```http
POST /api/leonardo/save
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "generationId": "gen_abc123",
  "imageId": "img_xyz789",
  "projectId": "proj_def456",
  "placement": {
    "pageId": "page_home",
    "sectionId": "hero",
    "slot": "background"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "savedUrl": "/projects/proj_def456/images/hero-bg.webp",
    "optimized": true,
    "sizes": {
      "original": 245000,
      "optimized": 85000
    }
  }
}
```

## Image Optimization

All saved images are automatically:
- Converted to WebP format
- Compressed for web
- Resized to multiple breakpoints
- Given proper alt text

### Optimization Options

```http
POST /api/images/optimize
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "quality": 80,
  "maxWidth": 1920,
  "format": "webp"
}
```

## Rate Limits

| Plan | Generations/month |
|------|-------------------|
| Starter | 50 |
| Professional | 200 |
| Enterprise | Unlimited |

## Error Codes

| Code | Description |
|------|-------------|
| GENERATION_FAILED | Image generation failed |
| INVALID_PROMPT | Content policy violation |
| QUOTA_EXCEEDED | Monthly limit reached |
| INVALID_DIMENSIONS | Size out of range |
| API_ERROR | Leonardo API unavailable |
