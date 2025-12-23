# Website Wizard

The Merlin Website Wizard guides you through creating a complete website in minutes.

## Starting the Wizard

Launch the wizard by:
1. Clicking **"Start Building"** on the homepage
2. Navigating to `/builder` directly
3. Clicking **"New Website"** in the dashboard

## Wizard Phases

### Phase 1: Business Information

Enter your business details:

- **Business Name** - Your company or brand name
- **Industry** - Select from 20+ categories
- **Description** - Brief overview of your business
- **Location** - City/region for local SEO

**Pro Tip:** Be specific in your description. Instead of "I sell coffee", try "Specialty single-origin coffee roastery in Cape Town, focusing on Ethiopian and Colombian beans with a modern café experience."

### Phase 2: Package Selection

Choose your tier:

| Package | Pages | Features |
|---------|-------|----------|
| **Starter** | 3 | Basic layout, contact form |
| **Professional** | 5 | SEO optimization, analytics ready |
| **Enterprise** | Unlimited | E-commerce, custom features |

### Phase 3: Template Selection

Browse templates by:
- Industry category
- Style (modern, classic, bold)
- Layout type (single-page, multi-page)

Each template shows:
- Live preview
- Customization options
- Compatible features

### Phase 4: AI Generation

Once you confirm, AI agents begin work:

```
📊 Research Agent     → Analyzing industry...
✍️  Content Agent     → Writing copy...
🎨 Design Agent       → Applying styles...
📱 Layout Agent       → Structuring pages...
🔍 SEO Agent          → Optimizing content...
♿ Accessibility Agent → Checking compliance...
```

Real-time progress is shown via SSE (Server-Sent Events).

### Phase 5: Review & Edit

After generation:
- Preview your complete website
- Edit sections with visual editor
- Generate custom images with Leonardo AI
- Ask Merlin for changes

## Wizard Tips

### For Best Results

1. **Be descriptive** - More detail = better content
2. **Know your audience** - Who visits your site?
3. **Have a goal** - What should visitors do?
4. **Prepare content** - Have your branding ready

### Common Issues

**Wizard stuck on loading?**
- Check your API keys in `.env`
- Verify server is running
- Check browser console for errors

**Content doesn't match my business?**
- Re-run with more specific description
- Use the visual editor to refine
- Ask Merlin to regenerate sections

## Customization After Wizard

The wizard creates a foundation. Customize further with:

- [Visual Editor](/guide/visual-editor) for layout changes
- [Merlin Chat](/guide/merlin) for AI-powered edits
- [Template Customization](/guide/templates) for advanced tweaks
