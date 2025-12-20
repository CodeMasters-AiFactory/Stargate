/**
 * Template Marketplace API Routes
 * Phase 3.1: Template Expansion - User submissions and monetization
 */

import type { Express } from 'express';
import {
  getSubmissions,
  saveSubmission,
  reviewSubmission,
  getTemplateReviews,
  saveReview,
  getCreatorStats,
  type TemplateSubmission,
  type TemplateReview,
} from '../services/templateMarketplaceService';

export function registerTemplateMarketplaceRoutes(app: Express) {
  // ===== TEMPLATE SUBMISSIONS =====
  
  // Get all submissions (with optional status filter)
  app.get('/api/templates/marketplace/submissions', async (req, res) => {
    try {
      const { status } = req.query;
      const submissions = await getSubmissions(status as TemplateSubmission['status']);
      
      res.json({
        success: true,
        submissions,
        count: submissions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch submissions',
      });
    }
  });
  
  // Submit a template
  app.post('/api/templates/marketplace/submit', async (req, res) => {
    try {
      const { submitterId, submitterEmail, template, monetization } = req.body;
      
      const submission: TemplateSubmission = {
        id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        submitterId,
        submitterEmail,
        template: {
          name: template.name,
          description: template.description,
          category: template.category,
          industry: template.industry || [],
          previewImage: template.previewImage,
          html: template.html,
          css: template.css,
          js: template.js,
          thumbnail: template.thumbnail,
          tags: template.tags || [],
        },
        status: 'pending',
        submittedAt: new Date(),
        monetization: monetization ? {
          isPremium: monetization.isPremium || false,
          price: monetization.price,
          revenueShare: monetization.revenueShare || 70, // Default 70% to creator
        } : undefined,
        stats: {
          downloads: 0,
          rating: 0,
          reviews: 0,
        },
      };
      
      await saveSubmission(submission);
      
      res.json({
        success: true,
        submission,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit template',
      });
    }
  });
  
  // Review a submission (admin only)
  app.post('/api/templates/marketplace/submissions/:submissionId/review', async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { status, reviewNotes, reviewerId } = req.body;
      
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be "approved" or "rejected"',
        });
      }
      
      await reviewSubmission(submissionId, status, reviewNotes, reviewerId);
      
      res.json({
        success: true,
        message: `Template ${status}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review submission',
      });
    }
  });
  
  // ===== TEMPLATE REVIEWS =====
  
  // Get reviews for a template
  app.get('/api/templates/marketplace/reviews/:templateId', async (req, res) => {
    try {
      const { templateId } = req.params;
      const reviews = await getTemplateReviews(templateId);
      
      res.json({
        success: true,
        reviews,
        count: reviews.length,
        averageRating: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
      });
    }
  });
  
  // Submit a review
  app.post('/api/templates/marketplace/reviews', async (req, res) => {
    try {
      const { templateId, userId, userName, rating, comment } = req.body;
      
      if (!templateId || !userId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Invalid review data',
        });
      }
      
      const review: TemplateReview = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId,
        userId,
        userName,
        rating,
        comment,
        helpful: 0,
        createdAt: new Date(),
      };
      
      await saveReview(review);
      
      res.json({
        success: true,
        review,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit review',
      });
    }
  });
  
  // ===== CREATOR DASHBOARD =====
  
  // Get creator statistics
  app.get('/api/templates/marketplace/creator/:creatorId/stats', async (req, res) => {
    try {
      const { creatorId } = req.params;
      const stats = await getCreatorStats(creatorId);
      
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch creator stats',
      });
    }
  });
  
  // Get creator's submissions
  app.get('/api/templates/marketplace/creator/:creatorId/submissions', async (req, res) => {
    try {
      const { creatorId } = req.params;
      const submissions = await getSubmissions();
      const creatorSubmissions = submissions.filter(s => s.submitterId === creatorId);
      
      res.json({
        success: true,
        submissions: creatorSubmissions,
        count: creatorSubmissions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch creator submissions',
      });
    }
  });
}

