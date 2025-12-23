# Stargate Portal Documentation

Welcome to the official documentation for Stargate Portal - an AI-powered website builder with 10 specialized AI agents.

## Quick Links

- [Getting Started](./getting-started.md)
- [API Reference](./api/README.md)
- [Components](./components/README.md)
- [AI Agents](./agents/README.md)
- [Templates](./templates/README.md)
- [Deployment](./deployment.md)

## Overview

Stargate Portal is a comprehensive website building platform that combines:

- **Visual Editor**: Drag-and-drop interface with responsive design tools
- **AI Agents**: 10 specialized AI agents for different aspects of web development
- **Template System**: 7,280+ templates across 91 industries
- **Leonardo AI Integration**: AI-powered image generation
- **Google Search Integration**: Research and content generation

## System Requirements

- Node.js 18.x or higher
- PostgreSQL 14+ (for production)
- 4GB RAM minimum
- Modern browser (Chrome, Firefox, Safari, Edge)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/stargate-portal.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit [http://localhost:5000](http://localhost:5000) to see the application.

## Architecture

```
stargate-portal/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities
├── server/          # Express backend
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   └── middleware/  # Express middleware
├── shared/          # Shared types
└── docs/            # Documentation
```

## Support

- [GitHub Issues](https://github.com/yourusername/stargate-portal/issues)
- [Discord Community](https://discord.gg/stargate)
- Email: support@stargate.dev

## License

MIT License - See [LICENSE](../LICENSE) for details.
