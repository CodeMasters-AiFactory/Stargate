# The 10 AI Agents

Stargate employs 10 specialized AI agents working together to build professional websites.

## Agent Overview

Each agent has a specific role in the website creation process:

| Agent | Specialty | Phase |
|-------|-----------|-------|
| 🔍 Research Agent | Industry analysis | Early |
| ✍️ Content Agent | Copy writing | Middle |
| 🎯 SEO Agent | Search optimization | Middle |
| ♿ Accessibility Agent | WCAG compliance | Middle |
| 🎨 Design Agent | Visual styling | Middle |
| 📐 Layout Agent | Page structure | Middle |
| 🖼️ Image Agent | AI image generation | Late |
| 💻 Code Agent | HTML/CSS generation | Late |
| ✅ Review Agent | Quality assurance | Final |
| 🧠 Memory Agent | Context management | Always |

## Research Agent 🔍

**Purpose:** Analyzes industry trends, competitors, and best practices.

**Inputs:**
- Business type and description
- Target market
- Competitors (optional)

**Outputs:**
- Industry insights
- Recommended features
- Content suggestions
- SEO keywords

**Example:**
> For a law firm, the Research Agent identifies: typical sections (practice areas, team, testimonials), industry keywords (legal services, attorney, consultation), and best practices from top law firm websites.

## Content Agent ✍️

**Purpose:** Writes compelling, relevant website copy.

**Creates:**
- Headlines and taglines
- Page descriptions
- Product/service details
- About us content
- Call-to-action text
- Blog posts

**Tone Options:**
- Professional
- Casual
- Luxury
- Technical
- Friendly

## SEO Agent 🎯

**Purpose:** Optimizes content for search engines.

**Handles:**
- Meta titles and descriptions
- Header tag hierarchy
- Keyword placement
- Image alt text
- URL structure
- Schema markup

**Output Example:**
```html
<title>Smith & Associates | Top Johannesburg Law Firm</title>
<meta name="description" content="Award-winning legal services in Johannesburg. Family law, corporate law, and litigation. Free consultation. Call 011-xxx-xxxx">
```

## Accessibility Agent ♿

**Purpose:** Ensures WCAG 2.1 AA compliance.

**Checks:**
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Form labels
- Focus indicators
- Alt text quality

**Fixes Applied:**
- Adds missing ARIA labels
- Improves color contrast
- Ensures focus visibility
- Adds skip links

## Design Agent 🎨

**Purpose:** Creates cohesive visual designs.

**Handles:**
- Color palette selection
- Typography pairing
- Spacing consistency
- Visual hierarchy
- Brand alignment

**Output:**
```css
:root {
  --primary: #2563eb;
  --secondary: #1e40af;
  --accent: #fbbf24;
  --text: #1f2937;
  --background: #ffffff;
}
```

## Layout Agent 📐

**Purpose:** Structures page architecture.

**Creates:**
- Section ordering
- Grid layouts
- Component arrangement
- Navigation structure
- Footer layout

**Considers:**
- User flow
- Content priority
- Visual balance
- Mobile responsiveness

## Image Agent 🖼️

**Purpose:** Generates and optimizes images.

**Functions:**
- Generates AI images via Leonardo
- Optimizes image size
- Creates responsive variants
- Adds proper alt text
- Suggests image placements

## Code Agent 💻

**Purpose:** Produces clean, semantic code.

**Generates:**
- Semantic HTML5
- TailwindCSS classes
- Responsive breakpoints
- Accessible markup
- Performance-optimized code

**Code Quality:**
- Valid HTML5
- BEM-like naming
- Mobile-first CSS
- No inline styles

## Review Agent ✅

**Purpose:** Quality assurance and validation.

**Checks:**
- Content accuracy
- Design consistency
- Accessibility compliance
- SEO requirements
- Mobile responsiveness
- Performance metrics

**Report:**
```
✅ Accessibility: PASS (WCAG 2.1 AA)
✅ SEO: PASS (Meta tags complete)
✅ Performance: PASS (LCP < 2.5s)
⚠️ Content: 2 warnings (review testimonials)
```

## Memory Agent 🧠

**Purpose:** Maintains context across the session.

**Stores:**
- Business information
- User preferences
- Previous decisions
- Brand guidelines
- Conversation history

**Benefits:**
- Consistent outputs
- Faster iterations
- Personalized suggestions
- Context-aware responses

## How Agents Collaborate

```
User Request
     │
     ▼
┌─────────────┐
│   Memory    │─── Provides context to all agents
└─────────────┘
     │
     ▼
┌─────────────┐
│  Research   │─── Analyzes requirements
└─────────────┘
     │
     ├────────────────┬───────────────┐
     ▼                ▼               ▼
┌─────────┐    ┌───────────┐   ┌───────────┐
│ Content │    │   Design  │   │   Layout  │
└─────────┘    └───────────┘   └───────────┘
     │                │               │
     ├────────────────┼───────────────┘
     ▼                ▼
┌─────────┐    ┌───────────┐
│   SEO   │    │   A11y    │
└─────────┘    └───────────┘
     │                │
     └────────────────┤
                      ▼
              ┌───────────┐
              │   Code    │
              └───────────┘
                      │
                      ▼
              ┌───────────┐
              │  Review   │
              └───────────┘
                      │
                      ▼
              Final Website
```

## Customizing Agents

### Adjust Agent Behavior

Edit `server/agents/config.ts`:

```typescript
export const agentConfig = {
  content: {
    tone: 'professional',
    length: 'concise',
    language: 'en-ZA'
  },
  design: {
    style: 'modern',
    colorScheme: 'brand'
  }
};
```

### Disable Agents

For specific workflows, disable agents:

```typescript
generateWebsite({
  disableAgents: ['seo', 'accessibility']
});
```
