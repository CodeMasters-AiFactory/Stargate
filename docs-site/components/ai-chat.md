# AI Chat Component

Merlin assistant chat interface.

## Import

```tsx
import { MerlinChat } from '@/components/MerlinChat';
```

## Basic Usage

```tsx
<MerlinChat
  projectId={projectId}
  onResponse={handleAIResponse}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| projectId | string | Yes | Current project ID |
| onResponse | (response: AIResponse) => void | No | Response callback |
| onAction | (action: AIAction) => void | No | Action callback |
| position | 'sidebar' \| 'modal' \| 'inline' | No | Display mode |
| placeholder | string | No | Input placeholder |
| welcomeMessage | string | No | Initial greeting |
| suggestions | string[] | No | Quick action buttons |

## Response Types

```typescript
interface AIResponse {
  type: 'text' | 'action' | 'error';
  content: string;
  actions?: AIAction[];
  thinking?: boolean;
}

interface AIAction {
  type: 'addSection' | 'editContent' | 'changeStyle' | 'deleteSection';
  target: string;
  payload: Record<string, any>;
}
```

## Events

### onResponse

Triggered when AI responds:

```tsx
const handleAIResponse = (response: AIResponse) => {
  if (response.type === 'action') {
    // Apply changes to project
    applyChanges(response.actions);
  }
  
  // Update chat history
  setChatHistory(prev => [...prev, response]);
};
```

### onAction

Triggered when AI performs an action:

```tsx
const handleAction = (action: AIAction) => {
  switch (action.type) {
    case 'addSection':
      editor.addSection(action.payload);
      break;
    case 'editContent':
      editor.updateContent(action.target, action.payload);
      break;
  }
};
```

## Display Modes

### Sidebar (Default)

```tsx
<MerlinChat
  position="sidebar"
  sidebarWidth={360}
  {...props}
/>
```

### Modal

```tsx
<MerlinChat
  position="modal"
  modalSize="lg"
  {...props}
/>
```

### Inline

```tsx
<MerlinChat
  position="inline"
  maxHeight={400}
  {...props}
/>
```

## Quick Suggestions

Show quick action buttons:

```tsx
<MerlinChat
  suggestions={[
    "Add a hero section",
    "Change the color scheme",
    "Generate a testimonial",
    "Improve the headline"
  ]}
  onSuggestionClick={(suggestion) => {
    // Send as message
    sendMessage(suggestion);
  }}
  {...props}
/>
```

## Custom Styling

```tsx
<MerlinChat
  theme={{
    userBubble: 'bg-primary text-white',
    aiBubble: 'bg-gray-100 text-gray-900',
    input: 'border-gray-300 focus:border-primary',
    sendButton: 'bg-primary hover:bg-primary-dark'
  }}
  {...props}
/>
```

## Message History

### Load Previous Messages

```tsx
<MerlinChat
  initialMessages={previousMessages}
  loadMoreMessages={loadMore}
  {...props}
/>
```

### Persist History

```tsx
const [messages, setMessages] = useState([]);

useEffect(() => {
  // Load from storage
  const saved = localStorage.getItem(`chat-${projectId}`);
  if (saved) setMessages(JSON.parse(saved));
}, [projectId]);

const handleResponse = (response) => {
  setMessages(prev => {
    const updated = [...prev, response];
    localStorage.setItem(`chat-${projectId}`, JSON.stringify(updated));
    return updated;
  });
};
```

## Streaming Responses

Enable streaming for real-time responses:

```tsx
<MerlinChat
  streaming={true}
  onStreamStart={() => setIsStreaming(true)}
  onStreamEnd={() => setIsStreaming(false)}
  {...props}
/>
```

## Context Awareness

Pass additional context:

```tsx
<MerlinChat
  context={{
    currentPage: 'home',
    selectedElement: elementId,
    projectTheme: theme
  }}
  {...props}
/>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send message |
| Shift+Enter | New line |
| Escape | Close chat |
| Ctrl+K | Open chat |
| Up Arrow | Previous message |

## Methods (via ref)

```tsx
const chatRef = useRef<MerlinChatRef>(null);

// Send message programmatically
chatRef.current?.sendMessage("Add a features section");

// Clear history
chatRef.current?.clearHistory();

// Focus input
chatRef.current?.focus();
```
