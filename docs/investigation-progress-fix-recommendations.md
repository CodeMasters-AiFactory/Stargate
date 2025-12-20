# Investigation Progress Bar Fix Recommendations

## Issue Summary

During smoke testing, the investigation system is working correctly:

- ✅ Research starts successfully
- ✅ Live activities are displayed
- ✅ Console shows progress events
- ✅ Topic handling is correct
- ❌ **Progress bars remain at 0%** (UI not updating)

## Root Cause

The progress bars are not updating because the frontend only updates `investigationProgress` state when `mode === 'wizard'`, but the "Test Research" button uses `mode === 'test'`.

**Location:** `client/src/components/IDE/WebsiteBuilderWizard.tsx` line 1771

```typescript
// Current code (BROKEN for test mode):
if (mode === 'wizard') {
  setInvestigationProgress(prev => ({
    ...prev,
    currentJob: categoryIndex,
    jobs: prev.jobs.map((job, idx) =>
      idx === categoryIndex
        ? {
            ...job,
            status: 'in_progress' as const,
            progress: categoryProgress,
          }
        : job
    ),
  }));
}
```

## Recommended Fixes

### Fix 1: Update Progress Bars in Both Modes (CRITICAL)

**Priority:** HIGH  
**File:** `client/src/components/IDE/WebsiteBuilderWizard.tsx`  
**Line:** ~1771

**Change:**

```typescript
// REMOVE the mode check - update progress in both test and wizard modes
setInvestigationProgress(prev => ({
  ...prev,
  currentJob: categoryIndex,
  jobs: prev.jobs.map((job, idx) =>
    idx === categoryIndex
      ? {
          ...job,
          status: 'in_progress' as const,
          progress: categoryProgress,
        }
      : job
  ),
}));
```

**Why:** The progress bars should update regardless of whether research is triggered from "Test Research" or the main wizard flow.

---

### Fix 2: Initialize Progress State for Test Mode

**Priority:** MEDIUM  
**File:** `client/src/components/IDE/WebsiteBuilderWizard.tsx`  
**Line:** ~1590-1618

**Current Issue:** When `testResearchActivity` is called, it doesn't initialize the progress state.

**Change:**

```typescript
const testResearchActivity = useCallback(
  async (userInput: string) => {
    const currentTopic = userInput.trim();
    if (!currentTopic) {
      toast({
        title: 'Invalid Topic',
        description: 'Please enter a topic to research.',
        variant: 'destructive',
      });
      return;
    }

    // Initialize progress state for test mode
    setInvestigationProgress({
      currentJob: 0,
      jobs: [
        { name: '1. Content Quality & Relevance', status: 'pending', progress: 0, checkScores: {} },
        { name: '2. Keywords & Semantic SEO', status: 'pending', progress: 0, checkScores: {} },
        // ... (all 13 categories)
      ],
    });

    await runInvestigation(
      {
        businessName: currentTopic,
        businessType: currentTopic,
        targetAudience: `Audience interested in ${currentTopic}`,
        pages: ['Home', 'About', 'Services'],
        features: [],
        description: `Research for: ${currentTopic}`,
      },
      'test'
    );
  },
  [runInvestigation, toast]
);
```

**Why:** Ensures progress bars are initialized before research starts in test mode.

---

### Fix 3: Ensure Backend SSE Messages Include All Required Fields

**Priority:** LOW (Already working, but verify)
**File:** `server/services/websiteInvestigation.ts`  
**Line:** ~412-419

**Verify:** The backend is already sending:

- ✅ `stage` (e.g., 'content_quality')
- ✅ `categoryIndex` (0-12)
- ✅ `categoryProgress` (0-100)
- ✅ `categoryName` (e.g., '1. Content Quality & Relevance')
- ✅ `message` (descriptive message)

**Action:** No changes needed, but add logging to verify:

```typescript
safeProgress({
  stage: category.stage,
  progress: overallProgress,
  message: `Analyzing ${category.name}...`,
  categoryIndex: categoryIdx,
  categoryName: category.name,
  categoryProgress: 0,
});
console.log(
  `[BACKEND] Sending progress: stage=${category.stage}, categoryIndex=${categoryIdx}, categoryProgress=0`
);
```

---

### Fix 4: Add Error Handling for Progress Updates

**Priority:** MEDIUM  
**File:** `client/src/components/IDE/WebsiteBuilderWizard.tsx`  
**Line:** ~1762-1789

**Change:**

```typescript
// Handle new 13-step Google Category process
if (data.stage && categoryStageMap[data.stage]) {
  try {
    const categoryInfo = categoryStageMap[data.stage];
    const categoryIndex =
      data.categoryIndex !== undefined ? data.categoryIndex : categoryInfo.index;
    const categoryProgress = data.categoryProgress !== undefined ? data.categoryProgress : 0;

    // Validate categoryIndex is within bounds
    if (categoryIndex < 0 || categoryIndex >= 13) {
      console.error(`[PROGRESS] Invalid categoryIndex: ${categoryIndex}`);
      return;
    }

    // Update overall progress (0-100%)
    progressPercent = Math.floor((categoryIndex / 13) * 100) + Math.floor(categoryProgress / 13);

    // Update the specific category's progress bar (BOTH modes)
    setInvestigationProgress(prev => {
      // Validate jobs array exists and has correct length
      if (!prev.jobs || prev.jobs.length !== 13) {
        console.error(`[PROGRESS] Invalid jobs array: length=${prev.jobs?.length}`);
        return prev;
      }

      return {
        ...prev,
        currentJob: categoryIndex,
        jobs: prev.jobs.map((job, idx) =>
          idx === categoryIndex
            ? {
                ...job,
                status: 'in_progress' as const,
                progress: Math.min(100, Math.max(0, categoryProgress)), // Clamp 0-100
              }
            : job
        ),
      };
    });

    console.log(
      `[EVENT:PROGRESS] { "percent": ${progressPercent}, "step": "${data.message || `Analyzing ${categoryInfo.name}`}" }`
    );
    console.log(
      `[CATEGORY_PROGRESS] Category ${categoryIndex + 1}/13 (${categoryInfo.name}): ${categoryProgress}%`
    );
  } catch (error) {
    console.error(`[PROGRESS] Error updating progress:`, error);
  }
}
```

**Why:** Prevents crashes if invalid data is received and ensures progress values are valid.

---

### Fix 5: Add Visual Feedback for Progress Updates

**Priority:** LOW (Nice to have)
**File:** `client/src/components/IDE/WebsiteBuilderWizard.tsx`  
**Line:** ~4442

**Current:** Progress bar shows `{job.progress}%`

**Enhancement:** Add animation and color changes:

```typescript
<Progress
  value={job.progress}
  className={`h-2 transition-all duration-300 ${
    job.progress === 100 ? 'bg-green-500' :
    job.progress > 0 ? 'bg-blue-500' :
    'bg-gray-300'
  }`}
/>
```

**Why:** Better visual feedback when progress updates.

---

## Implementation Order

1. **Fix 1** (CRITICAL) - Remove mode check for progress updates
2. **Fix 2** (MEDIUM) - Initialize progress state in test mode
3. **Fix 4** (MEDIUM) - Add error handling
4. **Fix 3** (LOW) - Verify backend logging
5. **Fix 5** (LOW) - Visual enhancements

## Testing Checklist

After implementing fixes:

- [ ] Test Research button updates progress bars in real-time
- [ ] Progress bars show 0% → 100% for each category
- [ ] Progress bars update smoothly without flickering
- [ ] Console shows `[CATEGORY_PROGRESS]` events match UI
- [ ] No errors in browser console
- [ ] Progress state persists correctly
- [ ] Both "Test Research" and wizard flow work identically

## Expected Behavior After Fixes

1. User clicks "Test Research" with "Space X"
2. Progress bars initialize to 0% for all 13 categories
3. Category 1 (Content Quality) progress bar updates: 0% → 10% → 20% → ... → 100%
4. Category 2 starts when Category 1 completes
5. All categories progress sequentially
6. Final state: All 13 categories at 100%

## Additional Notes

- The backend is working correctly and sending proper SSE messages
- The frontend is receiving and parsing messages correctly
- The only issue is the conditional update based on `mode`
- This is a simple fix that should resolve the issue immediately
