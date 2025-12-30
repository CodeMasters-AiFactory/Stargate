# StargatePortal Master Rules

> These rules are automatically loaded when the project is opened in Cursor.

## Project Overview

StargatePortal is a full-stack, AI-powered web development platform featuring:
- React 18 frontend with TypeScript and Vite
- Express.js backend with multi-agent AI system
- PostgreSQL database with Drizzle ORM
- Real-time WebSocket communication
- Docker containerization support

## Critical Configuration

### Ports
| Port | Service | Purpose |
|------|---------|---------|
| 5000 | Express Server | Main API + Frontend serving |
| 5173 | Vite HMR | Hot Module Replacement (dev only) |
| 5432 | PostgreSQL | Database |
| 6379 | Redis | Caching/Sessions |
| 9229 | Node Debugger | Debug mode |

### Required Environment Variables
Minimum required in `.env`:
```
NODE_ENV=development
PORT=5000
SESSION_SECRET=<32-char-random-string>
ENCRYPTION_KEY=<32-char-random-string>
```

For AI features, ensure these are set:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

## Project Structure Rules

### Frontend (client/)
- All React components in `client/src/components/`
- Custom hooks in `client/src/hooks/`
- Pages in `client/src/pages/`
- Use shadcn/ui components from `@/components/ui/`
- TanStack Query for data fetching
- Tailwind CSS for styling

### Backend (server/)
- API routes in `server/routes/`
- AI agents in `server/agents/`
- Business logic in `server/services/`
- Database operations use Drizzle ORM
- Schema defined in `shared/schema.ts`

### Shared (shared/)
- Database schema: `shared/schema.ts`
- Memory schema: `shared/memorySchema.ts`
- Types shared between client and server

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Prefer interfaces over type aliases for objects
- Use proper return types on functions

### React
- Functional components only
- Use custom hooks for reusable logic
- Memoize expensive computations
- Proper error boundaries

### API
- RESTful endpoints
- Consistent error response format
- Input validation on all endpoints
- Rate limiting on public endpoints

## Git Workflow
- Feature branches from `main`
- Conventional commit messages
- Run `npm run lint` before commits
- Run `npm run check` for type checking

## Testing
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Test files alongside source files (`.test.ts`)

## Startup Behavior
When this project opens, the following should happen automatically:
1. Check for required environment variables
2. Start development servers
3. Verify all services are running
4. Report status to developer

See `.cursor/rules/startup/` for detailed startup rules.
