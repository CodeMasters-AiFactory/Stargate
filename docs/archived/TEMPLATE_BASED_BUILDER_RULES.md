# Template-Based Website Builder Rules
## PERMANENT WORKFLOW - ALWAYS FOLLOW

**Created:** December 3, 2025  
**Version:** 1.0  
**Status:** ACTIVE - MANDATORY

---

## 🎯 Core Principle

**ALL websites built by Merlin MUST use a scraped/downloaded template as the base.**

We do NOT generate websites from scratch. Instead:
1. Use an existing template (from `scraped_templates/` folder)
2. Replace ALL images with new appropriate ones
3. Rewrite ALL content for the client's business
4. Keep the layout structure and design intact

---

## 📋 Mandatory Workflow

### Step 1: Template Selection
- User provides or selects a template from `scraped_templates/`
- Template contains: HTML structure, CSS styling, images list, sections
- Template serves as the DESIGN FOUNDATION

### Step 2: Image Replacement (MANDATORY)
For EVERY image in the template:
1. Analyze what the image represents (hero, team, service, testimonial, etc.)
2. Generate a NEW image using AI (DALL-E/Stable Diffusion) OR
3. Find appropriate stock image that matches the client's industry
4. Replace the URL in the HTML with the new image URL

**Image Replacement Rules:**
- Hero images → Generate new industry-specific hero image
- Team photos → Use professional stock photos or AI-generated
- Service images → Generate images matching client's actual services
- Icons → Keep if universal, replace if branded
- Logos → Replace with client's logo (user must provide)

### Step 3: Content Rewriting (MANDATORY)
For ALL text content in the template:
1. Identify the purpose of each text block (headline, description, CTA, etc.)
2. Rewrite content to match client's:
   - Business name
   - Industry
   - Services offered
   - Location
   - Contact information
   - Unique value propositions

**Content Rewriting Rules:**
- Maintain the TONE and STYLE of original (professional, casual, etc.)
- Keep the STRUCTURE (same number of bullet points, paragraphs, etc.)
- Replace ALL mentions of original company with client's info
- Rewrite ALL service descriptions for client's actual services
- Update ALL contact info (phone, email, address)
- Rewrite ALL testimonials (or remove if no real ones available)
- Update ALL CTAs to be client-specific

### Step 4: Technical Cleanup
- Remove all tracking scripts from original site
- Remove original company's analytics
- Add client's analytics if provided
- Ensure all links are updated or removed
- Validate HTML structure

---

## 🔧 Implementation in Merlin

### Template Input Format
```typescript
interface ScrapedTemplate {
  id: string;
  name: string;
  brand: string;           // Original company name (to find/replace)
  industry: string;
  html: string;            // Full HTML source
  css: string;             // All CSS styles
  images: Array<{          // All images found
    url: string;
    alt: string;
    context: string;       // hero, team, service, etc.
  }>;
  sections: Array<{        // Content sections
    type: string;
    content: string;
  }>;
  text: {
    title: string;
    headings: string[];
    paragraphs: string[];
  };
}
```

### Client Info Input Format
```typescript
interface ClientInfo {
  businessName: string;
  industry: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  services: Array<{
    name: string;
    description: string;
  }>;
  phone: string;
  email: string;
  address: string;
  logo?: string;           // URL to client's logo
  brandColors?: {
    primary: string;
    secondary: string;
  };
  testimonials?: Array<{
    name: string;
    quote: string;
    rating: number;
  }>;
}
```

### Generation Pipeline
```
1. Load Template
   ↓
2. Parse HTML/CSS/Images
   ↓
3. Generate Replacement Images (parallel)
   ↓
4. Rewrite All Content (LLM)
   ↓
5. Find/Replace Original Company → Client
   ↓
6. Update Contact Info
   ↓
7. Clean Up Tracking/Scripts
   ↓
8. Output Final Website
```

---

## 📁 Template Storage

Templates are stored in: `scraped_templates/`

Each template file contains:
- `index.json` - List of all available templates
- `{template-id}.json` - Full template data

---

## ⚠️ Important Rules

1. **NEVER generate website layout from scratch** - Always use template
2. **NEVER skip image replacement** - ALL images must be replaced
3. **NEVER skip content rewriting** - ALL text must be client-specific
4. **ALWAYS maintain template's design quality** - It was chosen for a reason
5. **ALWAYS remove original company's branding** - Legal requirement

---

## 🎨 Image Generation Prompts

When generating replacement images, use these prompt patterns:

**Hero Image:**
```
Professional [INDUSTRY] business hero image, [STYLE], showing [ACTIVITY], 
modern, high-quality, commercial photography style, 16:9 aspect ratio
```

**Service Image:**
```
[SERVICE NAME] being performed by professional, [INDUSTRY] setting, 
clean modern style, commercial photography, square format
```

**Team Image:**
```
Professional team of [NUMBER] people in [INDUSTRY] uniforms, 
friendly, diverse, modern office/workplace, commercial style
```

---

## 📝 Content Rewriting Prompts

When rewriting content, use these LLM prompts:

**Headlines:**
```
Rewrite this headline for a [INDUSTRY] business called [BUSINESS_NAME] 
in [LOCATION]. Keep the same tone and length. Original: "[ORIGINAL]"
```

**Service Descriptions:**
```
Rewrite this service description for [SERVICE_NAME] offered by 
[BUSINESS_NAME], a [INDUSTRY] company. Original: "[ORIGINAL]"
```

**CTAs:**
```
Rewrite this call-to-action for [BUSINESS_NAME]. Keep it actionable 
and compelling. Original: "[ORIGINAL]"
```

---

## ✅ Quality Checklist

Before finalizing any template-based website:

- [ ] All images replaced with industry-appropriate images
- [ ] All text content rewritten for client
- [ ] Original company name completely removed
- [ ] Client's contact info added correctly
- [ ] All links updated or removed
- [ ] Original tracking scripts removed
- [ ] HTML validates correctly
- [ ] CSS loads properly
- [ ] Mobile responsive maintained

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 3, 2025 | Initial template-based workflow rules |


