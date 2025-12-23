# Templates

Stargate includes 50+ professional templates across industries.

## Template Categories

### Business & Corporate
- Consulting firms
- Law offices
- Financial services
- Real estate agencies

### Creative & Design
- Photography studios
- Design agencies
- Architecture firms
- Art galleries

### Food & Hospitality
- Restaurants & cafés
- Hotels & resorts
- Catering services
- Food delivery

### Technology & SaaS
- Software products
- Tech startups
- IT services
- Cloud platforms

### E-commerce
- Fashion & apparel
- Electronics
- Home goods
- Specialty products

### Personal & Portfolio
- Personal brands
- Freelancer portfolios
- Resume sites
- Blogs

## Using Templates

### Browsing Templates

Navigate to **Templates** in the sidebar to browse:

```typescript
// Filter options
interface TemplateFilters {
  category: string;
  style: 'modern' | 'classic' | 'minimal' | 'bold';
  pageCount: number;
  features: string[];
}
```

### Template Preview

Click any template to see:
- Full-page preview
- Mobile/tablet views
- Included sections
- Customization options

### Applying a Template

1. Click **Use Template**
2. Enter your project name
3. Customize with the wizard or editor
4. Save and preview

## Template Structure

Each template includes:

```
template/
├── index.html          # Main HTML structure
├── styles/
│   └── main.css        # Template-specific styles
├── sections/
│   ├── hero.html       # Hero section
│   ├── features.html   # Features section
│   └── contact.html    # Contact section
├── config.json         # Template configuration
└── thumbnail.png       # Preview image
```

### Template Config

```json
{
  "name": "Modern SaaS",
  "category": "technology",
  "style": "modern",
  "sections": ["hero", "features", "pricing", "testimonials", "cta", "footer"],
  "colorScheme": ["#6366f1", "#4f46e5", "#1e1b4b"],
  "fonts": ["Inter", "system-ui"]
}
```

## Customizing Templates

### Via Visual Editor

1. Open project in visual editor
2. Click any section to edit
3. Modify text, images, colors
4. Drag to reorder sections

### Via Merlin Chat

Ask Merlin to modify templates:
- "Change the hero background to dark blue"
- "Add a team section after features"
- "Remove the testimonials section"

### Via Code

For advanced users, edit template HTML directly:

```html
<!-- Custom section -->
<section class="py-20 bg-gradient-to-r from-indigo-500 to-purple-600">
  <div class="container mx-auto">
    <h2 class="text-4xl font-bold text-white">Custom Section</h2>
  </div>
</section>
```

## Creating Custom Templates

### Step 1: Create Structure

```bash
mkdir templates/my-template
cd templates/my-template
```

### Step 2: Define Sections

Create HTML files for each section with Tailwind classes.

### Step 3: Add Config

```json
{
  "name": "My Custom Template",
  "category": "custom",
  "author": "Your Name",
  "sections": ["hero", "about", "contact"]
}
```

### Step 4: Register Template

Add to `data/templates/index.json` to make it available in the gallery.

## Template Best Practices

1. **Use semantic HTML** - Proper heading hierarchy
2. **Include accessibility** - ARIA labels, alt text
3. **Optimize images** - Use WebP, lazy loading
4. **Mobile-first** - Design for mobile, scale up
5. **Consistent spacing** - Use Tailwind spacing scale
