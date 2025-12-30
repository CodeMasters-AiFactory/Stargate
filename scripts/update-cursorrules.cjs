const fs = require('fs');
const path = require('path');

const cursorrules = path.join(__dirname, '..', '.cursorrules');

let content = fs.readFileSync(cursorrules, 'utf-8');

const startupSection = `| **START** | Run startup sequence (start all dev servers) |

---

# ═══════════════════════════════════════════════════════════════════
# 00-STARTUP: AUTOMATIC PROJECT INITIALIZATION
# ═══════════════════════════════════════════════════════════════════

## On Project Open

When this project is opened in Cursor, AUTOMATICALLY:

1. **Check Environment** (see \`.cursor/rules/startup/01-environment-check.md\`)
   - Verify Node.js >= 20
   - Check \`.env\` exists (create from \`.env.example\` if missing)
   - Verify \`node_modules\` exists (run \`npm install\` if missing)

2. **Start Dev Servers** (see \`.cursor/rules/startup/02-start-servers.md\`)
   - Run \`npm run dev\` in background
   - This starts Express (port 5000) + Vite HMR (port 5173)

3. **Verify Running** (see \`.cursor/rules/startup/03-verify-servers.md\`)
   - Check http://localhost:5000 responds
   - Confirm all services healthy
   - Report status to developer

## Quick Startup Command

When user types **"START"**, execute:
\`\`\`powershell
.\\scripts\\startup.ps1
\`\`\`

Or manually:
\`\`\`bash
npm run dev
\`\`\`

## Startup Status Report

After startup, display:
\`\`\`
╔══════════════════════════════════════════════════════════════╗
║              StargatePortal Status                           ║
╠══════════════════════════════════════════════════════════════╣
║ Express Server  │ :5000  │ ✅ Running                        ║
║ Vite HMR        │ :5173  │ ✅ Running                        ║
║ Frontend        │ http://localhost:5000                      ║
╚══════════════════════════════════════════════════════════════╝
\`\`\`

## Additional Startup Rules

See \`.cursor/rules/startup/\` folder for detailed startup procedures.

---

# ═══════════════════════════════════════════════════════════════════
# 01-CORE: IDENTITY`;

const oldText = `| **CHECKPOINT** | Quick save with timestamp |

---

# ═══════════════════════════════════════════════════════════════════
# 01-CORE: IDENTITY`;

const newText = '| **CHECKPOINT** | Quick save with timestamp |\n' + startupSection;

if (content.includes('# 00-STARTUP')) {
  console.log('Startup section already exists');
  process.exit(0);
}

content = content.replace(oldText, newText);

fs.writeFileSync(cursorrules, content, 'utf-8');
console.log('Updated .cursorrules successfully');
