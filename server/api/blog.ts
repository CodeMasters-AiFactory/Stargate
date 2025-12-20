/**
 * Blog API Routes
 * Complete blog system with posts, categories, tags, comments, and authors
 */

import type { Express } from 'express';
import {
  createBlogPost,
  getBlogPosts,
  getBlogPost,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  incrementPostViewCount,
  createBlogCategory,
  getBlogCategories,
  createBlogTag,
  getBlogTags,
  createBlogComment,
  getBlogComments,
  updateCommentStatus,
  createBlogAuthor,
  getBlogAuthors,
  publishScheduledPosts,
  generateRSSFeed,
} from '../services/blogService';

export function registerBlogRoutes(app: Express) {
  // ============================================
  // BLOG POSTS
  // ============================================

  // Create blog post
  app.post('/api/blog/posts', async (req, res) => {
    try {
      const {
        websiteId,
        title,
        content,
        authorId,
        slug,
        excerpt,
        featuredImage,
        status,
        publishedAt,
        tags,
        categories,
        seoMetadata,
      } = req.body;

      if (!websiteId || !title || !content || !authorId) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, title, content, and authorId are required',
        });
      }

      const postId = await createBlogPost(websiteId, title, content, authorId, {
        slug,
        excerpt,
        featuredImage,
        status,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
        tags,
        categories,
        seoMetadata,
      });

      res.json({
        success: true,
        postId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create blog post',
      });
    }
  });

  // Get blog posts
  app.get('/api/blog/posts/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const {
        status,
        categoryId,
        tagId,
        authorId,
        search,
        limit,
        offset,
      } = req.query;

      const posts = await getBlogPosts(websiteId, {
        status: status as any,
        categoryId: categoryId as string,
        tagId: tagId as string,
        authorId: authorId as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get blog posts',
      });
    }
  });

  // Get single blog post
  app.get('/api/blog/posts/:websiteId/:slug', async (req, res) => {
    try {
      const { websiteId, slug } = req.params;
      const post = await getBlogPostBySlug(websiteId, slug);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found',
        });
      }

      // Increment view count
      await incrementPostViewCount(post.id);

      res.json({
        success: true,
        post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get blog post',
      });
    }
  });

  // Update blog post
  app.patch('/api/blog/posts/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const updates = req.body;

      const success = await updateBlogPost(postId, updates);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found',
        });
      }

      res.json({
        success: true,
        message: 'Blog post updated',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post',
      });
    }
  });

  // Delete blog post
  app.delete('/api/blog/posts/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const success = await deleteBlogPost(postId);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found',
        });
      }

      res.json({
        success: true,
        message: 'Blog post deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post',
      });
    }
  });

  // ============================================
  // BLOG CATEGORIES
  // ============================================

  // Create category
  app.post('/api/blog/categories', async (req, res) => {
    try {
      const { websiteId, name, description } = req.body;

      if (!websiteId || !name) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and name are required',
        });
      }

      const categoryId = await createBlogCategory(websiteId, name, description);

      res.json({
        success: true,
        categoryId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  });

  // Get categories
  app.get('/api/blog/categories/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const categories = await getBlogCategories(websiteId);

      res.json({
        success: true,
        categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get categories',
      });
    }
  });

  // ============================================
  // BLOG TAGS
  // ============================================

  // Create tag
  app.post('/api/blog/tags', async (req, res) => {
    try {
      const { websiteId, name } = req.body;

      if (!websiteId || !name) {
        return res.status(400).json({
          success: false,
          error: 'websiteId and name are required',
        });
      }

      const tagId = await createBlogTag(websiteId, name);

      res.json({
        success: true,
        tagId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tag',
      });
    }
  });

  // Get tags
  app.get('/api/blog/tags/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const tags = await getBlogTags(websiteId);

      res.json({
        success: true,
        tags,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get tags',
      });
    }
  });

  // ============================================
  // BLOG COMMENTS
  // ============================================

  // Create comment
  app.post('/api/blog/comments', async (req, res) => {
    try {
      const { postId, authorName, authorEmail, content, parentId } = req.body;

      if (!postId || !authorName || !authorEmail || !content) {
        return res.status(400).json({
          success: false,
          error: 'postId, authorName, authorEmail, and content are required',
        });
      }

      const commentId = await createBlogComment(postId, authorName, authorEmail, content, parentId);

      res.json({
        success: true,
        commentId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      });
    }
  });

  // Get comments
  app.get('/api/blog/comments/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const { status } = req.query;

      const comments = await getBlogComments(postId, status as any);

      res.json({
        success: true,
        comments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get comments',
      });
    }
  });

  // Update comment status
  app.patch('/api/blog/comments/:commentId/status', async (req, res) => {
    try {
      const { commentId } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'approved', 'spam', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Valid status is required',
        });
      }

      const success = await updateCommentStatus(commentId, status);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found',
        });
      }

      res.json({
        success: true,
        message: 'Comment status updated',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update comment status',
      });
    }
  });

  // ============================================
  // BLOG AUTHORS
  // ============================================

  // Create author
  app.post('/api/blog/authors', async (req, res) => {
    try {
      const { websiteId, name, email, bio, avatar, userId } = req.body;

      if (!websiteId || !name || !email) {
        return res.status(400).json({
          success: false,
          error: 'websiteId, name, and email are required',
        });
      }

      const authorId = await createBlogAuthor(websiteId, name, email, bio, avatar, userId);

      res.json({
        success: true,
        authorId,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create author',
      });
    }
  });

  // Get authors
  app.get('/api/blog/authors/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const authors = await getBlogAuthors(websiteId);

      res.json({
        success: true,
        authors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get authors',
      });
    }
  });

  // ============================================
  // CONTENT SCHEDULING
  // ============================================

  // Publish scheduled posts
  app.post('/api/blog/publish-scheduled/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const published = await publishScheduledPosts(websiteId);

      res.json({
        success: true,
        published,
        message: `Published ${published} scheduled post(s)`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish scheduled posts',
      });
    }
  });

  // ============================================
  // RSS FEEDS
  // ============================================

  // Generate RSS feed
  app.get('/api/blog/rss/:websiteId', async (req, res) => {
    try {
      const { websiteId } = req.params;
      const rssFeed = await generateRSSFeed(websiteId);

      res.setHeader('Content-Type', 'application/rss+xml');
      res.send(rssFeed);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate RSS feed',
      });
    }
  });
}

