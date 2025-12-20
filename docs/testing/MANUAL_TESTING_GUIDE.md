# Manual Testing Guide for Phases 1-4

## Quick Start

1. **Start the dev server** (if not running):

   ```bash
   npm run dev
   ```

2. **Open browser**: Navigate to http://localhost:5000

3. **Open Developer Tools**: Press F12 to open console

4. **Follow this guide** step by step

---

## Phase 1: Package Selection

### Step 1: Navigate to Wizard

- Click "Create Website" or navigate to wizard
- **Expected**: Package selection page loads
- **Check Console**: No red errors

### Step 2: Test Package Selection

- **Hover** over each package card (Starter, Professional, Enterprise)
- **Click** each package
- **Expected**:
  - Card highlights/selects smoothly
  - No "bouncing" or layout shifts
  - Selection persists
- **Check Console**: No errors on click

### Step 3: Continue to Phase 2

- Click "Continue" button
- **Expected**: Smooth transition to Phase 2
- **Check Console**: No errors

**✅ Phase 1 Complete if:**

- All packages selectable
- No UI glitches
- Navigation works

---

## Phase 2: Client Specification

### Step 1: Form Load

- **Expected**: Form loads with all fields visible
- **Check Console**: No errors

### Step 2: Test Validation

- **Test Required Fields**:
  - Try to submit without filling required fields
  - **Expected**: Error messages appear
  - Fill required fields
  - **Expected**: Errors clear

- **Test Business Name**:
  - Enter invalid characters
  - **Expected**: Validation error
  - Enter valid name
  - **Expected**: Error clears

- **Test Business Type**:
  - Select different types
  - **Expected**: Conditional questions appear/disappear
  - **Expected**: Package constraints apply (if Starter selected)

### Step 3: Fill Complete Form

- Fill all required fields:
  - Business Name: "Test Business"
  - Business Type: Select one
  - Target Audience: "Small business owners"
  - Add pages/features as needed
- **Expected**: All fields accept input

### Step 4: Test Auto-Save

- Fill form partially
- **Refresh page** (F5)
- **Expected**: Form data restored
- **Check localStorage**:
  - Open DevTools → Application → Local Storage
  - Look for `stargate-wizard-state`
  - **Expected**: Contains form data

### Step 5: Submit Form

- Click "Continue"
- **Expected**:
  - Validation passes
  - Navigates to Phase 3
  - No errors

**✅ Phase 2 Complete if:**

- Validation works
- Auto-save works
- Form submits correctly
- Navigation works

---

## Phase 3: Content Quality & Relevance

### Step 1: Auto-Start Check

- **Expected**: Investigation auto-starts when Phase 3 loads
- **Check UI**:
  - Progress bars visible
  - All 13 categories listed
  - Connection status indicator visible
- **Check Console**:
  - Look for `[Wizard] Initializing investigation progress`
  - Look for `[Wizard] Auto-starting investigation`

### Step 2: Connection Status Indicator

- **Look for status badge** in progress summary section
- **Expected**:
  - Shows "🟢 Connected" (green) during investigation
  - Updates in real-time
- **Test Tooltip**: Hover over status badge
- **Expected**: Tooltip shows connection details

### Step 3: Progress Updates

- **Watch progress bars**:
  - **Expected**: Bars update in real-time
  - **Expected**: Category status changes (pending → in-progress → complete)
- **Check progress summary**:
  - **Expected**: Shows "X / 13 categories" complete
  - **Expected**: Estimated time updates
- **Check Console**:
  - Look for `[PROGRESS]` messages
  - **Expected**: No errors

### Step 4: Activity Feed

- **Check activity feed**:
  - **Expected**: Activities appear in real-time
  - **Expected**: Icons correct (search, analysis, finding, check)
- **Test Filters**:
  - Click filter buttons (All, Search, Analysis, Finding, Check)
  - **Expected**: Activities filter correctly
- **Test Search**:
  - Type in search box
  - **Expected**: Activities filter by search term

### Step 5: Google Checks Display

- **Expand a category** (click to expand)
- **Check check scores**:
  - **Expected**: Scores display (0-100%)
  - **Expected**: Color coding (green ≥95%, red <95%)
  - **Expected**: Regenerate button for failed checks

### Step 6: Progress Persistence Test

- **Wait for some progress** (2-3 categories complete)
- **Refresh page** (F5)
- **Expected**:
  - Toast notification: "Saved Progress Found"
  - Progress bars show saved state
  - Investigation can resume
- **Check localStorage**:
  - DevTools → Application → Local Storage
  - Look for `stargate-investigation-progress`
  - **Expected**: Contains progress data

### Step 7: Error Handling Test (Optional)

- **If a category fails** (or simulate by stopping server):
  - **Expected**: Error message displays
  - **Expected**: Retry button appears
  - **Click Retry**:
    - **Expected**: Only failed category resets
    - **Expected**: Other categories remain complete
    - **Expected**: Toast notification appears

### Step 8: Auto-Advance

- **Wait for all 13 categories to complete**
- **Expected**:
  - Auto-advances to Phase 4
  - No manual navigation needed
  - Smooth transition

**✅ Phase 3 Complete if:**

- Auto-start works
- Connection status shows correctly
- Progress updates in real-time
- Activity feed works
- Progress persistence works
- Auto-advance works

---

## Phase 4: Keywords & Semantic SEO

### Step 1: Page Load

- **Expected**: Phase 4 loads after Phase 3 completes
- **Check Console**: No errors

### Step 2: Content Display

- **Expected**:
  - Keywords displayed
  - Semantic SEO recommendations shown
  - Data from Phase 3 investigation visible
  - Formatting correct

### Step 3: Navigation

- Click "Continue"
- **Expected**: Navigates to next phase
- **Check Console**: No errors

**✅ Phase 4 Complete if:**

- Page loads correctly
- Content displays
- Navigation works

---

## Cross-Phase Testing

### Data Persistence Across Phases

1. Complete Phase 1 → Refresh → **Expected**: Data persists
2. Complete Phase 2 → Refresh → **Expected**: Data persists
3. Complete Phase 3 → Refresh → **Expected**: Progress persists

### Navigation Flow

- Test "Back" buttons (if available)
- Test "Continue" buttons
- **Expected**: Smooth transitions, no data loss

### Error Recovery

- Test with network throttling (DevTools → Network → Throttling)
- **Expected**: Graceful error handling
- **Expected**: Retry mechanisms work

---

## Critical Fixes Verification Checklist

### ✅ SSE Reconnection

- [ ] Connection status indicator visible
- [ ] Status updates correctly
- [ ] Reconnection attempts visible in console (if connection drops)
- [ ] Progress resumes after reconnection

### ✅ Progress Persistence

- [ ] Progress saves to localStorage
- [ ] Progress loads on page refresh
- [ ] Toast notification appears when saved progress found
- [ ] Investigation can resume from saved state

### ✅ Connection Status

- [ ] Status badge visible in Phase 3
- [ ] Shows "Connected" during investigation
- [ ] Updates to "Reconnecting" if connection drops
- [ ] Updates to "Disconnected" on failure
- [ ] Tooltip shows detailed information

### ✅ Partial Retry

- [ ] Retry button appears for failed categories
- [ ] Only failed category resets
- [ ] Other categories remain complete
- [ ] Toast notification appears

---

## Common Issues & Solutions

### Issue: Page won't load

**Solution**:

- Check dev server is running: `npm run dev`
- Check port 5000 is available
- Clear browser cache

### Issue: Investigation won't start

**Solution**:

- Check console for errors
- Verify Phase 2 form submitted correctly
- Check network tab for API errors

### Issue: Progress not persisting

**Solution**:

- Check localStorage in DevTools
- Verify browser allows localStorage
- Check console for save errors

### Issue: Connection status not updating

**Solution**:

- Check console for connection errors
- Verify SSE stream is connecting
- Check network tab for SSE connection

---

## Success Criteria

**All phases pass if:**

- ✅ No console errors
- ✅ All features work as expected
- ✅ Data persists correctly
- ✅ Navigation smooth
- ✅ Error handling graceful
- ✅ Performance acceptable

---

## Reporting Issues

If you find issues:

1. **Note the phase** (1, 2, 3, or 4)
2. **Note the step** (from this guide)
3. **Check console** for errors
4. **Take screenshot** if possible
5. **Report**: Phase, Step, Error message, Console output

---

**Ready to test! Follow this guide step by step.**
