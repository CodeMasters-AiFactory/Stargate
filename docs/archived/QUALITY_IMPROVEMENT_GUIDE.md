# Quality Improvement Guide

## How the Auto-Improvement System Works

---

## Overview

The auto-improvement system automatically identifies quality issues and applies targeted fixes to improve website quality until it reaches the 95% target (9.5/10 average, no category below 7.5/10).

---

## How It Works

### Step 1: Initial Generation

Website is generated using Merlin v5.0 Design LLM with:

- Unique content per section
- Complete CSS styling
- Proper HTML structure

### Step 2: Quality Assessment

Real quality assessment using v4.0 analyzer:

- Multi-expert panel evaluation
- 6 category scores (Visual, UX, Content, Conversion, SEO, Creativity)
- Issue identification with severity levels

### Step 3: Issue Prioritization

Issues are prioritized by:

1. **Critical** - Blocks functionality (missing CSS, duplicate content)
2. **High** - Significantly impacts quality (poor content, no CTAs)
3. **Medium** - Moderate impact (SEO issues, spacing)
4. **Low** - Minor improvements

### Step 4: Targeted Fixes

Specific fixers apply solutions:

- `fixDuplicateContent()` - Regenerates unique content
- `fixMissingCSS()` - Ensures CSS file exists
- `fixSEOIssues()` - Adds meta tags, schema
- `fixConversionIssues()` - Adds CTAs, contact info

### Step 5: Re-Assessment

After fixes, website is re-assessed:

- New quality scores calculated
- Remaining issues identified
- Improvement tracked

### Step 6: Iteration

Process repeats until:

- Target score reached (9.5/10)
- All categories ≥ 7.5/10
- Max iterations reached (10)

---

## Issue Resolution

### Visual Design Issues

**Missing CSS File**

- **Fix:** Generate complete CSS from style system
- **Priority:** Critical
- **Resolver:** `fixMissingCSS()`

**No Color System**

- **Fix:** Define cohesive palette from style system
- **Priority:** High
- **Resolver:** Style system generation

**Poor Typography**

- **Fix:** Implement typography hierarchy
- **Priority:** High
- **Resolver:** Style system generation

### Content Quality Issues

**Duplicate Content**

- **Fix:** Regenerate unique content per section type
- **Priority:** Critical
- **Resolver:** `fixDuplicateContent()` (prevented in Phase 1)

**Generic Filler**

- **Fix:** Replace with specific, industry-relevant content
- **Priority:** Critical
- **Resolver:** Content generation patterns

**No Location-Specific Content**

- **Fix:** Add city/region references where relevant
- **Priority:** Medium
- **Resolver:** Content generation

### Conversion Issues

**Single CTA**

- **Fix:** Add multiple CTAs (hero, sections, footer)
- **Priority:** High
- **Resolver:** `fixConversionIssues()`

**No Contact Info**

- **Fix:** Add phone, email, address, form
- **Priority:** Critical
- **Resolver:** `fixConversionIssues()`

**No Testimonials**

- **Fix:** Add testimonials section with social proof
- **Priority:** High
- **Resolver:** Content generation

### SEO Issues

**No Meta Description**

- **Fix:** Add compelling meta description (150-165 chars)
- **Priority:** High
- **Resolver:** `fixSEOIssues()`

**Broken Title**

- **Fix:** Fix grammar, length (50-60 chars), add keywords
- **Priority:** Critical
- **Resolver:** Code generation

**Poor Heading Hierarchy**

- **Fix:** Ensure H1 → H2 → H3 structure
- **Priority:** High
- **Resolver:** Code generation

---

## Improvement Tracking

Each improvement is tracked with:

- **Iteration number**
- **Issue description**
- **Fix applied**
- **Score before/after**
- **Category affected**

Example:

```
Iteration 1
Issue: Content Quality - Duplicate section headings
Fix: Regenerated unique content per section
Score: 2.2 → 6.5 (+4.3)
```

---

## Reports Generated

### Quality Report

- Overall score and verdict
- Category breakdown
- Issues found
- Recommendations

### Improvement Report

- Initial vs final scores
- Improvements applied
- Iteration details
- Target status

### Auto-Improvement Report

- Comprehensive journey
- Score improvements per category
- All issues and fixes
- Final recommendations

---

## Configuration

### Default Settings

```typescript
{
  targetScore: 9.5,        // 95% target
  maxIterations: 10,       // Max improvement cycles
  minCategoryScore: 7.5    // No category below this
}
```

### Customization

```typescript
await autoImproveToTarget(projectConfig, app, port, {
  targetScore: 8.5, // Lower target
  maxIterations: 5, // Fewer iterations
  minCategoryScore: 7.0, // Lower minimum
});
```

---

## Best Practices

1. **Start with Critical Issues** - Fix blocking issues first
2. **One Fix Per Iteration** - Don't overwhelm the system
3. **Re-Assess After Each Fix** - Track improvement accurately
4. **Set Realistic Targets** - 9.5/10 is ambitious but achievable
5. **Monitor Iterations** - Stop if no improvement after 3 iterations

---

## Troubleshooting

### Improvement Not Working

- Check that `app` and `port` are passed correctly
- Verify website is accessible at local URL
- Check improvement engine logs

### Scores Not Improving

- Verify fixes are actually being applied
- Check that re-generation is happening
- Review issue severity (may need manual fixes)

### Max Iterations Reached

- Review remaining issues
- Consider manual fixes for complex issues
- Lower target score if needed

---

**Last Updated:** January 2025
