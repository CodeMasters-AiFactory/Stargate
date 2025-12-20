# Stargate IDE - Design Guidelines

## Design Approach

**System-Based Approach** - Modern code editor patterns inspired by VSCode, Replit Editor, and Monaco Editor

- **Rationale**: As a productivity tool (IDE), functionality and efficiency are paramount over visual flair
- **Key Principles**: Clarity, efficiency, scanability, minimal distraction from code content

---

## Core Design Elements

### A. Typography

**Interface Text:**

- Primary: `Inter` or `SF Pro Display` (system fonts via Google Fonts CDN)
- UI Labels: 13-14px, medium weight (500)
- Menu Items: 13px, regular weight (400)
- File Names: 12px, regular weight
- Status Bar: 11px, regular weight

**Code/Monospace:**

- Editor Font: `JetBrains Mono` or `Fira Code` via Google Fonts CDN
- Code Size: 14px
- Line Height: 1.6 for optimal code readability
- Letter Spacing: Slightly wider for monospace clarity

### B. Layout System

**Spacing Primitives (Tailwind):**

- Core Units: 2, 4, 6, 8 (e.g., `p-2`, `m-4`, `gap-6`, `h-8`)
- Section Spacing: 8, 12, 16 for larger separations
- Rationale: Compact spacing suits information-dense IDE interfaces

**Layout Structure:**

```
├── Top Bar (h-12) - File name, actions, window controls
├── Main Container (flex-1)
│   ├── Sidebar (w-12 collapsed, w-56 expanded) - File tree, extensions
│   ├── Editor Area (flex-1) - Code editor pane
│   └── Right Panel (w-80, optional) - Output, terminal, debugger
└── Status Bar (h-6) - Line/col, language, git info
```

**Grid Constraints:**

- No multi-column for editor area (full-width code pane)
- Sidebar: Single column file tree structure
- Panels stack vertically on mobile (if applicable)

### C. Component Library

**Navigation & Structure:**

- **Top Bar**: Minimal height (48px), flat design, icon buttons (24px), file breadcrumbs
- **Sidebar**: Icon-only collapsed (48px wide), full expanded (224px wide), toggle transition
- **Tab Bar**: 32px height, close buttons, active tab indicator, drag-to-reorder support
- **File Tree**: 24px row height, indent by 16px per level, folder/file icons from Heroicons

**Editor Components:**

- **Code Editor Container**: Full-width/height within available space, line numbers gutter (40px)
- **Minimap** (optional): 120px wide, positioned absolutely on right edge
- **Line Number Gutter**: 40-50px wide, right-aligned numbers
- **Scrollbars**: Thin custom scrollbars (8px width) with subtle track

**Panels & Overlays:**

- **Bottom Panel**: Collapsible terminal/output (200-300px height), resize handle (4px)
- **Command Palette**: Centered modal (600px wide), fuzzy search input, keyboard navigation
- **Settings Panel**: Right-side drawer (400px wide), slide-in transition

**Forms & Inputs:**

- **Search Input**: 32px height, rounded corners (4px), icon prefix, keyboard shortcuts hint
- **Buttons**: 28-32px height, 8px horizontal padding, icon + text combinations
- **Dropdowns**: 32px height, chevron indicator, max-height with scroll for long lists

**Icons:**

- **Library**: Heroicons (via CDN) - outline style for UI, solid for active states
- **Size**: 16px for inline, 20px for toolbar, 24px for primary actions
- Consistent usage: folder icons, file type icons, action buttons

### D. Animations

**Minimal Animation Strategy:**

- **Sidebar Toggle**: 200ms ease-in-out width transition
- **Tab Switching**: Instant (no transition), focus on speed
- **Panel Resize**: Real-time, no animation (direct manipulation)
- **Command Palette**: 150ms fade-in, no complex animations
- **Hover States**: Instant background changes, no delays

**Rationale**: IDEs prioritize responsiveness; animations should never delay user actions

---

## Component Specifications

**File Explorer:**

- Compact 24px row height
- Hover states for selection
- Chevron icons for expand/collapse folders
- Truncate long file names with ellipsis
- Context menu on right-click

**Editor Tabs:**

- Show modified indicator (dot)
- Close button appears on hover
- Active tab with subtle highlight treatment
- Maximum 20 tabs visible, overflow with scroll

**Status Bar:**

- Fixed 24px height at bottom
- Left: Line/column, indentation info
- Right: Language mode, encoding, EOL type
- Divide sections with subtle separators

**Terminal/Output Panel:**

- Monospace font matching editor
- Resizable with drag handle
- Clear button, split view option
- Scroll-to-bottom on new output

---

## Images

**Not Applicable** - IDEs are functional interfaces without marketing imagery. No hero images or decorative visuals needed.

---

## Accessibility

- Keyboard navigation for all actions (Cmd/Ctrl shortcuts)
- Focus indicators on interactive elements (2px outline, 2px offset)
- ARIA labels for icon-only buttons
- Screen reader announcements for file tree changes
- High contrast mode support via CSS variables

---

## Key Design Decisions

1. **Sidebar-First Layout**: Familiar pattern from VSCode/Replit for immediate file access
2. **Monospace Typography**: Critical for code alignment and readability
3. **Minimal UI Chrome**: Maximize editor space, hide unnecessary decorations
4. **Instant Interactions**: No animation delays for file opening, switching, or commands
5. **Consistent 8px Grid**: Tight spacing for information density without claustrophobia
