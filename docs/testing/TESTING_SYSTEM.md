# Automated Testing System

## Overview
This project now has an automated testing system similar to Replit's live testing feature. It continuously tests the investigation endpoint and provides visual feedback on each step.

## Test Scripts

### 1. `test-automated.ps1` - Auto-Retry Testing
Runs the investigation test with automatic retry on failure.

**Usage:**
```powershell
.\test-automated.ps1
```

**Features:**
- Auto-retry up to 3 times
- Detailed error reporting
- Success/failure validation

### 2. `test-visual.ps1` - Visual Step-by-Step Testing
Shows each step as it executes, similar to Replit's live testing where you can see the cursor move through each function.

**Usage:**
```powershell
.\test-visual.ps1
```

**Watch Mode (Continuous):**
```powershell
.\test-visual.ps1 -Watch
```

**Features:**
- Visual step-by-step execution
- Real-time status updates
- Color-coded results (✅ success, ❌ error, ⏳ running)
- Shows exactly what's happening at each stage

### 3. `test-continuous.ps1` - Continuous Monitoring
Runs tests continuously at regular intervals, like Replit's live testing that keeps validating.

**Usage:**
```powershell
.\test-continuous.ps1
```

**Options:**
- `-IntervalSeconds 30` - Set test interval (default: 30 seconds)
- `-StopOnFailure` - Stop when a test fails

**Features:**
- Continuous testing
- Test statistics (passed/failed counts)
- Automatic retry on failure

## VS Code Tasks

You can also run tests from VS Code:

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select:
   - 🧪 Run Automated Test
   - 👁️ Run Visual Test
   - 🔄 Run Continuous Tests

## What Gets Tested

1. **Server Health** - Verifies server is running
2. **Investigation Endpoint** - Tests the full investigation flow
3. **SSE Messages** - Validates all progress messages are received
4. **Complete Message** - Ensures investigation completes successfully
5. **Error Handling** - Checks for any error messages

## Success Criteria

A test passes when:
- ✅ At least 3 messages received
- ✅ Complete message received
- ✅ No error messages
- ✅ All stages progress correctly

## When Tests Fail

The system will:
1. Show detailed error information
2. Retry automatically (if configured)
3. Provide investigation steps:
   - Check server console for [STEP X] logs
   - Check server console for [ROUTE] logs
   - Look for errors in server output
   - Verify server is running latest code

## Integration with Development

The testing system is designed to:
- Run automatically when you open the project
- Provide immediate feedback on changes
- Help identify issues quickly
- Give you full control to investigate failures

This is similar to Replit's live testing where you can see exactly what's happening step-by-step and the system automatically validates your code.

