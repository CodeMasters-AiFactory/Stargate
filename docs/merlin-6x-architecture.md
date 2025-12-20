# Merlin Website Wizard v6.x Architecture

**Version:** 6.0-ai-design  
**Last Updated:** 2025-01-20

---

## Overview

Merlin v6.x transforms the system from a template-driven generator into a **TRUE AI DESIGN ENGINE** with LLM-powered planning, styling, and optimization at every stage.

---

## Version History

### v5.1 (Emergency Upgrade)

- ✅ LLM content for ALL sections
- ✅ DALL-E image generation (hero + supporting)
- ✅ Modern CSS improvements

### v6.0 (Foundations)

- ✅ Versioning system
- ✅ Folder structure (`server/ai/`, `config/`, `docs/`)
- ✅ Pipeline logging
- ✅ Metadata generation

### v6.1 (AI Section Planner) - ✅ Complete

- ✅ `layoutPlannerLLM.ts` - AI-powered section planning
- ✅ Integrated into main pipeline
- ✅ Fallback to rule-based plan if LLM fails
- ✅ Section plan saved to `section-plan.json`

### v6.2 (AI Style Designer) - ✅ Complete

- ✅ `styleDesignerLLM.ts` - AI-powered color palette and typography generation
- ✅ Integrated into main pipeline
- ✅ Only activates for niche industries (not in known list)
- ✅ Merges AI style into base style system
- ✅ Fallback to base style if LLM fails
- ✅ Style system saved to `style-system.json`

### v6.3 (Component Variants) - ✅ Complete

- ✅ `section-variants.json` - Variant catalog with metadata
- ✅ `sectionVariantResolver.ts` - Intelligent variant selection
- ✅ Extended `SectionDefinition` with variantId and variantMeta
- ✅ Variant-aware HTML generator with separate render functions
- ✅ Complete CSS for all variant layouts
- ✅ JavaScript for interactive variants (FAQ accordion, carousel)
- ✅ Integrated into layout generation pipeline

### v6.4 (Responsive Layout Engine) - ✅ Complete

- ✅ `layout-rules.json` - Centralized breakpoint and layout config
- ✅ `responsiveRules.ts` - Responsive rules for all variants
- ✅ Mobile-first CSS generation with progressive enhancement
- ✅ Responsive container structure (`<main class="cm-main">`)
- ✅ Variant-specific responsive behavior (columns, image position, layout)
- ✅ Responsive typography and spacing scales
- ✅ All images scale properly (`max-width: 100%`)
- ✅ No horizontal overflow on any viewport
- ✅ Integrated into CSS and HTML generation

### v6.5 (AI Image Planner) - ✅ Complete

- ✅ `imagePlannerLLM.ts` - AI-powered image planning per section
- ✅ `planImagesForSite()` - Generates intelligent prompts based on industry, tone, style
- ✅ `generateSectionImagesV65()` - Generates images using AI-planned prompts
- ✅ Style hint extraction from v6.2 style system
- ✅ Image plan mapping to sections by `sectionKey`
- ✅ Support for hero, supporting, icon, background image purposes
- ✅ `supportImages` array for additional images (icons, avatars)
- ✅ Enhanced features/services rendering with icon images
- ✅ Metadata tracking (plannedImages, generatedImages)
- ✅ Fallback image plan when AI unavailable

### v6.6 (AI Copywriting 3.0) - ✅ Complete

- ✅ `copywriterLLM.ts` - Full LLM-powered copywriting system using GPT-4o
- ✅ `generateCopyForSections()` - Generates unique, premium copy for each section
- ✅ Industry-specific, SEO-aware, conversion-focused copy
- ✅ Tone-aware (professional, warm, bold, luxury, etc.)
- ✅ Aligned with v6.1 section plan, v6.2 style system, v6.3 variants, v6.5 image plans
- ✅ Section-specific requirements (hero vs features vs about vs testimonials)
- ✅ Text alignment based on variant (centered, left, right)
- ✅ Style system colors applied to headings and CTAs
- ✅ Semantic HTML tags (`<h1>` for hero, `<h2>` for other sections)
- ✅ Dynamic CTA buttons with descriptions
- ✅ Metadata tracking (copywriterVersion, sectionsWithCopy)
- ✅ Fallback copy generation when AI unavailable

### v6.7 (AI SEO Engine + Metadata System) - **CURRENT**

- ✅ `seoEngineLLM.ts` - Full LLM-powered SEO metadata generation using GPT-4o
- ✅ `generateSEOForSite()` - Generates comprehensive SEO metadata
- ✅ Page title (60-65 chars), meta description (150-160 chars), keywords
- ✅ Open Graph tags (og:title, og:description, og:image)
- ✅ Twitter Card tags
- ✅ Schema.org JSON-LD (LocalBusiness, SoftwareApplication, Organization, etc.)
- ✅ Clean URL slugs (lowercase, hyphen-separated)
- ✅ SEO score estimation (0-100)
- ✅ Readability optimization hints
- ✅ Industry-specific schema type detection
- ✅ HTML injection in `<head>` section
- ✅ Canonical URLs
- ✅ Metadata tracking (seoEngineVersion, seo, slug)
- ✅ Fallback SEO generation when AI unavailable

### v6.8 (Multi-Page Architecture) - ✅ Complete

- ✅ `pagePlanner.ts` - Plans pages based on industry and section types
- ✅ `multiPageGenerator.ts` - Generates multiple HTML pages with shared navigation
- ✅ Industry-specific page structures:
  - SaaS: home, features, pricing, contact
  - Law/Consulting: home, services, about, contact
  - Nonprofit: home, mission, projects, about, contact
  - Default Business: home, services, about, contact
- ✅ Shared navigation system with responsive mobile menu
- ✅ Page-specific SEO metadata (titles, descriptions, schema)
- ✅ Shared header/footer across all pages
- ✅ Navigation JavaScript for mobile toggle
- ✅ Responsive navigation CSS (hamburger menu < 768px)
- ✅ Page plan saved to `page-plan.json`
- ✅ Metadata includes multi-page structure (pages, navigation)
- ✅ All pages share CSS and JavaScript
- ✅ Section distribution across pages (max 5 sections per page)

### v6.9 (Global Theme Engine) - ✅ Complete

- ✅ `themeEngineLLM.ts` - Unified design theme generation using GPT-4o
- ✅ Color palette harmonization (primary, secondary, accent, neutrals)
- ✅ Typography system (display, heading, body fonts with scale)
- ✅ Spacing scale (xs, sm, md, lg, xl)
- ✅ Shadow system (level1, level2, level3)
- ✅ Mood extraction from industry + tone
- ✅ Design token system with CSS variables
- ✅ Theme applied to all CSS generation
- ✅ Navigation uses theme colors and shadows
- ✅ Footer uses theme neutrals
- ✅ Buttons use theme primary/accent colors
- ✅ Headings use theme typography scale
- ✅ Hero uses display font from theme
- ✅ Google Fonts integration with theme fonts
- ✅ Theme saved to `global-theme.json`
- ✅ Theme included in metadata.json
- ✅ Fallback theme generation from style system

### v6.10 (Cleanup, Hardening & Final Documentation) - ✅ Complete

- ✅ Pipeline status system (`server/status/merlinStatus.ts`)
- ✅ Centralized constants (`server/config/constants.ts`)
- ✅ Enhanced metadata with pipeline version and module versions
- ✅ Improved error handling across all AI modules
- ✅ Master entry point documentation
- ✅ Legacy generator deprecation markers
- ✅ CSS cleanup (removed hardcoded styles, theme tokens applied)
- ✅ Version system updated to v6.10
- ✅ Final documentation updates

**Legacy Generators (Deprecated):**

- `unifiedWebsiteGenerator.ts` - Marked deprecated, kept for reference
- `sterlingWebsiteGenerator.ts` - Marked deprecated, kept for reference
- `multipageGenerator.ts` (old) - Marked deprecated, use `generator/multiPageGenerator.ts` (v6.8)

**Active Fallback:**

- `copywritingV2.ts` - Active fallback system, not deprecated

---

## Data Flow

### Pipeline Flow (v6.10)

```
Project Config
    ↓
1. Design Context (v6.0)
   - Generate design strategy (AI design reasoner)
   - Build design context from config
   - Create design outputs
    ↓
2. Section Planning (v6.1)
   - AI section planner generates optimal structure
   - Falls back to rule-based plan if AI fails
   - Section plan saved to section-plan.json
    ↓
3. Style System (v6.2)
   - Generate base style system
   - AI style designer for niche industries (if needed)
   - Falls back to base system if AI fails
    ↓
4. Layout Generation (v6.3 + v6.4)
   - Generate layout with section variants
   - Apply responsive rules
   - Variant selection based on context
    ↓
5. Image Planning (v6.5)
   - AI image planner generates prompts
   - Industry-specific, style-aware planning
   - Falls back to rule-based plan if AI fails
    ↓
6. Image Generation (v6.5)
   - Generate images using AI-planned prompts
   - DALL-E integration
    ↓
7. Copywriting (v6.6)
   - AI copywriter generates premium copy
   - Industry-specific, SEO-aware, conversion-focused
   - Falls back to template-based copy if AI fails
    ↓
8. SEO Engine (v6.7)
   - AI SEO engine generates metadata
   - Titles, descriptions, keywords, OG tags, Schema.org
   - Falls back to rule-based SEO if AI fails
    ↓
9. Global Theme (v6.9)
   - Theme engine harmonizes all visual elements
   - Unified palette, typography, spacing, shadows
   - Falls back to style system-based theme if AI fails
    ↓
10. Multi-Page Planning (v6.8)
    - Page planner creates industry-specific structure
    - Section distribution across pages
    ↓
11. Code Generation (v6.8 + v6.9)
    - Generate all HTML pages with shared navigation
    - Apply theme tokens throughout
    - Generate CSS with design tokens
    - Generate JavaScript
    ↓
12. Quality Assessment
    - Real quality assessment (if app provided)
    - Iteration loop for improvements
    ↓
13. Metadata & Output
    - Save comprehensive metadata.json
    - Save all generation artifacts
    - Return GeneratedWebsite object
```

### AI Module Roles

**layoutPlannerLLM.ts (v6.1):**

- Analyzes business requirements
- Generates optimal section structure
- Returns ordered section plan with importance levels

**styleDesignerLLM.ts (v6.2):**

- Generates color palettes for niche industries
- Generates typography pairings
- Only activates if industry not in known list

**imagePlannerLLM.ts (v6.5):**

- Plans images for each section
- Generates industry-specific prompts
- Maps image purposes (hero, supporting, icon, background)

**copywriterLLM.ts (v6.6):**

- Generates premium copy for all sections
- Industry-specific, tone-aware
- SEO-aware, conversion-focused

**seoEngineLLM.ts (v6.7):**

- Generates comprehensive SEO metadata
- Page titles, descriptions, keywords
- Open Graph tags, Schema.org JSON-LD

**themeEngineLLM.ts (v6.9):**

- Harmonizes all visual elements
- Unified color palette, typography system
- Spacing scale, shadow system
- Mood extraction

### Fallback Behavior

Every AI module has a fallback to ensure generation always completes:

1. **layoutPlannerLLM** → Rule-based section plan (hero, value-prop, services, testimonials, about, contact)
2. **styleDesignerLLM** → Base style system (no AI override)
3. **imagePlannerLLM** → Rule-based image plan (hero image, generic supporting images)
4. **copywriterLLM** → Template-based copy from copywritingV2.ts
5. **seoEngineLLM** → Rule-based SEO metadata (industry + project name)
6. **themeEngineLLM** → Style system-based theme (extracted from style system)

**Recoverable Errors:**

- All AI failures are logged but don't crash generation
- Fallbacks ensure functional output
- Generation always completes successfully

---

## Architecture

### Folder Structure

```
server/
  ai/
    version.ts              # Version system
    layoutPlannerLLM.ts    # v6.1: AI section planner
    styleDesignerLLM.ts     # v6.2: AI style designer
    designReasoner.ts      # v6.0: Design strategy
    (future modules...)

  generator/
    sectionVariantResolver.ts  # v6.3: Variant selection logic
    (other generators...)

config/
  section-variants.json     # v6.3: Variant catalog
  layout-rules.json         # v6.4: Breakpoints and layout config

  generator/
    layoutLLM.ts           # Layout generation (uses section plan)
    styleSystem.ts         # Style generation
    contentLLM.ts          # Content generation
    codeGenerator.ts       # HTML/CSS generation

  services/
    merlinDesignLLM.ts     # Main orchestrator

config/
  section-variants.json    # (v6.3)
  layout-rules.json        # (v6.3)
  typography.json          # (v6.2)

docs/
  merlin-6x-architecture.md  # This file
  CHANGELOG-6x.md            # (v6.10)
```

---

## Pipeline Flow (v6.1)

1. **Version Logging** (`version.ts`)
   - Logs pipeline version at start
   - Creates metadata files

2. **Design Strategy** (`designReasoner.ts`)
   - AI-generated design personality
   - Color/layout direction

3. **Design Context** (`designThinking.ts`)
   - Legacy compatibility layer
   - Will be phased out

4. **Section Planning** (`layoutPlannerLLM.ts`) - **NEW v6.1**
   - AI generates optimal section structure
   - Returns ordered section plan
   - Falls back to rule-based if LLM fails

5. **Layout Generation** (`layoutLLM.ts`)
   - Uses section plan to build layout
   - Blueprint selection (still template-based)

6. **Style System** (`styleSystem.ts`)
   - Color palette and typography
   - (v6.2 will make this AI-generated)

7. **Content Generation** (`contentLLM.ts`)
   - LLM content for all sections
   - Per-section fallback

8. **Image Generation** (`advancedImageService.ts`)
   - DALL-E images for hero + supporting

9. **Code Generation** (`codeGenerator.ts`)
   - HTML/CSS output
   - Modern design tokens

10. **Quality Assessment** (`qualityAssessment.ts`)
    - Real quality scoring
    - (v6.6 will add AI critique)

---

## Module: styleDesignerLLM.ts (v6.2)

### Purpose

AI-powered style generation that creates custom color palettes and typography for niche industries.

### Inputs

- `projectConfig`: Business name, industry, tone, audience
- `designContext`: Emotional tone, brand voice, audience info

### Outputs

```typescript
{
  primaryColor: "#HEXCODE",
  secondaryColor: "#HEXCODE",
  accentColor: "#HEXCODE",
  backgroundColor: "#HEXCODE",
  surfaceColor: "#HEXCODE",
  headingFont: "Font Name",
  bodyFont: "Font Name",
  styleNotes?: "Explanation"
}
```

### Integration

- Called in Phase 4 if industry is NOT in known list
- Merged into base style system via `mergeStyleSystems()`
- Final style system used for CSS generation

### Fallback

If LLM fails:

- Uses base style system (from JSON lookup)
- Always functional, never blocks generation

### Known Industries

Legal, Law Firm, SaaS, Software, Ecommerce, Restaurant, Real Estate, Finance, Healthcare, Medical, Fitness, Gym, Education, Consulting, Marketing, Agency, Construction, Manufacturing, Hospitality, Tourism, Automotive, Beauty, Salon, Dentist, Veterinary, Pet, Nonprofit, Charity

### Niche Industries (Trigger AI)

Any industry NOT in the known list (e.g., "Marine Biology Research", "Quantum Computing", "Space Tourism")

---

## Module: layoutPlannerLLM.ts (v6.1)

### Purpose

AI-powered section planning that determines optimal homepage structure.

### Inputs

- `projectConfig`: Business name, industry, tone, audience, services

### Outputs

```typescript
{
  sections: [
    { key: "hero-1", type: "hero", importance: "high", notes: "...", order: 1 },
    ...
  ],
  rationale: "Explanation of section choices",
  totalSections: 5
}
```

### Integration

- Called after design context generation
- Section order injected into `designOutputs.sectionSequence`
- Layout generator uses this sequence

### Fallback

If LLM fails:

- Uses rule-based section plan
- Includes: hero, value-prop, services (if exists), testimonials, about, contact
- Always functional, never blocks generation

---

## Future Versions

### v6.2 - AI Style Designer

- Generate color palettes with LLM
- Generate typography pairings
- Override for niche industries

### v6.3 - Component Variants

- Section variant system
- Multiple layout options per section type
- Variant selection based on context

### v6.4 - Responsive Engine

- True mobile-first design
- Centralized breakpoints
- Intelligent responsive rules

### v6.5 - AI Image Planner

- Structured image planning per section
- Industry-specific prompts
- Image purpose mapping

### v6.6 - Quality Judge

- AI aesthetic scoring
- Critique and suggestions
- Auto-adjustments for minor issues

### v6.7 - Multi-page Sitemap Planner

- AI sitemap generation
- Multi-page support
- Page-specific section plans

### v6.8 - Multi-Page Architecture ✅ Complete

- Multi-page website generation
- Page planner (`pagePlanner.ts`) - Plans pages based on industry
- Multi-page generator (`multiPageGenerator.ts`) - Generates all HTML pages
- Shared navigation system with responsive mobile menu
- Page-specific SEO metadata
- Shared header/footer across all pages
- Navigation JavaScript for mobile toggle
- Page plan saved to `page-plan.json`
- Metadata includes multi-page structure

**Page Types:**

- Home (always exists)
- Services/Features (industry-dependent)
- About (for law/consulting/business)
- Contact (standard)
- Pricing (SaaS only)
- Mission/Projects (nonprofit only)

### v6.9 - Global Theme Engine ✅ Complete

- Unified design theme generation
- Color harmonization
- Typography system
- Design tokens

### v6.10 - Cleanup & Documentation ✅ Complete

- Pipeline status system
- Centralized constants
- Enhanced error handling
- Legacy generator deprecation
- Final documentation

---

## Safety & Fallbacks

### Core Principle

**NEVER block generation on AI failures.**

Every AI module has a fallback:

- `layoutPlannerLLM.ts` → Rule-based section plan
- `designReasoner.ts` → Simplified strategy
- `contentLLM.ts` → Template-based content
- `advancedImageService.ts` → Mock SVG images

### Error Handling

- All AI calls wrapped in try-catch
- Log warnings, continue with fallback
- Generation always completes

---

## Testing

### Verification Checklist

- [ ] Pipeline version logged at start
- [ ] Section plan generated (AI or fallback)
- [ ] `section-plan.json` saved to output
- [ ] `metadata.json` saved to output
- [ ] `pipeline-version.txt` saved to output
- [ ] Layout uses section plan order
- [ ] Generation completes even if LLM fails

---

## Known Limitations

1. **Layout Selection:** Still uses blueprint scoring (not AI)
   - Will be addressed in v6.3 (Component Variants)

2. **Style System:** Still uses JSON lookup (not AI)
   - Will be addressed in v6.2 (AI Style Designer)

3. **Code Generation:** Still string concatenation (not semantic)
   - Will be addressed in v6.8 (Export Modes)

4. **Iteration:** Exists but doesn't improve designs
   - Will be addressed in v6.6 (Quality Judge)

---

## Migration Notes

### From v5.1 to v6.1

- ✅ Backward compatible
- ✅ All v5.1 features preserved
- ✅ New section planning adds intelligence
- ✅ No breaking changes

### API Compatibility

- Same endpoint: `/api/website-builder/generate`
- Same request format
- Same response format
- Additional metadata files in output

---

## Next Steps

1. **Test v6.1** with real website generation
2. **Verify** section plans are used correctly
3. **Begin v6.2** (AI Style Designer)
