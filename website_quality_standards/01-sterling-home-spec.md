# Sterling Legal Partners - Homepage Specification

**Route:** `/`  
**Page Type:** Homepage  
**Business:** Modern, professional law firm  
**Services:** Corporate Law, Family Law, Criminal Defense  
**Location:** Use placeholders `[CITY]` and `[REGION]` for reusability

---

## SEO Configuration

### Page Title
```
Corporate, Family & Criminal Law Firm in [CITY] | Sterling Legal Partners
```

### Meta Description (150-165 characters)
```
Sterling Legal Partners is a full-service law firm in [CITY] helping businesses and families with corporate, family and criminal law. Book a confidential consultation today.
```

### H1 (Only One)
```
Trusted Corporate, Family & Criminal Law Firm in [CITY]
```

### H2 Headings (Include Keywords)
- "Who We Serve"
- "Our Key Practice Areas"
- "Why Clients Choose Sterling Legal Partners"
- "Client Outcomes We're Proud Of"
- "About Sterling Legal Partners"
- "How We Work With You"
- "Frequently Asked Questions"
- "Ready to Talk to a Lawyer?"

---

## Global Design Direction

### Colors
- **Primary:** Deep navy/dark blue (#1e3a8a or similar)
- **Accent:** Warm amber/copper (#d97706 or #b45309)
- **Background:** White with generous white space
- **Text:** Dark gray/black for body, navy for headings

### Typography
- **Headings:** Modern sans-serif, bold (Inter, Roboto, or similar)
- **Body:** Same font family, regular weight, 16-18px
- **Line Height:** 1.6-1.8 for body text
- **Hierarchy:** Clear size differences (H1: 48-60px, H2: 36-48px, H3: 24-30px)

### Components
- Clean hero sections with strong visual hierarchy
- Card-based layouts for services/features
- Generous spacing (60-120px between sections)
- Subtle hover effects and transitions
- Professional, not playful

---

## Section 1: Hero Section

### Layout
- Full-width hero with background image/illustration
- Content centered or left-aligned
- Dark overlay on image if needed for text readability

### Content

**H1:**
```
Trusted Corporate, Family & Criminal Law Firm in [CITY]
```

**Subheading (1-2 sentences):**
```
Sterling Legal Partners helps businesses and families navigate complex legal issues with clear advice, decisive action and confidential support.
```

**3 Bullet Points (Short, Benefit-Focused):**
- "Corporate, family & criminal law under one roof"
- "Clear fees, transparent communication"
- "Confidential, results-driven representation"

**Primary CTA Button:**
- Text: "Book a Consultation"
- Action: Scroll to contact section or open booking form modal
- Style: Large, prominent, primary color (navy or accent)

**Secondary CTA Button:**
- Text: "Call Our Office"
- Action: `tel:` link with placeholder number (e.g., `tel:+27123456789`)
- Style: Outlined or secondary style

**Trust Line (Small text under CTAs):**
```
Serving clients in [CITY] and surrounding [REGION].
```

**Background Image:**
- Generated via image generator
- Prompt: "Professional South African law firm office, warm natural light, subtle blue and copper brand colours, confident but approachable atmosphere, no visible text, modern interior"
- Or use abstract legal-themed illustration

---

## Section 2: Who We Serve

### H2
```
Who We Serve
```

### Intro Paragraph
```
We provide comprehensive legal services to two main client groups, each with distinct needs and priorities.
```

### Two Cards/Columns

#### Card A: "Businesses & Organisations"
- **Icon/Visual:** Business/office icon
- **Bullet Points:**
  - "Contract drafting and review"
  - "Regulatory compliance and governance"
  - "Commercial dispute resolution"
  - "Ongoing legal advisory for SMEs and growing companies"

#### Card B: "Individuals & Families"
- **Icon/Visual:** Family/individual icon
- **Bullet Points:**
  - "Divorce and separation matters"
  - "Child custody and maintenance"
  - "Criminal defense and bail applications"
  - "Protection of your rights and interests"

---

## Section 3: Key Practice Areas

### H2
```
Our Key Practice Areas
```

### 3 Service Cards

#### Card 1: Corporate Law
- **Title:** "Corporate Law"
- **Description (2-3 sentences):**
  ```
  Business formation, contracts, governance, dispute resolution and ongoing legal advisory for SMEs and growing companies. We help you build, protect and grow your business with sound legal foundations.
  ```
- **Link:** "View corporate law services" → `/services#corporate-law` or `/services/corporate-law`

#### Card 2: Family Law
- **Title:** "Family Law"
- **Description (2-3 sentences):**
  ```
  Divorce, custody, maintenance and parenting plans handled with sensitivity and firm protection of your rights. We focus on child-centered solutions while ensuring your interests are protected.
  ```
- **Link:** "View family law services" → `/services#family-law` or `/services/family-law`

#### Card 3: Criminal Defense
- **Title:** "Criminal Defense"
- **Description (2-3 sentences):**
  ```
  Strategic defense for bail applications, criminal charges and investigations, protecting your liberty and record. We act quickly to protect your rights and achieve the best possible outcome.
  ```
- **Link:** "View criminal defense services" → `/services#criminal-defense` or `/services/criminal-defense`

---

## Section 4: Why Clients Choose Us

### H2
```
Why Clients Choose Sterling Legal Partners
```

### Intro Sentence
```
We combine legal expertise with a client-focused approach that sets us apart.
```

### 3-4 Value Points (Icons + Descriptions)

#### 1. Clear Communication
- **Icon:** Communication/speech bubble icon
- **Description:** "We explain your options in plain language and keep you updated at every stage of your matter."

#### 2. Strategic Thinking
- **Icon:** Strategy/chess icon
- **Description:** "We focus on long-term outcomes, not just quick fixes. Every decision considers your broader goals."

#### 3. Personal Attention
- **Icon:** Personal/handshake icon
- **Description:** "You work with a dedicated attorney who understands your situation and is committed to your success."

#### 4. Confidential & Ethical
- **Icon:** Shield/lock icon
- **Description:** "Your matter is handled with discretion and integrity. We maintain the highest ethical standards."

---

## Section 5: Client Outcomes (Social Proof)

### H2
```
Client Outcomes We're Proud Of
```

### 3 Mini Case Blurbs (Anonymised, 1-2 sentences each)

#### Case 1: Corporate
```
Helped a growing tech company in [CITY] restructure shareholder agreements and avoid a costly dispute that could have derailed their expansion plans.
```

#### Case 2: Family Law
```
Guided a parent through a complex custody matter, achieving a stable, child-focused parenting plan that prioritised the children's wellbeing.
```

#### Case 3: Criminal Defense
```
Obtained bail and a favourable outcome in a criminal matter where the client faced significant reputational risk and potential career impact.
```

### Disclaimer
```
Examples are anonymised and illustrative only. Past results do not guarantee future outcomes.
```

---

## Section 6: About the Firm Teaser

### H2
```
About Sterling Legal Partners
```

### Story Paragraph
```
Founded with a commitment to making quality legal services accessible to businesses and families in [CITY], Sterling Legal Partners has built a reputation for clear communication, strategic thinking and results-driven representation. We combine deep legal expertise with a personal approach, ensuring every client receives the attention and outcomes they deserve.
```

### 3 Mini Values (Display in a row)
- **"Integrity"** - We act with honesty and ethical standards
- **"Clarity"** - We explain complex legal matters in plain language
- **"Action"** - We move decisively to protect your interests

### Button
- Text: "Meet the Firm"
- Link: `/about`

---

## Section 7: How It Works

### H2
```
How We Work With You
```

### Three Numbered Steps

#### Step 1: Schedule a Consultation
- **Number:** "1"
- **Title:** "Schedule a Consultation"
- **Description:** "Contact us to discuss your situation confidentially. We'll understand your needs and explain how we can help."

#### Step 2: Receive a Clear Plan
- **Number:** "2"
- **Title:** "Receive a Clear Plan"
- **Description:** "We outline your legal options and recommended strategy, including transparent fee structures and timelines."

#### Step 3: Move Forward With Confidence
- **Number:** "3"
- **Title:** "Move Forward With Confidence"
- **Description:** "We act on your instructions and keep you updated as your matter progresses, working toward the best possible outcome."

---

## Section 8: FAQ Section

### H2
```
Frequently Asked Questions
```

### 4-6 Q&As

#### Q1: How do consultations work?
**A:** "Initial consultations are confidential and typically last 30-60 minutes. We'll discuss your situation, explain your options, and outline how we can help. There is no obligation to proceed."

#### Q2: What do your fees look like?
**A:** "We provide transparent fee structures upfront. Fees vary depending on the complexity and type of matter. We'll discuss fees during your consultation and provide a clear estimate before you commit."

#### Q3: Can you help if I'm not based in [CITY]?
**A:** "Yes, we serve clients throughout [REGION] and can arrange consultations via phone or video call. Some matters may require in-person meetings, which we can discuss during your initial consultation."

#### Q4: How quickly can you start working on my matter?
**A:** "We understand that legal matters often require urgent attention. We aim to respond to new enquiries within 24 hours and can often begin work immediately after consultation and engagement."

#### Q5: Do you offer payment plans?
**A:** "We work with clients to find fee arrangements that work for their situation. This may include payment plans for certain matters, which we can discuss during your consultation."

#### Q6: What makes you different from other law firms?
**A:** "We combine deep legal expertise with clear communication, strategic thinking and personal attention. Every client works with a dedicated attorney who understands their situation and is committed to achieving the best possible outcome."

---

## Section 9: Final CTA Section

### Strong Heading (H2 or visually prominent)
```
Ready to Talk to a Lawyer?
```

### Supporting Text
```
Share a few details about your matter and our team will contact you to arrange a confidential consultation.
```

### Primary CTA Button
- Text: "Book a Consultation"
- Link: `/contact` or opens contact form
- Style: Large, prominent, primary color

### Secondary CTA
- Text: "Call [PHONE NUMBER]"
- Link: `tel:` link
- Style: Text link or secondary button

---

## Section 10: Footer

### Content Structure

**Column 1: Firm Info**
- Firm name: "Sterling Legal Partners"
- Logo/wordmark (if available)
- Tagline: "Trusted legal counsel for businesses and families"

**Column 2: Quick Links**
- Home
- Services
- About
- Contact
- Privacy Policy

**Column 3: Contact Info**
- Address: `[STREET ADDRESS], [CITY], [POSTAL CODE]`
- Phone: `[PHONE NUMBER]`
- Email: `info@sterlinglegalpartners.co.za` (or placeholder)

**Column 4: Practice Areas (Quick Links)**
- Corporate Law
- Family Law
- Criminal Defense

### Copyright Line
```
© 2025 Sterling Legal Partners. All rights reserved.
```

---

## Technical Requirements

### Performance
- Page load time: < 3 seconds
- Optimized images (WebP format, lazy loading)
- Minified CSS/JS

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios met

### SEO
- Schema markup (LocalBusiness, LegalService)
- Internal links to Services, About, Contact pages
- Alt text on all images
- Semantic HTML5 structure

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly buttons (min 44x44px)
- Readable text on all screen sizes

---

## Implementation Notes

- Use React components or HTML/CSS as per Merlin's tech stack
- Ensure all placeholder text `[CITY]`, `[REGION]`, `[PHONE NUMBER]` can be easily replaced
- Generate custom images via image generator (see 05-image-prompts-sterling.md)
- Test all CTAs and links
- Verify SEO elements before deployment
- Test on multiple devices and browsers

---

**Last Updated:** January 2025

