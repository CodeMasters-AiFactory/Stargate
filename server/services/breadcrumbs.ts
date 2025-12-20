/**
 * Breadcrumb Service
 * Generates breadcrumb navigation and BreadcrumbList schema markup
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

/**
 * Generate breadcrumb navigation HTML
 */
export function generateBreadcrumbHTML(items: BreadcrumbItem[]): string {
  if (items.length === 0) {
    return '';
  }

  const breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;
    const itemClass = isLast ? 'breadcrumb-item active' : 'breadcrumb-item';
    const ariaCurrent = isLast ? ' aria-current="page"' : '';
    
    if (isLast) {
      return `<li class="${itemClass}"${ariaCurrent}>${item.name}</li>`;
    }
    return `<li class="${itemClass}"><a href="${item.url}">${item.name}</a></li>`;
  }).join('\n      ');

  return `
<nav aria-label="Breadcrumb" class="breadcrumb-nav">
  <ol class="breadcrumb-list">
      ${breadcrumbItems}
  </ol>
</nav>
  `.trim();
}

/**
 * Generate BreadcrumbList schema markup
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  if (items.length === 0) {
    return '';
  }

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(breadcrumbList, null, 2)}</script>`;
}

/**
 * Generate breadcrumbs for a page based on site structure
 */
export function generateBreadcrumbsForPage(
  currentPageSlug: string,
  allPages: Array<{ slug: string; title: string; order: number }>,
  baseUrl: string = ''
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  // Always start with Home
  items.push({
    name: 'Home',
    url: baseUrl ? `${baseUrl}/` : './index.html',
    position: 1
  });

  // Find current page
  const currentPage = allPages.find(p => p.slug === currentPageSlug);
  
  if (!currentPage) {
    return items;
  }

  // If current page is not home, add it
  if (currentPageSlug !== 'home' && currentPageSlug !== 'index') {
    const pageUrl = baseUrl 
      ? `${baseUrl}/${currentPage.slug}.html`
      : `./${currentPage.slug}.html`;
    
    items.push({
      name: currentPage.title,
      url: pageUrl,
      position: items.length + 1
    });
  }

  return items;
}

/**
 * Generate breadcrumb CSS styles
 */
export function generateBreadcrumbCSS(): string {
  return `
.breadcrumb-nav {
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 0.5rem;
  color: #9ca3af;
}

.breadcrumb-item a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #1f2937;
  font-weight: 500;
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 0.75rem 0;
    margin-bottom: 1.5rem;
  }
  
  .breadcrumb-list {
    font-size: 0.8125rem;
  }
}
  `.trim();
}

