# AI Generation API

AI-powered content and website generation endpoints.

## Website Generation

### Generate Complete Website

```http
POST /api/website-builder/generate
Content-Type: application/json

{
  "package": "professional",
  "businessName": "Bean & Brew Coffee",
  "businessType": "restaurant",
  "description": "Modern specialty coffee shop in Cape Town",
  "location": "Cape Town, South Africa",
  "features": ["menu", "about", "contact", "gallery"]
}
```

**Response (SSE Stream):**
```
event: progress
data: {"phase": "research", "progress": 10, "message": "Analyzing industry..."}

event: progress
data: {"phase": "content", "progress": 30, "message": "Writing copy..."}

event: progress
data: {"phase": "design", "progress": 50, "message": "Applying styles..."}

event: complete
data: {"projectId": "proj_abc123", "previewUrl": "/preview/proj_abc123"}
```

### Generation Packages

| Package | Pages | Features |
|---------|-------|----------|
| starter | 3 | Basic layout, contact |
| professional | 5 | SEO, analytics, forms |
| enterprise | unlimited | E-commerce, custom |

## Content Generation

### Generate Text Content

```http
POST /api/ai/generate-content
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "type": "headline",
  "context": {
    "businessName": "Bean & Brew",
    "industry": "coffee shop",
    "tone": "friendly"
  },
  "prompt": "Generate a compelling hero headline"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Where Every Cup Tells a Story",
    "alternatives": [
      "Crafted with Passion, Served with Love",
      "Your Daily Dose of Exceptional Coffee"
    ]
  }
}
```

### Content Types

| Type | Description |
|------|-------------|
| headline | Page and section headlines |
| paragraph | Body text content |
| tagline | Short brand taglines |
| cta | Call-to-action text |
| product | Product descriptions |
| meta | SEO meta descriptions |

### Generate Page Content

```http
POST /api/ai/generate-page
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "projectId": "proj_abc123",
  "pageType": "about",
  "sections": ["story", "team", "values"]
}
```

## Chat Interface

### Send Message to Merlin

```http
POST /api/ai/chat
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "projectId": "proj_abc123",
  "message": "Add a testimonials section with 3 reviews"
}
```

**Response (SSE Stream):**
```
event: message
data: {"type": "thinking", "content": "Analyzing your request..."}

event: message
data: {"type": "action", "content": "Adding testimonials section"}

event: message
data: {"type": "complete", "content": "Done! I've added a testimonials section."}

event: changes
data: {"sections": [{"id": "testimonials", "action": "added"}]}
```

### Get Chat History

```http
GET /api/ai/chat/:projectId/history
Authorization: Bearer YOUR_TOKEN
```

## SEO Generation

### Generate SEO Content

```http
POST /api/ai/seo
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "projectId": "proj_abc123",
  "pageId": "page_home"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Bean & Brew Coffee | Cape Town's Best Specialty Coffee",
    "description": "Experience exceptional single-origin coffee...",
    "keywords": ["cape town coffee", "specialty coffee", ...],
    "ogImage": "/generated/og-image.png"
  }
}
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Website generation | 10/hour |
| Content generation | 100/hour |
| Chat messages | 200/hour |

## Error Codes

| Code | Description |
|------|-------------|
| AI_UNAVAILABLE | AI service temporarily down |
| QUOTA_EXCEEDED | Generation limit reached |
| INVALID_PROMPT | Prompt failed validation |
| GENERATION_FAILED | AI couldn't complete request |
