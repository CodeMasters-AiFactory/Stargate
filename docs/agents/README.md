# AI Agents Reference

Stargate Portal features 10 specialized AI agents, each designed for specific aspects of web development.

## Agent Overview

| Agent | Specialty | Primary Use Cases |
|-------|-----------|-------------------|
| NOVA | Orchestration | Project coordination, task delegation |
| ATLAS | Architecture | Technical decisions, system design |
| SAGE | Content | Copywriting, SEO content, messaging |
| ORACLE | Analytics | Data insights, user behavior |
| SCOUT | Research | Competitive analysis, market research |
| CIPHER | Security | Security audit, best practices |
| PHOENIX | Recovery | Error handling, troubleshooting |
| AEGIS | QA | Testing, quality assurance |
| TEMPO | Performance | Speed optimization, Core Web Vitals |
| GUARDIAN | Accessibility | WCAG compliance, a11y audits |

---

## NOVA - The Orchestrator

**Role:** Project Coordinator & Task Delegator

NOVA is the central intelligence that coordinates all other agents. It understands your project requirements and delegates tasks to the most appropriate specialists.

### Capabilities
- Project scope analysis
- Task prioritization
- Agent coordination
- Progress tracking
- Conflict resolution

### Usage Example
```
User: "I need to build a modern e-commerce site for luxury watches"

NOVA: "I'll coordinate this project. Here's my plan:
- SCOUT will research competitor sites
- SAGE will draft brand messaging
- ATLAS will recommend tech architecture
- GUARDIAN will ensure accessibility
- TEMPO will optimize for performance"
```

---

## ATLAS - The Architect

**Role:** Technical Architecture & System Design

ATLAS handles all technical decisions, from choosing frameworks to structuring your codebase.

### Capabilities
- Technology stack recommendations
- Component architecture
- Database design
- API structure
- Scalability planning

### Usage Example
```
User: "What's the best way to structure my multi-page site?"

ATLAS: "For your luxury watch e-commerce site, I recommend:
- React Router for navigation
- Lazy loading for product pages
- Server-side rendering for SEO
- CDN for static assets
- Redis caching for product data"
```

---

## SAGE - The Content Strategist

**Role:** Content Strategy & Copywriting

SAGE creates compelling content that converts visitors into customers.

### Capabilities
- Brand voice development
- Headline optimization
- Product descriptions
- Call-to-action writing
- SEO-optimized content

### Usage Example
```
User: "Write a hero section for my luxury watch site"

SAGE: "Here's a hero section that balances elegance with urgency:

Headline: 'Timeless Elegance, Crafted for Distinction'
Subheadline: 'Discover handcrafted timepieces worn by those who shape tomorrow'
CTA: 'Explore the Collection'"
```

---

## ORACLE - The Analyst

**Role:** Analytics & Data Insights

ORACLE interprets data to provide actionable insights for improving your site.

### Capabilities
- Traffic analysis
- Conversion tracking
- User behavior insights
- A/B test recommendations
- ROI calculations

### Usage Example
```
User: "Why is my checkout page underperforming?"

ORACLE: "Based on the heatmap data:
- 62% of users abandon at the shipping form
- Mobile users struggle with the date picker
- The 'Continue' button has low visibility

Recommendations:
1. Add guest checkout option
2. Replace date picker with mobile-friendly input
3. Increase button contrast by 40%"
```

---

## SCOUT - The Researcher

**Role:** Competitive Analysis & Market Research

SCOUT investigates your market and competitors to identify opportunities.

### Capabilities
- Competitor analysis
- Feature benchmarking
- Market trend identification
- User research synthesis
- Gap analysis

### Usage Example
```
User: "What are my competitors doing better?"

SCOUT: "I analyzed the top 5 luxury watch e-commerce sites:

Key differentiators:
1. Rolex: 360° product viewer (you're missing this)
2. Omega: Virtual try-on AR feature
3. Cartier: Appointment booking for VIP service

Quick wins for you:
- Add high-res zoom on hover
- Include authentication certificates
- Feature customer testimonials with photos"
```

---

## CIPHER - The Security Expert

**Role:** Security Audit & Best Practices

CIPHER ensures your site is secure and follows industry best practices.

### Capabilities
- Security vulnerability scanning
- HTTPS configuration
- Input validation review
- Authentication best practices
- GDPR/CCPA compliance

### Usage Example
```
User: "Is my checkout form secure?"

CIPHER: "Security audit results:

✅ HTTPS enabled with TLS 1.3
✅ Credit card fields use iframes
⚠️ CSRF token expires too quickly (30min)
❌ SQL injection possible in search

Immediate actions:
1. Extend CSRF token to 2 hours
2. Parameterize search queries
3. Add rate limiting to login"
```

---

## PHOENIX - The Recovery Specialist

**Role:** Error Handling & Troubleshooting

PHOENIX helps diagnose and fix issues when things go wrong.

### Capabilities
- Error diagnosis
- Recovery strategies
- Backup restoration
- Performance troubleshooting
- Rollback assistance

### Usage Example
```
User: "My site is showing a blank page after deployment"

PHOENIX: "Diagnosing the issue...

Found: Build error in production bundle
- React is loaded before its dependencies
- Vendor chunk not loading correctly

Solution:
1. Revert to previous deploy
2. Update vite.config.ts chunk order
3. Redeploy with fixed configuration"
```

---

## AEGIS - The Quality Guardian

**Role:** Testing & Quality Assurance

AEGIS ensures your site meets quality standards before going live.

### Capabilities
- Visual regression testing
- Cross-browser compatibility
- Responsive design verification
- Form validation testing
- User flow testing

### Usage Example
```
User: "Test my checkout flow"

AEGIS: "Checkout flow test results:

Desktop Chrome: ✅ Passed
Desktop Firefox: ✅ Passed
Mobile Safari: ⚠️ Credit card form overlaps
Tablet Android: ❌ Submit button unreachable

Issues found:
1. iOS input zoom causes layout shift
2. Android Chrome misses focus states"
```

---

## TEMPO - The Performance Optimizer

**Role:** Speed Optimization & Core Web Vitals

TEMPO ensures your site loads fast and provides a smooth experience.

### Capabilities
- Core Web Vitals optimization
- Image optimization
- Code splitting recommendations
- Caching strategies
- CDN configuration

### Usage Example
```
User: "My site is loading slowly"

TEMPO: "Performance audit results:

Current scores:
- LCP: 4.2s ❌ (target: <2.5s)
- FID: 180ms ⚠️ (target: <100ms)
- CLS: 0.25 ❌ (target: <0.1)

Top optimizations:
1. Compress hero image (saves 2.1s)
2. Lazy load product images (saves 0.8s)
3. Add font-display: swap (reduces CLS)
4. Defer non-critical JavaScript"
```

---

## GUARDIAN - The Accessibility Champion

**Role:** WCAG Compliance & Accessibility Audits

GUARDIAN ensures your site is accessible to all users.

### Capabilities
- WCAG 2.1 compliance checking
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- ARIA implementation

### Usage Example
```
User: "Is my site accessible?"

GUARDIAN: "Accessibility audit (WCAG 2.1 AA):

Score: 72/100

Critical issues:
1. Product images missing alt text (WCAG 1.1.1)
2. Form labels not associated (WCAG 1.3.1)
3. Focus indicator invisible (WCAG 2.4.7)

Fixes needed:
- Add descriptive alt text to 24 images
- Add for/id pairs to 8 form fields
- Add visible focus outline to interactive elements"
```

---

## Working with Multiple Agents

Agents can collaborate on complex tasks. NOVA automatically coordinates when needed.

### Example: Complete Site Audit

```
User: "Audit my entire site"

NOVA coordinates:
→ TEMPO runs performance audit
→ GUARDIAN checks accessibility
→ CIPHER scans for security issues
→ AEGIS tests across browsers
→ ORACLE analyzes user behavior

Consolidated report delivered in 2 minutes.
```

## API Access

Access agents programmatically:

```javascript
// Request content from SAGE
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Write product description for luxury watch',
    agent: 'SAGE'
  })
});
```

See [API Reference](../api/README.md) for complete documentation.
