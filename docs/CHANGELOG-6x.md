# Merlin Website Wizard v6.x Changelog

---

## v6.7 - AI SEO Engine + Metadata System (2025-01-20)

### Added

- **AI SEO Engine** (`server/ai/seoEngineLLM.ts`)
  - Full LLM-powered SEO metadata generation using GPT-4o
  - Generates page title (60-65 chars), meta description (150-160 chars), keywords, OG tags
  - Generates Schema.org JSON-LD (LocalBusiness, SoftwareApplication, Organization, etc.)
  - Generates clean URL slugs (lowercase, hyphen-separated)
  - Estimates SEO score (0-100) and provides readability hints
  - Industry-specific schema type detection

- **SEO Integration** (`server/services/merlinDesignLLM.ts`)
  - Phase 6.6: AI SEO Engine (after copywriting, before HTML generation)
  - Calls `generateSEOForSite()` with design context, section plan, section copies, image plans
  - Saves SEO metadata to `seo-metadata.json`
  - Stores SEO result in metadata

- **HTML SEO Injection** (`server/generator/codeGenerator.ts`)
  - Injects `<title>` tag from SEO result
  - Injects `<meta name="description">` tag
  - Injects `<meta name="keywords">` tag
  - Injects Open Graph tags (og:title, og:description, og:image)
  - Injects Twitter Card tags
  - Injects canonical URL (`<link rel="canonical">`)
  - Injects Schema.org JSON-LD (`<script type="application/ld+json">`)

- **Metadata Tracking**
  - `metadata.json` includes `seoEngineVersion: "6.7"`
  - `metadata.json` includes `seo` object (full SEO result)
  - `metadata.json` includes `slug` field
  - `seo-metadata.json` saved separately for reference

### Changed

- **Code Generator** (`server/generator/codeGenerator.ts`)
  - `generateWebsiteCode()` now accepts optional `seoResult` parameter
  - `generateHTML()` now accepts optional `seoResult` parameter
  - HTML `<head>` section now includes all SEO metadata
  - Schema.org JSON-LD injected in `<head>`

- **Version System** (`server/ai/version.ts`)
  - Updated `MERLIN_VERSION` to `'6.7-ai-seo-engine'`
  - Added `'v6.7-ai-seo-engine'` to features array

### Technical Details

- SEO generation happens in Phase 6.6 (after copywriting, before HTML generation)
- Uses GPT-4o with comprehensive prompt including:
  - Industry, tone, primary goal
  - Hero headline and copy from v6.6
  - Features/services copy from v6.6
  - Hero image from v6.5
  - Schema type determination (LocalBusiness, SoftwareApplication, Organization, etc.)
- Title validation: 60-65 characters (truncated if longer, extended if shorter)
- Description validation: 150-160 characters (truncated if longer, extended if shorter)
- Schema.org JSON-LD includes:
  - @context: "https://schema.org"
  - @type: Determined by industry (LocalBusiness, SoftwareApplication, Organization, etc.)
  - name, description, url (required)
  - Industry-specific fields (address, telephone, applicationCategory, etc.)
- Slug generation: Clean, lowercase, hyphen-separated, max 50 chars
- OG image uses hero image URL from v6.5
- Fallback SEO generation when AI unavailable

### Schema Types

- **LocalBusiness**: Law firms, restaurants, medical practices, real estate
- **SoftwareApplication**: SaaS, software, apps, platforms
- **Organization**: Nonprofits, NGOs, foundations, institutes, research
- **LegalService**: Law firms, attorneys, legal services
- **Restaurant**: Restaurants, cafes, food services
- **MedicalBusiness**: Medical practices, clinics, healthcare
- **RealEstateAgent**: Real estate, realtors, property
- **EducationalOrganization**: Education, schools, universities

### Impact

- **Before v6.7:**
  - No SEO metadata
  - No Schema.org markup
  - No OG tags for social sharing
  - No canonical URLs
  - Poor search engine visibility

- **After v6.7:**
  - ✅ Complete SEO metadata (title, description, keywords)
  - ✅ Schema.org JSON-LD for rich snippets
  - ✅ Open Graph tags for social sharing
  - ✅ Twitter Card tags
  - ✅ Canonical URLs
  - ✅ SEO score estimation
  - ✅ Readability optimization hints
  - ✅ Industry-specific schema types
  - ✅ Optimized character lengths (title: 60-65, description: 150-160)

### Example SEO Metadata

**Law Firm:**

```json
{
  "title": "Premium Legal Services | Smith & Associates Law",
  "description": "Smith & Associates offers expert legal guidance with 30+ years of experience. Trusted attorneys specializing in complex litigation, business law, and personal injury. Book your consultation today.",
  "keywords": ["legal services", "law firm", "attorneys", "litigation", "business law"],
  "schemaLD": {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": "Smith & Associates Law",
    "description": "..."
  }
}
```

**SaaS:**

```json
{
  "title": "CloudSync Pro - Secure Cloud Storage Platform",
  "description": "CloudSync Pro provides enterprise-grade cloud storage and file synchronization. Secure, fast, and reliable. Start your free trial today.",
  "keywords": ["cloud storage", "file sync", "SaaS", "cloud platform", "dashboard"],
  "schemaLD": {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CloudSync Pro",
    "applicationCategory": "BusinessApplication"
  }
}
```

---

## v6.6 - AI Copywriting 3.0 (2025-01-20)

### Added

- **AI Copywriter 3.0** (`server/ai/copywriterLLM.ts`)
  - Full LLM-powered copywriting system using GPT-4o
  - Replaces ALL template-based text with premium, industry-specific, SEO-aware copy
  - `generateCopyForSections()` function generates unique copy for each section
  - Structured `SectionCopy` interface with headline, subheadline, paragraph, bullets, CTA
  - One LLM call per section with strict JSON output
  - Industry-specific, tone-aware, conversion-focused copy

- **Copy Integration** (`server/services/merlinDesignLLM.ts`)
  - Phase 6.5: AI Copywriting 3.0 (after image generation, before HTML generation)
  - Attaches `section.copy` to each `SectionDefinition`
  - Saves section copies to `section-copies.json`
  - Logs copy generation for each section

- **Enhanced HTML Rendering** (`server/generator/codeGenerator.ts`)
  - All section renderers updated to use `section.copy` (v6.6 LLM copy)
  - Fallback to legacy `copy` object if v6.6 copy unavailable
  - Text alignment based on variant (centered, left, right)
  - Style system colors applied to headings and CTAs
  - Semantic HTML tags: `<h1>` for hero, `<h2>` for other sections
  - Dynamic CTA buttons with descriptions

- **Metadata Tracking**
  - `metadata.json` includes `copywriterVersion: "6.6"`
  - `metadata.json` includes `sectionsWithCopy` array
  - `section-copies.json` saved separately for reference

### Changed

- **SectionDefinition Interface** (`server/generator/layoutLLM.ts`)
  - Added `copy?: SectionCopy` field for v6.6 LLM-generated copy

- **Hero Section Renderers** (`server/generator/codeGenerator.ts`)
  - All hero variants now use `section.copy` for headline, subheadline, paragraph, CTA
  - Text alignment based on variant
  - Style system colors applied

- **About Section Renderers** (`server/generator/codeGenerator.ts`)
  - Now use `section.copy` for headline, paragraph, bullets, CTA
  - Bullets rendered as `<ul>` list

- **Features/Services Section Renderers** (`server/generator/codeGenerator.ts`)
  - Now use `section.copy.bullets` for feature items
  - Style system colors applied to headings

- **CTA Section Renderers** (`server/generator/codeGenerator.ts`)
  - Now use `section.copy` for headline, paragraph, CTA
  - CTA descriptions rendered

- **Version System** (`server/ai/version.ts`)
  - Updated `MERLIN_VERSION` to `'6.6-ai-copywriting-3.0'`
  - Added `'v6.6-ai-copywriting-3.0'` to features array

### Technical Details

- Copy generation happens in Phase 6.5 (after image generation, before HTML generation)
- Each section gets one LLM call with comprehensive prompt including:
  - Industry, primary goal, emotional tone
  - Section type, variant, importance, notes
  - Planned image prompt (for consistency)
  - Style system (colors, typography, mood)
  - Section-specific requirements (hero vs features vs about, etc.)
- Prompts instruct GPT-4o to:
  - Write as human professional copywriter
  - Write for website conversion
  - Match section purpose
  - Use industry-specific terminology
  - Be SEO-optimized
  - Be unique (zero templates)
  - Be consistent with image style
- Rate limiting: 500ms between section copy requests
- Fallback copy generation when AI unavailable
- Text alignment: centered for centered variants, left/right for split variants

### Impact

- **Before v6.6:**
  - Template-based, generic copy
  - Same phrases across different industries
  - No alignment with images or style system
  - Weak CTAs

- **After v6.6:**
  - ✅ Unique, premium, industry-specific copy
  - ✅ SEO-optimized, conversion-focused
  - ✅ Consistent with image prompts and style system
  - ✅ Tone-aware (professional, warm, bold, luxury, etc.)
  - ✅ Section-type appropriate (hero vs features vs about)
  - ✅ Strong, action-oriented CTAs
  - ✅ Proper semantic HTML tags

---

## v6.5 - AI Image Planner (2025-01-20)

### Added

- **AI Image Planner** (`server/ai/imagePlannerLLM.ts`)
  - Uses GPT-4o to generate intelligent image prompts per section
  - Plans images based on industry, tone, layout variant, and style system
  - Returns structured `PlannedImage` objects with purpose, prompt, styleHint, and alt text
  - Extracts style hints from v6.2 style system (colors, typography, mood)
  - Fallback image plan when AI is unavailable

- **Image Planning Integration** (`server/services/merlinDesignLLM.ts`)
  - Calls `planImagesForSite()` before image generation (Phase 5.5)
  - Maps planned images to sections by `sectionKey`
  - Attaches `imagePlans` to each `SectionDefinition`
  - Saves image plan to `image-plan.json`

- **AI-Planned Image Generation** (`generateSectionImagesV65()`)
  - Generates images using AI-planned prompts (not generic prompts)
  - Hero sections always use AI-planned hero prompts
  - Supporting/icon/background images use planned prompts
  - Populates `section.imageUrl` (primary) and `section.supportImages[]` (additional)
  - Rate limiting between image requests
  - Logs image generation progress

- **Enhanced Section Rendering** (`server/generator/codeGenerator.ts`)
  - Features/services sections use `supportImages` for icons when available
  - Testimonials can use avatars from `imagePlans` (optional)
  - All section variants properly render planned images
  - Images placed correctly based on variant layout (side, background, icons)

- **Metadata Tracking**
  - `metadata.json` includes `imagePlannerVersion: "6.5"`
  - `metadata.json` includes `plannedImages` array (full plan)
  - `metadata.json` includes `generatedImages` array (actual URLs)
  - `image-plan.json` saved separately for reference

### Changed

- **Image Generation Flow** (`server/services/merlinDesignLLM.ts`)
  - Replaced old `generateSectionImages()` with `generateSectionImagesV65()`
  - Image generation now uses AI-planned prompts instead of generic prompts
  - Hero images always use AI-planned prompts (no more generic hero images)
  - Supporting images use industry-specific, style-matched prompts

- **SectionDefinition Interface** (`server/generator/layoutLLM.ts`)
  - Added `imagePlans?: PlannedImage[]` field
  - Added `supportImages?: Array<{ url: string; alt: string }>` field
  - Added `key?: string` field for section identification

- **Features/Services Rendering** (`server/generator/codeGenerator.ts`)
  - `renderFeatures2Column()` now uses `supportImages` for icons
  - Icons fall back to emoji if no images available
  - Icon images properly sized and styled

### Technical Details

- Image planning happens in Phase 5.5 (after style system, before image generation)
- Planned images mapped to sections by `section.key` (e.g., "hero-1", "about-1")
- Hero images: always 1 per hero section, HD quality, cinematic style
- Supporting images: 1-3 per section depending on type, standard/HD quality
- Icon images: simple illustrations, standard quality
- Background images: subtle, atmospheric, HD quality
- Rate limiting: 1 second between additional images
- Style hints extracted from v6.2 style system (oceanic → "cool teal/cyan lighting")
- Prompts incorporate industry, tone, color palette, visual identity

### Impact

- Hero images now match industry (e.g., marine biology → underwater scenes, not generic offices)
- Supporting images align with style system (e.g., oceanic palette → marine visuals)
- Features/services have appropriate icons/illustrations
- Visual consistency across all sections
- No more generic SaaS icons for marine biology sites
- Images properly placed based on variant layout

---

## v6.4 - Responsive Layout Engine (2025-01-20)

### Added

- **Centralized Breakpoint System** (`config/layout-rules.json`)
  - Single source of truth for breakpoints (mobile: 0, tablet: 768, laptop: 1024, desktop: 1440)
  - Container settings (max-width, padding per breakpoint)
  - Responsive spacing and typography scales
  - Mobile-first approach

- **Responsive Rules Engine** (`server/generator/responsiveRules.ts`)
  - Defines responsive behavior for all 30+ section variants
  - Rules specify columns, image position, layout, spacing per breakpoint
  - Helper functions: `getResponsiveRulesForVariant()`, `getResponsiveRulesForSectionType()`
  - Safe fallback rules for unknown variants

- **Mobile-First CSS Generation** (`server/generator/codeGenerator.ts`)
  - Base styles = mobile (0px+)
  - Progressive enhancement via `@media (min-width: Xpx)`
  - CSS variables for breakpoints, containers, spacing, typography
  - Responsive grid layouts that adapt per breakpoint
  - Image scaling: `max-width: 100%; height: auto;`

- **Responsive Container Structure**
  - `<main class="cm-main">` wrapper with max-width and responsive padding
  - Container padding: 1.5rem (mobile) → 2rem (tablet) → 3rem (desktop)
  - Prevents horizontal overflow

- **Variant-Specific Responsive Rules**
  - Hero variants: stacked on mobile, split on tablet+
  - Features variants: 1 col (mobile) → 2 col (tablet) → 3-4 col (desktop)
  - About variants: stacked on mobile, split on tablet+
  - Testimonials variants: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
  - Pricing variants: 1 col (mobile) → 2-3 col (tablet/desktop)
  - All variants have explicit responsive behavior

### Changed

- **CSS Generation** (`server/generator/codeGenerator.ts`)
  - Loads `layout-rules.json` for breakpoints and settings
  - Generates CSS variables for responsive values
  - Mobile-first media queries (min-width)
  - Responsive typography scales
  - Grid layouts adapt columns per breakpoint

- **HTML Structure** (`server/generator/codeGenerator.ts`)
  - Wraps content in `<main class="cm-main">` for responsive container
  - Images always use `max-width: 100%; height: auto;`
  - Sections apply responsive classes based on variant rules

- **Section Rendering** (`server/generator/codeGenerator.ts`)
  - Looks up responsive rules for each variant
  - Logs responsive rules application
  - Applies responsive classes/styles based on rules

- **Metadata** (`server/services/merlinDesignLLM.ts`)
  - Added `responsiveEngineVersion: '6.4'` to metadata

### Technical Details

- Breakpoints: 0px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
- Mobile-first: base styles for mobile, enhance for larger screens
- All images scale properly: `max-width: 100%; height: auto;`
- No horizontal overflow: `overflow-x: hidden` on body
- Container max-width: 1200px with responsive padding
- Typography scales: hero (2rem → 3rem → 4rem), sections (1.75rem → 2.25rem → 3rem)
- Grid columns adapt: 1 (mobile) → 2 (tablet) → 3-4 (desktop)

### Impact

- All generated sites are fully responsive
- No horizontal scroll on any viewport size
- Sections stack properly on mobile
- Multi-column layouts work on tablet/desktop
- Typography scales appropriately
- Images never overflow containers
- Consistent responsive behavior across all variants

---

## v6.3 - Component & Section Variants (2025-01-20)

### Added

- **Section Variants Catalog** (`config/section-variants.json`)
  - Multiple layout variants per section type
  - Variants for: hero, features, about, testimonials, pricing, cta, contact, faq
  - Each variant includes bestForGoals and bestForIndustries metadata
  - Layout hints for responsive behavior

- **Variant Resolver** (`server/generator/sectionVariantResolver.ts`)
  - Intelligent variant selection based on industry, goals, and section notes
  - Scoring system: industry match (10pts), goal match (5pts), notes match (3pts)
  - Safe fallback to first variant if no matches

- **Extended SectionDefinition** (`server/generator/layoutLLM.ts`)
  - Added `variantId?: string` field
  - Added `variantMeta?: any` field
  - Variant selection integrated into layout generation

- **Variant-Aware HTML Generator** (`server/generator/codeGenerator.ts`)
  - Branch rendering by section type, then by variantId
  - Separate render functions for each variant
  - Hero variants: split-left, split-right, centered, image-background, minimal
  - Features variants: 3-column, 2-column, 4-column, alternating
  - About variants: image-left, image-right, centered, split-image
  - Testimonials variants: grid, spotlight, carousel
  - Pricing variants: 3-tier, 2-tier, single
  - CTA variants: centered, split, with-image
  - Contact variants: split-form, centered
  - FAQ variants: accordion, 2-column

- **Variant CSS Styles** (`server/generator/codeGenerator.ts`)
  - Complete CSS for all variant layouts
  - Responsive breakpoints for all variants
  - Grid layouts, overlays, carousels, accordions

- **Variant JavaScript** (`server/generator/codeGenerator.ts`)
  - FAQ accordion toggle functionality
  - Testimonials carousel auto-scroll

### Changed

- **Layout Generation** (`server/generator/layoutLLM.ts`)
  - Now accepts `sectionPlan` parameter
  - Calls `chooseVariantForSection()` for each section
  - Sets `variantId` and `variantMeta` on each section

- **Main Pipeline** (`server/services/merlinDesignLLM.ts`)
  - Passes `sectionPlan` to `generateLayout()`
  - Logs variant selection for each section

### Technical Details

- Variant selection happens during layout generation (Phase 3)
- Variant metadata stored in section definition
- HTML generator branches by variantId for different structures
- All variants remain responsive and accessible
- Backward compatible: sections without variantId use default rendering

### Impact

- More visually varied website designs
- Industry-appropriate layouts (e.g., image-background hero for travel/marine)
- Better section layouts based on goals (e.g., 3-column features for SaaS)
- Richer component library with multiple options per section type

---

## v6.2 - AI Style Designer (2025-01-20)

### Added

- **AI Style Designer** (`server/ai/styleDesignerLLM.ts`)
  - Uses GPT-4o to generate color palettes and typography for niche industries
  - Returns structured style system with hex colors and fonts
  - Validates hex colors and font names
  - Safe fallback to base style system if LLM fails

- **Industry Detection** (`matchesKnownIndustry()`)
  - Checks if industry has predefined palettes
  - Known industries: legal, saas, ecommerce, restaurant, real estate, finance, etc.
  - Niche industries trigger AI style generation

- **Style Merging** (`mergeStyleSystems()`)
  - Merges AI-generated colors/fonts into base style system
  - Preserves spacing, radii, shadows, icons
  - Replaces primary, secondary, accent, background, surface, fonts

- **Enhanced CSS Variables**
  - Added `--cm-color-primary`, `--cm-color-secondary`, `--cm-color-accent`
  - Added `--cm-color-bg`, `--cm-color-surface`
  - Added `--cm-font-heading`, `--cm-font-body`
  - Backward compatible with existing variables

### Changed

- **Main Pipeline** (`server/services/merlinDesignLLM.ts`)
  - Added AI style generation for niche industries
  - Logs whether AI override or base system is used
  - Saves `style-system.json` with base/final/AI override info
  - Updates metadata with style system info

- **CSS Generation** (`server/generator/codeGenerator.ts`)
  - Uses final style system (AI or base) for CSS variables
  - Added v6.2 CSS variables alongside existing ones

### Technical Details

- AI style only activates for industries NOT in known list
- Known industries use base style system (faster, proven palettes)
- Niche industries get AI-generated custom palettes
- All color values validated as hex codes
- Font names validated as non-empty strings
- Never blocks generation - always falls back to base if AI fails

### Impact

- Fixes "Marine Biology" color mismatch problem
- Niche industries now get appropriate colors (ocean blues, nature greens, etc.)
- Typography matches industry tone
- Maintains performance for known industries (no LLM call)

---

## v6.1 - AI Section Planner (2025-01-20)

### Added

- **AI Section Planner** (`server/ai/layoutPlannerLLM.ts`)
  - Uses GPT-4o to generate optimal section structure
  - Returns ordered section plan with importance levels
  - Integrated into main pipeline after design context
  - Section plan saved to `section-plan.json`

- **Version System** (`server/ai/version.ts`)
  - Pipeline version logging
  - Feature tracking
  - Metadata generation

- **Pipeline Metadata**
  - `pipeline-version.txt` - Version info
  - `metadata.json` - Full generation metadata
  - `section-plan.json` - AI section plan

### Changed

- **Main Pipeline** (`server/services/merlinDesignLLM.ts`)
  - Added version logging at start
  - Integrated AI section planner (Phase 2.5)
  - Section plan overrides design strategy section order
  - Metadata saved before return

### Technical Details

- Section planner uses strict JSON output format
- Safe fallback to rule-based plan if LLM fails
- Never blocks generation on AI failures
- Backward compatible with v5.1

---

## v6.0 - Foundations (2025-01-20)

### Added

- **Folder Structure**
  - `server/ai/` - AI modules
  - `config/` - Configuration files
  - `docs/` - Documentation

- **Architecture Documentation**
  - `docs/merlin-6x-architecture.md` - Full architecture docs
  - `docs/CHANGELOG-6x.md` - This file

### Changed

- Pipeline now logs version at start
- Foundation for v6.x transformation

---

## Migration Notes

### From v5.1 to v6.1

- ✅ Fully backward compatible
- ✅ All v5.1 features preserved
- ✅ New section planning adds intelligence
- ✅ No breaking changes to API

### Output Files

New files in `generated-v5/` directory:

- `section-plan.json` - AI section plan
- `metadata.json` - Generation metadata
- `pipeline-version.txt` - Version info

---

## Next Versions

### v6.2 - AI Style Designer (Planned)

- LLM-generated color palettes
- LLM-generated typography pairings
- Override for niche industries

### v6.3 - Component Variants (Planned)

- Section variant system
- Multiple layout options per section
- Variant selection based on context

### v6.4 - Responsive Engine (Planned)

- True mobile-first design
- Centralized breakpoints
- Intelligent responsive rules

### v6.5 - AI Image Planner (Planned)

- Structured image planning
- Industry-specific prompts
- Image purpose mapping

### v6.6 - Quality Judge (Planned)

- AI aesthetic scoring
- Critique and suggestions
- Auto-adjustments

### v6.7 - Multi-page Sitemap (Planned)

- AI sitemap generation
- Multi-page support
- Page-specific plans

### v6.8 - Multi-Page Architecture (✅ Complete - 2025-01-20)

- Multi-page website generation
- Page planner based on industry and section types
- Shared navigation system with responsive mobile menu
- Page-specific SEO metadata
- Shared header/footer across all pages
- Multiple HTML files (index.html, about.html, services.html, etc.)
- Navigation JavaScript for mobile toggle
- Page plan saved to `page-plan.json`
- Metadata includes multi-page structure

**Files Created:**

- `server/generator/multiPageGenerator.ts` - Multi-page generation logic
- `server/generator/pagePlanner.ts` - Page planning based on industry

**Files Modified:**

- `server/generator/codeGenerator.ts` - Added navigation CSS, exported functions
- `server/services/merlinDesignLLM.ts` - Integrated multi-page generation
- `server/ai/version.ts` - Updated to v6.8

**Features:**

- Industry-specific page structures (SaaS, Law, Nonprofit, etc.)
- Responsive navigation with hamburger menu
- Page-specific SEO titles and descriptions
- Schema.org markup per page type
- Shared CSS and JavaScript across all pages

### v6.9 - Global Theme Engine (✅ Complete - 2025-01-20)

**Added:**

- **Global Theme Engine** (`server/ai/themeEngineLLM.ts`)
  - Unified design theme generation using GPT-4o
  - Color palette harmonization (primary, secondary, accent, neutrals)
  - Typography system (display, heading, body fonts with scale)
  - Spacing scale (xs, sm, md, lg, xl)
  - Shadow system (level1, level2, level3)
  - Mood extraction from industry + tone
  - Fallback theme generation from style system

- **Design Token System**
  - CSS variables for all theme values
  - Consistent class naming across all sections/pages
  - Theme tokens applied to navigation, footer, buttons, headings
  - Google Fonts integration with theme fonts

- **Theme Integration**
  - Theme generated after style system and image plans
  - Theme saved to `global-theme.json`
  - Theme included in metadata.json
  - Theme applied to all CSS generation

**Changed:**

- **CSS Generator** (`server/generator/codeGenerator.ts`)
  - Updated to use global theme tokens
  - Replaced hardcoded CSS with theme variables
  - Navigation uses theme colors and shadows
  - Footer uses theme neutrals
  - Buttons use theme primary/accent colors
  - Headings use theme typography scale
  - Hero uses display font from theme

- **Multi-Page Generator** (`server/generator/multiPageGenerator.ts`)
  - Google Fonts link uses theme fonts (display, heading, body)
  - All pages share theme tokens

- **Section Renderers**
  - Hero sections use theme tokens
  - Removed inline styles in favor of theme classes
  - Consistent spacing using theme scale

**Technical Details:**

- Theme generation happens in Phase 6.6.5 (after SEO, before multi-page generation)
- Uses GPT-4o with comprehensive prompt including industry, tone, style system, image plans
- Fallback theme generated from style system if LLM fails
- All CSS variables prefixed with `--cm-` for consistency
- Theme mood saved as single descriptor (e.g., "modern", "luxury", "clean")

### v6.10 - Cleanup, Hardening & Final Documentation (✅ Complete - 2025-01-20)

**Added:**

- **Pipeline Status System** (`server/status/merlinStatus.ts`)
  - Centralized status information
  - Module version tracking
  - Ready status flag
  - Feature list

- **Centralized Constants** (`server/config/constants.ts`)
  - Known industries list
  - Default breakpoints
  - Default containers
  - Default spacing scale
  - Default typography scale
  - Shared utility functions

- **Enhanced Metadata**
  - `pipelineVersion: "6.10"` field
  - `modules` object with all module versions
  - `generatedAt` timestamp
  - Comprehensive module tracking

**Changed:**

- **Error Handling**
  - All AI modules now log errors with module name + version + project name
  - Consistent error messages: `[Module Name vX.X] Error for "Project Name": error message`
  - All modules have fallbacks that ensure generation continues
  - No AI failure crashes the entire generation

- **Master Entry Point Documentation**
  - Comprehensive docstring in `generateWebsiteWithLLM()`
  - High-level flow description (13 phases)
  - Fallback behavior documentation
  - Error handling documentation
  - Where to plug in future features

- **Legacy Generator Deprecation**
  - `unifiedWebsiteGenerator.ts` - Marked deprecated
  - `sterlingWebsiteGenerator.ts` - Marked deprecated
  - `multipageGenerator.ts` (old) - Marked deprecated
  - `copywritingV2.ts` - Documented as active fallback (not deprecated)

- **CSS Cleanup**
  - Removed hardcoded inline styles where possible
  - Hero sections use theme token classes
  - Consistent class naming with `.cm-` prefix
  - Theme tokens applied throughout

- **Version System**
  - Updated to v6.10
  - Pipeline version: `v6.10-cleanup-hardening`

**Technical Details:**

- All constants consolidated in `server/config/constants.ts`
- Known industries list shared across modules
- Error handling standardized across all AI modules
- Metadata structure finalized with module versions
- Status system provides health check capability

**Impact:**

- Improved code maintainability
- Better error visibility
- Clearer documentation
- Stable, production-ready pipeline
