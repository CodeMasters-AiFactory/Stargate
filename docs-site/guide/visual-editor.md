# Visual Editor

The drag-and-drop visual editor for designing websites without code.

## Editor Overview

The visual editor provides:
- Real-time preview while editing
- Drag-and-drop component placement
- Property panel for fine-tuning
- Responsive breakpoint editing
- Undo/redo history

## Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar: Save | Preview | Undo | Redo | Device | Settings │
├─────────────┬───────────────────────────────┬───────────────┤
│             │                               │               │
│  Component  │                               │  Properties   │
│   Library   │         Live Canvas           │    Panel      │
│             │                               │               │
│  - Sections │                               │  - Styles     │
│  - Content  │                               │  - Layout     │
│  - Media    │                               │  - Content    │
│             │                               │               │
└─────────────┴───────────────────────────────┴───────────────┘
```

## Basic Operations

### Adding Components

1. Open Component Library (left panel)
2. Drag component onto canvas
3. Drop in desired location
4. Component snaps to grid

### Selecting Elements

- **Click** to select
- **Double-click** to edit text inline
- **Shift+Click** to multi-select
- **Cmd/Ctrl+A** to select all

### Moving Elements

- Drag to reposition
- Use arrow keys for fine movement
- Hold Shift for constrained movement

### Editing Properties

1. Select an element
2. Properties panel shows on right
3. Modify settings:
   - **Content** - Text, images, links
   - **Style** - Colors, fonts, spacing
   - **Layout** - Width, alignment, display

## Component Types

### Sections
Pre-built page sections:
- Hero banners
- Feature grids
- Testimonials
- Pricing tables
- Contact forms
- Footers

### Content
- Headings (H1-H6)
- Paragraphs
- Lists
- Blockquotes
- Code blocks

### Media
- Images
- Videos
- Icons
- Background images

### Interactive
- Buttons
- Links
- Forms
- Modals

## Styling Options

### Colors

```css
/* Use theme variables */
--color-primary: #6366f1;
--color-secondary: #4f46e5;
--color-accent: #f59e0b;
```

Or pick from:
- Color palette picker
- HEX/RGB input
- Eyedropper tool

### Typography

- Font family selection
- Size (responsive scales)
- Weight (light to bold)
- Line height
- Letter spacing

### Spacing

- Margin (external)
- Padding (internal)
- Gap (between children)

Use consistent scales: 4, 8, 12, 16, 24, 32, 48, 64px

### Effects

- Shadows (sm, md, lg, xl)
- Border radius
- Opacity
- Transitions
- Hover states

## Responsive Design

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 640px | Phones |
| Tablet | 640-1024px | Tablets |
| Desktop | > 1024px | Laptops/Desktops |

### Responsive Editing

1. Click device icon in toolbar
2. Select breakpoint
3. Make changes for that screen size
4. Changes apply only to that breakpoint

### Preview Modes

- Desktop view (default)
- Tablet portrait/landscape
- Mobile portrait/landscape
- Full responsive preview

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Cmd/Ctrl + S |
| Undo | Cmd/Ctrl + Z |
| Redo | Cmd/Ctrl + Shift + Z |
| Delete | Backspace |
| Duplicate | Cmd/Ctrl + D |
| Preview | Cmd/Ctrl + P |
| Select All | Cmd/Ctrl + A |

## Tips & Best Practices

1. **Start with sections** - Build page structure first
2. **Use the grid** - Align elements consistently
3. **Mobile-first** - Design for mobile, then desktop
4. **Preview often** - Check your changes frequently
5. **Name your layers** - Keep components organized
