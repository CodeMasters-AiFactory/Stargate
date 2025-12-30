# Startup Rule: Start Development Servers

> Priority: 2 (After environment check)
> Trigger: After 01-environment-check passes

## Purpose
Start all required development servers for StargatePortal.

## Primary Startup Script (RECOMMENDED)

Use the comprehensive startup script:
```powershell
.\scripts\start-and-verify.ps1
```

This script:
- Checks database connection (PostgreSQL/Neon)
- Kills any stuck processes on port 5000
- Starts Express API server on port 5000
- Starts Vite dev server on port 5173
- Verifies all services are healthy
- Writes status to `STARTUP_STATUS.json`

## Alternative Methods

### Quick Start
```bash
npm run dev
```

### Docker Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Expected Output

### Successful Start
```
[server] Server running on port 5000
[vite] Dev server running at http://localhost:5173
[vite] ready in XXXms
```

### Common Issues

#### Port 5000 Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

#### npm run dev Fails
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run dev
```

## Background Process
The dev server runs in the background. To monitor:
```bash
# Check if running
curl http://localhost:5000/api/health

# View logs
# Logs appear in the terminal where npm run dev was executed
```

## Success Criteria
- [ ] npm run dev executed without errors
- [ ] No port conflicts
- [ ] Process started successfully

## Next Step
Proceed to `03-verify-servers.md`
