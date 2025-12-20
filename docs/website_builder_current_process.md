# Website Builder Current Tech Stack & Process

**Date**: January 2025  
**Version**: Merlin 6.10  
**Status**: ACTUAL CURRENT IMPLEMENTATION (Not aspirational)

---

## 1️⃣ CURRENT TECH STACK

### Frontend

- **Framework**: React 18.3.1
- **Styling System**:
  - Tailwind CSS 3.4.17 (with @tailwindcss/vite 4.1.3)
  - CSS Variables (HSL-based design tokens)
  - Custom CSS for generated websites (not Tailwind - plain CSS)
- **Component Libraries**:
  - Radix UI (full suite: dialogs, dropdowns, tabs, etc.)
  - shadcn/ui components (built on Radix)
  - Lucide React icons
- **Routing**: Wouter 3.3.5 (lightweight React router)
- **State Management**:
  - React Context API
  - TanStack Query 5.60.5 (for API calls)
- **Forms**: React Hook Form 7.55.0
- **Editor**: Monaco Editor (@monaco-editor/react 4.7.0)

### Backend

- **Runtime**: Node.js (v24.11.1 in production)
- **Framework**: Express 4.21.2
- **Session Management**: express-session 1.18.1
- **Authentication**: Passport.js 0.7.0 (local strategy)
- **WebSockets**:
  - Socket.io 4.7.5 (for collaboration)
  - ws 8.18.0 (for live preview)

### Database / Storage

- **ORM**: Drizzle ORM 0.39.1
- **Database**:
  - Neon Serverless PostgreSQL (@neondatabase/serverless 0.10.4)
  - **CURRENTLY OPTIONAL** - Server runs without DB using in-memory storage
  - Database URL is optional in environment
- **File Storage**:
  - Generated websites saved to `website_projects/{projectSlug}/generated-v5/`
  - Static file serving via Express

### Build & Tooling

- **Package Manager**: npm (Node.js built-in)
- **Bundler / Dev Server**:
  - Vite 5.4.20 (for frontend)
  - esbuild 0.25.0 (for server bundling in production)
- **TypeScript**: 5.6.3
- **Transpiler**: tsx 4.20.5 (for dev server)
- **CSS Processing**:
  - PostCSS 8.4.47
  - Autoprefixer 10.4.20
  - clean-css 5.3.3 (for minification)
  - terser 5.44.1 (for JS minification)
- **Linting**: ESLint 8.57.0
- **Testing**: Vitest 1.6.0

### AI / Content Tools

- **Primary LLM**: GPT-4o (OpenAI)
  - Used for: Layout planning, copywriting, SEO, image planning, style design, theme generation
  - API: OpenAI SDK 6.8.1
  - Model: `gpt-4o` (explicitly set in code)
  - Fallback: Template-based content if API key missing
- **Secondary LLM**: Claude 3.5 Sonnet (Anthropic)
  - Used for: Agent Farm coordination, code analysis
  - API: @anthropic-ai/sdk 0.68.0
  - Model: `claude-sonnet-4` (in Agent Farm)
- **Tertiary LLM**: Google Gemini
  - API: @google/genai 1.29.0
  - **CURRENTLY UNDEFINED** - Installed but not actively used in website generation
- **Image Generation**:
  - DALL-E 3 (OpenAI Images API)
  - Model: `dall-e-3`
  - Used for: Hero images, supporting images
  - Fallback: Placeholder images if API key missing
- **Image Processing**: Sharp 0.34.5 (for optimization)

### Hosting Assumptions

- **Development**: Local server on port 5000
- **Production**: **CURRENTLY UNDEFINED** - No specific hosting platform assumed
- **Static Files**: Served via Express static middleware
- **Generated Websites**: Saved to local filesystem, served at `/website_projects/{slug}/generated-v5/`

---

## 2️⃣ CURRENT WEBSITE BUILD PROCESS

### Phase 1 – Discovery & Requirements

**Step 1**: User fills out form in `WebsiteBuilderWizard.tsx`

- Business name, type, location, services, goals, tone
- Form validation using React Hook Form + Zod

**Step 2**: Optional website investigation

- If URL provided, `websiteInvestigation.ts` analyzes competitor site
- Uses GPT-4o to extract design patterns, content structure, color schemes
- Results stored in `InvestigationResults` object

**Step 3**: Convert requirements to `ProjectConfig`

- `formatConverter.ts` transforms user requirements into internal config format
- Adds default values, normalizes data structure
- Creates project slug from business name

**Step 4**: Send to backend via SSE (Server-Sent Events)

- POST to `/api/website-builder/generate`
- Streams progress updates back to frontend
- Frontend displays progress in real-time

### Phase 2 – Information Architecture & Planning

**Step 1**: Generate design context

- `designThinking.ts` creates `DesignContext` from project config
- Extracts industry, tone, goals, target audience
- Creates design outputs (moodboards, section sequences)

**Step 2**: AI design strategy (v6.0)

- `designReasoner.ts` uses GPT-4o to generate design strategy
- Creates section order, visual style recommendations
- Falls back to rule-based if API unavailable

**Step 3**: AI section planning (v6.1)

- `layoutPlannerLLM.ts` uses GPT-4o to plan optimal section structure
- Generates `LayoutPlan` with sections, order, purposes
- Falls back to rule-based section plan if API unavailable

**Step 4**: Page planning (v6.8)

- `pagePlanner.ts` creates multi-page structure
- Industry-specific pages (Home, Services, About, Contact)
- Creates `PlannedPage[]` array

### Phase 3 – Design & Layout

**Step 1**: Style system generation

- `styleSystem.ts` creates base style system from design context
- Colors, typography, spacing, shadows
- If industry not in known list, `styleDesignerLLM.ts` uses GPT-4o for custom styles
- Falls back to base system if AI unavailable

**Step 2**: Layout structure generation

- `layoutLLM.ts` generates `LayoutStructure` with section definitions
- Uses blueprint scoring system (not AI-generated layouts)
- Selects section variants (hero-split-left, features-3-column, etc.)
- Applies responsive rules (v6.4)

**Step 3**: Global theme harmonization (v6.9)

- `themeEngineLLM.ts` uses GPT-4o to create unified theme
- Harmonizes colors, typography, spacing across all elements
- Extracts mood from industry + tone
- Falls back to style system if AI unavailable

### Phase 4 – Implementation / Coding

**Step 1**: Image planning (v6.5)

- `imagePlannerLLM.ts` uses GPT-4o to generate image prompts
- Industry-specific, style-aware prompts for each section
- Creates `PlannedImage[]` array
- Falls back to rule-based image plan if API unavailable

**Step 2**: Image generation (v6.5)

- `advancedImageService.ts` calls DALL-E 3 API
- Generates hero images and supporting images
- Saves images to `website_projects/{slug}/generated-v5/assets/images/`
- Falls back to placeholder images if API unavailable

**Step 3**: Copywriting (v6.6)

- `copywriterLLM.ts` uses GPT-4o to generate section copy
- Industry-specific, SEO-aware, conversion-focused
- **ACTUALLY**: Falls back to intelligent template-based copy (no OpenAI dependency in practice)
- `copywritingV2.ts` provides fallback copy generation

**Step 4**: SEO metadata generation (v6.7)

- `seoEngineLLM.ts` uses GPT-4o to generate SEO metadata
- Page titles, descriptions, keywords, OG tags, Schema.org JSON-LD
- Falls back to rule-based SEO if API unavailable

**Step 5**: Code generation (v6.10)

- `codeGenerator.ts` generates HTML, CSS, JavaScript
- **NOT AI-GENERATED CODE** - Template-based string concatenation
- Uses design tokens (colors, fonts, spacing) from style system
- Applies responsive CSS rules
- Generates semantic HTML5 structure

**Step 6**: Multi-page generation (v6.8)

- `multiPageGenerator.ts` creates all HTML pages
- Shared navigation, header, footer across pages
- Each page gets its own HTML file (index.html, services.html, etc.)

### Phase 5 – Content Integration

**Step 1**: Copy integration

- Section copy from `copywriterLLM.ts` inserted into HTML
- Headlines, paragraphs, CTAs placed in appropriate sections
- Industry-specific content based on project config

**Step 2**: Image integration

- Generated DALL-E images embedded in HTML
- Alt text from image planning
- Responsive image tags with srcset

**Step 3**: SEO integration

- Meta tags inserted into `<head>`
- Schema.org JSON-LD added
- Open Graph tags for social sharing

### Phase 6 – Quality Check / Smoke Test

**Step 1**: Real quality assessment (if app/port provided)

- `qualityAssessment.ts` serves generated website locally
- Calls `analyzerV4.ts` to analyze at `http://localhost:5000/website_projects/{slug}/generated-v5/index.html`
- Uses Puppeteer 24.30.0 to load page and extract metrics

**Step 2**: Quality scoring

- Scores 6 categories: Visual Design, UX Structure, Content Quality, Conversion Trust, SEO Foundations, Creativity
- Each scored 0-10
- Threshold: All categories >= 7.5/10 for "meetsThresholds"

**Step 3**: Iteration loop

- If quality < 7.5, regenerates (up to 3 iterations)
- Adjusts design based on quality issues
- Re-runs quality assessment

**Step 4**: Quality report generation

- `generateQualityReport()` creates markdown report
- Lists issues with severity and suggestions
- Saves to `website_projects/{slug}/generated-v5/quality-report.md`

**Step 5**: How we decide "good enough"

- **CURRENTLY**: If all 6 categories >= 7.5/10 OR max iterations (3) reached
- No automatic fixes - only identifies issues
- User must manually review quality report

### Phase 7 – SEO & Performance

**Step 1**: SEO (what we actually do)

- Meta tags: title, description, keywords (from seoEngineLLM.ts)
- Open Graph tags: og:title, og:description, og:image
- Twitter Card tags
- Schema.org JSON-LD (structured data)
- Canonical URLs
- **CURRENTLY UNDEFINED**: No actual SEO validation or testing

**Step 2**: Performance (what we actually do)

- CSS minification using clean-css
- JavaScript minification using terser
- **CURRENTLY UNDEFINED**: No performance testing, no Lighthouse scores, no Core Web Vitals measurement
- No image optimization beyond DALL-E generation
- No lazy loading implementation
- No critical CSS extraction

### Phase 8 – Delivery / Handover

**Step 1**: How we present final result

- Frontend receives website via SSE stream
- Displays in `MultiPagePreview.tsx` component
- Shows all generated pages in tabs
- Download button creates ZIP archive using `archiver` 7.0.1

**Step 2**: How we summarize what we did

- Returns `MultiPageWebsite` object with:
  - `manifest`: Website metadata
  - `files`: All HTML/CSS/JS files
  - `assets`: Images and other assets
- Saves to `website_projects/{slug}/generated-v5/`
- Creates `metadata.json` with generation info
- **CURRENTLY**: No automatic summary or documentation generation

---

## 3️⃣ CURRENT LIMITATIONS (BEING HONEST)

### What We DON'T Do (Yet)

1. **No automatic issue fixing** - Quality assessment identifies problems but doesn't fix them
2. **No performance optimization** - No Lighthouse, no Core Web Vitals, no speed testing
3. **No real SEO validation** - We generate SEO tags but don't validate them
4. **Template-based code generation** - HTML/CSS is string concatenation, not AI-generated
5. **Blueprint-based layouts** - Layout selection uses scoring, not AI reasoning
6. **Limited image optimization** - No compression, no WebP conversion, no lazy loading
7. **No accessibility testing** - No WCAG compliance checking
8. **No browser compatibility testing** - No cross-browser validation
9. **No mobile responsiveness testing** - Responsive rules applied but not tested
10. **No actual hosting** - Websites saved locally, no deployment

### What We DO Well

1. **Multi-model AI** - GPT-4o for generation, Claude for analysis
2. **Fallback system** - Everything has fallbacks, never crashes
3. **Real quality assessment** - Actually serves and analyzes generated websites
4. **Multi-page generation** - Creates full website structure
5. **Industry-specific** - Tailors design and content to industry
6. **Live preview** - Real-time updates during generation
7. **Iteration loop** - Tries to improve quality automatically

---

## 4️⃣ COMPARISON WITH REPLIT

### Replit's Approach (Based on Public Info)

- **Frontend**: React-based IDE
- **Backend**: Python/Node.js runtime
- **AI**: Replit's own models + GPT-4
- **Hosting**: Built-in (Replit hosting)
- **Deployment**: One-click deploy
- **Code Generation**: AI writes actual code
- **Testing**: Built-in test runner

### Our Approach

- **Frontend**: React + Vite (similar)
- **Backend**: Node.js + Express (similar)
- **AI**: GPT-4o + Claude (multi-model, more flexible)
- **Hosting**: **CURRENTLY UNDEFINED** (local only)
- **Deployment**: **CURRENTLY UNDEFINED** (manual ZIP download)
- **Code Generation**: Template-based (NOT AI-generated code)
- **Testing**: Quality assessment only (no unit/integration tests)

### Key Differences

1. **We have multi-model AI** - Replit uses single model
2. **We have real quality assessment** - Replit doesn't analyze output quality
3. **We generate full websites** - Replit generates code snippets
4. **We DON'T have built-in hosting** - Replit does
5. **We DON'T generate actual code with AI** - Replit does
6. **We have iteration loop** - Replit doesn't

---

## 5️⃣ FILE LOCATION

**Saved to**: `docs/website_builder_current_process.md`

**You can update this later** to improve the process as we add features.

---

## SUMMARY

**What we ACTUALLY use RIGHT NOW:**

- React + Tailwind for frontend
- Express + Node.js for backend
- GPT-4o for AI generation (with fallbacks)
- DALL-E 3 for images (with placeholders)
- Template-based code generation (NOT AI-generated code)
- Real quality assessment with iteration
- Local file storage (no cloud hosting)

**What we DON'T have:**

- AI-generated code (we use templates)
- Automatic issue fixing
- Performance optimization
- Real hosting/deployment
- Accessibility testing
- Browser compatibility testing
