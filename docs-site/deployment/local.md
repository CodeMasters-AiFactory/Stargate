# Local Development

Set up Stargate Portal for local development.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## Quick Setup

```bash
# Clone repository
git clone https://github.com/CodeMasters-AiFactory/Stargate.git
cd Stargate

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## Environment Configuration

Create `.env` in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (SQLite for local development)
DATABASE_URL=file:./dev.db

# AI Services (get your own keys)
ANTHROPIC_API_KEY=sk-ant-...
LEONARDO_AI_API_KEY=...

# Optional: Google Search API for research features
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...

# Session (use any random string locally)
SESSION_SECRET=local-dev-secret-key
```

## Getting API Keys

### Anthropic (Claude)
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Generate API key
4. Add to `.env` as `ANTHROPIC_API_KEY`

### Leonardo AI
1. Visit [app.leonardo.ai](https://app.leonardo.ai)
2. Go to Settings → API
3. Generate token
4. Add to `.env` as `LEONARDO_AI_API_KEY`

## Project Structure

```
Stargate/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── index.html
├── server/           # Express backend
│   ├── agents/       # AI agents
│   ├── routes/       # API routes
│   └── index.ts
├── shared/           # Shared types
├── docs-site/        # Documentation
└── website_projects/ # Generated websites
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint code |
| `npm run typecheck` | TypeScript check |

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests in watch mode
npm run test:watch
```

### Making Changes

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Run tests: `npm run test`
5. Commit and push

### Database Reset

SQLite database can be reset:

```bash
rm dev.db
npm run dev  # Recreates database
```

## Debugging

### VS Code Configuration

`.vscode/launch.json` is pre-configured for debugging.

Press F5 to start debugging with breakpoints.

### Server Logs

Logs are written to:
- Console (development)
- `logs/` directory (production)

### Browser DevTools

- React DevTools extension
- Network tab for API calls
- Console for errors

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### Dependencies Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
npm run typecheck
```

### Database Errors

```bash
rm dev.db
npm run dev
```
