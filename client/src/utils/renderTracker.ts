/**
 * Render Tracker Utility
 * Tracks component re-renders to identify performance issues
 */

interface RenderInfo {
  componentName: string;
  renderCount: number;
  lastRender: number;
  renderFrequency: number; // renders per second
  propsChanges: number;
  stateChanges: number;
}

const renderData = new Map<string, RenderInfo>();
const renderLog: Array<{ component: string; timestamp: number; reason?: string }> = [];
const MAX_LOG_SIZE = 100;

export function trackRender(componentName: string, reason?: string) {
  const now = Date.now();
  const existing = renderData.get(componentName);

  if (existing) {
    const timeSinceLastRender = now - existing.lastRender;
    const frequency = timeSinceLastRender > 0 ? 1000 / timeSinceLastRender : 0;

    renderData.set(componentName, {
      ...existing,
      renderCount: existing.renderCount + 1,
      lastRender: now,
      renderFrequency: frequency,
    });
  } else {
    renderData.set(componentName, {
      componentName,
      renderCount: 1,
      lastRender: now,
      renderFrequency: 0,
      propsChanges: 0,
      stateChanges: 0,
    });
  }

  // Log render
  renderLog.push({ component: componentName, timestamp: now, reason });
  if (renderLog.length > MAX_LOG_SIZE) {
    renderLog.shift();
  }

  // Warn if rendering too frequently (> 2 renders per second)
  const info = renderData.get(componentName);
  if (info && info.renderFrequency > 2 && info.renderCount > 5) {
    console.warn(
      `[RenderTracker] ⚠️ ${componentName} rendering frequently: ${info.renderFrequency.toFixed(2)} renders/sec (${info.renderCount} total renders)`,
      reason ? `Reason: ${reason}` : ''
    );
  }
}

export function getRenderStats() {
  return {
    components: Array.from(renderData.values()),
    recentRenders: renderLog.slice(-20),
  };
}

export function logRenderStats() {
  const stats = getRenderStats();
  console.group('[RenderTracker] Component Render Statistics');

  // Sort by render frequency (highest first)
  const sorted = stats.components.sort((a, b) => b.renderFrequency - a.renderFrequency);

  console.table(
    sorted.map(c => ({
      Component: c.componentName,
      'Total Renders': c.renderCount,
      'Renders/sec': c.renderFrequency.toFixed(2),
      'Last Render': new Date(c.lastRender).toLocaleTimeString(),
    }))
  );

  console.log('Recent Renders (last 20):');
  console.table(
    stats.recentRenders.map(r => ({
      Component: r.component,
      Time: new Date(r.timestamp).toLocaleTimeString(),
      Reason: r.reason || 'N/A',
    }))
  );

  console.groupEnd();
}

// DISABLED: Auto-log stats every 5 seconds - causing performance overhead
// Only enable manually via console: logRenderStats()
// if (process.env.NODE_ENV === 'development') {
//   setInterval(() => {
//     const stats = getRenderStats();
//     const frequentRenderers = stats.components.filter(
//       c => c.renderFrequency > 2 && c.renderCount > 5
//     );
//     if (frequentRenderers.length > 0) {
//       console.warn(
//         '[RenderTracker] Frequent re-renderers detected:',
//         frequentRenderers.map(c => c.componentName)
//       );
//       logRenderStats();
//     }
//   }, 5000);
// }
