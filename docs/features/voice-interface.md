# Voice Interface

## Overview

Voice-to-website interface using browser-native Web Speech API for local-only voice commands (no external APIs required).

## Features

- **Browser-Native**: Uses Web Speech API (no external dependencies)
- **Real-Time Transcription**: Live speech-to-text conversion
- **Command Processing**: Keyword-based command recognition
- **Local-Only**: No data sent to external services
- **Multi-Browser Support**: Works in Chrome, Edge, Safari

## API Endpoints

### POST /api/voice/process
Process voice command (audio file).

**Request:**
- Content-Type: `multipart/form-data` or `application/json`
- Body: Audio file (WebM, WAV, etc.) or base64-encoded audio

**Response:**
```json
{
  "success": true,
  "transcription": "Create a website for a restaurant",
  "intent": {
    "action": "create_website",
    "target": "restaurant",
    "value": null
  }
}
```

### POST /api/voice/text
Process text command (for testing).

**Request:**
```json
{
  "text": "Change the hero title to Welcome"
}
```

**Response:**
```json
{
  "success": true,
  "intent": {
    "action": "change_text",
    "target": "hero_title",
    "value": "Welcome"
  }
}
```

## Frontend Component

Use the `VoiceInterface` component:

```tsx
import { VoiceInterface } from '@/components/Voice/VoiceInterface';

<VoiceInterface
  onCommandProcessed={(command) => {
    console.log('Command:', command.text);
    console.log('Intent:', command.intent);
  }}
  onWebsiteGenerated={(data) => {
    console.log('Website generated:', data);
  }}
/>
```

## Supported Commands

### Website Creation
- "Create a website for a [industry] in [city]"
- "Build a website for [business name]"
- "Generate a [industry] website"

### Content Editing
- "Change the hero title to [text]"
- "Update the description to [text]"
- "Change the button text to [text]"

### Design Commands
- "Make the background [color]"
- "Change the font to [font name]"
- "Make the logo bigger"

### Actions
- "Save the website"
- "Export the website"
- "Preview the website"

## Browser Compatibility

- **Chrome/Edge**: Full support (Web Speech API)
- **Safari**: Full support (Web Speech API)
- **Firefox**: Limited support (may require polyfill)

## Usage Example

```typescript
// Start listening
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('');
  
  // Process command
  fetch('/api/voice/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: transcript }),
  });
};

recognition.start();
```

## Command Processing

Commands are processed using keyword-based recognition:

1. **Extract Keywords**: Identify action, target, and value
2. **Match Intent**: Map to known commands
3. **Execute Action**: Perform the requested action
4. **Return Result**: Provide feedback to user

## Best Practices

1. **Clear Speech**: Speak clearly and at moderate pace
2. **Quiet Environment**: Minimize background noise
3. **Browser Permissions**: Grant microphone permissions
4. **Command Format**: Use supported command patterns
5. **Error Handling**: Handle transcription errors gracefully

## Privacy

- **Local Processing**: All voice processing happens in browser
- **No External APIs**: No data sent to third-party services
- **User Control**: User controls when to start/stop listening
- **Permission-Based**: Requires explicit microphone permission

## Limitations

- **Language**: Currently supports English only
- **Accuracy**: Depends on browser's speech recognition
- **Network**: Requires internet for command processing API
- **Browser Support**: Limited in some browsers

