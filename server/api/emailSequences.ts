/**
 * Email Sequence API Routes
 * Phase 3.3: Marketing Automation - Email sequence APIs
 */

import type { Express } from 'express';
import {
  getSequences,
  getSequence,
  saveSequence,
  deleteSequence,
  getEnrollments,
  enrollSubscriber,
  processEnrollment,
  processPendingEnrollments,
  type EmailSequence,
  type SequenceEnrollment,
} from '../services/emailSequenceService';

export function registerEmailSequenceRoutes(app: Express) {
  // ===== SEQUENCE MANAGEMENT =====
  
  // Get all sequences for a website
  app.get('/api/email-sequences/:websiteId/sequences', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const sequences = await getSequences(websiteId);
      
      res.json({
        success: true,
        sequences,
        count: sequences.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sequences',
      });
    }
  });
  
  // Get a specific sequence
  app.get('/api/email-sequences/:websiteId/sequences/:sequenceId', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      const sequence = await getSequence(websiteId, sequenceId);
      
      if (!sequence) {
        return res.status(404).json({
          success: false,
          error: 'Sequence not found',
        });
      }
      
      res.json({
        success: true,
        sequence,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sequence',
      });
    }
  });
  
  // Create or update a sequence
  app.post('/api/email-sequences/:websiteId/sequences', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const sequenceData: EmailSequence = req.body;
      
      if (!sequenceData.id) {
        sequenceData.id = `sequence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      sequenceData.websiteId = websiteId;
      
      if (!sequenceData.stats) {
        sequenceData.stats = {
          totalEnrolled: 0,
          totalCompleted: 0,
          totalUnsubscribed: 0,
          averageCompletionTime: 0,
          emailsSent: 0,
          emailsOpened: 0,
          emailsClicked: 0,
        };
      }
      
      await saveSequence(websiteId, sequenceData);
      
      res.json({
        success: true,
        sequence: sequenceData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save sequence',
      });
    }
  });
  
  // Update a sequence
  app.put('/api/email-sequences/:websiteId/sequences/:sequenceId', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      const sequenceData: Partial<EmailSequence> = req.body;
      
      const existing = await getSequence(websiteId, sequenceId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Sequence not found',
        });
      }
      
      const updated: EmailSequence = {
        ...existing,
        ...sequenceData,
        id: sequenceId,
        websiteId,
        updatedAt: new Date(),
      };
      
      await saveSequence(websiteId, updated);
      
      res.json({
        success: true,
        sequence: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update sequence',
      });
    }
  });
  
  // Delete a sequence
  app.delete('/api/email-sequences/:websiteId/sequences/:sequenceId', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      await deleteSequence(websiteId, sequenceId);
      
      res.json({
        success: true,
        message: 'Sequence deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete sequence',
      });
    }
  });
  
  // ===== ENROLLMENT MANAGEMENT =====
  
  // Get enrollments for a sequence
  app.get('/api/email-sequences/:websiteId/sequences/:sequenceId/enrollments', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      const enrollments = await getEnrollments(websiteId, sequenceId);
      
      res.json({
        success: true,
        enrollments,
        count: enrollments.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch enrollments',
      });
    }
  });
  
  // Enroll a subscriber in a sequence
  app.post('/api/email-sequences/:websiteId/sequences/:sequenceId/enroll', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      const { subscriberId, subscriberEmail, metadata } = req.body;
      
      if (!subscriberEmail) {
        return res.status(400).json({
          success: false,
          error: 'Subscriber email is required',
        });
      }
      
      const enrollment = await enrollSubscriber(
        websiteId,
        sequenceId,
        subscriberId || `subscriber-${Date.now()}`,
        subscriberEmail,
        metadata || {}
      );
      
      res.json({
        success: true,
        enrollment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enroll subscriber',
      });
    }
  });
  
  // Process a specific enrollment
  app.post('/api/email-sequences/:websiteId/enrollments/:enrollmentId/process', async (req, res) => {
    try {
      const { websiteId, enrollmentId } = req.params;
      
      const enrollments = await getEnrollments(websiteId);
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          error: 'Enrollment not found',
        });
      }
      
      const updated = await processEnrollment(websiteId, enrollment);
      
      res.json({
        success: true,
        enrollment: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process enrollment',
      });
    }
  });
  
  // Process all pending enrollments (cron job endpoint)
  app.post('/api/email-sequences/:websiteId/process-pending', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const result = await processPendingEnrollments(websiteId);
      
      res.json({
        success: true,
        ...result,
        message: `Processed ${result.processed} enrollments`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process pending enrollments',
      });
    }
  });
  
  // Get sequence statistics
  app.get('/api/email-sequences/:websiteId/sequences/:sequenceId/stats', async (req, res) => {
    try {
      const { websiteId, sequenceId } = req.params;
      const sequence = await getSequence(websiteId, sequenceId);
      
      if (!sequence) {
        return res.status(404).json({
          success: false,
          error: 'Sequence not found',
        });
      }
      
      const enrollments = await getEnrollments(websiteId, sequenceId);
      
      const stats = {
        ...sequence.stats,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        pausedEnrollments: enrollments.filter(e => e.status === 'paused').length,
        completionRate: sequence.stats.totalEnrolled > 0
          ? (sequence.stats.totalCompleted / sequence.stats.totalEnrolled) * 100
          : 0,
        openRate: sequence.stats.emailsSent > 0
          ? (sequence.stats.emailsOpened / sequence.stats.emailsSent) * 100
          : 0,
        clickRate: sequence.stats.emailsSent > 0
          ? (sequence.stats.emailsClicked / sequence.stats.emailsSent) * 100
          : 0,
      };
      
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sequence statistics',
      });
    }
  });
}

