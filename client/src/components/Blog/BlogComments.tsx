/**
 * Blog Comments Component
 * Displays and manages blog post comments
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import type { BlogComment } from '@shared/schema';

export interface BlogCommentsProps {
  postId: string;
  websiteId: string;
}

export function BlogComments({ postId, websiteId }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog/comments/${postId}?status=approved`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName || !authorEmail || !commentContent) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          authorName,
          authorEmail,
          content: commentContent,
          parentId: parentId || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthorName('');
        setAuthorEmail('');
        setCommentContent('');
        setParentId(null);
        loadComments();
        alert('Comment submitted! It will appear after moderation.');
      } else {
        alert('Failed to submit comment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: BlogComment, level: number = 0) => {
    const replies = comments.filter(c => c.parentId === comment.id);

    return (
      <div
        key={comment.id}
        className={`space-y-4 ${level > 0 ? 'ml-8 mt-4 border-l-2 pl-4' : ''}`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{comment.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </p>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          {level === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParentId(comment.id)}
              className="text-xs"
            >
              Reply
            </Button>
          )}
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-4">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-semibold">
          Comments ({topLevelComments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
        {parentId && (
          <div className="bg-muted p-2 rounded text-sm">
            <p className="text-muted-foreground">
              Replying to comment. <Button
                variant="link"
                size="sm"
                onClick={() => setParentId(null)}
                className="h-auto p-0"
              >
                Cancel
              </Button>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="authorName">Name</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorEmail">Email</Label>
            <Input
              id="authorEmail"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commentContent">Comment</Label>
          <Textarea
            id="commentContent"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            required
            className="min-h-[100px]"
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <p className="text-muted-foreground">Loading comments...</p>
      ) : topLevelComments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}

