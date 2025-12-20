# Merlin Website Analyzer v3.0 Specification
## Complete Upgrade Documentation

**Version:** 3.0  
**Date:** November 19, 2025  
**Status:** Implementation in Progress

---

## 🎯 OVERVIEW

v3.0 introduces **screenshot-based analysis**, **mobile rendering**, **CSS computation**, **animation detection**, **layout rhythm evaluation**, and **brand personality recognition**.

This is a **complete rewrite** of the analysis engine with human-level design evaluation capabilities.

---

## 📋 PHASE 1: SCREENSHOT-BASED ANALYSIS

### Requirements

**Technology Stack:**
- Puppeteer or Playwright for headless browser rendering
- Image processing for pixel analysis
- Screenshot storage system

**Rendering Dimensions:**
- Desktop: 1440px width
- Tablet: 768px width  
- Mobile: 390px width

**Screenshot Storage:**
```
/website_analysis_screenshots/<domain>/<timestamp>/
  - desktop.png
  - tablet.png
  - mobile.png
```

**Screenshot Analysis:**
1. Color palette extraction (pixel clustering)
2. Layout rhythm detection (vertical spacing, column consistency)
3. Typography detection (OCR + computed styles)
4. Image quality identification
5. Component recognition (hero → card grid → CTA → footer)
6. Crowded/messy/template/premium detection

**Module:** `/server/analyzer/screenshotEvaluator.ts`

---

## 📋 PHASE 2: ADVANCED VISUAL DESIGN SCORING

### Scoring Factors

1. **Color Palette Quality (0-2.5 points)**
   - Extract dominant colors from screenshot
   - Count harmonized colors (triads, complementary)
   - Score higher for cohesive, brand-aligned palette

2. **Typography Hierarchy (0-2.0 points)**
   - Detect heading vs body weights, sizes, font families
   - Penalize mismatched fonts or poor hierarchy
   - Reward modern fonts (Inter, SF Pro, Helvetica Neue, IBM Plex)

3. **Whitespace & Rhythm (0-2.0 points)**
   - Detect average vertical spacing between sections
   - Reward consistent spacing "grid rhythm"
   - Penalize cramped or uneven spacing

4. **Photography & Illustration Quality (0-2.0 points)**
   - Detect custom photos vs stock (filename + resolution)
   - Reward branded illustrations or photography sets

5. **Animation Quality (0-1.5 points)**
   - Detect CSS transitions and JS animations:
     - fade-in
     - parallax
     - smooth scroll
     - hover micro-interactions
   - Penalize overdone or jittery animations

**Output:** `/website_analysis_reports_v3/<domain>/visual.json`

---

## 📋 PHASE 3: MOBILE UX AND RESPONSIVENESS SCORING

### Analysis (Using 390px Mobile Screenshot)

1. **Mobile Navigation (0-2.0 points)**
   - Detect hamburger nav
   - Test tap-target spacing (min 44px)
   - Check sticky header

2. **Mobile Layout Stack Quality (0-2.5 points)**
   - Detect correct column stacking
   - Penalize horizontal scroll
   - Reward fluid responsiveness

3. **Mobile Readability (0-2.0 points)**
   - Detect font sizes (min 16px body)
   - Detect line-height (1.5-1.8 ideal)
   - Identify clipped or overlapping elements

4. **Mobile Performance Approximation (0-1.5 points)**
   - Check total image weight (sum of <img>)
   - Penalize excessively large hero videos

**Output:** `/website_analysis_reports_v3/<domain>/mobile.json`

---

## 📋 PHASE 4: FUNCTIONAL UX & CONVERSION ANALYSIS

### Detection Requirements

1. **Clear Primary CTA (0-2.0 points)**
   - Detect "Book a consultation", "Get Started", etc.
   - Check visibility and prominence

2. **Repeated CTAs (0-1.5 points)**
   - Count CTAs throughout page
   - Reward strategic placement

3. **Contact Information (0-2.0 points)**
   - Phone number
   - Email address
   - Physical address
   - Contact form

4. **Trust Elements (0-2.0 points)**
   - Testimonials
   - Reviews
   - Recognized clients
   - Certifications
   - Security badges

5. **Page Flow (0-2.5 points)**
   - Hero → Value → Proof → Action
   - Logical progression

**Output:** `/website_analysis_reports_v3/<domain>/conversion.json`

---

## 📋 PHASE 5: BRAND PERSONALITY & CREATIVITY DETECTION

### NEW: Creativity = Identity + Originality + Cohesion

**Scoring Factors:**

1. **Unique Brand Voice (0-2.0 points)**
   - Identify distinctive writing tone
   - Penalize generic, template-sounding content

2. **Custom Illustration Style (0-2.0 points)**
   - Identify if icons/graphics follow brand system
   - Reward cohesive visual language

3. **Original Layout Patterns (0-2.5 points)**
   - Non-template-shaped sections
   - Unique component shapes
   - Grid experiments executed well

4. **Memorable Design Elements (0-2.5 points)**
   - Custom hero art
   - Branded transitions
   - Strong taglines

**Output:** `/website_analysis_reports_v3/<domain>/creativity.json`

---

## 📋 PHASE 6: TRUE CONTENT QUALITY ANALYSIS

### Rendered DOM Analysis (Not Raw HTML)

**Scoring Factors:**

1. **Depth of Text (0-2.0 points)**
   - Word count (1000+ ideal)
   - Paragraph count
   - Sentence complexity

2. **Specificity to Industry (0-2.0 points)**
   - Industry terminology
   - Specific examples
   - Case studies

3. **Clarity in Value Proposition (0-2.0 points)**
   - Clear "what we do"
   - Clear "why choose us"
   - Clear "how it works"

4. **Avoidance of Boilerplate (0-2.0 points)**
   - Penalize generic filler
   - Reward specific details

5. **Educational Content (0-1.0 points)**
   - FAQs
   - Guides
   - Resources

6. **Tone Consistency (0-1.0 points)**
   - Brand personality alignment
   - Consistent voice

**Penalties:**
- Empty slogans
- Repeated filler blocks
- No detail on services

**Output:** `/website_analysis_reports_v3/<domain>/content.json`

---

## 📋 PHASE 7: SEO FOUNDATIONS UPGRADE

### Enhanced SEO Checks

1. **Keyword Presence (0-2.0 points)**
   - Industry-relevant keywords
   - Location-specific (if applicable)

2. **Location Optimization (0-1.0 points)**
   - City/region mentions
   - Local schema

3. **Heading Structure (0-2.0 points)**
   - One H1 per page
   - Descriptive H2/H3s
   - Keyword-rich headings

4. **Canonical Tag (0-0.5 points)**
   - Present and correct

5. **Schema.org Detection (0-2.0 points)**
   - Organization
   - LocalBusiness
   - FAQ
   - Product/Service

6. **Image Alt Coverage (0-1.5 points)**
   - Percentage with alt text
   - Descriptive alt text

7. **Internal Links (0-1.0 points)**
   - Descriptive anchor text
   - Logical linking structure

**Output:** `/website_analysis_reports_v3/<domain>/seo.json`

---

## 📋 PHASE 8: NEW SCORING WEIGHTS (CRITICAL)

### Excellent Status Requirements

A site is **EXCELLENT** ONLY IF:

- ✅ Visual Design ≥ 8.0
- ✅ UX Structure ≥ 8.0
- ✅ Content Quality ≥ 8.0
- ✅ Conversion & Trust ≥ 7.5
- ✅ SEO Foundations ≥ 7.5
- ✅ Creativity ≥ 7.0
- ✅ Mobile UX ≥ 8.0
- ✅ No accessibility red flags
- ✅ No layout-breaking issues

**ALL criteria must be met. No exceptions.**

### Scoring Scale

- **Poor:** Average < 4.0
- **OK:** Average 4.0-5.9
- **Good:** Average 6.0-7.4 OR average ≥ 7.5 but any category below threshold
- **Excellent:** Average ≥ 7.5 AND all categories meet thresholds above
- **World-Class:** Average ≥ 9.0 AND all categories ≥ 9.0

---

## 📋 PHASE 9: REPORT OUTPUT UPGRADE

### Directory Structure

```
/website_analysis_reports_v3/<domain>/
  ├── visual.json
  ├── content.json
  ├── ux.json
  ├── mobile.json
  ├── seo.json
  ├── creativity.json
  ├── conversion.json
  ├── accessibility.json
  ├── final-score.json
  ├── summary.md
  └── screenshots/
      ├── desktop.png
      ├── tablet.png
      └── mobile.png
```

### JSON Schema

**visual.json:**
```json
{
  "colorPalette": {
    "dominantColors": ["#hex1", "#hex2"],
    "harmonyScore": 0-10,
    "brandAlignment": 0-10
  },
  "typography": {
    "hierarchyScore": 0-10,
    "fontQuality": 0-10,
    "modernFonts": true/false
  },
  "whitespace": {
    "rhythmScore": 0-10,
    "spacingConsistency": 0-10
  },
  "photography": {
    "qualityScore": 0-10,
    "customImages": true/false
  },
  "animation": {
    "qualityScore": 0-10,
    "detectedAnimations": ["fade-in", "parallax"]
  },
  "finalScore": 0-10
}
```

**final-score.json:**
```json
{
  "url": "https://example.com",
  "timestamp": "ISO8601",
  "categoryScores": {
    "visualDesign": 0-10,
    "uxStructure": 0-10,
    "contentQuality": 0-10,
    "conversionTrust": 0-10,
    "seoFoundations": 0-10,
    "creativity": 0-10,
    "mobileUX": 0-10
  },
  "weightedScore": 0-100,
  "verdict": "Poor|OK|Good|Excellent|World-Class",
  "thresholds": {
    "visualDesign": 8.0,
    "uxStructure": 8.0,
    "contentQuality": 8.0,
    "conversionTrust": 7.5,
    "seoFoundations": 7.5,
    "creativity": 7.0,
    "mobileUX": 8.0
  },
  "meetsExcellentCriteria": true/false
}
```

---

## 📋 PHASE 10: BENCHMARK RE-ANALYSIS

### Test Sites

1. https://www.apple.com/
2. https://stripe.com/
3. https://www.airbnb.com/
4. https://www.shopify.com/
5. https://www.notion.so/
6. https://www.tesla.com/
7. https://slack.com/
8. https://www.ibm.com/design/
9. https://monday.com/
10. https://www.dropbox.com/

**Output Location:** `/website_analysis_reports_v3/benchmark/`

---

## 🔧 IMPLEMENTATION NOTES

### Dependencies Required

```json
{
  "puppeteer": "^21.0.0",
  "sharp": "^0.32.0",
  "color-thief-node": "^1.0.0",
  "tesseract.js": "^5.0.0"
}
```

### Performance Considerations

- Screenshot rendering: 5-10 seconds per site
- Image processing: 2-5 seconds per screenshot
- Total analysis time: ~30-60 seconds per site
- Cache screenshots for re-analysis

### Error Handling

- Timeout for slow-loading sites (30s)
- Fallback to v2.0 if screenshot fails
- Graceful degradation for missing features

---

## ✅ FINAL RULE

**v3.0 logic is the NEW master standard.**

v1.0 and v2.0 logic is **obsolete**.

A site with **ANY category below threshold CANNOT be Excellent**.

---

**Documentation Version:** 1.0  
**Last Updated:** November 19, 2025  
**Status:** Specification Complete - Implementation In Progress

