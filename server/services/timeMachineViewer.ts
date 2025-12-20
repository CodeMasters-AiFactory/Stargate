/**
 * Website Time Machine Viewer Service
 * 
 * Interactive timeline of any website:
 * - Pull all Wayback Machine snapshots
 * - Visual slider through time
 * - Side-by-side comparison
 * - Export evolution report
 */

import { checkWaybackMachineAvailability, scrapeHistoricalPage } from './timeMachineScraper';
import { getErrorMessage, logError } from '../utils/errorHandler';
import fetch from 'node-fetch';

const WAYBACK_MACHINE_CDX_API = 'http://web.archive.org/cdx/search/cdx';

export interface Snapshot {
  timestamp: string; // YYYYMMDDhhmmss
  url: string;
  statusCode: string;
  available: boolean;
}

export interface TimeMachineView {
  url: string;
  snapshots: Snapshot[];
  oldestSnapshot?: Snapshot;
  newestSnapshot?: Snapshot;
  totalSnapshots: number;
  evolution: {
    majorChanges: Array<{
      timestamp: string;
      description: string;
      significance: 'low' | 'medium' | 'high';
    }>;
    timeline: Array<{
      year: number;
      snapshotCount: number;
    }>;
  };
}

/**
 * Get all snapshots for a URL
 */
export async function getTimeMachineView(url: string, limit: number = 100): Promise<TimeMachineView> {
  try {
    console.log(`[Time Machine Viewer] Fetching snapshots for ${url}`);

    const cdxUrl = `${WAYBACK_MACHINE_CDX_API}?url=${url}&output=json&limit=${limit}`;
    const response = await fetch(cdxUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch snapshots: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length < 2) {
      return {
        url,
        snapshots: [],
        totalSnapshots: 0,
        evolution: {
          majorChanges: [],
          timeline: [],
        },
      };
    }

    const header = data[0];
    const timestampIndex = header.indexOf('timestamp');
    const statusCodeIndex = header.indexOf('statuscode');
    const originalIndex = header.indexOf('original');

    const snapshots: Snapshot[] = data.slice(1).map((row: string[]) => ({
      timestamp: row[timestampIndex],
      url: row[originalIndex],
      statusCode: row[statusCodeIndex],
      available: row[statusCodeIndex] === '200',
    }));

    // Sort by timestamp
    snapshots.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const oldestSnapshot = snapshots[0];
    const newestSnapshot = snapshots[snapshots.length - 1];

    // Analyze evolution
    const evolution = analyzeEvolution(snapshots);

    return {
      url,
      snapshots,
      oldestSnapshot,
      newestSnapshot,
      totalSnapshots: snapshots.length,
      evolution,
    };
  } catch (error) {
    logError(error, 'Time Machine Viewer');
    throw new Error(`Time machine view failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Compare two snapshots
 */
export async function compareSnapshots(
  url: string,
  timestamp1: string,
  timestamp2: string
): Promise<{
  snapshot1: { timestamp: string; html: string };
  snapshot2: { timestamp: string; html: string };
  differences: {
    added: number;
    removed: number;
    changed: number;
  };
}> {
  try {
    const [snapshot1, snapshot2] = await Promise.all([
      scrapeHistoricalPage(url, timestamp1),
      scrapeHistoricalPage(url, timestamp2),
    ]);

    // Simple diff (would need proper diff library for better results)
    const diff = calculateSimpleDiff(snapshot1.htmlContent, snapshot2.htmlContent);

    return {
      snapshot1: {
        timestamp: timestamp1,
        html: snapshot1.htmlContent,
      },
      snapshot2: {
        timestamp: timestamp2,
        html: snapshot2.htmlContent,
      },
      differences: diff,
    };
  } catch (error) {
    logError(error, 'Time Machine Viewer - Compare');
    throw new Error(`Snapshot comparison failed: ${getErrorMessage(error)}`);
  }
}

/**
 * Analyze evolution of website
 */
function analyzeEvolution(snapshots: Snapshot[]): TimeMachineView['evolution'] {
  const majorChanges: TimeMachineView['evolution']['majorChanges'] = [];
  const timeline: Record<number, number> = {};

  // Group by year
  snapshots.forEach(snapshot => {
    const year = parseInt(snapshot.timestamp.substring(0, 4));
    timeline[year] = (timeline[year] || 0) + 1;
  });

  // Detect major changes (simplified - would need content comparison)
  if (snapshots.length > 10) {
    const interval = Math.floor(snapshots.length / 5);
    for (let i = interval; i < snapshots.length; i += interval) {
      majorChanges.push({
        timestamp: snapshots[i].timestamp,
        description: `Snapshot ${i + 1} of ${snapshots.length}`,
        significance: i % (interval * 2) === 0 ? 'high' : 'medium',
      });
    }
  }

  return {
    majorChanges,
    timeline: Object.entries(timeline).map(([year, count]) => ({
      year: parseInt(year),
      snapshotCount: count,
    })),
  };
}

/**
 * Calculate simple diff between two HTML strings
 */
function calculateSimpleDiff(html1: string, html2: string): {
  added: number;
  removed: number;
  changed: number;
} {
  const lines1 = html1.split('\n');
  const lines2 = html2.split('\n');

  const set1 = new Set(lines1);
  const set2 = new Set(lines2);

  const added = lines2.filter(line => !set1.has(line)).length;
  const removed = lines1.filter(line => !set2.has(line)).length;
  const changed = Math.abs(lines1.length - lines2.length);

  return {
    added,
    removed,
    changed,
  };
}

