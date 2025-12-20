/**
 * Internal Linking Service
 * Generates strategic internal links for SEO
 */

export interface RelatedContent {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  relevance: number;
}

/**
 * Find related content based on keywords and topics
 */
export function findRelatedContent(
  currentPage: {
    slug: string;
    keywords?: string[];
    title?: string;
  },
  allPages: Array<{
    slug: string;
    title: string;
    description?: string;
    keywords?: string[];
  }>,
  maxResults: number = 3
): RelatedContent[] {
  if (!currentPage.keywords || currentPage.keywords.length === 0) {
    // Fallback: return pages with similar titles or recent pages
    return allPages
      .filter(p => p.slug !== currentPage.slug)
      .slice(0, maxResults)
      .map(p => ({
        slug: p.slug,
        title: p.title,
        description: p.description || '',
        keywords: p.keywords || [],
        relevance: 0.5
      }));
  }

  // Calculate relevance score based on keyword overlap
  const related: RelatedContent[] = allPages
    .filter(p => p.slug !== currentPage.slug)
    .map(page => {
      const pageKeywords = page.keywords || [];
      const currentKeywords = currentPage.keywords || [];
      
      // Calculate keyword overlap
      const commonKeywords = currentKeywords.filter(k => 
        pageKeywords.some(pk => pk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(pk.toLowerCase()))
      );
      
      const relevance = commonKeywords.length / Math.max(currentKeywords.length, 1);
      
      return {
        slug: page.slug,
        title: page.title,
        description: page.description || '',
        keywords: pageKeywords,
        relevance
      };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxResults);

  return related;
}

/**
 * Generate related content links HTML
 */
export function generateRelatedContentLinks(related: RelatedContent[]): string {
  if (related.length === 0) {
    return '';
  }

  const links = related.map(item => `
    <li class="related-content-item">
      <a href="./${item.slug}.html" class="related-content-link">
        <h3 class="related-content-title">${item.title}</h3>
        ${item.description ? `<p class="related-content-description">${item.description}</p>` : ''}
      </a>
    </li>
  `).join('\n    ');

  return `
<section class="related-content-section">
  <h2 class="section-title">Related Content</h2>
  <ul class="related-content-list">
    ${links}
  </ul>
</section>
  `.trim();
}

/**
 * Generate contextual internal links within content
 */
export function addContextualLinks(
  content: string,
  keywords: string[],
  allPages: Array<{ slug: string; title: string; keywords?: string[] }>
): string {
  let linkedContent = content;

  // For each keyword, find the most relevant page and add a link
  keywords.forEach(keyword => {
    const relevantPage = allPages.find(page => {
      const pageKeywords = page.keywords || [];
      return pageKeywords.some(pk => 
        pk.toLowerCase().includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(pk.toLowerCase())
      ) || page.title.toLowerCase().includes(keyword.toLowerCase());
    });

    if (relevantPage) {
      // Create a regex to find the keyword (case-insensitive, whole word)
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      
      // Replace first occurrence with a link
      linkedContent = linkedContent.replace(regex, (match, offset) => {
        // Check if already inside a link
        const beforeMatch = linkedContent.substring(0, offset);
        const afterMatch = linkedContent.substring(offset);
        
        if (beforeMatch.includes('<a ') && !beforeMatch.match(/<a[^>]*>[\s\S]*$/)) {
          // Already inside a link, don't replace
          return match;
        }
        
        return `<a href="./${relevantPage.slug}.html" class="contextual-link">${match}</a>`;
      });
    }
  });

  return linkedContent;
}

/**
 * Generate topic cluster structure
 */
export function generateTopicCluster(
  pages: Array<{
    slug: string;
    title: string;
    keywords?: string[];
  }>
): Map<string, string[]> {
  const clusters = new Map<string, string[]>();

  // Group pages by primary keyword
  pages.forEach(page => {
    const primaryKeyword = page.keywords?.[0] || page.title.toLowerCase();
    const clusterKey = primaryKeyword.split(' ')[0]; // Use first word as cluster key

    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, []);
    }
    clusters.get(clusterKey)?.push(page.slug);
  });

  return clusters;
}

/**
 * Generate internal linking CSS
 */
export function generateInternalLinkingCSS(): string {
  return `
.related-content-section {
  margin-top: 4rem;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.related-content-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.related-content-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.related-content-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.related-content-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.related-content-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.related-content-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.contextual-link {
  color: #3b82f6;
  text-decoration: underline;
  text-decoration-color: rgba(59, 130, 246, 0.3);
  transition: color 0.2s, text-decoration-color 0.2s;
}

.contextual-link:hover {
  color: #2563eb;
  text-decoration-color: rgba(37, 99, 235, 0.5);
}

@media (max-width: 768px) {
  .related-content-list {
    grid-template-columns: 1fr;
  }
}
  `.trim();
}

