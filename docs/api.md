# API Reference

Complete API documentation for Merlin Website Builder.

---

## Authentication

All API requests require authentication via session cookies or API tokens.

---

## Website Generation

### POST /api/website-builder/generate

Generate a complete website package.

**Request Body:**
```json
{
  "package": "essential",
  "businessName": "My Business",
  "businessType": "restaurant",
  "location": "New York, NY"
}
```

**Response:** Server-Sent Events (SSE) stream with progress updates.

---

## Performance API

### POST /api/performance/metrics

Record a performance metric.

**Request Body:**
```json
{
  "name": "LCP",
  "value": 1200,
  "rating": "good",
  "url": "https://example.com",
  "websiteId": "website-123"
}
```

### GET /api/performance/report

Get performance report for a website.

**Query Parameters:**
- `websiteId` (optional): Website ID
- `url` (optional): Specific URL

---

## E-Commerce API

### GET /api/ecommerce/products

List all products.

### POST /api/ecommerce/products

Create a new product.

---

## Email Marketing API

### GET /api/email-marketing/campaigns

List all email campaigns.

### POST /api/email-marketing/campaigns

Create a new campaign.

---

For complete API documentation, see the [API Reference Guide](./api-reference.md).

