/**
 * Cursor Tracking Service
 * Tracks and broadcasts cursor positions for real-time collaboration
 */

import type { UserPresence } from './realtimeService';

export interface CursorPosition {
  x: number;
  y: number;
  element?: string;
  timestamp: number;
}

export interface CursorData {
  userId: string;
  userName: string;
  avatar?: string;
  color: string;
  position: CursorPosition;
  isActive: boolean;
}

class CursorTrackingService {
  private cursors: Map<string, CursorData> = new Map();
  private colorPalette = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  private colorIndex = 0;

  assignColor(userId: string): string {
    if (this.cursors.has(userId)) {
      return this.cursors.get(userId)!.color;
    }

    const color = this.colorPalette[this.colorIndex % this.colorPalette.length];
    this.colorIndex += 1;
    return color;
  }

  updateCursor(userId: string, userName: string, position: CursorPosition, avatar?: string): CursorData {
    const color = this.assignColor(userId);
    const cursorData: CursorData = {
      userId,
      userName,
      avatar,
      color,
      position,
      isActive: true,
    };

    this.cursors.set(userId, cursorData);
    return cursorData;
  }

  removeCursor(userId: string): void {
    this.cursors.delete(userId);
  }

  getCursor(userId: string): CursorData | null {
    return this.cursors.get(userId) || null;
  }

  getAllCursors(): CursorData[] {
    return Array.from(this.cursors.values());
  }

  markInactive(userId: string): void {
    const cursor = this.cursors.get(userId);
    if (cursor) {
      cursor.isActive = false;
    }
  }

  cleanupInactive(maxIdleTime: number = 30000): void {
    const now = Date.now();
    for (const [userId, cursor] of this.cursors.entries()) {
      if (now - cursor.position.timestamp > maxIdleTime) {
        this.cursors.delete(userId);
      }
    }
  }
}

export const cursorTrackingService = new CursorTrackingService();

