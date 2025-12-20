# Merlin Website Wizard - Architecture Overview

**Version:** 1.0  
**Last Updated:** January 2025

---

## System Overview

Merlin Website Wizard is a modular, autonomous website builder that produces high-quality, near-world-class business websites. The system is designed to be extensible across industries (law, IT, medical, real estate, etc.) and continuously improves through analysis and learning.

---

## Core Principles

1. **Quality First:** All websites must meet strict quality standards (see `/website_quality_standards/00-website-quality-manifesto.md`)
2. **Modular Design:** Each component is independent and can be extended or replaced
3. **Autonomous Operation:** System works step-by-step with minimal user intervention
4. **Continuous Learning:** Analysis and feedback improve future generations
5. **Industry Agnostic:** Architecture supports any business type

---

## Module Architecture

### 1. Project Setup Wizard (Input & Config)

**Location:** `/client/src/components/IDE/WebsiteBuilderWizard.tsx` (UI)  
**Backend:** `/server/routes.ts` (API endpoints)

**Responsibilities:**

- Collect user input (business info, services, preferences)
- Validate and structure configuration
- Save project config to `/website_projects/<project-slug>/project-config.json`

**Data Flow:**

```
User Input → Validation → project-config.json → Other Modules
```

**Key Data Structure:**

```typescript
{
  projectName: string;
  industry: string;
  location: { city, region, country };
  targetAudiences: string[];
  toneOfVoice: string;
  brandPreferences?: { colorPalette, fontPreferences };
  services: Array<{ name, shortDescription }>;
  pagesToGenerate: string[];
  specialNotes?: string;
}
```

---

### 2. Brand Generator Module

**Location:** `/server/services/brandGenerator.ts`

**Responsibilities:**

- Generate cohesive brand toolkit from project config
- Create color palette (primary, secondary, accent, neutrals)
- Define typography system (heading font, body font, sizes)
- Generate spacing & radius system
- Create brand tagline options

**Input:** `project-config.json`  
**Output:** `/website_projects/<project-slug>/brand.json`

**Data Flow:**

```
project-config.json → Brand Generator → brand.json → Layout Engine
```

**Key Output:**

```typescript
{
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutrals: { background, text, border };
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: { h1, h2, h3, body };
  };
  spacing: { small, medium, large, xlarge };
  borderRadius: string;
  taglines: string[];
}
```

---

### 3. Copywriting / Content Engine

**Location:** `/server/services/contentEngine.ts`

**Responsibilities:**

- Generate deep, specific, conversion-oriented content for each page
- Create structured content objects per page type
- Ensure industry-specific, location-aware copy
- NO generic filler - always specific and actionable

**Input:** `project-config.json`, `brand.json`, page type  
**Output:** `/website_projects/<project-slug>/content/<page>.json`

**Data Flow:**

```
project-config.json + brand.json → Content Engine → content/<page>.json → Layout Engine
```

**Content Schemas:**

- **Home:** hero, whoWeServe, keyServices, differentiators, outcomes, aboutTeaser, howItWorks, faq, finalCTA
- **Services:** intro, overview, detailedServiceSections[], faq, cta
- **About:** hero, story, values, team, standards, highlights, cta
- **Contact:** intro, contactOptions, form, map, faq

**Key Rules:**

- Always mention location and target audience
- Use specific examples, not vague statements
- Include trust elements and social proof
- Action-oriented CTAs

---

### 4. UI/UX Layout & Component Engine

**Location:** `/client/src/components/website/` (React components)  
**Backend:** `/server/services/layoutEngine.ts` (layout recipes)

**Responsibilities:**

- Map content schemas to UI components
- Define layout patterns (hero, card grids, two-column, FAQ, etc.)
- Ensure consistent spacing and brand colors
- Responsive design (desktop + mobile)

**Input:** `content/<page>.json`, `brand.json`  
**Output:** React components or HTML templates

**Data Flow:**

```
content/<page>.json + brand.json → Layout Engine → UI Components → Final Pages
```

**Layout Patterns:**

- HeroSection (two-column: text + image)
- CardGrid (services, benefits, team)
- TwoColumnSection (who we serve, features)
- TimelineSection (how it works, process)
- FAQSection (accordion)
- TestimonialBand (social proof)
- CTASection (conversion)

**Component System:**

- `<HeroSection />` - Full-width hero with H1, CTAs, image
- `<CardGrid />` - Responsive grid of cards
- `<TwoColumnSection />` - Side-by-side content
- `<FAQSection />` - Expandable Q&A
- `<CTASection />` - Prominent call-to-action

---

### 5. SEO Research & Optimization Engine

**Location:** `/server/services/seoEngine.ts`

**Responsibilities:**

- Generate SEO title and meta description per page
- Create keyword-rich headings (H1, H2, H3)
- Suggest URL slugs
- Ensure proper heading hierarchy
- Generate schema markup

**Input:** `project-config.json`, page type, content  
**Output:** `/website_projects/<project-slug>/seo/<page>.json`

**Data Flow:**

```
project-config.json + content → SEO Engine → seo/<page>.json → Website Generator
```

**Key Output:**

```typescript
{
  title: string; // 50-60 chars, includes location + service
  metaDescription: string; // 150-165 chars, includes CTA
  canonicalUrl: string;
  h1: string; // One per page, keyword-rich
  headings: Array<{ level: 2|3, text: string }>;
  keywords: string[];
  schema: object; // JSON-LD schema markup
}
```

**Rules:**

- One H1 per page with primary keyword
- H2/H3 headings are descriptive, not generic
- Include location in titles and headings
- Schema markup for LocalBusiness, LegalService, etc.

---

### 6. Image & Media Engine

**Location:** `/server/services/imageEngine.ts`  
**Uses:** `/server/services/advancedImageService.ts` (DALL·E integration)

**Responsibilities:**

- Determine required images per page
- Generate DALL·E prompts based on industry, location, brand
- Call DALL·E API (or prepare prompts for manual generation)
- Save images and prompts

**Input:** `project-config.json`, `brand.json`, page type  
**Output:**

- `/website_projects/<project-slug>/images/` (generated images)
- `/website_projects/<project-slug>/image-prompts.md` (prompts used)

**Data Flow:**

```
project-config.json + brand.json → Image Engine → DALL·E API → images/ → Layout Engine
```

**Image Requirements:**

- Home hero image
- Service illustrations
- Team/office images
- Abstract backgrounds (optional)

**Prompt Generation:**

- Industry-specific context
- Location references
- Brand color integration
- Tone of voice alignment

---

### 7. Website Generator (File Output)

**Location:** `/server/services/websiteGenerator.ts`  
**Integration:** `/server/services/multipageGenerator.ts`

**Responsibilities:**

- Assemble all modules into final website
- Generate HTML/React components
- Inject SEO meta tags
- Apply brand styling
- Create file structure

**Input:**

- `content/<page>.json`
- `brand.json`
- `seo/<page>.json`
- `images/`

**Output:** Complete website files in `/website_projects/<project-slug>/output/`

**Data Flow:**

```
All Module Outputs → Website Generator → Final Website Files
```

**File Structure:**

```
output/
  index.html
  services.html
  about.html
  contact.html
  assets/
    styles/
      main.css
    scripts/
      app.js
    images/
      hero.jpg
      ...
```

---

### 8. Website Analysis & Scoring Engine ("Judge")

**Location:** `/server/services/websiteAnalyzer.ts`  
**UI:** `/client/src/components/IDE/WebsiteAnalysis.tsx` (to be created)

**Responsibilities:**

- Analyze any website URL against quality standards
- Score each category 0-10
- Generate honest, constructive feedback
- Classify as Poor/OK/Good/Excellent/World-class

**Input:** Website URL  
**Output:** `/website_analysis_reports/<domain>-<timestamp>.json`

**Data Flow:**

```
URL → Fetch HTML → Extract Info → Score Categories → Generate Report
```

**Scoring Categories:**

1. Visual Design & Layout (0-10)
2. UX & Structure (0-10)
3. Content & Positioning (0-10)
4. Conversion & Trust (0-10)
5. SEO Foundations (0-10)
6. Creativity & Differentiation (0-10)

**Rules:**

- Be HONEST, not flattering
- If any category < 7.5, clearly state NOT excellent
- Provide specific, actionable feedback
- Compare against world-class sites in that industry

---

### 9. Learning & Refinement System

**Location:** `/server/services/learningSystem.ts`

**Responsibilities:**

- Auto-analyze generated websites
- Compare scores over time
- Track improvements
- Update quality standards based on learnings

**Data Flow:**

```
Generated Website → Auto-Analysis → Save Report → Compare → Update Standards
```

**Storage:**

- `/website_projects/<project-slug>/analysis/<timestamp>.json` - Internal analysis
- `/docs/improvement-log.md` - Running log of changes and learnings

**Improvement Tracking:**

- Changes to quality rules
- Template/layout updates
- Lessons from real website analyses
- Industry-specific patterns discovered

---

## High-Level Data Flows

### Website Generation Flow

```
User Input
  ↓
Project Setup Wizard
  ↓
project-config.json
  ↓
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Brand Generator │ Content      │ SEO Engine   │ Image Engine │
│                 │ Engine       │              │              │
└─────────────────┴──────────────┴──────────────┴──────────────┘
  ↓
brand.json    content/<page>.json    seo/<page>.json    images/
  ↓
Layout Engine
  ↓
UI Components / HTML
  ↓
Website Generator
  ↓
Final Website Files
  ↓
Auto-Analysis
  ↓
Analysis Report
```

### Website Analysis Flow

```
User Input (URL)
  ↓
Website Analyzer
  ↓
Fetch & Parse HTML
  ↓
Extract Info (title, headings, content, CTAs, etc.)
  ↓
Score Against Rubric
  ↓
Generate Report
  ↓
Save to /website_analysis_reports/
  ↓
Display in UI
```

---

## File Structure

```
/merlin-website-wizard
  /client                    # Frontend (React)
    /src
      /components
        /IDE
          WebsiteBuilderWizard.tsx
          WebsiteAnalysis.tsx (to be created)
        /website
          HeroSection.tsx
          CardGrid.tsx
          ...
  /server                    # Backend (Node/Express)
    /services
      brandGenerator.ts
      contentEngine.ts
      layoutEngine.ts
      seoEngine.ts
      imageEngine.ts
      websiteGenerator.ts
      websiteAnalyzer.ts
      learningSystem.ts
    /routes.ts
  /website_quality_standards
    00-website-quality-manifesto.md
    01-sterling-legal-partners-homepage-spec.md
    ...
  /website_projects
    /<project-slug>
      project-config.json
      brand.json
      /content
        home.json
        services.json
        ...
      /seo
        home.json
        services.json
        ...
      /images
        hero.jpg
        ...
      /analysis
        <timestamp>.json
      /output
        index.html
        ...
  /website_analysis_reports
    <domain>-<timestamp>.json
  /docs
    merlin-architecture.md
    ui-patterns.md
    improvement-log.md
```

---

## Integration Points

### Frontend ↔ Backend

- **Project Setup:** `POST /api/website-builder/projects` - Create/update project config
- **Generate Website:** `POST /api/website-builder/generate` - Trigger full generation
- **Analyze Website:** `POST /api/website-builder/analyze` - Analyze external URL
- **Get Project:** `GET /api/website-builder/projects/:slug` - Retrieve project data

### Module Dependencies

```
Project Setup Wizard
  ↓
Brand Generator (depends on: project-config)
  ↓
Content Engine (depends on: project-config, brand.json)
  ↓
SEO Engine (depends on: project-config, content)
  ↓
Image Engine (depends on: project-config, brand.json)
  ↓
Layout Engine (depends on: content, brand.json)
  ↓
Website Generator (depends on: all above)
  ↓
Website Analyzer (independent, analyzes any URL)
```

---

## Quality Standards Integration

**Every module must:**

1. Read `/website_quality_standards/00-website-quality-manifesto.md` before operation
2. Apply quality standards in its domain
3. Never call output "excellent" if any category < 7.5/10
4. Be honest and critical in self-evaluation

---

## Extension Points

### Adding New Industries

1. Create industry-specific content templates in Content Engine
2. Add industry-specific image prompts in Image Engine
3. Update SEO Engine with industry keywords
4. Document in `/docs/industries/<industry>.md`

### Adding New Page Types

1. Define content schema in Content Engine
2. Create layout recipe in Layout Engine
3. Add SEO template in SEO Engine
4. Update project-config schema

### Adding New Analysis Features

1. Extend Website Analyzer with new checks
2. Update scoring rubric if needed
3. Document in quality manifesto

---

## Next Steps

1. ✅ Phase 0: Folder structure aligned
2. ✅ Phase 1: Quality standards verified
3. ✅ Phase 2: Architecture documented
4. ⏳ Phase 3-12: Implement remaining modules

---

**Last Updated:** January 2025
