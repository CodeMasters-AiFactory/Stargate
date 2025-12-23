# Getting Started with Stargate Portal

This guide will walk you through setting up and using Stargate Portal for the first time.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **PostgreSQL** (optional for local dev) - SQLite is used by default

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/stargate-portal.git
cd stargate-portal
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (SQLite for development)
DATABASE_URL=file:./dev.db

# AI Services (Optional but recommended)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
LEONARDO_API_KEY=your-leonardo-key

# Google Search (for research features)
GOOGLE_SEARCH_API_KEY=your-google-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5000](http://localhost:5000).

## Creating Your First Website

### Using the Merlin Wizard

1. Click **"Launch Merlin Wizard"** on the homepage
2. Enter your business information
3. Select an industry and style
4. Let AI generate your website structure
5. Customize using the visual editor
6. Preview and deploy

### Manual Creation

1. Navigate to **Templates** in the sidebar
2. Browse or search for a template
3. Click **Use Template** to start editing
4. Customize content, colors, and layout
5. Save and preview your changes

## Understanding the Visual Editor

### Toolbar

| Tool | Description |
|------|-------------|
| Device Preview | Switch between mobile, tablet, desktop views |
| Undo/Redo | Revert or reapply changes |
| Zoom | Zoom in/out of the canvas |
| Grid | Toggle alignment grid |

### Component Palette

Drag components from the left panel onto your canvas:

- **Layout**: Sections, containers, grids
- **Content**: Text, headings, images, videos
- **Interactive**: Buttons, forms, accordions
- **Media**: Image galleries, carousels, videos
- **Navigation**: Menus, breadcrumbs, pagination

### Property Panel

Select any component to edit its properties:

- **Style**: Colors, fonts, spacing
- **Content**: Text, images, links
- **Behavior**: Animations, interactions
- **Responsive**: Breakpoint-specific settings

## AI Agents

Stargate includes 10 specialized AI agents:

| Agent | Role |
|-------|------|
| NOVA | Project coordination and orchestration |
| ATLAS | Technical architecture decisions |
| SAGE | Content strategy and writing |
| ORACLE | Analytics and insights |
| SCOUT | Research and competitive analysis |
| CIPHER | Security and best practices |
| PHOENIX | Recovery and troubleshooting |
| AEGIS | Quality assurance |
| TEMPO | Performance optimization |
| GUARDIAN | Accessibility compliance |

Access agents through the AI panel in the editor.

## Deployment

### Deploy to Azure

```bash
npm run build
npm run deploy:azure
```

### Deploy to Vercel

```bash
npm run build
vercel deploy
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod
```

## Next Steps

- [API Reference](./api/README.md) - Integrate with external services
- [Components Guide](./components/README.md) - Deep dive into components
- [Templates](./templates/README.md) - Create custom templates
- [Advanced Features](./advanced/README.md) - Power user features

## Getting Help

- Check the [FAQ](./faq.md)
- Search [GitHub Issues](https://github.com/yourusername/stargate-portal/issues)
- Join our [Discord](https://discord.gg/stargate)
