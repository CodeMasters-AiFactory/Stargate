/**
 * PWA Generator Service
 * Generates Progressive Web App manifest, service worker, and offline support
 */

import * as fs from 'fs';
import * as path from 'path';
import { writeFileContent } from './azureStorage';

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  orientation: 'portrait' | 'landscape' | 'any';
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
  }>;
  categories?: string[];
  screenshots?: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  shortcuts?: Array<{
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons: Array<{ src: string; sizes: string }>;
  }>;
  share_target?: {
    action: string;
    method: string;
    enctype: string;
    params: {
      title: string;
      text: string;
      url: string;
    };
  };
}

export interface ServiceWorkerConfig {
  cacheName: string;
  version: string;
  precache: string[];
  runtimeCaching: Array<{
    urlPattern: string;
    handler: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate' | 'networkOnly' | 'cacheOnly';
    options?: any;
  }>;
  offlineFallback?: string;
}

/**
 * Generate PWA manifest
 */
export function generatePWAManifest(config: {
  websiteId: string;
  siteName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  iconPath?: string;
}): PWAManifest {
  const manifest: PWAManifest = {
    name: config.siteName,
    short_name: config.siteName.substring(0, 12),
    description: config.description,
    start_url: '/',
    display: 'standalone',
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    orientation: 'any',
    icons: [
      {
        src: config.iconPath || '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: config.iconPath || '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: config.iconPath || '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity'],
  };

  return manifest;
}

/**
 * Generate service worker
 */
export function generateServiceWorker(config: ServiceWorkerConfig): string {
  return `
// Service Worker for ${config.cacheName}
// Version: ${config.version}

const CACHE_NAME = '${config.cacheName}-v${config.version}';
const PRECACHE_URLS = ${JSON.stringify(config.precache, null, 2)};

// Install event - precache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Runtime caching strategies
  ${config.runtimeCaching.map(rule => `
    if (${rule.urlPattern.includes('*') ? `url.pathname.match(/${rule.urlPattern.replace('*', '.*')}/)` : `url.pathname === '${rule.urlPattern}'`}) {
      event.respondWith(${getHandlerCode(rule.handler, 'request')});
      return;
    }
  `).join('\n')}

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          ${config.offlineFallback ? `if (!response) {
            return caches.match('${config.offlineFallback}');
          }` : ''}
          return response;
        });
      })
  );
});

// Push notifications (if enabled)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Update';
  const options = {
    body: data.body || 'You have a new update',
    icon: data.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: data.url,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
  `.trim();
}

function getHandlerCode(handler: string, requestVar: string): string {
  switch (handler) {
    case 'networkFirst':
      return `
        fetch(${requestVar})
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(${requestVar}, responseToCache);
              });
            }
            return response;
          })
          .catch(() => caches.match(${requestVar}))
      `.trim();
    case 'cacheFirst':
      return `
        caches.match(${requestVar})
          .then((response) => {
            if (response) return response;
            return fetch(${requestVar}).then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(${requestVar}, responseToCache);
                });
              }
              return response;
            });
          })
      `.trim();
    case 'staleWhileRevalidate':
      return `
        caches.match(${requestVar}).then((cachedResponse) => {
          const fetchPromise = fetch(${requestVar}).then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(${requestVar}, responseToCache);
              });
            }
            return response;
          });
          return cachedResponse || fetchPromise;
        })
      `.trim();
    case 'networkOnly':
      return `fetch(${requestVar})`;
    case 'cacheOnly':
      return `caches.match(${requestVar})`;
    default:
      return `fetch(${requestVar})`;
  }
}

/**
 * Generate PWA files for a website
 */
export async function generatePWA(
  projectSlug: string,
  config: {
    siteName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    iconPath?: string;
    precache?: string[];
    offlineFallback?: string;
  }
): Promise<{ manifestPath: string; serviceWorkerPath: string }> {
  // Generate manifest
  const manifest = generatePWAManifest({
    websiteId: projectSlug,
    siteName: config.siteName,
    description: config.description,
    themeColor: config.themeColor,
    backgroundColor: config.backgroundColor,
    iconPath: config.iconPath,
  });

  // Generate service worker
  const serviceWorker = generateServiceWorker({
    cacheName: projectSlug,
    version: '1.0.0',
    precache: config.precache || ['/', '/index.html', '/styles.css', '/script.js'],
    runtimeCaching: [
      {
        urlPattern: '/api/*',
        handler: 'networkFirst',
      },
      {
        urlPattern: '/images/*',
        handler: 'cacheFirst',
      },
      {
        urlPattern: '*.css',
        handler: 'staleWhileRevalidate',
      },
      {
        urlPattern: '*.js',
        handler: 'staleWhileRevalidate',
      },
    ],
    offlineFallback: config.offlineFallback,
  });

  // Save files
  const manifestPath = `manifest.json`;
  const serviceWorkerPath = `service-worker.js`;

  await writeFileContent(projectSlug, manifestPath, JSON.stringify(manifest, null, 2));
  await writeFileContent(projectSlug, serviceWorkerPath, serviceWorker);

  // Generate HTML with PWA meta tags
  const pwaMetaTags = `
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="${config.themeColor}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="${config.siteName}">
    <link rel="apple-touch-icon" href="${config.iconPath || '/icon-192.png'}">
  `.trim();

  return {
    manifestPath,
    serviceWorkerPath,
  };
}

/**
 * Generate install prompt HTML
 */
export function generateInstallPromptHTML(): string {
  return `
<div id="pwa-install-prompt" class="pwa-install-prompt" style="display: none;">
  <div class="pwa-install-content">
    <h3>Install App</h3>
    <p>Install this app on your device for a better experience</p>
    <div class="pwa-install-buttons">
      <button id="pwa-install-button" class="btn-primary">Install</button>
      <button id="pwa-dismiss-button" class="btn-secondary">Not Now</button>
    </div>
  </div>
</div>

<script>
  let deferredPrompt;
  const installPrompt = document.getElementById('pwa-install-prompt');
  const installButton = document.getElementById('pwa-install-button');
  const dismissButton = document.getElementById('pwa-dismiss-button');

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // Already installed
  } else {
    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installPrompt.style.display = 'block';
    });

    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installPrompt.style.display = 'none';
        }
        deferredPrompt = null;
      }
    });

    dismissButton.addEventListener('click', () => {
      installPrompt.style.display = 'none';
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    });

    // Don't show if dismissed in last 7 days
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      installPrompt.style.display = 'none';
    }
  }
</script>

<style>
  .pwa-install-prompt {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 20px;
    max-width: 400px;
    z-index: 1000;
  }
  .pwa-install-content h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }
  .pwa-install-content p {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 14px;
  }
  .pwa-install-buttons {
    display: flex;
    gap: 8px;
  }
  .pwa-install-buttons button {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-primary {
    background: #3b82f6;
    color: white;
  }
  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
  }
</style>
  `.trim();
}

