# Visual Editor Component

The main drag-and-drop editing canvas.

## Import

```tsx
import { VisualEditor } from '@/components/VisualEditor';
```

## Basic Usage

```tsx
<VisualEditor
  project={project}
  onSave={handleSave}
  onChange={handleChange}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| project | Project | Yes | The project to edit |
| onSave | (project: Project) => void | Yes | Save callback |
| onChange | (changes: Changes) => void | No | Change callback |
| readonly | boolean | No | Disable editing |
| initialPage | string | No | Page to load initially |
| theme | EditorTheme | No | Custom editor theme |

## Project Type

```typescript
interface Project {
  id: string;
  name: string;
  pages: Page[];
  theme: Theme;
  settings: ProjectSettings;
}

interface Page {
  id: string;
  name: string;
  path: string;
  sections: Section[];
}

interface Section {
  id: string;
  type: string;
  content: Record<string, any>;
  styles: Record<string, string>;
}
```

## Events

### onSave

Triggered when user saves (Ctrl+S or Save button):

```tsx
const handleSave = async (project: Project) => {
  await api.saveProject(project);
  toast.success('Saved!');
};
```

### onChange

Triggered on every edit:

```tsx
const handleChange = (changes: Changes) => {
  console.log('Changed:', changes.type, changes.target);
  setHasUnsavedChanges(true);
};
```

## Exposed Methods

Access editor methods via ref:

```tsx
const editorRef = useRef<VisualEditorRef>(null);

// Later...
editorRef.current?.undo();
editorRef.current?.redo();
editorRef.current?.selectElement(elementId);
editorRef.current?.addSection(sectionType);
```

### Available Methods

| Method | Description |
|--------|-------------|
| undo() | Undo last action |
| redo() | Redo last undone action |
| save() | Trigger save |
| selectElement(id) | Select element by ID |
| addSection(type) | Add new section |
| deleteSection(id) | Remove section |
| duplicateSection(id) | Copy section |
| moveSection(id, direction) | Reorder section |
| exportHTML() | Get HTML output |

## Customization

### Custom Theme

```tsx
const customTheme: EditorTheme = {
  canvas: {
    background: '#f5f5f5',
    gridColor: '#e0e0e0',
    gridSize: 8
  },
  selection: {
    color: '#2563eb',
    handleSize: 8
  },
  panels: {
    background: '#ffffff',
    border: '#e5e7eb'
  }
};

<VisualEditor theme={customTheme} {...props} />
```

### Custom Components

Register custom components for the editor:

```tsx
import { registerComponent } from '@/components/VisualEditor';

registerComponent('custom-banner', {
  name: 'Custom Banner',
  icon: 'banner',
  render: CustomBannerComponent,
  properties: [
    { name: 'title', type: 'text' },
    { name: 'background', type: 'color' }
  ]
});
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy |
| Ctrl+V | Paste |
| Delete | Remove selected |
| Ctrl+D | Duplicate |
| Arrow keys | Move element |

## Sub-Components

The VisualEditor is composed of:

- `EditorCanvas` - The main editing area
- `ComponentPanel` - Left sidebar with components
- `PropertiesPanel` - Right sidebar with properties
- `EditorToolbar` - Top toolbar with actions
- `HistoryPanel` - Undo/redo history
