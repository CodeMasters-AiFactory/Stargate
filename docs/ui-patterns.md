# UI Layout Patterns

**Last Updated:** January 2025

This document describes common layout patterns used in Merlin Website Wizard for building modern, professional websites.

---

## Pattern Library

### 1. Hero Section

**Purpose:** Primary landing area with main message and CTAs

**Layout:**

- Full-width section
- Two-column layout on desktop (text left, image right)
- Stacked on mobile
- Background: solid color, gradient, or image

**Components:**

- H1 heading (large, bold)
- Subheading (1-2 sentences)
- 3-4 bullet points (benefits)
- Primary CTA button (large, prominent)
- Secondary CTA button/link
- Trust line (small text)

**Example:**

```
┌─────────────────────────────────────┐
│  [Hero Image]    H1: Main Message   │
│                   Subheading        │
│                   • Benefit 1       │
│                   • Benefit 2       │
│                   • Benefit 3       │
│                   [Primary CTA]     │
│                   [Secondary CTA]   │
│                   Trust line        │
└─────────────────────────────────────┘
```

---

### 2. Card Grid

**Purpose:** Display multiple items (services, features, team, etc.)

**Layout:**

- Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Equal-height cards
- Consistent spacing

**Card Structure:**

- Icon/image (optional)
- Title
- Description (2-3 sentences)
- Link/button (optional)

**Example:**

```
┌──────┐  ┌──────┐  ┌──────┐
│ Card │  │ Card │  │ Card │
│      │  │      │  │      │
│ Title│  │ Title│  │ Title│
│ Desc │  │ Desc │  │ Desc │
│ Link │  │ Link │  │ Link │
└──────┘  └──────┘  └──────┘
```

---

### 3. Two-Column Section

**Purpose:** Compare two options, show features side-by-side

**Layout:**

- Two equal columns on desktop
- Stacked on mobile
- Can have images, icons, or text

**Example:**

```
┌──────────────┬──────────────┐
│ Column 1     │ Column 2     │
│              │              │
│ Title        │ Title        │
│ • Point 1    │ • Point 1    │
│ • Point 2    │ • Point 2    │
│ • Point 3    │ • Point 3    │
└──────────────┴──────────────┘
```

---

### 4. Timeline / Steps Section

**Purpose:** Show process, how it works, or timeline

**Layout:**

- Vertical timeline or horizontal steps
- Numbered items
- Clear progression

**Example:**

```
Step 1 → Step 2 → Step 3
  │        │        │
Title    Title    Title
Desc     Desc     Desc
```

---

### 5. FAQ Section

**Purpose:** Answer common questions

**Layout:**

- Accordion (expandable Q&A)
- Or simple list
- Clear question/answer separation

**Example:**

```
┌─────────────────────────────┐
│ ▼ Question 1                │
│   Answer text...            │
├─────────────────────────────┤
│ ▶ Question 2                │
├─────────────────────────────┤
│ ▶ Question 3                │
└─────────────────────────────┘
```

---

### 6. Testimonial Band

**Purpose:** Social proof and trust building

**Layout:**

- Horizontal scroll or grid
- Quote cards
- Attribution (name, role, company - optional)

**Example:**

```
┌────────┐  ┌────────┐  ┌────────┐
│ Quote  │  │ Quote  │  │ Quote  │
│ "..."  │  │ "..."  │  │ "..."  │
│ -Name  │  │ -Name  │  │ -Name  │
└────────┘  └────────┘  └────────┘
```

---

### 7. CTA Section

**Purpose:** Conversion point

**Layout:**

- Centered content
- Large heading
- Supporting text
- Primary CTA button (large)
- Secondary CTA (optional)

**Example:**

```
┌─────────────────────────────┐
│                             │
│    Ready to Get Started?    │
│    Supporting text...       │
│                             │
│    [Primary CTA Button]     │
│    [Secondary CTA]          │
│                             │
└─────────────────────────────┘
```

---

## Component System

### React Components (if using React)

```typescript
<HeroSection
  h1={string}
  subheading={string}
  bullets={string[]}
  primaryCTA={{ text, action }}
  secondaryCTA={{ text, action }}
  trustLine={string}
  backgroundImage={string}
/>

<CardGrid
  title={string}
  cards={Array<{
    title: string;
    description: string;
    icon?: string;
    image?: string;
    link?: string;
  }>}
  columns={3}
/>

<TwoColumnSection
  title={string}
  intro={string}
  leftColumn={{ title, content }}
  rightColumn={{ title, content }}
/>

<TimelineSection
  title={string}
  steps={Array<{
    number: number;
    title: string;
    description: string;
  }>}
/>

<FAQSection
  title={string}
  items={Array<{
    question: string;
    answer: string;
  }>}
/>

<TestimonialBand
  title={string}
  testimonials={Array<{
    quote: string;
    author?: string;
    role?: string;
  }>}
/>

<CTASection
  heading={string}
  text={string}
  primaryCTA={{ text, action }}
  secondaryCTA={{ text, action }}
/>
```

---

## Layout Recipes

### Home Page Recipe

```
1. HeroSection (content.hero)
2. TwoColumnSection (content.whoWeServe)
3. CardGrid (content.keyServices)
4. CardGrid (content.differentiators)
5. TestimonialBand (content.outcomes)
6. TwoColumnSection (content.aboutTeaser)
7. TimelineSection (content.howItWorks)
8. FAQSection (content.faq)
9. CTASection (content.finalCTA)
10. Footer (global)
```

### Services Page Recipe

```
1. HeroSection (content.intro)
2. CardGrid (content.overview)
3. ContentSection (content.detailedServices[0])
4. ContentSection (content.detailedServices[1])
5. ContentSection (content.detailedServices[2])
6. FAQSection (content.faq)
7. CTASection (content.cta)
8. Footer (global)
```

### About Page Recipe

```
1. HeroSection (content.hero)
2. ContentSection (content.story)
3. CardGrid (content.values)
4. CardGrid (content.team)
5. ContentSection (content.standards)
6. TimelineSection (content.highlights)
7. CTASection (content.cta)
8. Footer (global)
```

### Contact Page Recipe

```
1. HeroSection (content.intro)
2. TwoColumnSection (content.contactOptions)
3. FormSection (content.form)
4. MapSection (content.map) - optional
5. FAQSection (content.faq)
6. Footer (global)
```

---

## Spacing System

Use consistent spacing from brand.json:

- **Small:** 0.5rem (8px) - Tight spacing
- **Medium:** 1rem (16px) - Standard spacing
- **Large:** 2rem (32px) - Section spacing
- **XLarge:** 4rem (64px) - Major section breaks

**Section Padding:**

- Top/Bottom: 5rem (80px) for major sections
- Left/Right: Container padding (varies by breakpoint)

---

## Responsive Breakpoints

- **Mobile:** < 768px (single column, stacked)
- **Tablet:** 768px - 1024px (2 columns max)
- **Desktop:** > 1024px (full layout)

---

## Brand Integration

All components must:

- Use colors from `brand.json` (primary, secondary, accent)
- Use typography from `brand.json` (headingFont, bodyFont)
- Apply spacing system from `brand.json`
- Use border radius from `brand.json`

---

**Last Updated:** January 2025
