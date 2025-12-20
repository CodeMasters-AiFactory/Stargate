import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { errorLogger } from './services/errorLogger';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    "Root element not found. Make sure index.html has a <div id='root'></div> element."
  );
}

// Suppress browser automation errors and YouTube API warnings in console
if (typeof window !== 'undefined') {
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Suppress "Element not found" errors from browser automation
    if (typeof message === 'string' && message.includes('Element not found')) {
      return true; // Suppress this error
    }
    // Suppress YouTube API warnings
    if (
      typeof message === 'string' && (
        message.includes('Unrecognized feature') ||
        message.includes('postMessage') ||
        message.includes('target origin') ||
        message.includes('youtube.com')
      )
    ) {
      return true; // Suppress YouTube warnings
    }
    // Call original error handler for other errors
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Also suppress console.error and console.warn for YouTube-specific messages
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Unrecognized feature:') ||
      message.includes('postMessage') ||
      message.includes('target origin') ||
      message.includes('youtube.com') ||
      (typeof args[0] === 'string' && args[0].includes('youtube'))
    ) {
      return; // Suppress YouTube warnings
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Unrecognized feature:') ||
      message.includes('postMessage') ||
      message.includes('target origin') ||
      message.includes('youtube.com') ||
      (typeof args[0] === 'string' && args[0].includes('youtube'))
    ) {
      return; // Suppress YouTube warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  // Suppress unhandled promise rejections from YouTube
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (
      reason.includes('youtube') ||
      reason.includes('postMessage') ||
      reason.includes('target origin')
    ) {
      event.preventDefault(); // Suppress YouTube-related promise rejections
    }
  });
}

// Disable console logs in production to improve performance
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Starting React application...');
  console.log('Root element found:', rootElement);
  console.log('Root element innerHTML length:', rootElement?.innerHTML?.length || 0);
  console.log('Window location:', window.location.href);
}

try {
  console.log('[main.tsx] Creating React root...');
  const root = createRoot(rootElement);
  console.log('[main.tsx] Root created, rendering App component...');
  root.render(<App />);
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ React app rendered successfully');
    console.log('[main.tsx] App component should now be visible');
  }

  // Report successful render to backend (non-blocking)
  fetch('/api/health/frontend', { method: 'GET' }).catch(() => {
    // Ignore errors - this is just for monitoring
  });
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Report error to backend (non-blocking)

  fetch('/api/health/frontend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Ignore errors - this is just for monitoring
  });

  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Error Loading Application</h1>
      <p>Failed to render React app. Check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
        ${error instanceof Error ? error.stack : String(error)}
      </pre>
      <p style="margin-top: 20px; color: #666;">
        <strong>Debugging steps:</strong><br>
        1. Check browser console (F12) for detailed errors<br>
        2. Check server logs for compilation errors<br>
        3. Visit <a href="/api/health/frontend">/api/health/frontend</a> for health status
      </p>
    </div>
  `;
}
