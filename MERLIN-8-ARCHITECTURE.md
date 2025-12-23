# ═══════════════════════════════════════════════════════════════════════════════
# MERLIN 8.0 - "THE WORLD'S BEST WEBSITE BUILDER"
# Architecture & Implementation Plan
# ═══════════════════════════════════════════════════════════════════════════════

## 🎯 THE VISION
Build websites so good that clients think a $10,000 agency made them.
Not "good for AI" - just GOOD. Period.

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 1: CLIENT ENTRY FLOW
## ═══════════════════════════════════════════════════════════════════════════════

### Step 1: The Choice (First Screen)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   🎨 How would you like to build your website?                      │
│                                                                      │
│   ┌─────────────────────┐    ┌─────────────────────┐                │
│   │                     │    │                     │                │
│   │   📋 START WITH     │    │   🚀 BUILD FROM     │                │
│   │     A TEMPLATE      │    │      SCRATCH        │                │
│   │                     │    │                     │                │
│   │  Browse 33+ premium │    │  Tell Merlin about  │                │
│   │  designs and make   │    │  your business and  │                │
│   │  them yours         │    │  we'll create a     │                │
│   │                     │    │  unique design      │                │
│   │  ⏱️ ~5 minutes      │    │                     │                │
│   │                     │    │  ⏱️ ~3 minutes      │                │
│   └─────────────────────┘    └─────────────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

### Path A: Template-First Flow
1. Browse templates (filterable by industry)
2. Preview template
3. Click "Use This Template"
4. Quick intake: Business name, industry, services (3 fields)
5. Merlin TRANSFORMS template with:
   - Real Leonardo AI images for YOUR business
   - Rewritten copy for YOUR industry
   - Your brand colors applied
   - Your contact info
6. Edit & publish

### Path B: Merlin From-Scratch Flow
1. Smart intake form (see below)
2. Merlin analyzes & creates unique design
3. Generates with Leonardo images
4. Industry-specific copy
5. Edit & publish

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 2: THE SMART INTAKE (For From-Scratch)
## ═══════════════════════════════════════════════════════════════════════════════

### Not a boring form - a CONVERSATION:

Screen 1: "What's your business called?"
→ [Phoenix Racing Team]

Screen 2: "What industry are you in?"
→ [Dropdown with smart suggestions]
   - Sports & Racing 🏎️
   - Restaurant & Food 🍽️
   - Legal Services ⚖️
   - Technology 💻
   - Real Estate 🏠
   - Healthcare 🏥
   - (50+ industries)

Screen 3: "Tell us about your business in one sentence"
→ [Elite Formula 1 racing team competing at the pinnacle of motorsport]

Screen 4: "What's your vibe?" (Visual picker)
→ [Dark & Bold] [Light & Clean] [Warm & Inviting] [Luxury & Elegant]

Screen 5: "Pick colors you like" (Optional)
→ [Color palette picker or "Let Merlin decide"]

Screen 6: "What pages do you need?"
→ [✓] Home [✓] About [✓] Services [ ] Blog [✓] Contact

→ [BUILD MY WEBSITE] 🚀

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 3: INDUSTRY DNA ENGINE 🧬
## ═══════════════════════════════════════════════════════════════════════════════

The SECRET SAUCE. Each industry has a "DNA profile":

### Example: Racing/Motorsport DNA
```javascript
{
  industry: "racing",
  designRules: {
    colorScheme: "dark",
    primaryColors: ["#E10600", "#1E1E1E", "#FFFFFF"],
    fonts: {
      heading: "Orbitron, Rajdhani, Russo One",
      body: "Inter, Roboto"
    },
    aesthetic: "aggressive, fast, dramatic",
    heroStyle: "full-bleed image with overlay",
    statsBar: true,
    animations: "fast, sharp transitions"
  },
  imagePrompts: {
    hero: "Formula 1 race car speeding on track, dramatic lighting, motion blur, professional motorsport photography",
    services: "F1 pit crew in action, tire change, professional motorsport",
    team: "Racing driver portrait with helmet, visor up, confident pose",
    background: "Racing track aerial view, night race, lights"
  },
  copyStyle: {
    tone: "powerful, confident, technical",
    words: ["championship", "podium", "velocity", "precision", "engineering excellence"],
    avoid: ["nice", "good", "services", "solutions"]
  },
  sections: ["hero", "stats", "services", "team", "sponsors", "calendar", "cta"]
}
```

### Example: Restaurant DNA
```javascript
{
  industry: "restaurant",
  designRules: {
    colorScheme: "warm",
    primaryColors: ["#8B4513", "#FFF8DC", "#2F4F4F"],
    fonts: {
      heading: "Playfair Display, Cormorant",
      body: "Lato, Open Sans"
    },
    aesthetic: "warm, appetizing, inviting",
    heroStyle: "food photography hero",
    menuSection: true
  },
  imagePrompts: {
    hero: "Elegant restaurant interior, warm lighting, fine dining ambiance",
    food: "Gourmet dish plating, professional food photography, appetizing",
    chef: "Professional chef in kitchen, cooking action shot"
  },
  copyStyle: {
    tone: "warm, inviting, sensory",
    words: ["savor", "crafted", "fresh", "seasonal", "artisan"],
    avoid: ["cheap", "fast", "deal"]
  }
}
```

### Industries to Cover (50+):
- Racing/Motorsport
- Restaurant/Café
- Law Firm
- Medical/Healthcare
- Real Estate
- Tech Startup
- E-commerce
- Fitness/Gym
- Photography
- Wedding/Events
- Construction
- Accounting
- Dental
- Veterinary
- Salon/Spa
- Hotel/Travel
- Music/Entertainment
- Education
- Non-profit
- Church/Religious
- Automotive
- Architecture
- Interior Design
- Fashion
- Jewelry
- Cannabis (where legal)
- Financial Services
- Insurance
- Marketing Agency
- SaaS
- Consulting
- Manufacturing
- Logistics
- Agriculture
- Wine/Brewery
- Podcast/Media
- Personal Brand
- Portfolio
- And more...

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 4: THE GENERATION PIPELINE
## ═══════════════════════════════════════════════════════════════════════════════

### NEW 12-Step Pipeline (Simplified from 30):

1. **INTAKE** - Collect business info
2. **INDUSTRY DNA** - Load industry profile
3. **DESIGN SYSTEM** - Generate colors, fonts, spacing
4. **LAYOUT SELECTION** - Pick best layout for industry
5. **LEONARDO IMAGES** - Generate 5-8 custom images
6. **AI COPYWRITING** - Industry-specific, powerful copy
7. **HTML GENERATION** - Build semantic HTML
8. **CSS STYLING** - Apply design system
9. **RESPONSIVE** - Mobile/tablet optimization
10. **SEO INJECTION** - Meta tags, schema, sitemap
11. **QUALITY CHECK** - Automated review
12. **EXPORT** - Package for editing/deployment

### Image Generation Strategy:
- Hero image: 1 (1200x800)
- Service/feature images: 3 (800x600)
- Team/about image: 1 (800x800)
- Background/texture: 1 (1920x1080)
- Total: 6 images per website
- Cost: ~6 Leonardo credits per site (you have 150/day = 25 websites/day)

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 5: DESIGN PATTERNS LIBRARY
## ═══════════════════════════════════════════════════════════════════════════════

Pre-built, battle-tested sections:

### Hero Patterns:
1. Full-bleed image with text overlay (racing, luxury)
2. Split hero (image left, text right)
3. Video background hero
4. Animated gradient hero (tech, startup)
5. Minimal text-focused hero

### Section Patterns:
1. Stats bar (racing, business)
2. Feature cards (3-column)
3. Alternating image/text rows
4. Testimonial slider
5. Team grid
6. Pricing table
7. FAQ accordion
8. Contact form + map
9. Gallery/portfolio grid
10. Blog preview

### Footer Patterns:
1. Minimal (logo + links)
2. Full (newsletter, social, sitemap)
3. CTA footer (one last push)

## ═══════════════════════════════════════════════════════════════════════════════
## PHASE 6: IMPLEMENTATION ROADMAP
## ═══════════════════════════════════════════════════════════════════════════════

### Week 1: Foundation
- [ ] Create industry DNA database (20 industries)
- [ ] Build new intake flow UI
- [ ] Integrate Leonardo into pipeline

### Week 2: Generation Engine
- [ ] New HTML generator with design patterns
- [ ] CSS generation with design tokens
- [ ] Copy generation with industry tone

### Week 3: Template Integration
- [ ] Template browser UI
- [ ] Template transformation engine
- [ ] Template + custom images merger

### Week 4: Polish & Testing
- [ ] Test all 20 industries
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Bug fixes

## ═══════════════════════════════════════════════════════════════════════════════
## SUCCESS METRICS
## ═══════════════════════════════════════════════════════════════════════════════

A website is GOOD if:
✅ You can't tell AI made it
✅ Industry-appropriate design
✅ Real, relevant images (not stock placeholders)
✅ Copy that sounds human and specific
✅ Mobile-perfect
✅ Fast loading (<3s)
✅ SEO-ready
✅ Client says "Wow"

## ═══════════════════════════════════════════════════════════════════════════════
## COMPETITIVE ADVANTAGE
## ═══════════════════════════════════════════════════════════════════════════════

| Feature | Wix | Squarespace | Replit | **Merlin 8.0** |
|---------|-----|-------------|--------|----------------|
| AI Design | ❌ | ❌ | Basic | **Industry DNA** |
| AI Images | ❌ | ❌ | ❌ | **Leonardo** |
| AI Copy | ❌ | ❌ | Basic | **Industry-tuned** |
| Templates | Generic | Generic | None | **Transformed** |
| Speed | Hours | Hours | Minutes | **Minutes** |
| Result | DIY look | Better | Basic | **Agency quality** |

## ═══════════════════════════════════════════════════════════════════════════════
## NEXT STEP: BUILD IT
## ═══════════════════════════════════════════════════════════════════════════════

Ready to start building Merlin 8.0?

First file: /server/engines/merlin8/industryDNA.ts
