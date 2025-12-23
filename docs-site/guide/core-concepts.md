# Core Concepts

Understanding the key concepts behind Stargate Portal.

## Architecture Overview

Stargate Portal uses a modern full-stack architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Visual  │  │ Merlin  │  │Template │  │ Mobile  │    │
│  │ Editor  │  │  Chat   │  │ Gallery │  │ Editor  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AI Agent Orchestrator               │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │   │
│  │  │Res.│ │Con.│ │SEO │ │A11y│ │Des.│ │....│    │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
      ┌─────────┐   ┌──────────┐   ┌──────────┐
      │  Claude │   │ Leonardo │   │ Database │
      │   API   │   │    AI    │   │  SQLite  │
      └─────────┘   └──────────┘   └──────────┘
```

## Key Components

### Projects

A **project** is a complete website with all its pages, assets, and configuration.

```typescript
interface Project {
  id: string;
  name: string;
  slug: string;
  pages: Page[];
  theme: Theme;
  settings: ProjectSettings;
  createdAt: Date;
}
```

### Templates

Templates are pre-built website designs that users can customize. Each template includes:

- HTML structure with semantic sections
- TailwindCSS styling
- Placeholder content
- Image placeholders with AI prompts

### Pages

Pages are individual views within a project, containing sections and components.

### Sections

Sections are building blocks of pages (hero, features, testimonials, etc.).

## The 17-Phase Workflow

Stargate uses a structured 17-phase process to generate websites:

| Phase | Description |
|-------|-------------|
| 1 | Research & analysis |
| 2 | Industry baseline |
| 3 | Content strategy |
| 4 | Information architecture |
| 5 | Wireframing |
| 6 | Visual design |
| 7 | Component selection |
| 8 | Content generation |
| 9 | SEO optimization |
| 10 | Accessibility audit |
| 11 | Image generation |
| 12 | Code generation |
| 13 | Responsive adaptation |
| 14 | Performance optimization |
| 15 | Testing |
| 16 | Review |
| 17 | Export |

## AI Agents

Stargate employs 10 specialized AI agents:

1. **Research Agent** - Analyzes industry trends
2. **Content Agent** - Writes copy and content
3. **SEO Agent** - Optimizes for search engines
4. **Accessibility Agent** - Ensures WCAG compliance
5. **Design Agent** - Creates visual layouts
6. **Layout Agent** - Structures page architecture
7. **Image Agent** - Generates AI images
8. **Code Agent** - Produces clean code
9. **Review Agent** - Quality assurance
10. **Memory Agent** - Maintains context

## Data Flow

1. User describes business → Research Agent analyzes
2. Research data → Content Agent creates copy
3. Content + template → Design Agent applies styling
4. Design output → Code Agent generates HTML/CSS
5. Code → Review Agent validates quality
6. Final output → Stored in database

## Next Steps

- [Website Wizard](/guide/website-wizard) - Step-by-step wizard
- [AI Agents](/guide/ai-agents) - Deep dive into agents
