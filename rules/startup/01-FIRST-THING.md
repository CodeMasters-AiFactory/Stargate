# 🚀 FIRST THING - READ THIS BEFORE ANYTHING

## MANDATORY STARTUP SEQUENCE

Every time you start a new session, execute these steps IN ORDER:

### Step 1: Read All Rules
```
Read ALL files in C:\CURSOR PROJECTS\StargatePortal\rules\ (all subfolders)
```

### Step 2: Check Progress
```
Read C:\CURSOR PROJECTS\StargatePortal\claude-progress.txt
Read C:\CURSOR PROJECTS\StargatePortal\feature_list.json
```

### Step 3: Check Chat History
```
Read the latest file in C:\CURSOR PROJECTS\StargatePortal\chat-history\
```

### Step 4: Verify Server Status
```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
curl http://localhost:5000/api/health
```

### Step 5: Check Linear for Tasks
```
Use Linear MCP to check COD team tasks
```

### Step 6: Report Status to User
Tell the user:
- What was the last thing worked on
- Current project status
- Any pending tasks
- Recommended next action

---

## CRITICAL REMINDERS

1. **Project Location**: `C:\CURSOR PROJECTS\StargatePortal` (NOT C:\StargatePortal)
2. **Azure URL**: https://stargate-linux.azurewebsites.net/
3. **Local URL**: http://localhost:5000
4. **Use PowerShell syntax**: semicolons (;) not && for command chaining
5. **Save chat history** at end of each session

---

## DO NOT

- ❌ Start coding without reading rules
- ❌ Assume you know the current state
- ❌ Make changes without checking what exists
- ❌ Forget to save chat history
- ❌ Skip the Linear task check
