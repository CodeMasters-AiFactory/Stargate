# Template Gallery Component

Browse and select website templates.

## Import

```tsx
import { TemplateGallery } from '@/components/TemplateGallery';
```

## Basic Usage

```tsx
<TemplateGallery
  onSelect={handleTemplateSelect}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onSelect | (template: Template) => void | Yes | Selection callback |
| category | string | No | Filter by category |
| style | string | No | Filter by style |
| showSearch | boolean | No | Show search bar |
| showFilters | boolean | No | Show filter controls |
| columns | number | No | Grid columns (default: 3) |
| templates | Template[] | No | Custom template list |

## Template Type

```typescript
interface Template {
  id: string;
  name: string;
  category: string;
  style: 'modern' | 'classic' | 'minimal' | 'bold';
  thumbnail: string;
  preview: string;
  pages: number;
  sections: string[];
  colorScheme: string[];
  fonts: string[];
  featured?: boolean;
  new?: boolean;
}
```

## Events

### onSelect

```tsx
const handleTemplateSelect = (template: Template) => {
  // Navigate to project creation with template
  router.push(`/create?template=${template.id}`);
};
```

### onPreview

```tsx
<TemplateGallery
  onPreview={(template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  }}
  onSelect={handleSelect}
/>
```

## Filtering

### By Category

```tsx
<TemplateGallery
  category="restaurant"
  onSelect={handleSelect}
/>
```

### By Style

```tsx
<TemplateGallery
  style="modern"
  onSelect={handleSelect}
/>
```

### Multiple Filters

```tsx
<TemplateGallery
  filters={{
    category: ['restaurant', 'cafe'],
    style: ['modern', 'minimal'],
    pageCount: { min: 3, max: 5 }
  }}
  onSelect={handleSelect}
/>
```

## Search

Enable search functionality:

```tsx
<TemplateGallery
  showSearch={true}
  searchPlaceholder="Find a template..."
  onSearch={(query) => console.log('Searching:', query)}
  onSelect={handleSelect}
/>
```

## Custom Rendering

### Custom Template Card

```tsx
<TemplateGallery
  renderTemplate={(template, isSelected) => (
    <CustomTemplateCard
      template={template}
      selected={isSelected}
      onPreview={() => openPreview(template)}
    />
  )}
  onSelect={handleSelect}
/>
```

### Custom Empty State

```tsx
<TemplateGallery
  emptyState={
    <div className="text-center py-12">
      <p>No templates found</p>
      <button onClick={clearFilters}>Clear filters</button>
    </div>
  }
  onSelect={handleSelect}
/>
```

## Layout Options

### Grid Columns

```tsx
// Responsive columns
<TemplateGallery
  columns={{
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  }}
  onSelect={handleSelect}
/>
```

### Card Size

```tsx
<TemplateGallery
  cardSize="large" // 'small' | 'medium' | 'large'
  onSelect={handleSelect}
/>
```

## Loading States

```tsx
<TemplateGallery
  loading={isLoading}
  loadingPlaceholder={<TemplateSkeleton count={6} />}
  onSelect={handleSelect}
/>
```

## Pagination

```tsx
<TemplateGallery
  pagination={{
    enabled: true,
    pageSize: 12,
    showPageNumbers: true
  }}
  onPageChange={(page) => fetchTemplates(page)}
  onSelect={handleSelect}
/>
```

## Styling

```tsx
<TemplateGallery
  className="my-gallery"
  cardClassName="rounded-xl shadow-lg"
  selectedClassName="ring-2 ring-primary"
  onSelect={handleSelect}
/>
```
