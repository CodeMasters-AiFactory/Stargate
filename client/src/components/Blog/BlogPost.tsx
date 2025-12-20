/**
 * Blog Post Display Component
 * Displays a single blog post with content, metadata, and related posts
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, Tag as TagIcon, Share2 } from 'lucide-react';
import type { BlogPost } from '@shared/schema';
import { BlogComments } from './BlogComments';

export interface BlogPostProps {
  websiteId: string;
  postSlug: string;
  onBack?: () => void;
}

export function BlogPost({ websiteId, postSlug, onBack }: BlogPostProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState<{ name: string; avatar?: string } | null>(null);

  useEffect(() => {
    loadPost();
  }, [websiteId, postSlug]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/${websiteId}/${postSlug}`);
      const data = await response.json();

      if (data.success && data.post) {
        setPost(data.post);
        // Load author if available
        if (data.post.authorId) {
          loadAuthor(data.post.authorId);
        }
      }
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuthor = async (authorId: string) => {
    try {
      const response = await fetch(`/api/blog/authors/${websiteId}`);
      const data = await response.json();
      if (data.success) {
        const authorData = data.authors.find((a: any) => a.id === authorId);
        if (authorData) {
          setAuthor({ name: authorData.name, avatar: authorData.avatar });
        }
      }
    } catch (error) {
      console.error('Failed to load author:', error);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">Post not found</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <article className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="space-y-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-4">
              ← Back to Posts
            </Button>
          )}

          <h1 className="text-4xl font-bold">{post.title}</h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {author && (
              <div className="flex items-center gap-2">
                {author.avatar && (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <User className="w-4 h-4" />
                <span>{author.name}</span>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            )}
            {post.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} min read</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="w-4 h-4 text-muted-foreground" />
              {(post.tags as string[]).map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Featured Image */}
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto rounded-lg"
            />
          )}
        </header>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Buttons */}
        <div className="border-t pt-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Share:</span>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments */}
        {post.id && (
          <div className="border-t pt-6">
            <BlogComments postId={post.id} websiteId={websiteId} />
          </div>
        )}
      </article>
    </div>
  );
}

