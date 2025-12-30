# 0 - Quick Start & Rules

## Quick Commands

| Command | Action |
|---------|--------|
| **0** | Confirm rules loaded, ready to work |
| **2** | Run UI Deep Smoke Test (comprehensive) |

## Files

| File | Description |
|------|-------------|
| `RULES.md` | Master rules file (single source of truth) |
| `README.md` | This file |

## What Happens

### When you type "0":
Claude confirms all rules are loaded and ready.

### When you type "2":
Claude runs a comprehensive UI smoke test:
- Tests ALL user journeys
- Checks 7 categories (Functional, Visual, UX, Data, Technical, Performance, Accessibility)
- FIXES issues found (doesn't just report)
- Produces final report

## Rules Summary (5 Core Rules)

1. **AUTONOMY** - Execute immediately, never ask
2. **VERIFY WITH BROWSER** - Screenshots, not "please refresh"
3. **FIX ERRORS IMMEDIATELY** - Don't just report
4. **PHASE COMPLEX TASKS** - Plan → Implement → Verify
5. **HANDLE CACHE PROGRAMMATICALLY** - Never ask user to clear cache

## Frozen Stack

- Node.js + npm
- React 18 + Vite 5 + TypeScript 5
- Express + Drizzle ORM + PostgreSQL
- TailwindCSS + shadcn/ui

## Active Services

- ✅ Merlin Website Wizard (ONLY)
- ❌ All others removed

---

**Version 6.0**
