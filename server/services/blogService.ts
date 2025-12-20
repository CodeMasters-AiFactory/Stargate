/**
 * Blog Service
 * Complete blog system with posts, categories, tags, comments, and authors
 */

import { db } from '../db';
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogComments,
  blogAuthors,
  type InsertBlogPost,
  type InsertBlogCategory,
  type InsertBlogTag,
  type InsertBlogComment,
  type InsertBlogAuthor,
} from '@shared/schema';
import { eq, and, desc, asc, inArray, gte, lte, or, like } from 'drizzle-orm';

/**
 * Blog Post Management
 */

export async function createBlogPost(
  websiteId: string,
  title: string,
  content: string,
  authorId: string,
  options: {
    slug?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    publishedAt?: Date;
    tags?: string[];
    categories?: string[];
    seoMetadata?: Record<string, any>;
  } = {}
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  // Generate slug if not provided
  const slug = options.slug || title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Calculate reading time (estimate: 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const [post] = await db
    .insert(blogPosts)
    .values({
      websiteId,
      title,
      slug,
      content,
      authorId,
      excerpt: options.excerpt,
      featuredImage: options.featuredImage,
      status: options.status || 'draft',
      publishedAt: options.publishedAt || (options.status === 'published' ? new Date() : null),
      tags: options.tags || [],
      categories: options.categories || [],
      seoMetadata: options.seoMetadata || {},
      readingTime,
    })
    .returning();

  return post.id;
}

export async function getBlogPosts(
  websiteId: string,
  filters: {
    status?: 'draft' | 'published' | 'scheduled' | 'archived';
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<typeof blogPosts.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.websiteId, websiteId));

  if (filters.status) {
    query = query.where(eq(blogPosts.status, filters.status));
  }

  if (filters.categoryId) {
    query = query.where(
      // Check if categoryId is in categories array
      // This is a simplified check - in production, use proper JSONB query
    );
  }

  if (filters.tagId) {
    query = query.where(
      // Check if tagId is in tags array
    );
  }

  if (filters.authorId) {
    query = query.where(eq(blogPosts.authorId, filters.authorId));
  }

  if (filters.search) {
    query = query.where(
      or(
        like(blogPosts.title, `%${filters.search}%`),
        like(blogPosts.content, `%${filters.search}%`),
        like(blogPosts.excerpt || '', `%${filters.search}%`)
      )
    );
  }

  query = query.orderBy(desc(blogPosts.createdAt));

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function getBlogPost(postId: string): Promise<typeof blogPosts.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);

  return post || null;
}

export async function getBlogPostBySlug(
  websiteId: string,
  slug: string
): Promise<typeof blogPosts.$inferSelect | null> {
  if (!db) {
    return null;
  }

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.websiteId, websiteId),
        eq(blogPosts.slug, slug)
      )
    )
    .limit(1);

  return post || null;
}

export async function updateBlogPost(
  postId: string,
  updates: Partial<InsertBlogPost>
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db
      .update(blogPosts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, postId));
    return true;
  } catch (error) {
    console.error('[BlogService] Update error:', error);
    return false;
  }
}

export async function deleteBlogPost(postId: string): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));
    return true;
  } catch (error) {
    console.error('[BlogService] Delete error:', error);
    return false;
  }
}

export async function incrementPostViewCount(postId: string): Promise<void> {
  if (!db) {
    return;
  }

  try {
    const post = await getBlogPost(postId);
    if (post) {
      await db
        .update(blogPosts)
        .set({ viewCount: (post.viewCount || 0) + 1 })
        .where(eq(blogPosts.id, postId));
    }
  } catch (error) {
    console.error('[BlogService] View count error:', error);
  }
}

/**
 * Blog Category Management
 */

export async function createBlogCategory(
  websiteId: string,
  name: string,
  description?: string
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const [category] = await db
    .insert(blogCategories)
    .values({
      websiteId,
      name,
      slug,
      description,
    })
    .returning();

  return category.id;
}

export async function getBlogCategories(websiteId: string): Promise<typeof blogCategories.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(blogCategories)
    .where(eq(blogCategories.websiteId, websiteId))
    .orderBy(asc(blogCategories.name));
}

/**
 * Blog Tag Management
 */

export async function createBlogTag(websiteId: string, name: string): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Check if tag already exists
  const existing = await db
    .select()
    .from(blogTags)
    .where(
      and(
        eq(blogTags.websiteId, websiteId),
        eq(blogTags.slug, slug)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [tag] = await db
    .insert(blogTags)
    .values({
      websiteId,
      name,
      slug,
    })
    .returning();

  return tag.id;
}

export async function getBlogTags(websiteId: string): Promise<typeof blogTags.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(blogTags)
    .where(eq(blogTags.websiteId, websiteId))
    .orderBy(asc(blogTags.name));
}

/**
 * Blog Comment Management
 */

export async function createBlogComment(
  postId: string,
  authorName: string,
  authorEmail: string,
  content: string,
  parentId?: string
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [comment] = await db
    .insert(blogComments)
    .values({
      postId,
      authorName,
      authorEmail,
      content,
      parentId,
      status: 'pending', // Require moderation by default
    })
    .returning();

  return comment.id;
}

export async function getBlogComments(
  postId: string,
  status?: 'pending' | 'approved' | 'spam' | 'rejected'
): Promise<typeof blogComments.$inferSelect[]> {
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(blogComments)
    .where(eq(blogComments.postId, postId));

  if (status) {
    query = query.where(eq(blogComments.status, status));
  }

  return await query.orderBy(asc(blogComments.createdAt));
}

export async function updateCommentStatus(
  commentId: string,
  status: 'pending' | 'approved' | 'spam' | 'rejected'
): Promise<boolean> {
  if (!db) {
    return false;
  }

  try {
    await db
      .update(blogComments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(blogComments.id, commentId));
    return true;
  } catch (error) {
    console.error('[BlogService] Comment status update error:', error);
    return false;
  }
}

/**
 * Blog Author Management
 */

export async function createBlogAuthor(
  websiteId: string,
  name: string,
  email: string,
  bio?: string,
  avatar?: string,
  userId?: string
): Promise<string> {
  if (!db) {
    throw new Error('Database not available');
  }

  const [author] = await db
    .insert(blogAuthors)
    .values({
      websiteId,
      name,
      email,
      bio,
      avatar,
      userId,
    })
    .returning();

  return author.id;
}

export async function getBlogAuthors(websiteId: string): Promise<typeof blogAuthors.$inferSelect[]> {
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(blogAuthors)
    .where(eq(blogAuthors.websiteId, websiteId))
    .orderBy(asc(blogAuthors.name));
}

/**
 * Content Scheduling
 */

export async function getScheduledPosts(websiteId: string): Promise<typeof blogPosts.$inferSelect[]> {
  if (!db) {
    return [];
  }

  const now = new Date();

  return await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.websiteId, websiteId),
        eq(blogPosts.status, 'scheduled'),
        lte(blogPosts.publishedAt || new Date(0), now)
      )
    )
    .orderBy(asc(blogPosts.publishedAt));
}

export async function publishScheduledPosts(websiteId: string): Promise<number> {
  if (!db) {
    return 0;
  }

  const scheduledPosts = await getScheduledPosts(websiteId);
  let published = 0;

  for (const post of scheduledPosts) {
    if (post.publishedAt && post.publishedAt <= new Date()) {
      await updateBlogPost(post.id, { status: 'published' });
      published++;
    }
  }

  return published;
}

/**
 * RSS Feed Generation
 */

export async function generateRSSFeed(websiteId: string): Promise<string> {
  if (!db) {
    return '';
  }

  const posts = await getBlogPosts(websiteId, {
    status: 'published',
    limit: 20,
  });

  const siteName = 'Website'; // Would get from website manifest
  const siteUrl = 'https://example.com'; // Would get from website config

  const rssItems = posts.map(post => {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const pubDate = post.publishedAt || post.createdAt;
    
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <author>${post.authorId || 'admin'}</author>
    </item>
    `.trim();
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${siteName} Blog]]></title>
    <link>${siteUrl}/blog</link>
    <description><![CDATA[Blog feed for ${siteName}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`.trim();
}

