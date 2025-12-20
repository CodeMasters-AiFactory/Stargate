# Merlin Website Analyzer v4.0 Specification
## Multi-Expert Panel with Human Perception Scoring

**Version:** 4.0  
**Date:** November 19, 2025  
**Status:** Implementation in Progress

---

## 🎯 OVERVIEW

v4.0 introduces **multi-expert virtual panel evaluation**, **AI consensus engine**, **human perception scoring**, **UX heuristics**, and **industry benchmarking**.

This upgrade makes the analyzer evaluate like:
- A senior designer
- A creative director
- A UX lead
- A brand strategist
- A conversion specialist

**ALL AT ONCE.**

---

## 📋 PHASE 1: MULTI-EXPERT VIRTUAL PANEL

### 5 Parallel Evaluators

#### 1. UX Designer Agent
**Focus:** Layout, flow, spacing, navigation logic

**Evaluation Criteria:**
- Gestalt principles (proximity, similarity, continuity, closure)
- Jakob Nielsen's 10 heuristics
- Information architecture
- Navigation clarity
- User journey mapping
- Accessibility compliance

**Output:**
- UX score (0-10)
- Strengths (layout, navigation, flow)
- Weaknesses (confusion points, dead ends)
- Verdict

#### 2. Senior Product Designer Agent
**Focus:** Visual design, typography, brand identity, spacing rhythm

**Evaluation Criteria:**
- "Premium feel" assessment
- Modern design language
- Typography hierarchy
- Color palette cohesion
- Whitespace usage
- Visual rhythm

**Output:**
- Visual Design score (0-10)
- Strengths (premium feel, modern language)
- Weaknesses (dated design, poor spacing)
- Verdict

#### 3. Conversion Strategist Agent
**Focus:** CTAs, trust, funnels, messaging clarity

**Evaluation Criteria:**
- CTA placement and strength
- Trust elements (testimonials, certifications)
- Funnel optimization
- Friction points
- Emotional hooks
- Conversion flow

**Output:**
- Conversion score (0-10)
- Strengths (strong CTAs, trust elements)
- Weaknesses (friction, weak messaging)
- Verdict

#### 4. SEO Specialist Agent
**Focus:** Structure, metadata, keyword strategy, helpful content

**Evaluation Criteria:**
- Title and meta optimization
- Heading structure
- Keyword presence
- Schema markup
- Internal linking
- Content depth and helpfulness
- Ranking potential

**Output:**
- SEO score (0-10)
- Strengths (optimization, structure)
- Weaknesses (missing elements, thin content)
- Verdict

#### 5. Brand Identity Analyst
**Focus:** Uniqueness, consistency, narrative voice, memorable impression

**Evaluation Criteria:**
- Logo style and placement
- Icon system consistency
- Photography style
- Brand story and narrative
- Voice and tone
- Memorable elements
- Differentiation from competitors

**Output:**
- Brand/Creativity score (0-10)
- Strengths (unique identity, strong narrative)
- Weaknesses (generic, inconsistent)
- Verdict

---

## 📋 PHASE 2: CONSENSUS ENGINE

### Module: `/server/analyzer/consensus.ts`

**Purpose:** Combine all 5 expert outputs into final verdict

### Industry-Specific Weighting

**SaaS:**
- UX: 30%
- Conversion: 30%
- Branding: 20%
- Visual: 20%

**Law Firm:**
- Content: 40%
- Trust: 25%
- UX: 20%
- Visual: 10%
- Brand: 5%

**Creative Agency:**
- Visual: 40%
- Creativity: 30%
- Brand: 20%
- UX: 10%

**Ecommerce:**
- Conversion: 35%
- UX: 25%
- Visual: 20%
- SEO: 20%

**Medical:**
- Trust: 40%
- Content: 30%
- UX: 20%
- Visual: 10%

**Real Estate:**
- Visual: 35%
- Trust: 25%
- UX: 20%
- SEO: 20%

**Default (General Business):**
- UX: 25%
- Visual: 20%
- Content: 20%
- Conversion: 20%
- SEO: 10%
- Brand: 5%

### Consensus Engine Tasks

1. **Normalize Scores**
   - Convert all agent scores to 0-10 scale
   - Apply industry-specific weights

2. **Reconcile Disagreements**
   - Detect score anomalies (>2 point differences)
   - Flag for review
   - Use weighted average

3. **Detect Anomalies**
   - If one agent scores very differently, investigate
   - Check for valid reasons (industry-specific requirements)

4. **Produce Final Verdict**
   - Calculate weighted score (0-100)
   - Apply v3.0 thresholds
   - Generate human-like verdict

---

## 📋 PHASE 3: HUMAN EXPERIENCE MODEL

### Human Perception Score (0-100)

**Based on:**

1. **First 5-Second Impression (0-25 points)**
   - "Would a human trust this site immediately?"
   - Visual polish assessment
   - Professional appearance
   - Initial credibility

2. **Emotional Resonance (0-25 points)**
   - "Does it feel premium, trustworthy, exciting?"
   - Emotional connection
   - Brand personality perception
   - Memorable impact

3. **Cohesion (0-25 points)**
   - "Does everything look like it belongs together?"
   - Visual consistency
   - Brand consistency
   - Design system adherence

4. **Identity Recognition (0-25 points)**
   - "Does the site have a unique personality?"
   - Distinctive design
   - Memorable elements
   - Brand differentiation

**Analysis Method:**
- Screenshot analysis (visual assessment)
- Textual analysis (tone, voice, messaging)
- Component analysis (consistency check)

**Output:** `/website_analysis_reports_v4/<domain>/perception.json`

---

## 📋 PHASE 4: GOLD STANDARD UX HEURISTICS

### Implemented Heuristics

#### Jakob Nielsen's 10 Heuristics
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, recover from errors
10. Help and documentation

#### Additional Principles

**Fitts's Law:**
- Tap target sizes (min 44px)
- Clickable area proximity
- Button placement optimization

**Hick's Law:**
- Choice complexity
- Navigation simplicity
- Decision time assessment

**Miller's Law:**
- Information chunking
- Cognitive load
- Working memory limits (7±2 items)

**Visual Hierarchy:**
- Size relationships
- Color contrast
- Typography scale
- Spacing relationships

**Gestalt Principles:**
- Proximity grouping
- Similarity grouping
- Continuity
- Closure
- Figure/ground

**Attention Flow:**
- F-pattern scanning
- Z-pattern scanning
- Visual weight distribution

**Fold-Line CTA:**
- Above-fold CTA presence
- CTA visibility
- Value proposition clarity

**Scroll-Depth Effectiveness:**
- Content engagement
- Progressive disclosure
- Scroll-triggered animations

---

## 📋 PHASE 5: INDUSTRY BENCHMARKING

### Industry Baseline Profiles

**Location:** `/website_quality_standards/industry-baselines/`

**For Each Industry:**

#### Law Firm
- Expected content depth: 1500+ words
- Standard CTA patterns: "Book Consultation", "Call Now"
- Standard UX flow: Hero → Services → About → Testimonials → Contact
- Standard trust elements: Bar memberships, certifications, case studies
- Typical SEO features: Location keywords, service pages, FAQ schema
- Specialist requirements: Confidentiality messaging, attorney bios

#### SaaS
- Expected content depth: 2000+ words
- Standard CTA patterns: "Start Free Trial", "Get Started", "Request Demo"
- Standard UX flow: Hero → Features → Pricing → Testimonials → CTA
- Standard trust elements: Customer logos, case studies, security badges
- Typical SEO features: Product keywords, comparison pages, blog
- Specialist requirements: Feature explanations, integration info

#### Medical
- Expected content depth: 1000+ words
- Standard CTA patterns: "Book Appointment", "Call Now"
- Standard UX flow: Hero → Services → Doctors → Testimonials → Contact
- Standard trust elements: Certifications, insurance accepted, reviews
- Typical SEO features: Location + specialty keywords, FAQ schema
- Specialist requirements: HIPAA compliance messaging, insurance info

#### Real Estate
- Expected content depth: 1200+ words
- Standard CTA patterns: "View Properties", "Contact Agent"
- Standard UX flow: Hero → Featured Listings → About → Contact
- Standard trust elements: Testimonials, sold properties, certifications
- Typical SEO features: Location keywords, property schema
- Specialist requirements: Property search, map integration

#### Creative Agency
- Expected content depth: 800+ words (visual-heavy)
- Standard CTA patterns: "View Portfolio", "Get Quote", "Start Project"
- Standard UX flow: Hero → Portfolio → Services → About → Contact
- Standard trust elements: Client logos, case studies, awards
- Typical SEO features: Service keywords, portfolio pages
- Specialist requirements: Visual portfolio, creative showcase

#### Ecommerce
- Expected content depth: 500+ words per product
- Standard CTA patterns: "Add to Cart", "Buy Now", "Shop Now"
- Standard UX flow: Hero → Featured Products → Categories → Cart
- Standard trust elements: Reviews, security badges, return policy
- Typical SEO features: Product schema, category pages, reviews
- Specialist requirements: Product images, checkout flow, trust signals

#### Automotive
- Expected content depth: 1000+ words
- Standard CTA patterns: "Schedule Test Drive", "Get Quote"
- Standard UX flow: Hero → Inventory → Services → About → Contact
- Standard trust elements: Reviews, certifications, warranties
- Typical SEO features: Location + make/model keywords
- Specialist requirements: Inventory search, financing info

---

## 📋 PHASE 6: FINAL OUTPUT FORMAT

### Directory Structure

```
/website_analysis_reports_v4/<domain>/
  ├── expert-panel/
  │   ├── ux-designer.json
  │   ├── product-designer.json
  │   ├── conversion-strategist.json
  │   ├── seo-specialist.json
  │   └── brand-analyst.json
  ├── consensus.json
  ├── perception.json
  ├── heuristics.json
  ├── industry-benchmark.json
  ├── final-score.json
  ├── summary.md
  └── screenshots/
      ├── desktop.png
      ├── tablet.png
      └── mobile.png
```

### JSON Schemas

**expert-panel/ux-designer.json:**
```json
{
  "agent": "UX Designer",
  "focus": "Layout, flow, spacing, navigation",
  "score": 0-10,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "heuristics": {
    "nielsen": { "score": 0-10, "violations": [] },
    "fitts": { "score": 0-10, "issues": [] },
    "hick": { "score": 0-10, "issues": [] }
  },
  "verdict": "Good|Excellent|..."
}
```

**consensus.json:**
```json
{
  "industry": "SaaS|Law|Medical|...",
  "weights": { "ux": 0.30, "visual": 0.20, ... },
  "normalizedScores": { "ux": 8.5, "visual": 7.0, ... },
  "weightedScore": 0-100,
  "anomalies": [],
  "finalVerdict": "Good|Excellent|World-Class"
}
```

**perception.json:**
```json
{
  "firstImpression": 0-25,
  "emotionalResonance": 0-25,
  "cohesion": 0-25,
  "identityRecognition": 0-25,
  "totalScore": 0-100,
  "breakdown": {
    "trust": "high|medium|low",
    "premium": "high|medium|low",
    "memorable": "high|medium|low"
  }
}
```

**final-score.json:**
```json
{
  "url": "...",
  "timestamp": "...",
  "expertScores": { "ux": 8.5, "visual": 7.0, ... },
  "consensusScore": 0-100,
  "perceptionScore": 0-100,
  "weightedFinalScore": 0-100,
  "verdict": "Poor|OK|Good|Excellent|World-Class",
  "meetsExcellentCriteria": true/false
}
```

---

## ✅ FINAL RULE

**v4.0 replaces v3.0.**

v4.0 must evaluate like:
- A senior designer
- A creative director
- A UX lead
- A brand strategist
- A conversion specialist

**ALL AT ONCE.**

---

**Documentation Version:** 1.0  
**Last Updated:** November 19, 2025  
**Status:** Specification Complete - Implementation In Progress

