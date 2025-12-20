/**
 * Collaboration API Routes
 * Real-time collaboration endpoints
 */

import type { Express, Request, Response } from 'express';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { realtimeService } from '../services/collaboration/realtimeService';
import { cursorTrackingService } from '../services/collaboration/cursorTracking';

export function registerCollaborationRoutes(app: Express) {
  /**
   * GET /api/collaboration/room/:roomId/users
   * Get active collaborators in a room
   */
  app.get('/api/collaboration/room/:roomId/users', async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const users = realtimeService.getActiveUsers(roomId);

      res.json({
        success: true,
        users: users.map(user => ({
          userId: user.userId,
          userName: user.userName,
          avatar: user.avatar,
          status: user.status,
          cursor: user.cursor,
        })),
      });
    } catch (error) {
      logError(error, 'Collaboration API - GetUsers');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/collaboration/room/:roomId/state
   * Get current room state
   */
  app.get('/api/collaboration/room/:roomId/state', async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const state = realtimeService.getRoomState(roomId);

      if (!state) {
        return res.status(404).json({
          success: false,
          error: 'Room not found',
        });
      }

      res.json({
        success: true,
        state: {
          roomId: state.roomId,
          users: Array.from(state.users.values()),
          version: state.version,
        },
      });
    } catch (error) {
      logError(error, 'Collaboration API - GetRoomState');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/collaboration/cursors/:roomId
   * Get all cursor positions in a room
   */
  app.get('/api/collaboration/cursors/:roomId', async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const state = realtimeService.getRoomState(roomId);

      if (!state) {
        return res.json({
          success: true,
          cursors: [],
        });
      }

      const cursors = Array.from(state.users.values()).map(user => ({
        userId: user.userId,
        userName: user.userName,
        avatar: user.avatar,
        cursor: user.cursor,
        color: cursorTrackingService.getCursor(user.userId)?.color || '#3b82f6',
      }));

      res.json({
        success: true,
        cursors,
      });
    } catch (error) {
      logError(error, 'Collaboration API - GetCursors');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * GET /api/collaboration/website/:websiteId/comments
   * Get comments for a website
   */
  app.get('/api/collaboration/website/:websiteId/comments', async (req: Request, res: Response) => {
    try {
      // This would typically query database for comments
      // For now, return empty array
      res.json({
        success: true,
        comments: [],
      });
    } catch (error) {
      logError(error, 'Collaboration API - GetComments');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}
