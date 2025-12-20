# Complete 17-Phase Workflow

## Overview

The Merlin Website Builder now uses a **17-phase workflow** where each of the 13 Google Rating Categories is its own separate phase.

## Complete Phase Sequence

### Phase 1: Package Selection

- User selects package (Essential/Professional/SEO/Deluxe/Ultra)
- Constraints stored: max pages, max services, features
- **Validation:** Cannot proceed without selection

### Phase 2: Client Specification (Requirements)

- All questions on one scrollable page
- Package limits enforced
- **Validation:** All required fields + package constraints

### Phase 3-15: 13 Google Rating Categories (Each is its own phase)

#### Phase 3: Content Quality & Relevance

- Category #1 (MOST IMPORTANT)
- Deep research: 2-3 minutes
- Auto-starts when entering this phase
- Shows progress, checks, and live activity

#### Phase 4: Keywords & Semantic SEO

- Category #2
- Auto-advances from Phase 3 when complete

#### Phase 5: Technical SEO

- Category #3
- Auto-advances from Phase 4 when complete

#### Phase 6: Core Web Vitals

- Category #4
- Auto-advances from Phase 5 when complete

#### Phase 7: Structure & Navigation

- Category #5
- Auto-advances from Phase 6 when complete

#### Phase 8: Mobile Optimization

- Category #6
- Auto-advances from Phase 7 when complete

#### Phase 9: Visual Quality & Engagement

- Category #7
- Auto-advances from Phase 8 when complete

#### Phase 10: Image & Media Quality

- Category #8
- Auto-advances from Phase 9 when complete

#### Phase 11: Local SEO

- Category #9
- Auto-advances from Phase 10 when complete

#### Phase 12: Trust Signals

- Category #10
- Auto-advances from Phase 11 when complete

#### Phase 13: Schema & Structured Data

- Category #11
- Auto-advances from Phase 12 when complete

#### Phase 14: On-Page SEO Structure

- Category #12
- Auto-advances from Phase 13 when complete

#### Phase 15: Security

- Category #13 (Final category)
- Auto-advances from Phase 14 when complete
- When complete, auto-advances to Phase 16

### Phase 16: Website Builder

- Generates website respecting package constraints
- Uses requirements + all 13 category analysis results
- Auto-advances to Phase 17 when complete

### Phase 17: Review & Final Output

- User reviews generated website
- Final approval and delivery

## Auto-Advancement Logic

1. **Phase 2 → Phase 3:** User clicks "Continue to Investigation" → Goes to `content-quality`
2. **Phase 3:** Auto-starts investigation when entering this phase
3. **Phase 3-15:** Each category auto-advances to next when it reaches 100% progress
4. **Phase 15 → Phase 16:** When all 13 categories complete, auto-advances to `build`
5. **Phase 16 → Phase 17:** When website generation completes, auto-advances to `review`

## User Experience

- **Clear Phase Labels:** Each phase shows "Phase X of 17"
- **Progress Indicators:** Each category shows its own progress bar
- **Live Activity Feed:** Shows research activities in real-time
- **Auto-Advancement:** No manual clicking needed between categories
- **Navigation:** User can use Previous/Next buttons or Quick Jump dropdown

## Technical Implementation

- **Stage Names:** Backend uses underscores (`content_quality`), frontend uses hyphens (`content-quality`)
- **Progress Tracking:** Each category tracked separately in `investigationProgress.jobs[]`
- **Auto-Advance:** Triggered when category progress reaches 100%
- **State Management:** Package, requirements, and investigation results stored in `wizardState`
