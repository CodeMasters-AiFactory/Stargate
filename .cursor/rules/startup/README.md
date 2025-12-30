# StargatePortal Startup Rules

This folder contains automated startup rules that execute when the project is opened.

## Execution Order

1. **01-environment-check.md** - Verify environment is ready
2. **02-start-servers.md** - Start all development servers
3. **03-verify-servers.md** - Verify everything is running

## Quick Start Command

For manual execution, run:
```bash
npm run dev
```

Or use the PowerShell script:
```powershell
.\scripts\startup.ps1
```

## What Gets Started

| Service | Port | Description |
|---------|------|-------------|
| Express Server | 5000 | Main API + Frontend |
| Vite HMR | 5173 | Hot Module Replacement |
| PostgreSQL | 5432 | Database (if configured) |
| Redis | 6379 | Cache (if configured) |

## Automatic Behavior

When Cursor opens this project, the AI assistant should:

1. Read these startup rules
2. Check if dev servers are already running
3. If not running, offer to start them
4. Verify all services are healthy
5. Report status to developer

## Customization

Edit individual rule files to customize behavior:
- Add new checks to `01-environment-check.md`
- Modify server startup in `02-start-servers.md`
- Add new verification steps to `03-verify-servers.md`

## Troubleshooting

### Nothing Starts Automatically
- Ensure `.cursor/rules/` folder exists
- Check that files are readable
- Verify Node.js 20+ is installed

### Port Conflicts
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 5000 (Linux/Mac)
lsof -i :5000
kill -9 <PID>
```

### Missing Dependencies
```bash
npm install
```
