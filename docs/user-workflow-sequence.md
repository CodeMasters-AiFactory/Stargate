# User Workflow Sequence - Complete Flow

## Overview

This document outlines the complete user journey through the Merlin Website Builder, ensuring logical progression and validation at each step.

## Phase Flow

### ✅ Phase 1: Package Selection

**Stage:** `package-select`

**User Experience:**

1. User sees 5 package options:
   - **Essential** ($29/month) - 1 page, 3 services
   - **Professional** ($49/month) - 5 pages, 10 services
   - **SEO Optimized** ($69/month) - 15 pages, 20 services, Advanced SEO
   - **Deluxe** ($99/month) - 50 pages, 50 services, Competitor Research
   - **Ultra** ($199/month) - Unlimited, Automated Maintenance

2. User clicks on a package card to select it
3. Selected package is highlighted with blue border
4. Package constraints are displayed
5. **Validation:** Button is disabled until package is selected
6. User clicks "Continue to Requirements" button

**What Happens:**

- Package ID and constraints stored in `wizardState.selectedPackage` and `wizardState.packageConstraints`
- Navigation moves to `requirements` stage
- Package info is preserved for later validation

---

### ✅ Phase 2: Client Specification (Requirements)

**Stage:** `requirements`

**User Experience:**

1. User sees ALL questions on one scrollable page
2. Questions are grouped by category (Project Overview, Business Details, Services, etc.)
3. Package info displayed at top: "Package: Essential • Limit: 1 page, 3 services"
4. User fills out all required fields
5. **Package Constraints Enforced:**
   - Service count limited to package max (e.g., Essential = 3 services)
   - Warning shown when limit reached
   - "Add Service" button shows count: "Add Service (2/3)"
6. User clicks "Continue to Investigation" button

**Validation Before Proceeding:**

- ✅ Package must be selected (shows error if missing)
- ✅ All required questions must be answered
- ✅ Service count must not exceed package limit
- ✅ All field validations must pass

**What Happens:**

- All requirements stored in `wizardState.requirements`
- Navigation moves to `investigate` stage
- Investigation auto-starts after 500ms delay

---

### ✅ Phase 3: Content Investigation

**Stage:** `investigate`

**User Experience:**

1. User sees "Content Investigation Engine" header
2. Shows "Analysis Starting..." message with spinner
3. Investigation automatically begins (no button click needed)
4. Progress bars show 13 Google Rating Categories:
   - Content Quality & Relevance (2-3 min, deep research)
   - Keywords & Semantic SEO
   - Technical SEO
   - Core Web Vitals
   - Structure & Navigation
   - Mobile Optimization
   - Visual Quality & Engagement
   - Image & Media Quality
   - Local SEO
   - Trust Signals
   - Schema & Structured Data
   - On-Page SEO Structure
   - Security
5. Live activity feed shows research progress
6. Each category shows progress 0% → 100%
7. Spinning indicator shows system is busy
8. When complete, automatically moves to Build stage

**What Happens:**

- Investigation uses client data: `businessName`, `businessType`, `services`, `targetAudience`, etc.
- Results stored in `wizardState.investigationResults`
- Navigation automatically moves to `build` stage (Phase 4)
- Content checking runs after investigation

---

### ⏳ Phase 4: Website Builder

**Stage:** `build`

**User Experience:**

1. User sees website generation in progress
2. Shows progress of website building
3. Respects package constraints:
   - Max pages from selected package
   - Max services from selected package
   - Features based on package (competitor research, advanced SEO, etc.)
4. When complete, automatically moves to Review stage

**What Happens:**

- Website generated using:
  - Requirements from Phase 2
  - Investigation results from Phase 3
  - Package constraints from Phase 1
- Generated website stored
- Navigation moves to `review` stage

---

### ⏳ Phase 5: Review & Final Output

**Stage:** `review`

**User Experience:**

1. User sees generated website preview
2. Can review all pages
3. Can make adjustments if needed
4. Final approval and delivery

**What Happens:**

- Website is finalized
- User can download or deploy
- Project marked as complete

---

## Navigation Flow

```
Phase 1: Package Select
    ↓ (Continue to Requirements)
Phase 2: Requirements
    ↓ (Continue to Investigation - auto-validates)
Phase 3: Investigation
    ↓ (Auto-advances when complete)
Phase 4: Build
    ↓ (Auto-advances when complete)
Phase 5: Review
    ↓ (Complete)
Done
```

## Validation Points

1. **Package Selection → Requirements:**
   - ✅ Package must be selected
   - ✅ Button disabled until selection

2. **Requirements → Investigation:**
   - ✅ Package must be selected
   - ✅ All required fields filled
   - ✅ Service count ≤ package max
   - ✅ All validations pass

3. **Investigation → Build:**
   - ✅ Investigation must complete
   - ✅ Results must be available
   - ✅ Auto-advances (no user action)

4. **Build → Review:**
   - ✅ Website must be generated
   - ✅ Respects package constraints
   - ✅ Auto-advances (no user action)

## Error Handling

- **Missing Package:** Shows warning, prevents progression
- **Validation Errors:** Shows specific errors, highlights fields
- **Investigation Failure:** Shows retry option, can skip
- **Build Failure:** Shows error, allows retry

## User Feedback

- ✅ Progress indicators at each stage
- ✅ Loading spinners during processing
- ✅ Success messages when stages complete
- ✅ Error messages with clear actions
- ✅ Package limits clearly displayed
- ✅ Validation feedback on fields
