# User Experience Rules - Progress & Feedback

## Core Principle
**People don't mind waiting for quality as long as they see progress**

---

## "Create from Scratch" Flow

### Step 1: Smart Intake Questions
Ask the right questions to build a great site:

1. **Business Basics**
   - "What's your business name?"
   - "What industry are you in?" (dropdown + auto-detect option)

2. **Description**
   - "Describe your business in 2-3 sentences"
   - "What makes you different from competitors?"

3. **Services/Products**
   - "List your top 3 services or products"
   - "What's your most popular offering?"

4. **Target Audience**
   - "Who is your ideal customer?"
   - "What problem do you solve for them?"

5. **Style Preferences** (optional)
   - "Any colors you love or hate?"
   - "Show examples of sites you like"

6. **Contact**
   - Location, phone, email
   - Social media links

---

## Real-Time Progress Display

### The Task Execution List
Show users EXACTLY what's happening:

```
✅ Analyzing your business details...
✅ Loading industry design profile...
⏳ Generating hero image (Leonardo AI)...
⬜ Generating services image...
⬜ Generating about image...
⬜ Generating team image...
⬜ Creating website copy...
⬜ Building HTML structure...
⬜ Applying styling...
⬜ Optimizing for mobile...
⬜ Final quality check...
```

### Progress Bar
- Show percentage (e.g., 35% complete)
- Smooth animation between steps
- Estimated time remaining

### Live Preview (Advanced)
If possible, show the website BUILDING in real-time:
- Start with wireframe/skeleton
- Add sections as they're built
- Images appear as generated
- Colors/fonts apply live

---

## Status Messages by Phase

| Phase | Message | Duration |
|-------|---------|----------|
| Init | "Preparing your custom design..." | 2s |
| DNA | "Loading industry-perfect styling..." | 1s |
| Image 1 | "Creating your hero image..." | 8-12s |
| Image 2 | "Crafting services visual..." | 8-12s |
| Image 3 | "Designing about section..." | 8-12s |
| Image 4 | "Adding finishing touches..." | 8-12s |
| HTML | "Building your website structure..." | 3s |
| CSS | "Applying professional styling..." | 2s |
| Final | "Running quality checks..." | 2s |
| Done | "Your website is ready!" | - |

---

## Error Handling UX

If something fails:
- Don't show technical errors
- "We're working on your image, please wait..."
- Auto-retry up to 3 times
- If still failing: "We'll use a beautiful placeholder while we sort this out"

---

## Post-Generation

Once complete, show:
1. Full preview of the website
2. "Download" button
3. "Edit" button (future feature)
4. "Start New" button
5. Share options
