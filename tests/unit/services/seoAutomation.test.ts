/**
 * Unit Tests - SEO Automation
 */

import { describe, it, expect } from 'vitest';
import { optimizeSEO } from '../../../server/services/seoAutomation';

describe('SEO Automation', () => {
  const sampleHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Old Title</title>
    </head>
    <body>
      <h1>Welcome</h1>
      <p>Content here</p>
    </body>
    </html>
  `;

  const clientInfo = {
    businessName: 'Test Business',
    industry: 'Technology',
    location: { city: 'New York', state: 'NY', country: 'USA' },
    services: [
      { name: 'Web Development', description: 'Custom web solutions' },
      { name: 'Consulting', description: 'Tech consulting' },
    ],
    phone: '+1-555-1234',
    email: 'test@example.com',
    address: '123 Main St',
  };

  describe('optimizeSEO', () => {
    it('should optimize HTML with SEO tags', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result).toBeDefined();
      expect(result.html).toContain('Test Business');
      expect(result.metaTags).toBeDefined();
      expect(result.metaTags.title).toContain('Test Business');
      expect(result.metaTags.description).toBeDefined();
    });

    it('should generate schema markup', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.schema).toBeDefined();
      expect(Array.isArray(result.schema)).toBe(true);
      expect(result.schema.length).toBeGreaterThan(0);
      
      const localBusinessSchema = result.schema.find((s: any) => s['@type'] === 'LocalBusiness');
      expect(localBusinessSchema).toBeDefined();
      expect(localBusinessSchema.name).toBe('Test Business');
    });

    it('should generate sitemap', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo, [
        { slug: 'index', name: 'Home' },
        { slug: 'about', name: 'About' },
      ]);

      expect(result.sitemap).toBeDefined();
      expect(result.sitemap).toContain('<?xml');
      expect(result.sitemap).toContain('<urlset');
      expect(result.sitemap).toContain('/index');
      expect(result.sitemap).toContain('/about');
    });

    it('should generate robots.txt', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.robotsTxt).toBeDefined();
      expect(result.robotsTxt).toContain('User-agent');
      expect(result.robotsTxt).toContain('Sitemap');
    });

    it('should calculate SEO score', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.seoScore).toBeDefined();
      expect(typeof result.seoScore).toBe('number');
      expect(result.seoScore).toBeGreaterThanOrEqual(0);
      expect(result.seoScore).toBeLessThanOrEqual(100);
    });

    it('should list improvements', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.improvements).toBeDefined();
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
      
      const improvement = result.improvements[0];
      expect(improvement).toHaveProperty('type');
      expect(improvement).toHaveProperty('description');
      expect(improvement).toHaveProperty('impact');
    });

    it('should include Open Graph tags', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.metaTags.openGraph).toBeDefined();
      expect(result.metaTags.openGraph['og:title']).toBeDefined();
      expect(result.metaTags.openGraph['og:description']).toBeDefined();
      expect(result.metaTags.openGraph['og:type']).toBe('website');
    });

    it('should include Twitter Card tags', async () => {
      const result = await optimizeSEO(sampleHTML, clientInfo);

      expect(result.metaTags.twitter).toBeDefined();
      expect(result.metaTags.twitter['twitter:card']).toBeDefined();
      expect(result.metaTags.twitter['twitter:title']).toBeDefined();
    });
  });
});

