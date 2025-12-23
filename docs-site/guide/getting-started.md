# Getting Started

This guide will walk you through setting up and using Stargate Portal for the first time.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (optional) - SQLite is used by default for local development

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/CodeMasters-AiFactory/Stargate.git
cd Stargate
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

# AI Services
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

## Next Steps

- [Quick Start](/guide/quick-start) - Jump right in with examples
- [Core Concepts](/guide/core-concepts) - Understand the architecture
- [AI Features](/guide/merlin) - Learn about Merlin and AI agents
