/**
 * Comments Panel
 * Add and view comments/annotations on website elements
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, X, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  websiteId: string;
  elementId?: string;
  elementPath?: string;
  userId: string;
  userName: string;
  avatar?: string;
  content: string;
  x?: number;
  y?: number;
  createdAt: string;
  resolved?: boolean;
  replies?: Comment[];
}

export interface CommentsPanelProps {
  websiteId: string;
  selectedElementId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentsPanel({
  websiteId,
  selectedElementId,
  open,
  onOpenChange,
}: CommentsPanelProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && websiteId) {
      loadComments();
    }
  }, [open, websiteId, selectedElementId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/collaboration/website/${websiteId}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      // In a real implementation, this would call the API
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        websiteId,
        elementId: selectedElementId,
        userId: user.id || 'anonymous',
        userName: user.username || 'Anonymous',
        avatar: user.avatar,
        content: newComment,
        createdAt: new Date().toISOString(),
        resolved: false,
      };

      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      setComments(prev =>
        prev.map(c => (c.id === commentId ? { ...c, resolved: true } : c))
      );
      toast.success('Comment resolved');
    } catch (error) {
      console.error('Failed to resolve comment:', error);
      toast.error('Failed to resolve comment');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Comments</h3>
          <span className="text-xs text-muted-foreground">
            ({comments.filter(c => !c.resolved).length})
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading comments...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-2">
              Add a comment to start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <Card
                key={comment.id}
                className={`p-3 ${comment.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>
                      {comment.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{comment.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {comment.elementId && (
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    {!comment.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveComment(comment.id)}
                        className="h-6 text-xs"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Comment */}
      <div className="p-4 border-t space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleAddComment();
            }
          }}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="w-full"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Add Comment
        </Button>
      </div>
    </div>
  );
}

