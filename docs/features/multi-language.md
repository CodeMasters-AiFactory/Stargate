# Multi-Language Website Generation

## Overview

StargatePortal supports generating websites in 15+ languages with full RTL (Right-to-Left) support for Arabic and Hebrew.

## Supported Languages

- **English** (en) - Default
- **Spanish** (es)
- **French** (fr)
- **German** (de)
- **Italian** (it)
- **Portuguese** (pt)
- **Dutch** (nl)
- **Russian** (ru)
- **Chinese** (zh)
- **Japanese** (ja)
- **Korean** (ko)
- **Arabic** (ar) - RTL
- **Hebrew** (he) - RTL
- **Hindi** (hi)
- **Turkish** (tr)

## API Endpoints

### GET /api/multi-language/languages
Get list of all supported languages.

**Response:**
```json
{
  "success": true,
  "languages": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "rtl": false,
      "locale": "en-US"
    }
  ],
  "count": 15
}
```

### POST /api/multi-language/generate
Generate website in target language.

**Request:**
```json
{
  "html": "<html>...</html>",
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<html lang='es'>...</html>",
  "language": {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Español",
    "rtl": false,
    "locale": "es-ES"
  },
  "rtl": false
}
```

### POST /api/multi-language/generate-all
Generate website in all supported languages.

**Request:**
```json
{
  "html": "<html>...</html>",
  "sourceLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "languages": [
    {
      "language": "es",
      "html": "...",
      "rtl": false
    }
  ],
  "count": 15
}
```

## Usage Example

```typescript
import { generateMultiLanguageWebsite } from './services/multiLanguageGenerator';

const result = await generateMultiLanguageWebsite(
  html,
  'es', // Spanish
  'en'  // Source language
);

console.log(result.html); // Spanish version
console.log(result.rtl);  // false
```

## Features

- **Automatic Translation**: Text content is translated to target language
- **RTL Support**: Automatic right-to-left layout for Arabic and Hebrew
- **Language Switcher**: Built-in language selector component
- **SEO Optimization**: Proper `lang` and `hreflang` attributes
- **Meta Tags**: Language-specific meta tags

## Frontend Component

Use the `LanguageSelector` component:

```tsx
import { LanguageSelector } from '@/components/Language/LanguageSelector';

<LanguageSelector
  websiteId="website-123"
  currentHtml={html}
  onLanguageGenerated={(lang, html) => {
    console.log(`Generated in ${lang}`);
  }}
/>
```

## Best Practices

1. **Source Language**: Always specify the source language for accurate translation
2. **RTL Testing**: Test RTL layouts thoroughly for Arabic/Hebrew
3. **SEO**: Use `hreflang` tags for multi-language SEO
4. **Performance**: Generate languages on-demand, not all at once
5. **Content**: Ensure all text content is translatable (avoid images with text)

