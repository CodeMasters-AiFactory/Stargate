# Merlin Assistant

Merlin is your AI-powered website building companion.

## What is Merlin?

Merlin is an intelligent assistant that helps you:
- Generate website content
- Edit and refine designs
- Answer questions about your project
- Execute complex multi-step changes
- Learn your preferences over time

## Accessing Merlin

### Sidebar Chat
Click the Merlin icon in any editor view to open the chat sidebar.

### Keyboard Shortcut
Press `Cmd/Ctrl + K` to quickly open Merlin.

### Inline Mode
Right-click any element and select **Ask Merlin** for context-aware help.

## Chat Interface

```
┌─────────────────────────────────────────┐
│  Merlin Assistant                    X  │
├─────────────────────────────────────────┤
│                                         │
│  🧙 How can I help with your website?  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ User: Add a pricing section     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🧙 I've added a pricing section │   │
│  │    with 3 tiers. Would you like │   │
│  │    me to customize the prices?  │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  Type your message...           [Send]  │
└─────────────────────────────────────────┘
```

## Common Commands

### Content Generation

| Command | Description |
|---------|-------------|
| "Write a hero headline for [business]" | Creates compelling headlines |
| "Generate about us content" | Writes company background |
| "Create product descriptions for [items]" | E-commerce descriptions |
| "Write a blog post about [topic]" | Long-form content |

### Design Changes

| Command | Description |
|---------|-------------|
| "Change colors to [scheme]" | Updates color palette |
| "Make the layout more modern" | Redesigns sections |
| "Add more white space" | Adjusts spacing |
| "Use [font] for headings" | Updates typography |

### Section Management

| Command | Description |
|---------|-------------|
| "Add a testimonials section" | Inserts new section |
| "Remove the pricing table" | Deletes section |
| "Move features above about" | Reorders sections |
| "Duplicate the CTA section" | Copies section |

### Image Requests

| Command | Description |
|---------|-------------|
| "Generate a hero image of [description]" | Creates AI image |
| "Replace team photo with AI portraits" | Generates avatars |
| "Create product images for [items]" | Product photography |

## Advanced Usage

### Multi-Step Tasks

Merlin can handle complex requests:

> "Create a complete contact page with a form, map embed, contact details, and office hours for a law firm in Johannesburg"

Merlin will:
1. Generate the page structure
2. Create appropriate sections
3. Fill in content
4. Add the map component
5. Style everything consistently

### Project Context

Merlin remembers your project details:
- Business name and type
- Color scheme and fonts
- Existing content
- Previous changes

### Memory & Learning

Merlin learns your preferences:
- Writing style
- Design preferences
- Common requests
- Terminology

## Tips for Better Results

### Be Specific

**Vague:** "Make it better"
**Specific:** "Make the hero section more impactful with a larger headline and darker background"

### Provide Examples

"Write testimonials similar to Apple's customer stories - short, emotional, focused on transformation"

### Iterate

Ask follow-up questions:
1. "Generate a headline"
2. "Make it shorter"
3. "Add more urgency"
4. "Perfect! Use this one"

### Reference Your Brand

"Use our brand voice - professional but approachable, like talking to a trusted advisor"

## Troubleshooting

### Merlin Not Responding?
- Check ANTHROPIC_API_KEY in .env
- Verify API key has credits
- Check network connection

### Wrong Results?
- Be more specific
- Provide examples
- Break into smaller requests

### Missing Context?
- Remind Merlin of your business type
- Reference previous changes
- Include relevant details
