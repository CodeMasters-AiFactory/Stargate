# Smoke Test Evidence Collection

This directory stores evidence collected during smoke tests.

## Structure

```
smoke-test-evidence/
├── README.md (this file)
├── screenshots/          # Visual evidence
│   ├── before-fixes/
│   └── after-fixes/
├── logs/                 # Console and server logs
│   ├── console/
│   └── server/
├── network/              # Network request captures
│   └── api-calls/
└── reports/              # Test reports
    └── [date]-[feature]/
```

## Usage

When running smoke tests:
1. Take screenshots at key stages (before/after fixes)
2. Capture console logs for errors
3. Save network requests for failed API calls
4. Store test reports with timestamps

## Naming Convention

- Screenshots: `[feature]-[stage]-[timestamp].png`
  - Example: `merlin-wizard-generation-before-20250120-094500.png`
  
- Logs: `[feature]-[type]-[timestamp].log`
  - Example: `merlin-wizard-console-20250120-094500.log`
  
- Reports: `[date]-[feature]-smoke-test.md`
  - Example: `20250120-merlin-wizard-smoke-test.md`

## Cleanup

- Keep evidence for last 10 smoke tests
- Archive older evidence to `archive/` folder
- Remove evidence older than 30 days

