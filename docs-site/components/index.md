# Component Library

Stargate Portal includes a comprehensive library of React components for building websites.

## Overview

All components are built with:
- **React 18** with hooks
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Radix UI** for accessibility
- **Framer Motion** for animations

## Core Components

### Visual Editor

The main editing canvas where users design their websites.

```tsx
import { VisualEditor } from '@/components/VisualEditor';

<VisualEditor
  project={project}
  onSave={handleSave}
  onChange={handleChange}
/>
```

See [Visual Editor](/components/visual-editor) for full documentation.

### Mobile Editor

Touch-optimized editor for mobile devices.

```tsx
import { MobileEditor } from '@/components/VisualEditor/MobileEditor';

<MobileEditor
  project={project}
  onGesture={handleGesture}
/>
```

See [Mobile Editor](/components/mobile-editor) for gestures and touch handling.

### Template Gallery

Browse and select templates from the library.

```tsx
import { TemplateGallery } from '@/components/TemplateGallery';

<TemplateGallery
  category="restaurant"
  onSelect={handleTemplateSelect}
/>
```

### AI Chat

Merlin assistant chat interface.

```tsx
import { MerlinChat } from '@/components/MerlinChat';

<MerlinChat
  projectId={projectId}
  onResponse={handleAIResponse}
/>
```

## Component Categories

### Layout
- `Section` - Page sections with variants
- `Container` - Content containers
- `Grid` - Responsive grid system
- `Flex` - Flexbox layouts

### Content
- `Heading` - H1-H6 headings
- `Text` - Paragraph text
- `Image` - Optimized images
- `Video` - Video embeds

### Interactive
- `Button` - Clickable buttons
- `Form` - Form containers
- `Input` - Form inputs
- `Select` - Dropdown selects

### Navigation
- `Navbar` - Site navigation
- `Footer` - Page footer
- `Breadcrumb` - Breadcrumb navigation
- `Pagination` - Page navigation

## Styling

Components use TailwindCSS utility classes. Override styles via:

```tsx
<Button className="bg-brand-500 hover:bg-brand-600">
  Custom Button
</Button>
```

Or use the theme system:

```tsx
<Button variant="primary" size="lg">
  Themed Button
</Button>
```
