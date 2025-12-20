# Merlin Design LLM v5.0 Specification
## Generative Website Design Model

**Version:** 5.0  
**Date:** November 19, 2025  
**Status:** Implementation In Progress

---

## 🎯 OVERVIEW

v5.0 transforms Merlin from an **analyzer** into a **generative design LLM** capable of creating world-class websites from scratch.

Merlin v5.0 behaves like:
- A Creative Director
- A Senior UX Designer
- A Senior Brand Designer
- A Senior Web Copywriter
- A Front-End Developer

**ALL COMBINED INTO ONE SYSTEM.**

---

## 📋 PHASE 1: INTERNAL TRAINING MEMORY

### Design Knowledge Base

**Location:** `/website_quality_standards/design-llm-knowledge/`

### Knowledge Files:

1. **layout-patterns.json** (100 world-class layouts)
   - Hero variations
   - Section sequences
   - Grid systems
   - Card layouts
   - Footer patterns

2. **hero-designs.json** (50 hero designs)
   - Centered hero
   - Split-screen hero
   - Video background hero
   - Animated hero
   - Minimalist hero

3. **cta-bands.json** (40 CTA band designs)
   - Single CTA
   - Dual CTA
   - CTA with trust elements
   - CTA with social proof

4. **grid-patterns.json** (50 grid/card patterns)
   - 2-column grid
   - 3-column grid
   - 4-column grid
   - Masonry grid
   - Asymmetric grid

5. **typography-pairings.json** (100 typography pairings)
   - Heading + Body combinations
   - Font families
   - Size scales
   - Weight variations

6. **color-palettes.json** (100 color palettes)
   - Primary/secondary/accent
   - Neutral scales
   - Industry-specific palettes
   - Accessibility-compliant combinations

7. **industry-best-practices.json** (20 practices per sector)
   - Law Firm
   - SaaS
   - Medical
   - Real Estate
   - Creative Agency
   - Ecommerce
   - Automotive
   - And more...

---

## 📋 PHASE 2: STRUCTURED DESIGN THINKING ENGINE

### Design Logic Flow

1. **Who is the audience?**
   - Demographics
   - Psychographics
   - Technical proficiency
   - Goals and pain points

2. **What is the emotional tone?**
   - Professional
   - Friendly
   - Premium
   - Innovative
   - Trustworthy
   - Exciting

3. **What is the brand voice?**
   - Formal vs Casual
   - Technical vs Simple
   - Bold vs Subtle
   - Modern vs Traditional

4. **What is the user goal?**
   - Learn about services
   - Book consultation
   - Make purchase
   - Sign up
   - Contact

5. **What must the page help the user achieve?**
   - Clear value proposition
   - Build trust
   - Remove friction
   - Guide to action

### Outputs:

- **Moodboards (textual):** Color, typography, imagery style
- **Section sequences:** Hero → Value → Proof → Action
- **Content outlines:** Headlines, subheadings, body copy
- **Layout diagrams:** ASCII or JSON wireframes
- **Component recommendations:** Cards, buttons, forms, etc.

**Module:** `/server/generator/designThinking.ts`

---

## 📋 PHASE 3: LAYOUT GENERATOR

### Module: `/server/generator/layoutLLM.ts`

### Outputs:

**layout.json:**
```json
{
  "sections": [
    {
      "type": "hero",
      "layout": "centered",
      "components": ["heading", "subheading", "cta", "image"],
      "grid": "single-column",
      "breakpoints": {
        "mobile": "stacked",
        "tablet": "centered",
        "desktop": "centered"
      }
    },
    {
      "type": "features",
      "layout": "grid-3-column",
      "components": ["card", "icon", "heading", "description"],
      "breakpoints": {
        "mobile": "1-column",
        "tablet": "2-column",
        "desktop": "3-column"
      }
    }
  ],
  "wireframe": "ASCII or JSON",
  "responsiveBreakpoints": [390, 768, 1024, 1440]
}
```

---

## 📋 PHASE 4: STYLE SYSTEM GENERATOR

### Outputs:

**style.json:**
```json
{
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutrals": ["#hex", "#hex", "#hex"]
  },
  "typography": {
    "heading": {
      "font": "Inter",
      "sizes": [48, 36, 24, 18],
      "weights": [700, 600]
    },
    "body": {
      "font": "Inter",
      "sizes": [16, 14],
      "weights": [400, 500],
      "lineHeight": 1.6
    }
  },
  "spacing": {
    "scale": [4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
    "system": "8px base"
  },
  "borderRadius": {
    "small": "4px",
    "medium": "8px",
    "large": "16px",
    "full": "9999px"
  },
  "shadows": {
    "small": "...",
    "medium": "...",
    "large": "..."
  },
  "icons": {
    "style": "outline",
    "library": "heroicons"
  }
}
```

---

## 📋 PHASE 5: COPYWRITING ENGINE 2.0

### Outputs:

**copy.json:**
```json
{
  "hero": {
    "hook": "...",
    "headline": "...",
    "subheadline": "...",
    "cta": "..."
  },
  "valueProposition": "...",
  "tagline": "...",
  "sections": [
    {
      "heading": "...",
      "body": "...",
      "cta": "..."
    }
  ],
  "services": [
    {
      "name": "...",
      "description": "..."
    }
  ],
  "faq": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}
```

---

## 📋 PHASE 6: CODE GENERATOR

### Output Formats:

1. **HTML + CSS + JS** (vanilla)
2. **React/Next.js Components**
3. **Tailwind CSS**
4. **CSS Modules**

### Pattern:

**Section → Component → JSX/HTML/CSS**

### Output Location:

`/website_projects/<slug>/generated-v5/`

**Structure:**
```
generated-v5/
  ├── index.html
  ├── styles.css
  ├── script.js
  ├── components/
  │   ├── Hero.tsx
  │   ├── Features.tsx
  │   └── ...
  └── README.md
```

---

## 📋 PHASE 7: SELF-CHECK WITH v4.0 ANALYZER

### Quality Assurance Loop:

1. Generate website design
2. Pass through v4.0 Website Analyzer
3. Check thresholds:
   - Visual ≥ 8.0
   - UX ≥ 8.0
   - Content ≥ 8.0
   - SEO ≥ 7.5
   - Creativity ≥ 7.5
   - Mobile ≥ 8.0

4. If ANY fail:
   - Identify failing categories
   - Auto-revise design
   - Re-generate
   - Re-check

5. Repeat until all thresholds met OR max iterations (3)

---

## 🔧 IMPLEMENTATION ARCHITECTURE

### Core Modules:

1. **Design Knowledge Base** (`/server/knowledge/`)
2. **Design Thinking Engine** (`/server/generator/designThinking.ts`)
3. **Layout Generator** (`/server/generator/layoutLLM.ts`)
4. **Style System Generator** (`/server/generator/styleSystem.ts`)
5. **Copywriting Engine 2.0** (`/server/generator/copywritingV2.ts`)
6. **Code Generator** (`/server/generator/codeGenerator.ts`)
7. **Quality Assurance** (`/server/generator/qualityAssurance.ts`)

### Main Orchestrator:

`/server/services/merlinDesignLLM.ts`

---

## ✅ FINAL RULE

**Merlin v5.0 must behave like:**
- A Creative Director ✅
- A Senior UX Designer ✅
- A Senior Brand Designer ✅
- A Senior Web Copywriter ✅
- A Front-End Developer ✅

**ALL COMBINED INTO ONE SYSTEM.**

---

**Documentation Version:** 1.0  
**Last Updated:** November 19, 2025  
**Status:** Specification Complete - Implementation In Progress

