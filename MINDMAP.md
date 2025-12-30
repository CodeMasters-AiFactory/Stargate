# STARGATE PORTAL - CUSTOMER JOURNEY MINDMAP
## Version 1.0 - Master Reference Document

---

## COMPLETE CUSTOMER WORKFLOW

```
START
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DISCOVERY & ENTRY                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LANDING PAGE  (/)                                               │
│     "The Best Websites on the Planet"                               │
│     ├─ Hero section with features                                   │
│     ├─ "How It Works" (3 steps)                                     │
│     ├─ Pricing preview                                              │
│     └─ CTA: "Start Building Free"                                   │
│                                                                     │
│  2. ONBOARDING  (/onboarding) - First-time users only               │
│     4-step tour with Merlin AI avatar                               │
│     ├─ Step 1: Welcome to Merlin                                    │
│     ├─ Step 2: Tell About Your Business                             │
│     ├─ Step 3: Watch the Magic Happen                               │
│     ├─ Step 4: Launch Your Website                                  │
│     └─ Sets localStorage flag when complete                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: BUILD PATH SELECTION                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  3. BUILD CHOICE  (/merlin8)                                        │
│     "How would you like to start?"                                  │
│                                                                     │
│     ┌─────────────────────┐    ┌─────────────────────────┐         │
│     │  PATH A: TEMPLATE   │    │  PATH B: FROM SCRATCH   │         │
│     │  Browse 33+ designs │    │  AI generates 100%      │ POPULAR │
│     │  Ready in 2-3 min   │    │  unique design          │         │
│     │  /merlin8/templates │    │  /merlin8/create        │         │
│     └─────────────────────┘    └─────────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: QUICK INTAKE FORM (5 Steps)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  4. QUICK INTAKE  (/merlin8/create)                                 │
│                                                                     │
│     Step 1: BUSINESS INFO                                           │
│             └─ Business Name + Industry (required)                  │
│                                                                     │
│     Step 2: DESCRIPTION                                             │
│             └─ What you do (20+ chars required)                     │
│                                                                     │
│     Step 3: SERVICES                                                │
│             └─ Add 1-3 services (at least 1 required)               │
│                                                                     │
│     Step 4: CONTACT INFO                                            │
│             └─ Location, Phone, Email (optional)                    │
│                                                                     │
│     Step 5: REVIEW                                                  │
│             └─ Confirm all information                              │
│                                                                     │
│     [Generate My Website] button →                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 4: AI GENERATION (Real-Time Progress)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  5. GENERATION PROGRESS  (/merlin8/generating)                      │
│     Duration: ~30-120 seconds                                       │
│     Technology: Server-Sent Events (SSE) streaming                  │
│                                                                     │
│     13-Step Generation Process:                                     │
│     ┌──────────────────────────────────────────────────────────┐   │
│     │  Phase 1: ✓ Analyzing your business details              │   │
│     │  Phase 2: ✓ Loading industry design profile              │   │
│     │  Phase 3: ✓ Preparing content and copy                   │   │
│     │  Phase 4: ✓ Generating hero image (Leonardo AI)          │   │
│     │           ✓ Generating services image                    │   │
│     │           ✓ Generating about image                       │   │
│     │           ✓ Generating team image                        │   │
│     │  Phase 5: ✓ Downloading AI images                        │   │
│     │  Phase 6: ✓ Building HTML structure                      │   │
│     │           ✓ Applying professional styling                │   │
│     │           ✓ Optimizing for mobile                        │   │
│     │  Phase 7: ✓ Saving files to server                       │   │
│     │  Phase 8: ✓ Final quality check                          │   │
│     └──────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 5: GENERATION COMPLETE                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  6. SUCCESS STATE  (/merlin8/generating - complete)                 │
│     ├─ Green checkmark animation                                    │
│     ├─ Website preview in iframe                                    │
│     ├─ Stats: "4 images generated, 45 seconds"                      │
│     └─ Preview URL displayed                                        │
│                                                                     │
│     Three Options:                                                  │
│     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│     │ View Full Screen │ │ Edit Website     │ │ Create Another   │ │
│     │ (new window)     │ │ (/editor/slug)   │ │ (/merlin8)       │ │
│     └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 6: ADVANCED EDITOR (9-Stage Wizard)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  7. WEBSITE BUILDER WIZARD  (/editor/{projectSlug})                 │
│     Full IDE experience with sidebar navigation                     │
│                                                                     │
│     ┌─────────────────────────────────────────────────────────┐    │
│     │  Stage 1: PACKAGE SELECT                                │    │
│     │           Choose pricing tier                           │    │
│     │           ├─ Free Trial ($0) - 25 credits, 1 site       │    │
│     │           ├─ Starter ($9) - 150 credits, 2 sites        │    │
│     │           ├─ Pro ($29) - 500 credits, 10 sites POPULAR  │    │
│     │           ├─ Agency ($79) - 2000 credits, 50 sites      │    │
│     │           └─ Enterprise ($199) - 10K credits, unlimited │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 2: TEMPLATE SELECT                               │    │
│     │           Choose design template from gallery           │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 3: KEYWORDS COLLECTION                           │    │
│     │           SEO keyword research                          │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 4: CONTENT REWRITING                             │    │
│     │           AI rewrites and optimizes copy                │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 5: IMAGE GENERATION                              │    │
│     │           Generate/upload custom images                 │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 6: SEO ASSESSMENT                                │    │
│     │           Audit & optimization recommendations          │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 7: REVIEW/REDO                                   │    │
│     │           Request changes, feedback loop                │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 8: FINAL APPROVAL                                │    │
│     │           QA check before launch                        │    │
│     ├─────────────────────────────────────────────────────────┤    │
│     │  Stage 9: FINAL WEBSITE                                 │    │
│     │           Ready to publish!                             │    │
│     └─────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 7: WEBSITE LIVE                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  8. FINAL WEBSITE DISPLAY                                           │
│     ├─ Live preview                                                 │
│     ├─ Download HTML/CSS/Assets                                     │
│     ├─ Publish/Deploy options                                       │
│     ├─ View Analytics                                               │
│     ├─ SEO Tools access                                             │
│     ├─ Share website                                                │
│     └─ Save to Dashboard (/dashboard)                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
  │
  ▼
 END - Website Live!
```

---

## ROUTE MAP

| Route | Purpose | Component File |
|-------|---------|----------------|
| `/` | Landing/Home page | `pages/Home.tsx` |
| `/onboarding` | First-time user tour | `pages/Onboarding.tsx` |
| `/merlin8` | Build path choice | `pages/merlin8/BuildChoice.tsx` |
| `/merlin8/create` | 5-step intake form | `pages/merlin8/QuickIntake.tsx` |
| `/merlin8/generating` | AI generation progress | `pages/merlin8/GeneratingProgress.tsx` |
| `/merlin8/templates` | Template browser | `pages/merlin8/Templates.tsx` |
| `/#features` | Pricing page | `components/IDE/WebsiteBuilderWizard.tsx` |
| `/editor/{slug}` | Full website editor | `components/IDE/WebsiteBuilderWizard.tsx` |
| `/dashboard` | User's projects | `components/IDE/MainLayout.tsx` |
| `/services` | Services dashboard | `components/IDE/MainLayout.tsx` |
| `/admin` | Admin panel | `components/Admin/AdminPanel.tsx` |

---

## PRICING TIERS

| Tier | Price | Credits | Websites | Features |
|------|-------|---------|----------|----------|
| **Free Trial** | $0 | 25 | 1 | Basic templates, Haiku models, Community support |
| **Starter** | $9/mo | 150 | 2 | All templates, Haiku & Sonnet, Email support, AI images |
| **Pro** | $29/mo | 500 | 10 | Premium templates, All AI models, Priority support, Custom domains, Analytics |
| **Agency** | $79/mo | 2000 | 50 | All features, Opus models, White-label, API access, Dedicated support |
| **Enterprise** | $199/mo | 10,000 | Unlimited | Everything, SLA guarantee, Account manager, On-boarding |

**Yearly Discount:** 20% off all paid tiers

---

## CREDIT PACKS (One-Time Purchase)

| Credits | Price | Discount |
|---------|-------|----------|
| 50 | $4 | - |
| 100 | $7 | 12% off |
| 250 | $15 | 25% off |
| 500 | $25 | 37% off |
| 1,000 | $40 | 50% off |
| 5,000 | $150 | 62% off |

---

## AI MODEL PRICING

| Model | Credits/Message | Best For | Speed |
|-------|-----------------|----------|-------|
| Haiku 3 | 1 credit | Simple edits, quick tasks | Fastest |
| Haiku 3.5 | 2 credits | Efficient conversations | Very Fast |
| Haiku 4.5 | 3 credits | Near-frontier speed | Fast |
| **Sonnet 4.5** | 8 credits | Website building, coding | Balanced (Recommended) |
| Opus 4.5 | 15 credits | Complex reasoning | Premium |
| Opus 4.1 | 40 credits | Ultimate intelligence | Ultimate |

---

## TECH STACK (Frozen)

- **Runtime:** Node.js LTS + npm
- **Frontend:** React 18.3.1 + Vite 5.4.21 + TypeScript 5.6.3
- **Backend:** Express 4.21.2 + Drizzle ORM + PostgreSQL
- **Styling:** TailwindCSS + shadcn/ui
- **AI Images:** Leonardo AI (4 images per website)
- **AI Models:** Claude (Haiku, Sonnet, Opus)
- **Platform:** Windows 10 Pro

---

## ACTIVE SERVICES

| Service | Status |
|---------|--------|
| Merlin Website Wizard | ✅ ACTIVE |
| Stargate IDE | ❌ Coming Soon |
| PANDORA | ❌ Coming Soon |
| Quantum Core | ❌ Coming Soon |
| Regis Core | ❌ Coming Soon |
| Nero Core | ❌ Coming Soon |
| Titan Ticket Master | ❌ Coming Soon |

---

## KEY FILES REFERENCE

| Purpose | File Path |
|---------|-----------|
| Landing Page | `client/src/pages/Home.tsx` |
| Onboarding | `client/src/pages/Onboarding.tsx` |
| Build Choice | `client/src/pages/merlin8/BuildChoice.tsx` |
| Quick Intake | `client/src/pages/merlin8/QuickIntake.tsx` |
| Generation Progress | `client/src/pages/merlin8/GeneratingProgress.tsx` |
| Website Builder Wizard | `client/src/components/IDE/WebsiteBuilderWizard.tsx` |
| Pricing Page | `client/src/components/PricingPage.tsx` |
| Main Layout | `client/src/components/IDE/MainLayout.tsx` |
| Sidebar | `client/src/components/IDE/Sidebar.tsx` |
| Top Navbar | `client/src/components/IDE/TopNavbar.tsx` |
| Rules | `0/RULES.md` |

---

## QUICK COMMANDS

| Command | Action |
|---------|--------|
| **0** | Confirm rules loaded, ready to work |
| **2** | Run UI Deep Smoke Test |

---

**Document Version:** 1.0
**Last Updated:** December 25, 2025
**Reference:** Always refer to this document for agreed workflow
