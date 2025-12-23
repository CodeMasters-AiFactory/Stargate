# Environment Setup Rules

## Project Structure
```
C:\CURSOR PROJECTS\StargatePortal\
├── client/                 # React frontend (Vite + TypeScript)
├── server/                 # Express backend
│   └── engines/
│       └── merlin8/        # Merlin 8.0 AI Engine
│           ├── orchestrator.ts
│           ├── industryDNA.ts
│           ├── htmlGenerator.ts
│           └── leonardoIntegration.ts
├── public/
│   └── generated/          # Generated websites stored here
├── rules/                  # All rule documents
├── chat-history/           # Session transcripts
├── init.ps1                # PowerShell startup script
└── claude-progress.txt     # Progress tracker
```

## Startup Commands
```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
npm run dev
```

## API Endpoints
- `GET /api/health` - Server health check
- `GET /api/merlin8/industries` - List all industries
- `GET /api/merlin8/industry/:id` - Get industry DNA
- `POST /api/merlin8/generate` - Generate website (SSE)
- `POST /api/merlin8/generate-sync` - Generate website (JSON)

## Key Files to Know
| File | Purpose |
|------|---------|
| `industryDNA.ts` | All industry profiles (colors, fonts, styles) |
| `orchestrator.ts` | Main generation logic |
| `htmlGenerator.ts` | Generates HTML/CSS output |
| `leonardoIntegration.ts` | Leonardo AI image generation |
| `QuickIntake.tsx` | Client intake form |
| `GeneratingProgress.tsx` | Progress display during generation |

## Environment Variables Required
- `LEONARDO_API_KEY` - For AI image generation
- Database connection (when PostgreSQL is set up)
