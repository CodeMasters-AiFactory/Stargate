# Example: Old Pipeline vs v5.1 Pipeline

## Current Example: "Iron Temple" (Generated with OLD Pipeline)

**Location:** `website_projects/iron-temple/generated-v5/`

### Problems with This Site:

#### 1. **Repetitive Generic Content**
Every section has the same heading and body:
```html
<h2>Why Choose Us</h2>
<p>We combine trustworthy service with balanced expertise to deliver Personal Training that matter. Our team understands Finding right solution and provides solutions tailored to your needs.</p>
```

This appears in:
- Audience section
- Services section  
- Case Studies section
- Team section
- Value Proposition section
- Process section
- FAQ section
- Contact section

**8 sections, all with identical content!**

#### 2. **No Images**
- No hero image
- No supporting images
- Layout JSON shows no `imageUrl` properties

#### 3. **Generic Template Text**
- Hero headline: "Iron Temple delivers Personal Training that Learn more" (broken sentence)
- All sections use template placeholder text
- No industry-specific or business-specific content

---

## What v5.1 Would Generate Instead:

### ✅ **Unique LLM Content for Each Section**
- Hero: "Transform Your Fitness Journey with Expert Personal Training"
- Services: "Comprehensive fitness programs tailored to your goals"
- About: "Our experienced trainers bring years of expertise..."
- Testimonials: "See how we've helped clients achieve their fitness goals..."
- Each section would have unique, relevant content

### ✅ **DALL-E Images**
- Hero image: Fitness/gym theme, high-quality
- Supporting image: Training equipment or client success
- 2-3 images total, stored in `layout.json` with `imageUrl` properties

### ✅ **Modern CSS**
- Design tokens (`--cm-color-*`)
- Card styling with shadows
- Better spacing and typography
- Responsive design

---

## How to See v5.1 in Action:

To generate a NEW website using v5.1:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:5000`

3. **Use Website Builder Wizard:**
   - Enter business details
   - Click "Generate Website"
   - Wait for generation

4. **Check the results:**
   - View at: `http://localhost:5000/website_projects/{slug}/generated-v5/index.html`
   - Check `copy.json` - should have unique content per section
   - Check `layout.json` - should have `imageUrl` properties
   - Check server logs - should show LLM content generation for all sections

---

## Verification Checklist for v5.1:

When you generate a new site, verify:

- [ ] **Content:** Each section has unique heading and body (not "Why Choose Us" repeated)
- [ ] **Images:** `layout.json` shows `imageUrl` on hero + 1-2 other sections
- [ ] **HTML:** Contains 2-3 `<img>` tags
- [ ] **Logs:** Show `[Merlin v5.1] Generating LLM content for X sections...`
- [ ] **Logs:** Show `[Content LLM] Successfully generated content for [section type]` (one per section)
- [ ] **Logs:** Show `[Advanced Image Service] Generating hd hero image...`

If all these check, v5.1 is working correctly!

