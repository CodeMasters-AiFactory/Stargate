# 🔍 Website Generation Debugger - User Guide

## Overview

The Website Generation Debugger is a visual tool that shows you **exactly** what happens during website generation, step-by-step, phase-by-phase. You can pause at any step, verify the results, and only proceed when you're ready.

## Features

✅ **Real-time Visualization** - See each phase and step as it happens  
✅ **Pause/Resume** - Pause at any step to verify results  
✅ **Error Detection** - Errors are highlighted immediately  
✅ **Step Details** - View data generated at each step  
✅ **Progress Tracking** - Accurate progress (only shows 100% when truly complete)  
✅ **1-Page Website** - Generates a simple 1-page website for testing  

## How to Use

### Step 1: Open the Debugger

1. Navigate to your IDE
2. Look for **"Website Generation Debugger"** in the components
3. Or add it to your routing:
   ```tsx
   import { WebsiteGenerationDebugger } from '@/components/IDE/WebsiteGenerationDebugger';
   
   <WebsiteGenerationDebugger 
     onComplete={(result) => console.log('Done!', result)}
     onError={(error) => console.error('Error:', error)}
   />
   ```

### Step 2: Start Generation

1. Click **"Start Generation"** button
2. The debugger will begin generating a 1-page test website
3. You'll see phases and steps appear in real-time

### Step 3: Monitor Progress

**Phases** (10 total):
1. ✅ Setup & Initialization
2. ✅ Design Strategy
3. ✅ Layout Generation
4. ✅ Style System
5. ✅ Content Generation
6. ✅ Image Planning & Generation
7. ✅ SEO & Optimization
8. ✅ Code Generation
9. ✅ Quality Assessment
10. ✅ Finalization

**Each Phase Contains Steps:**
- Click on a phase to expand and see its steps
- Each step shows:
  - ✅ Status (pending/running/completed/error)
  - ⏱️ Duration
  - 📊 Data generated
  - ❌ Errors (if any)

### Step 4: Pause/Resume

- **Pause**: Click "Pause" button to pause at the current step
- **Resume**: Click "Resume" to continue
- **Stop**: Click "Stop" to abort generation

### Step 5: Verify Steps

1. **Expand a Phase**: Click on a phase header to see its steps
2. **View Step Data**: Click "Show Data" on any completed step to see what was generated
3. **Check Errors**: Errors are highlighted in red with details
4. **Verify Progress**: Progress bar shows accurate completion percentage

### Step 6: Completion

- Progress shows **100%** only when:
  - ✅ All phases completed
  - ✅ All steps completed
  - ✅ Files saved
  - ✅ Result confirmed

## Visual Indicators

### Phase Status
- ⚪ **Pending** - Not started yet
- 🔵 **Running** - Currently executing
- ✅ **Completed** - Finished successfully
- ❌ **Error** - Failed with errors

### Step Status
- ⚪ **Pending** - Waiting to run
- 🔵 **Running** - Currently executing (spinning icon)
- ✅ **Completed** - Finished successfully (green checkmark)
- ❌ **Error** - Failed (red X)

### Progress Bar
- Shows **actual progress** based on completed steps
- Only reaches 100% when **truly complete**
- Updates in real-time

## Error Handling

**Errors are displayed:**
1. **In the Errors Alert** at the top
2. **On the specific step** that failed
3. **In the phase** containing the error

**Error Format:**
```
Phase Name → Step Name: Error message
```

## Example Flow

```
1. Click "Start Generation"
   ↓
2. Phase 1: Setup & Initialization
   - Step 1: Convert Requirements ✅
   - Step 2: Create Directory ✅
   ↓
3. Phase 2: Design Strategy
   - Step 3: Generate Design Strategy ✅
   - Step 4: Generate Design Context ✅
   ↓
4. Phase 3: Layout Generation
   - Step 5: Generate Section Plan ✅
   - Step 6: Generate Layout Structure ✅
   ↓
... (continues through all phases)
   ↓
10. Phase 10: Finalization
   - Step N: Convert Format ✅
   - Step N+1: Save Files ✅
   ↓
✅ Generation Complete! (100%)
```

## API Endpoints

### Start Debug Generation
```
POST /api/website-builder/generate-debug
Body: {
  "requirements": { ... },
  "debugMode": true,
  "pauseBetweenSteps": true
}
```

### Pause Generation
```
POST /api/website-builder/debug-pause
Body: {
  "sessionId": "optional"
}
```

### Resume Generation
```
POST /api/website-builder/debug-resume
Body: {
  "sessionId": "optional"
}
```

## Troubleshooting

**Problem**: Steps not showing
- **Solution**: Make sure the phase is expanded (click on phase header)

**Problem**: Pause not working
- **Solution**: Check browser console for errors, ensure API endpoints are accessible

**Problem**: Progress stuck
- **Solution**: Check for errors in the Errors Alert, verify server is running

**Problem**: Generation stops unexpectedly
- **Solution**: Check server logs, look for errors in the Errors Alert

## Technical Details

- **Format**: Server-Sent Events (SSE)
- **Events**: `phase-start`, `phase-complete`, `step-start`, `step-complete`, `step-error`, `progress`, `complete`, `error`
- **Pause Mechanism**: Global pause state with session management
- **Progress Calculation**: `(completedSteps / totalSteps) * 100`

---

**Status**: ✅ Ready to use  
**Version**: 1.0.0

