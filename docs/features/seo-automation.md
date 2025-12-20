# SEO Automation

## Overview

Automatic SEO optimization with schema markup, sitemap generation, robots.txt, and comprehensive meta tags.

## Features

- **Automatic Schema Markup**: LocalBusiness, Organization, FAQ schemas
- **Meta Tags**: Title, description, keywords, Open Graph, Twitter Cards
- **Sitemap Generation**: XML sitemap for all pages
- **Robots.txt**: Automatic robots.txt generation
- **SEO Scoring**: 0-100 SEO score calculation
- **Improvement Suggestions**: Actionable SEO improvements

## API Endpoints

### POST /api/seo-automation/optimize
Full SEO optimization for a website.

**Request:**
```json
{
  "html": "<html>...</html>",
  "clientInfo": {
    "businessName": "My Business",
    "industry": "Technology",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "services": [
      {
        "name": "Web Development",
        "description": "Custom web solutions"
      }
    ],
    "phone": "+1-555-1234",
    "email": "contact@example.com",
    "address": "123 Main St",
    "websiteUrl": "https://example.com"
  },
  "pages": [
    { "slug": "index", "name": "Home" },
    { "slug": "about", "name": "About" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "html": "<html>...optimized...</html>",
  "sitemap": "<?xml version='1.0'?>...",
  "robotsTxt": "User-agent: *...",
  "schema": [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "My Business"
    }
  ],
  "metaTags": {
    "title": "My Business | Web Development | New York, NY",
    "description": "My Business provides Web Development in New York, NY...",
    "keywords": "My Business, Technology, Web Development, New York, NY",
    "openGraph": {
      "og:title": "...",
      "og:description": "...",
      "og:type": "website"
    },
    "twitter": {
      "twitter:card": "summary_large_image",
      "twitter:title": "..."
    }
  },
  "improvements": [
    {
      "type": "meta-tags",
      "description": "Generated optimized title, description, and keywords",
      "impact": "high"
    }
  ],
  "seoScore": 85
}
```

### GET /api/seo-automation/generate-sitemap
Generate XML sitemap.

**Query Parameters:**
- `pages`: JSON array of pages
- `baseUrl`: Base URL for sitemap

### GET /api/seo-automation/generate-robots
Generate robots.txt.

**Query Parameters:**
- `allowAll`: Boolean (default: true)
- `baseUrl`: Base URL

## SEO Score Calculation

The SEO score (0-100) is calculated based on:

- **Title Tag** (20 points): Proper length (30-60 characters)
- **Meta Description** (20 points): Proper length (120-160 characters)
- **H1 Tag** (15 points): Single H1 tag
- **Schema Markup** (20 points): Structured data present
- **Open Graph Tags** (10 points): Complete OG tags
- **Image Alt Tags** (10 points): 80%+ images have alt text
- **Internal Links** (5 points): 5+ internal links

## Frontend Component

Use the `SEODashboard` component:

```tsx
import { SEODashboard } from '@/components/SEO/SEODashboard';

<SEODashboard
  websiteId="website-123"
  currentHtml={html}
  clientInfo={clientInfo}
  onOptimized={(optimization) => {
    console.log(`SEO Score: ${optimization.seoScore}`);
  }}
/>
```

## Schema Types

### LocalBusiness Schema
For local businesses with location and services.

### Organization Schema
For company information and contact details.

### FAQ Schema
For FAQ pages with questions and answers.

## Best Practices

1. **Complete Client Info**: Provide all business information for accurate schema
2. **Page Structure**: Include all pages in sitemap
3. **Regular Updates**: Re-run optimization after content changes
4. **Monitor Score**: Track SEO score improvements over time
5. **Schema Validation**: Validate schema markup with Google's Rich Results Test

