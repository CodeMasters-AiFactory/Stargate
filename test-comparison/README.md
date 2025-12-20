# Merlin v5.1 Three-Site Test Suite

**Date:** 2025-01-20  
**Pipeline Version:** v5.1 (Emergency Upgrade)

---

## Overview

This test suite validates the upgraded v5.1 pipeline by generating 3 websites and analyzing the results. The reports show exactly what functions are called, what LLM services are used, and what the expected outputs are.

---

## Test Sites

1. **Smith & Associates Law Firm** (`smith-associates-law-firm-diagnostic-report.md`)
   - Industry: Legal Services
   - Tests: Professional content, legal-specific imagery, corporate layout

2. **CloudSync Pro SaaS** (`cloudsync-pro-saas-diagnostic-report.md`)
   - Industry: SaaS / Cloud Storage
   - Tests: Tech-forward content, modern imagery, SaaS layout

3. **Oceanic Research Institute** (`oceanic-research-institute-diagnostic-report.md`)
   - Industry: Marine Biology Research
   - Tests: Scientific content, nature imagery, niche industry handling

---

## How to Run Actual Tests

### Option 1: Via Web Interface (Recommended)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5000`

3. **Use the Website Builder Wizard** to generate each site:
   - Enter business name, industry, tone, services
   - Click "Generate Website"
   - Wait for generation to complete

4. **Check the results:**
   - View generated website at: `http://localhost:5000/website_projects/{slug}/generated-v5/index.html`
   - Check server logs for pipeline trace
   - Review generated files in `website_projects/{slug}/generated-v5/`

### Option 2: Via API (Programmatic)

Use the API endpoint directly:

```bash
curl -X POST http://localhost:5000/api/website-builder/generate \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "businessName": "Smith & Associates Law Firm",
      "businessType": "Legal Services",
      "toneOfVoice": "Professional, credible, sharp",
      "targetAudience": "Clients needing legal representation",
      "services": [
        {"name": "Criminal Defense", "description": "Expert criminal defense representation"},
        {"name": "Family Law", "description": "Comprehensive family law services"},
        {"name": "Estate Planning", "description": "Professional estate planning and wills"}
      ],
      "city": "New York",
      "region": "NY",
      "country": "USA"
    }
  }'
```

---

## Verification Checklist

For each generated website, verify:

### Pipeline Trace
- [ ] Server logs show `[Merlin v6.0] Generating AI design strategy...`
- [ ] Server logs show `[Merlin v5.1] Generating LLM content for X sections...` (where X = total sections)
- [ ] Server logs show `[Content LLM] Successfully generated content for [section type]` (one per section)
- [ ] Server logs show `[Advanced Image Service] Generating hd hero image for [business name]`
- [ ] Server logs show `[Advanced Image Service] Generating standard [style] image` (1-2 times)

### Content Quality
- [ ] `copy.json` shows unique, industry-specific content (not generic templates)
- [ ] HTML does NOT contain generic text like "We combine trustworthy service..."
- [ ] Each section has unique heading and body text
- [ ] Content is relevant to the business type

### Images
- [ ] `layout.json` shows `imageUrl` on hero section
- [ ] `layout.json` shows `imageUrl` on 1-2 other sections
- [ ] HTML contains 2-3 `<img src="...">` tags
- [ ] Images are DALL-E URLs (not mock SVGs, unless API failed)

### CSS/Visual
- [ ] `styles.css` contains modern design tokens (`--cm-color-*` or `--color-primary`)
- [ ] `styles.css` contains card styling (`.feature-card` or `.section-block`)
- [ ] `styles.css` contains responsive rules (`@media (max-width: 768px)`)
- [ ] Website looks modern with cards, shadows, proper spacing

---

## Expected Results Summary

| Site | Sections | LLM Content | Images | Layout Match | Color Match | Quality |
|------|----------|-------------|--------|-------------|-------------|---------|
| Law Firm | 5-7 | ✅ All | 2-3 | ✅ Good | ✅ Good | 8/8/8 |
| SaaS | 5-7 | ✅ All | 2-3 | ✅ Good | ✅ Good | 8/7/8 |
| Marine Bio | 5-7 | ✅ All | 2-3 | ⚠️ Generic | ⚠️ Generic | 8/6/8 |

**Quality Scores:** Clarity / Sophistication / Visual Appeal

---

## Known Issues

### Issue 1: Layout Mismatch for Niche Industries
**Problem:** "Marine Biology Research" doesn't match any blueprint industries → gets generic blueprint

**Evidence:** `layoutLLM.ts:27-70` uses string matching, falls back to first blueprint if no match

**Impact:** Niche industries get mismatched layouts

**Fix Needed:** LLM-based layout planning (v6.0 Priority 1)

---

### Issue 2: Color Mismatch for Niche Industries
**Problem:** "Marine Biology Research" doesn't match any palette industries → gets generic palette

**Evidence:** `styleSystem.ts:57-148` uses string matching, falls back to first palette if no match

**Impact:** Niche industries get mismatched colors (e.g., tech blue instead of ocean blue)

**Fix Needed:** LLM-based style generation (v6.0 Priority 2)

---

### Issue 3: Iteration Doesn't Improve
**Problem:** Iteration loop exists but doesn't actually revise designs

**Evidence:** `merlinDesignLLM.ts:65-181` loops but re-runs same logic

**Impact:** Quality issues persist through iterations

**Fix Needed:** Real iteration with improvement (v6.0 Priority 4)

---

## Files Generated

Each test generates:
- `index.html` - Complete HTML page
- `styles.css` - Modern CSS with design tokens
- `script.js` - JavaScript (if any)
- `layout.json` - Section structure with image URLs
- `copy.json` - All content (hero, sections, services, FAQ)
- `style.json` - Color palette, typography, spacing

---

## Next Steps

1. **Run actual tests** using web interface or API
2. **Compare results** to diagnostic reports
3. **Verify** all checklist items
4. **Report discrepancies** if pipeline doesn't match expectations
5. **Plan v6.0** based on identified weaknesses

---

## References

- **Full Comparison:** `COMPARISON_SUMMARY.md`
- **Individual Reports:** See individual diagnostic reports above
- **Code Evidence:** All reports include file paths and line numbers

