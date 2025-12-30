# STARTUP SECTION TO ADD TO .cursorrules

> Add this section to .cursorrules after the QUICK COMMANDS table, before the IDENTITY section.

## Add to QUICK COMMANDS table:

```
| **START** | Run startup sequence (start all dev servers) |
```

## Add this new section after QUICK COMMANDS:

```markdown
---

# ═══════════════════════════════════════════════════════════════════
# 00-STARTUP: AUTOMATIC PROJECT INITIALIZATION
# ═══════════════════════════════════════════════════════════════════

## On Project Open

When this project is opened in Cursor, AUTOMATICALLY:

1. **Check Environment** (see `.cursor/rules/startup/01-environment-check.md`)
   - Verify Node.js >= 20
   - Check `.env` exists (create from `.env.example` if missing)
   - Verify `node_modules` exists (run `npm install` if missing)

2. **Start Dev Servers** (see `.cursor/rules/startup/02-start-servers.md`)
   - Run `npm run dev` in background
   - This starts Express (port 5000) + Vite HMR (port 5173)

3. **Verify Running** (see `.cursor/rules/startup/03-verify-servers.md`)
   - Check http://localhost:5000 responds
   - Confirm all services healthy
   - Report status to developer

## Quick Startup Command

When user types **"START"**, execute:
```powershell
.\scripts\startup.ps1
```

Or manually:
```bash
npm run dev
```

## Startup Status Report

After startup, display:
```
╔══════════════════════════════════════════════════════════════╗
║              StargatePortal Status                           ║
╠══════════════════════════════════════════════════════════════╣
║ Express Server  │ :5000  │ ✅ Running                        ║
║ Vite HMR        │ :5173  │ ✅ Running                        ║
║ Frontend        │ http://localhost:5000                      ║
╚══════════════════════════════════════════════════════════════╝
```

## Additional Startup Rules

See `.cursor/rules/startup/` folder for detailed startup procedures:
- `README.md` - Overview
- `01-environment-check.md` - Environment verification
- `02-start-servers.md` - Server startup procedures
- `03-verify-servers.md` - Health checks and verification
```
