# Startup Rule: Environment Check

> Priority: 1 (First to run)
> Trigger: On project open

## Purpose
Verify all required environment variables and dependencies are in place before starting servers.

## Checks to Perform

### 1. Node.js Version
```bash
node --version
# Must be >= 20.0.0
```

### 2. Environment File
Check `.env` exists and contains required variables:
- `NODE_ENV`
- `PORT`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`

### 3. Optional API Keys (warn if missing)
- `OPENAI_API_KEY` - Required for OpenAI features
- `ANTHROPIC_API_KEY` - Required for Claude features
- `GEMINI_API_KEY` - Required for Gemini features

### 4. Dependencies
```bash
# Check if node_modules exists
ls node_modules/.package-lock.json
# If missing, run: npm install
```

### 5. Database Connection (if DATABASE_URL is set)
```bash
npm run db:push --dry-run
```

## Actions

### If .env is missing:
```bash
cp .env.example .env
echo "Created .env from template - please configure API keys"
```

### If node_modules is missing:
```bash
npm install
```

### If Node.js version is too old:
```
ERROR: Node.js 20+ required. Current version: X.X.X
Please update Node.js before continuing.
```

## Success Criteria
- [ ] Node.js >= 20.0.0
- [ ] .env file exists
- [ ] Required env vars set
- [ ] node_modules exists
- [ ] No critical errors

## Next Step
Proceed to `02-start-servers.md`
