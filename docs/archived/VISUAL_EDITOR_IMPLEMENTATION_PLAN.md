# Visual Editor Implementation Plan - Week 1-2

**Goal:** Complete drag-drop positioning and component rendering to reach 90% competitive parity
**Timeline:** 2 weeks (10 working days)
**Current Status:** 75% complete → Target: 90%

---

## Current Implementation Analysis

### What Works ✅

1. **ComponentPalette.tsx** - 100% complete
   - Component library with 100+ components
   - Search and category filtering
   - Drag source properly configured

2. **VisualEditor.tsx** - 90% complete
   - Three-panel layout working
   - Undo/redo history implemented
   - Keyboard shortcuts functional
   - Save/export working

3. **Backend API** - 100% complete
   - Component generation endpoint
   - Save/load state
   - Export to ZIP

### Critical Issues 🔴

1. **ComponentCanvas.tsx - Lines 33-106**
   ```typescript
   // PROBLEM: Always drops at end of body content
   const newBodyContent = bodyContent + '\n' + html; // Line 68

   // NEED: Insert at specific position based on drop coordinates
   ```

2. **ComponentRenderer.tsx - Lines 160-179**
   ```typescript
   // PROBLEM: Renders HTML twice (dangerouslySetInnerHTML + iframe)
   // PROBLEM: Click handlers don't work in iframe
   // PROBLEM: No visual selection highlighting
   ```

3. **No Drop Zone Indicators**
   - Need visual feedback showing where component will be inserted
   - Need drop zones between existing components
   - Need insertion line/highlight

---

## Implementation Plan - Day by Day

### Day 1-2: Fix ComponentCanvas Drop Positioning

**Goal:** Enable dropping components at specific positions

**Files to modify:**
- `client/src/components/VisualEditor/ComponentCanvas.tsx`

**Tasks:**

1. **Add drop position tracking (2 hours)**
   ```typescript
   // Track mouse position during drag
   const [dropPosition, setDropPosition] = useState<{x: number, y: number} | null>(null);
   const [insertionIndex, setInsertionIndex] = useState<number>(-1);

   // Update useDrop to capture drop position
   drop: (item, monitor) => {
     const offset = monitor.getClientOffset();
     if (offset) {
       handleComponentDrop(item.component.id, offset);
     }
   }
   ```

2. **Calculate insertion position from drop coordinates (3 hours)**
   ```typescript
   // Parse existing components from HTML
   const parseComponents = (html: string) => {
     const parser = new DOMParser();
     const doc = parser.parseFromString(html, 'text/html');
     const components = Array.from(doc.querySelectorAll('[data-component-id]'));
     return components.map(el => ({
       id: el.getAttribute('data-component-id'),
       element: el,
       bounds: el.getBoundingClientRect() // Get position
     }));
   };

   // Find insertion point based on Y coordinate
   const findInsertionIndex = (components, dropY) => {
     for (let i = 0; i < components.length; i++) {
       if (dropY < components[i].bounds.bottom) {
         return i; // Insert before this component
       }
     }
     return components.length; // Insert at end
   };
   ```

3. **Insert component at calculated position (3 hours)**
   ```typescript
   // Split body content at insertion point
   const insertComponentAt = (html: string, newComponent: string, index: number) => {
     const components = parseComponents(html);

     if (index === 0) {
       // Insert at beginning
       return newComponent + '\n' + html;
     } else if (index >= components.length) {
       // Insert at end (current behavior)
       return html + '\n' + newComponent;
     } else {
       // Insert between components
       const insertAfter = components[index - 1].element;
       const insertPoint = html.indexOf(insertAfter.outerHTML) + insertAfter.outerHTML.length;
       return html.slice(0, insertPoint) + '\n' + newComponent + '\n' + html.slice(insertPoint);
     }
   };
   ```

**Acceptance Criteria:**
- ✅ Component drops at mouse position (not just at end)
- ✅ Insertion works between existing components
- ✅ Insertion works at beginning and end
- ✅ No duplicate components on drop

---

### Day 3-4: Add Visual Drop Zone Indicators

**Goal:** Show users where component will be inserted

**Files to modify:**
- `client/src/components/VisualEditor/ComponentCanvas.tsx`
- Create new: `client/src/components/VisualEditor/DropZoneIndicator.tsx`

**Tasks:**

1. **Create DropZoneIndicator component (2 hours)**
   ```typescript
   // DropZoneIndicator.tsx
   export function DropZoneIndicator({ position, isActive }: {
     position: { top: number, left: number, width: number },
     isActive: boolean
   }) {
     if (!isActive) return null;

     return (
       <div
         style={{
           position: 'absolute',
           top: position.top,
           left: position.left,
           width: position.width,
           height: '4px',
           backgroundColor: 'rgb(59, 130, 246)',
           zIndex: 1000,
           borderRadius: '2px',
           boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
           animation: 'pulse 1s ease-in-out infinite'
         }}
       >
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full" />
       </div>
     );
   }
   ```

2. **Track hover position during drag (3 hours)**
   ```typescript
   // In ComponentCanvas
   const [hoverIndex, setHoverIndex] = useState<number>(-1);

   // Add hover tracking to useDrop
   hover: (item, monitor) => {
     const offset = monitor.getClientOffset();
     if (offset) {
       const components = parseComponents(bodyContent);
       const index = findInsertionIndex(components, offset.y);
       setHoverIndex(index);
     }
   }
   ```

3. **Render drop zones between components (3 hours)**
   ```typescript
   // Render drop zone indicators at component boundaries
   {components.map((comp, index) => (
     <React.Fragment key={comp.id}>
       <DropZoneIndicator
         position={{
           top: comp.bounds.top - 2,
           left: comp.bounds.left,
           width: comp.bounds.width
         }}
         isActive={hoverIndex === index && isDragging}
       />
       {/* Component content */}
     </React.Fragment>
   ))}
   ```

**Acceptance Criteria:**
- ✅ Blue insertion line appears during drag
- ✅ Line moves to show current insertion point
- ✅ Line appears at correct Y position
- ✅ Line spans full width of canvas
- ✅ Smooth animation when line moves

---

### Day 5-6: Fix ComponentRenderer

**Goal:** Proper rendering with selection and hover effects

**Files to modify:**
- `client/src/components/VisualEditor/ComponentRenderer.tsx`

**Tasks:**

1. **Remove duplicate rendering (1 hour)**
   ```typescript
   // REMOVE lines 160-169 (dangerouslySetInnerHTML div)
   // KEEP only iframe rendering (lines 172-178)

   // The issue: Currently renders HTML twice causing conflicts
   ```

2. **Add selection highlighting via iframe messaging (4 hours)**
   ```typescript
   // Use postMessage to communicate with iframe
   const iframeRef = useRef<HTMLIFrameElement>(null);

   useEffect(() => {
     const iframe = iframeRef.current;
     if (!iframe?.contentWindow) return;

     // Inject selection styles and event handlers
     iframe.contentWindow.document.addEventListener('click', (e) => {
       const target = e.target as HTMLElement;
       const component = target.closest('[data-component-id]');
       if (component) {
         const id = component.getAttribute('data-component-id');
         window.parent.postMessage({ type: 'component-select', id }, '*');
       }
     });

     // Add hover effects
     iframe.contentWindow.document.addEventListener('mouseover', (e) => {
       const target = e.target as HTMLElement;
       const component = target.closest('[data-component-id]');
       if (component) {
         component.classList.add('editor-hover');
       }
     });
   }, [completeHtml]);

   // Listen for selection messages from iframe
   useEffect(() => {
     const handleMessage = (e: MessageEvent) => {
       if (e.data.type === 'component-select') {
         onElementSelect({
           id: e.data.id,
           type: 'component',
           path: []
         });
       }
     };
     window.addEventListener('message', handleMessage);
     return () => window.removeEventListener('message', handleMessage);
   }, [onElementSelect]);
   ```

3. **Add resize handles for selected elements (3 hours)**
   ```typescript
   // Inject resize handles into iframe
   const addResizeHandles = (componentId: string) => {
     const iframe = iframeRef.current?.contentWindow?.document;
     if (!iframe) return;

     const component = iframe.querySelector(`[data-component-id="${componentId}"]`);
     if (!component) return;

     // Add 8 resize handles (corners + edges)
     const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
     handles.forEach(position => {
       const handle = iframe.createElement('div');
       handle.className = `resize-handle resize-handle-${position}`;
       handle.style.cssText = `
         position: absolute;
         width: 8px;
         height: 8px;
         background: rgb(59, 130, 246);
         border: 2px solid white;
         border-radius: 50%;
         cursor: ${position}-resize;
         z-index: 10000;
       `;
       // Position handle based on direction
       // ... positioning logic
       component.appendChild(handle);
     });
   };

   useEffect(() => {
     if (selectedElement) {
       addResizeHandles(selectedElement.id);
     }
   }, [selectedElement]);
   ```

**Acceptance Criteria:**
- ✅ Only one rendering (iframe only)
- ✅ Click selects component (blue outline appears)
- ✅ Hover shows dashed outline
- ✅ Selected component has 8 resize handles
- ✅ Resize handles are draggable (functionality in Day 7)

---

### Day 7-8: Implement Drag-to-Reorder

**Goal:** Drag existing components to reorder them

**Files to modify:**
- `client/src/components/VisualEditor/ComponentRenderer.tsx`
- `client/src/components/VisualEditor/ComponentCanvas.tsx`

**Tasks:**

1. **Make rendered components draggable (3 hours)**
   ```typescript
   // Inject drag functionality into iframe components
   const makeDraggable = (componentId: string) => {
     const iframe = iframeRef.current?.contentWindow?.document;
     if (!iframe) return;

     const component = iframe.querySelector(`[data-component-id="${componentId}"]`) as HTMLElement;
     if (!component) return;

     component.draggable = true;
     component.addEventListener('dragstart', (e) => {
       e.dataTransfer?.setData('component-id', componentId);
       component.style.opacity = '0.5';
     });

     component.addEventListener('dragend', () => {
       component.style.opacity = '1';
     });
   };
   ```

2. **Handle drop for reordering (4 hours)**
   ```typescript
   // In ComponentCanvas, update drop handler
   const handleComponentReorder = useCallback((
     draggedId: string,
     targetIndex: number
   ) => {
     const html = bodyContent;

     // Extract dragged component HTML
     const draggedMatch = html.match(
       new RegExp(`<div[^>]*data-component-id="${draggedId}"[^>]*>[\\s\\S]*?</div>`, 'i')
     );
     if (!draggedMatch) return;

     const draggedHTML = draggedMatch[0];

     // Remove from current position
     const htmlWithoutDragged = html.replace(draggedHTML, '');

     // Insert at new position
     const newHTML = insertComponentAt(htmlWithoutDragged, draggedHTML, targetIndex);

     // Update website
     updatePageContent(newHTML);
   }, [bodyContent]);
   ```

3. **Visual feedback during reorder (1 hour)**
   ```typescript
   // Show ghost of component being dragged
   // Show drop zones during drag
   // Animate components shifting to make room
   ```

**Acceptance Criteria:**
- ✅ Can drag existing components
- ✅ Drop zones appear during drag
- ✅ Component moves to new position
- ✅ Other components shift smoothly
- ✅ Works with undo/redo

---

### Day 9-10: Polish and Testing

**Goal:** Smooth interactions and bug fixes

**Tasks:**

1. **Add smooth animations (2 hours)**
   ```typescript
   // Animate component insertion
   // Animate component reordering
   // Smooth transitions for selection
   ```

2. **Handle edge cases (3 hours)**
   - Empty canvas (no components yet)
   - Single component on page
   - Nested components (future feature)
   - Very tall components
   - Components with position: absolute

3. **Performance optimization (2 hours)**
   ```typescript
   // Debounce hover calculations
   // Memoize component parsing
   // Lazy render drop zones (only during drag)
   ```

4. **User testing and bug fixes (3 hours)**
   - Test with real website content
   - Test all 20 most common components
   - Test rapid dragging
   - Test on different screen sizes

**Acceptance Criteria:**
- ✅ No lag during drag operations
- ✅ Animations are smooth (60 FPS)
- ✅ No visual glitches
- ✅ Works with 50+ components on page
- ✅ Zero console errors

---

## Technical Implementation Details

### Drop Position Calculation Algorithm

```typescript
interface ComponentBounds {
  id: string;
  top: number;
  bottom: number;
  height: number;
  element: HTMLElement;
}

function calculateInsertionIndex(
  components: ComponentBounds[],
  dropY: number,
  canvasTop: number
): number {
  // Convert screen Y to canvas-relative Y
  const relativeY = dropY - canvasTop;

  // Find first component whose bottom is below drop point
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    const midpoint = comp.top + (comp.height / 2);

    if (relativeY < midpoint) {
      return i; // Insert before this component
    }
  }

  // Drop is after all components
  return components.length;
}
```

### HTML Insertion Algorithm

```typescript
function insertHTMLAtIndex(
  fullHTML: string,
  newComponentHTML: string,
  insertionIndex: number,
  componentMarkers: { start: number, end: number }[]
): string {
  if (insertionIndex === 0) {
    // Insert at very beginning
    const bodyStart = fullHTML.indexOf('<body>') + 6;
    return fullHTML.slice(0, bodyStart) +
           '\n' + newComponentHTML + '\n' +
           fullHTML.slice(bodyStart);
  }

  if (insertionIndex >= componentMarkers.length) {
    // Insert at end
    const bodyEnd = fullHTML.indexOf('</body>');
    return fullHTML.slice(0, bodyEnd) +
           '\n' + newComponentHTML + '\n' +
           fullHTML.slice(bodyEnd);
  }

  // Insert between components
  const insertAfter = componentMarkers[insertionIndex - 1];
  return fullHTML.slice(0, insertAfter.end) +
         '\n' + newComponentHTML + '\n' +
         fullHTML.slice(insertAfter.end);
}
```

### IFrame Communication Pattern

```typescript
// Parent → IFrame: Apply selection
iframeRef.current?.contentWindow?.postMessage({
  type: 'select-component',
  componentId: 'comp-123'
}, '*');

// IFrame → Parent: Component clicked
window.parent.postMessage({
  type: 'component-clicked',
  componentId: 'comp-123',
  bounds: { top: 100, left: 50, width: 400, height: 200 }
}, '*');

// Parent listens
window.addEventListener('message', (e) => {
  if (e.data.type === 'component-clicked') {
    onElementSelect({
      id: e.data.componentId,
      type: 'component',
      path: []
    });
  }
});
```

---

## Testing Plan

### Unit Tests (Day 10)

```typescript
// calculateInsertionIndex.test.ts
describe('calculateInsertionIndex', () => {
  it('inserts at beginning when Y < first component', () => {
    const components = [
      { top: 100, bottom: 200, height: 100 },
      { top: 250, bottom: 350, height: 100 }
    ];
    expect(calculateInsertionIndex(components, 50, 0)).toBe(0);
  });

  it('inserts between components', () => {
    // ... test cases
  });

  it('inserts at end when Y > last component', () => {
    // ... test cases
  });
});

// insertHTMLAtIndex.test.ts
describe('insertHTMLAtIndex', () => {
  it('inserts component at beginning', () => {
    const html = '<body><div id="1">A</div></body>';
    const result = insertHTMLAtIndex(html, '<div id="2">B</div>', 0, []);
    expect(result).toContain('<div id="2">B</div><div id="1">A</div>');
  });
});
```

### Integration Tests (Day 10)

```typescript
// visualEditor.integration.test.tsx
describe('Visual Editor Integration', () => {
  it('drops component at mouse position', async () => {
    render(<VisualEditor website={mockWebsite} />);

    // Drag component from palette
    const component = screen.getByText('Hero Section');
    fireEvent.dragStart(component);

    // Drop at specific Y coordinate
    const canvas = screen.getByTestId('canvas');
    fireEvent.drop(canvas, { clientY: 300 });

    // Verify component inserted at correct position
    await waitFor(() => {
      expect(mockWebsite.files['index.html']).toContain('<div class="hero">');
    });
  });

  it('shows drop zone indicator during drag', () => {
    // ... test
  });

  it('selects component on click', () => {
    // ... test
  });
});
```

### E2E Tests (Day 10)

```typescript
// visualEditor.e2e.test.ts (Playwright)
test('complete drag-drop workflow', async ({ page }) => {
  await page.goto('/editor?website=test-site');

  // Wait for editor to load
  await page.waitForSelector('.component-palette');

  // Drag hero component
  const hero = page.locator('text=Hero Section');
  await hero.dragTo(page.locator('.canvas'), {
    targetPosition: { x: 400, y: 200 }
  });

  // Verify drop zone appeared
  await expect(page.locator('.drop-zone-indicator')).toBeVisible();

  // Verify component appeared
  await expect(page.locator('[data-component-id]')).toHaveCount(1);

  // Click component
  await page.locator('[data-component-id]').click();

  // Verify selected
  await expect(page.locator('[data-component-id].selected')).toBeVisible();

  // Verify resize handles
  await expect(page.locator('.resize-handle')).toHaveCount(8);
});
```

---

## Risk Mitigation

### Risk 1: IFrame click handlers not working
**Probability:** Medium
**Impact:** High
**Mitigation:**
- Use postMessage for all iframe↔parent communication
- Test in multiple browsers early
- Fallback: Direct DOM manipulation if postMessage fails

### Risk 2: HTML parsing breaks on complex websites
**Probability:** Medium
**Impact:** Medium
**Mitigation:**
- Use DOMParser (browser-native, reliable)
- Handle malformed HTML gracefully
- Add extensive error logging
- Test with 10+ real websites

### Risk 3: Performance degrades with 50+ components
**Probability:** Low
**Impact:** Medium
**Mitigation:**
- Debounce all hover calculations (100ms)
- Memoize component parsing results
- Use React.memo for heavy components
- Only render drop zones during active drag

### Risk 4: Undo/redo breaks after changes
**Probability:** Low
**Impact:** High
**Mitigation:**
- Test undo/redo after every feature addition
- Maintain immutability in state updates
- Add comprehensive undo/redo tests

---

## Success Metrics

### Performance Targets
- **Drop latency:** <100ms from drop to visual update
- **Hover feedback:** <50ms to show drop zone
- **Selection:** <30ms to highlight component
- **Undo/redo:** <50ms

### Quality Targets
- **Zero console errors** during normal usage
- **Zero visual glitches** (flashing, jumping)
- **100% of 20 common components** work correctly
- **Works with 100+ components** on page without lag

### User Experience Targets
- **3 seconds** to understand how to add a component (no tutorial needed)
- **5 seconds** to add first component to page
- **10 seconds** to rearrange 3 components
- **NPS 50+** from internal testing

---

## Next Steps After Week 1-2

### Week 3: Component Library Expansion
- Complete HTML generators for all 100 components
- Add variants for each component (3-5 per component)
- Add props validation and defaults

### Week 4: Property Panel Enhancement
- Live preview of property changes
- Color picker for colors
- Font picker for typography
- Spacing visual editor

### Week 5: Advanced Features
- Responsive breakpoint editing
- Animation timeline
- Component library search improvements
- Keyboard shortcuts enhancement

### Week 6: Testing & Polish
- E2E test suite completion
- Performance profiling and optimization
- User acceptance testing
- Bug fixes from UAT

---

## Conclusion

**Estimated Completion:** 2 weeks (10 working days)
**Result:** Visual Editor 90% competitive vs Wix/Squarespace
**Next Priority:** Component HTML generators (Week 3)

This plan is aggressive but achievable. The architecture is solid, we just need to complete the missing 25% of functionality.

**Ready to start Day 1!** 🚀
