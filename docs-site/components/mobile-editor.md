# Mobile Editor Component

Touch-optimized editor for mobile devices.

## Import

```tsx
import { MobileEditor } from '@/components/VisualEditor/MobileEditor';
```

## Basic Usage

```tsx
<MobileEditor
  project={project}
  onSave={handleSave}
  onGesture={handleGesture}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| project | Project | Yes | Project to edit |
| onSave | (project: Project) => void | Yes | Save callback |
| onGesture | (gesture: Gesture) => void | No | Gesture handler |
| hapticFeedback | boolean | No | Enable haptics |
| orientation | 'portrait' \| 'landscape' | No | Lock orientation |

## Touch Gestures

### Supported Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select element |
| Double tap | Edit text inline |
| Long press | Open context menu |
| Drag | Move element |
| Pinch | Zoom canvas |
| Two-finger pan | Scroll canvas |
| Swipe left | Undo |
| Swipe right | Redo |

### Gesture Handling

```tsx
const handleGesture = (gesture: Gesture) => {
  switch (gesture.type) {
    case 'pinch':
      console.log('Zoom:', gesture.scale);
      break;
    case 'pan':
      console.log('Pan:', gesture.delta);
      break;
    case 'longPress':
      showContextMenu(gesture.position);
      break;
  }
};
```

## Device Preview

Switch between device sizes:

```tsx
<MobileEditor
  devicePreview="mobile" // 'mobile' | 'tablet' | 'desktop'
  {...props}
/>
```

## Haptic Feedback

Enable haptic feedback for interactions:

```tsx
<MobileEditor
  hapticFeedback={true}
  hapticIntensity="medium" // 'light' | 'medium' | 'heavy'
  {...props}
/>
```

Haptics trigger on:
- Element selection
- Drag start/end
- Menu open
- Save complete

## Mobile-Specific Features

### Bottom Sheet Properties

Properties panel slides up from bottom:

```tsx
// Properties panel behavior
<MobileEditor
  propertiesPanelHeight="half" // 'quarter' | 'half' | 'full'
  {...props}
/>
```

### Floating Action Button

Quick actions via FAB:

```tsx
<MobileEditor
  fabActions={[
    { icon: 'plus', action: 'addSection' },
    { icon: 'image', action: 'addImage' },
    { icon: 'text', action: 'addText' }
  ]}
  {...props}
/>
```

### Orientation Handling

```tsx
const MobileEditorWrapper = () => {
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const handleResize = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <MobileEditor
      orientation={orientation}
      {...props}
    />
  );
};
```

## Responsive Breakpoints

Edit different breakpoints on mobile:

```tsx
<MobileEditor
  editingBreakpoint="mobile" // What you're editing
  previewBreakpoint="mobile" // What you're viewing
  onBreakpointChange={handleBreakpointChange}
  {...props}
/>
```

## Styling

Custom mobile editor styles:

```tsx
<MobileEditor
  className="mobile-editor-custom"
  style={{
    '--fab-color': '#2563eb',
    '--selection-color': '#6366f1'
  }}
  {...props}
/>
```

## Performance

### Optimizations Applied

- Canvas virtualization for large pages
- Debounced gesture handling
- Lazy-loaded property panels
- Touch event throttling

### Recommended Settings

```tsx
<MobileEditor
  virtualizeThreshold={50} // Sections before virtualizing
  gestureDebounce={16} // ms between gesture updates
  {...props}
/>
```
