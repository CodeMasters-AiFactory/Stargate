# 24/7 Agent Running Rules (Anthropic Long-Running Agents Pattern)

## Architecture Overview

Based on Anthropic's research "Effective harnesses for long-running agents" (Nov 2025).

### Two-Agent Pattern
1. **Initializer Agent**: Sets up environment, creates task list, prepares context
2. **Coding Agent**: Executes ONE task, tests, commits, updates progress, ends

### Key Files
- `init.ps1` / `init.sh` - Environment bootstrap
- `claude-progress.txt` - Persistent context across sessions
- `feature_list.json` - Task tracking with pass/fail status
- `chat-history/` - All session transcripts

---

## Session Workflow

### Starting a Session
1. Run `init.ps1` (PowerShell) or `init.sh` (Bash)
2. Read `claude-progress.txt` for context
3. Read `feature_list.json` for task status
4. Read latest chat history file
5. Pick ONE task with `passes: false`
6. Execute that single task

### During a Session
- Focus on ONE feature only
- Test thoroughly before marking complete
- Commit with descriptive message
- Update progress files

### Ending a Session
1. Update `feature_list.json` - set `passes: true` if successful
2. Update `claude-progress.txt` with session summary
3. Git commit all changes
4. Save chat transcript to `chat-history/`

---

## Progress File Format (claude-progress.txt)
```
=== SESSION LOG ===
Date: YYYY-MM-DD HH:MM
Task: [task name]
Status: [COMPLETED/FAILED/IN_PROGRESS]
Notes: [what was done]
Next: [what to do next]
==================
```

## Feature List Format (feature_list.json)
```json
{
  "features": [
    {
      "id": "industry-accounting",
      "name": "Accounting Industry DNA",
      "passes": false,
      "completedDate": null,
      "notes": ""
    }
  ]
}
```

---

## Critical Rules

1. **ONE TASK PER SESSION** - Complete it fully before moving on
2. **ALWAYS TEST** - Never mark complete without verification
3. **ALWAYS COMMIT** - Never leave uncommitted work
4. **ALWAYS UPDATE PROGRESS** - Next session needs this info
5. **SAVE CHAT HISTORY** - Continuity requires transcripts
