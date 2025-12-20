# Automated Error Detection and Logging System

## Overview

This system automatically detects errors on screen, logs them to files, and can trigger automatic fixes. It's especially useful during smoke tests, as it will detect errors and log them so the AI can understand exactly what's wrong and start fixing it.

## Features

### 1. **Automatic Error Detection**
- Detects React errors via ErrorBoundary
- Detects JavaScript errors (window.onerror)
- Detects unhandled promise rejections
- Detects network/API errors
- Detects errors visible on screen (DOM scanning)

### 2. **Error Logging**
- Logs all errors to `/error_logs/errors-YYYY-MM-DD.jsonl` (one file per day)
- Sends errors to backend API endpoint `/api/errors/log`
- Includes full context: stack traces, component info, route, severity
- Categorizes errors by type and severity

### 3. **Error Severity Levels**
- **Critical**: React rendering errors, component crashes
- **High**: API errors (500+), network failures
- **Medium**: General JavaScript errors, screen errors
- **Low**: Warnings, deprecations

### 4. **Auto-Fix Detection**
- Identifies errors that can be auto-fixed (e.g., "cannot read properties of undefined")
- Marks errors with `canAutoFix: true`
- Triggers auto-fix attempts when possible

### 5. **Screen Error Detection**
- Scans DOM every 2 seconds for error indicators
- Detects error messages in:
  - `[data-testid*="error"]`
  - `.error`, `.error-message`
  - `[role="alert"]`
  - `.alert-danger`, `.toast-error`
  - React ErrorBoundary components

## Files Created

### Frontend
- `client/src/services/errorLogger.ts` - Main error logging service
- Updated `client/src/components/ErrorBoundary.tsx` - Integrated with error logger
- Updated `client/src/main.tsx` - Initializes error logger

### Backend
- `server/api/errorLogging.ts` - API routes for error logging
- Updated `server/routes.ts` - Registered error logging routes

## API Endpoints

### POST `/api/errors/log`
Logs an error from the frontend.

**Request Body:**
```json
{
  "id": "unique-error-id",
  "timestamp": 1234567890,
  "type": "react" | "javascript" | "api" | "render" | "network",
  "message": "Error message",
  "stack": "Error stack trace",
  "componentStack": "React component stack",
  "url": "http://localhost:5000/page",
  "userAgent": "Browser user agent",
  "severity": "low" | "medium" | "high" | "critical",
  "context": {
    "route": "/stargate-websites",
    "component": "TemplatePreview",
    "props": {},
    "state": {}
  },
  "canAutoFix": true,
  "autoFixAttempted": false,
  "autoFixSuccess": false
}
```

**Response:**
```json
{
  "success": true,
  "logged": true
}
```

### GET `/api/errors/recent?limit=50&severity=critical`
Get recent error logs.

**Query Parameters:**
- `limit` (optional): Number of errors to return (default: 50)
- `severity` (optional): Filter by severity level

**Response:**
```json
{
  "success": true,
  "errors": [...],
  "count": 10
}
```

### GET `/api/errors/stats`
Get error statistics for today.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "bySeverity": {
      "critical": 2,
      "high": 5,
      "medium": 15,
      "low": 3
    },
    "byType": {
      "react": 2,
      "javascript": 10,
      "api": 8,
      "network": 5
    },
    "critical": 2,
    "canAutoFix": 5
  }
}
```

## Usage

### Automatic (Default)
The error logger is automatically initialized when the app starts. It will:
1. Catch all errors automatically
2. Log them to files
3. Send them to the backend API
4. Attempt auto-fixes when possible

### Manual Logging
```typescript
import { errorLogger } from '@/services/errorLogger';

// Log a custom error
errorLogger.logError({
  type: 'javascript',
  message: 'Custom error message',
  severity: 'high',
  context: {
    route: window.location.pathname,
    component: 'MyComponent',
  },
});
```

### Get Error Logs
```typescript
import { errorLogger } from '@/services/errorLogger';

// Get all errors
const allErrors = errorLogger.getErrorLogs();

// Get critical errors only
const criticalErrors = errorLogger.getCriticalErrors();

// Get errors by severity
const highErrors = errorLogger.getErrorsBySeverity('high');
```

## Error Log File Format

Errors are logged to `error_logs/errors-YYYY-MM-DD.jsonl` (JSON Lines format, one error per line):

```json
{"id":"abc123","timestamp":1234567890,"type":"react","message":"Cannot read properties of undefined","severity":"critical","url":"http://localhost:5000/stargate-websites","context":{"route":"/stargate-websites","component":"TemplatePreview"},"canAutoFix":true}
{"id":"def456","timestamp":1234567891,"type":"api","message":"API Error: 500 Internal Server Error","severity":"high","url":"http://localhost:5000/api/templates","context":{"route":"/stargate-websites"},"canAutoFix":false}
```

## Smoke Test Integration

During smoke tests, the error logger will:
1. **Detect errors automatically** - No manual intervention needed
2. **Log to files** - Errors are saved to `error_logs/errors-YYYY-MM-DD.jsonl`
3. **Send to API** - Errors are sent to `/api/errors/log` for real-time monitoring
4. **Trigger auto-fixes** - Attempts to fix common errors automatically

### Example Smoke Test Flow

1. User navigates to `/stargate-websites`
2. Error occurs: "Cannot read properties of undefined (reading 'bodyFont')"
3. Error logger detects it:
   - Logs to console: `[ErrorLogger] CRITICAL: Cannot read properties of undefined`
   - Sends to API: `POST /api/errors/log`
   - Writes to file: `error_logs/errors-2025-12-02.jsonl`
   - Marks as `canAutoFix: true`
4. AI agent reads the error log and fixes the code
5. Error is resolved

## Benefits

1. **Automatic Detection** - No need to manually check for errors
2. **Complete Context** - Full stack traces, component info, route info
3. **Persistent Logging** - Errors saved to files for analysis
4. **Real-time Monitoring** - API endpoint for live error tracking
5. **Auto-fix Ready** - Identifies errors that can be auto-fixed
6. **Smoke Test Friendly** - Perfect for automated testing

## Example Error Log Entry

```json
{
  "id": "a1b2c3d4e5f6",
  "timestamp": 1701523200000,
  "type": "react",
  "message": "Cannot read properties of undefined (reading 'bodyFont')",
  "stack": "TypeError: Cannot read properties of undefined (reading 'bodyFont')\n    at generatePreviewHTML (TemplatePreview.tsx:48:42)\n    at TemplatePreview (TemplatePreview.tsx:110:23)",
  "componentStack": "at TemplatePreview\n    at div\n    at TemplateSelectionStage",
  "url": "http://localhost:5000/stargate-websites",
  "userAgent": "Mozilla/5.0...",
  "severity": "critical",
  "context": {
    "route": "/stargate-websites",
    "component": "TemplatePreview",
    "props": {
      "template": {
        "id": "tesla",
        "name": "Tesla Template"
      }
    }
  },
  "canAutoFix": true,
  "autoFixAttempted": false,
  "autoFixSuccess": false,
  "serverTimestamp": "2025-12-02T14:30:00.000Z",
  "serverTime": 1701523200000
}
```

## Configuration

### Enable/Disable Logging
```typescript
import { errorLogger } from '@/services/errorLogger';

// Disable logging
errorLogger.setLoggingEnabled(false);

// Enable logging
errorLogger.setLoggingEnabled(true);
```

### Clear Logs
```typescript
import { errorLogger } from '@/services/errorLogger';

// Clear in-memory logs
errorLogger.clearLogs();
```

## Integration with AI Agents

The error logging system is designed to work with AI agents:

1. **Error Detection** - AI can read error logs from files or API
2. **Context Understanding** - Full context helps AI understand the error
3. **Auto-fix Trigger** - AI can identify and fix errors marked as `canAutoFix: true`
4. **Smoke Test Feedback** - AI can check error logs after smoke tests

### Example AI Agent Usage

```typescript
// AI agent reads error logs
const response = await fetch('/api/errors/recent?severity=critical&limit=10');
const { errors } = await response.json();

// AI analyzes errors
errors.forEach(error => {
  if (error.canAutoFix && !error.autoFixAttempted) {
    // AI fixes the error
    fixError(error);
  }
});
```

## Troubleshooting

### Errors Not Being Logged
1. Check browser console for `[ErrorLogger]` messages
2. Check `error_logs/errors-YYYY-MM-DD.jsonl` file exists
3. Check `/api/errors/log` endpoint is accessible
4. Verify error logger is initialized in `main.tsx`

### Too Many Errors
- Errors are limited to 1000 in memory
- Old errors are automatically removed
- File logs are kept indefinitely (one file per day)

### Performance Impact
- DOM scanning runs every 2 seconds (minimal impact)
- Error logging is non-blocking (async)
- File writes are buffered

## Future Enhancements

1. **Screenshot Capture** - Capture screenshots when errors occur
2. **Error Grouping** - Group similar errors together
3. **Error Trends** - Track error trends over time
4. **Auto-fix Implementation** - Implement actual auto-fix logic
5. **Alert System** - Send alerts for critical errors
6. **Error Dashboard** - Web UI for viewing error logs

