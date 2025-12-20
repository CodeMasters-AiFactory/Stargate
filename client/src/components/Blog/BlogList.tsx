/**
 * Blog List Component
 * Displays list of blog posts with filters and pagination
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import type { BlogPost } from '@shared/schema';

export interface BlogListProps {
  websiteId: string;
  onEditPost?: (postId: string) => void;
  onViewPost?: (postId: string) => void;
  onNewPost?: () => void;
}

export function BlogList({ websiteId, onEditPost, onViewPost, onNewPost }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;

  useEffect(() => {
    loadPosts();
  }, [websiteId, statusFilter, searchQuery, currentPage]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: postsPerPage.toString(),
        offset: ((currentPage - 1) * postsPerPage).toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/blog/posts/${websiteId}?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
        setTotalPosts(data.posts.length); // In production, get total from API
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        loadPosts();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'archived':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not published';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Blog Posts</h2>
        <Button onClick={onNewPost}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="border-b bg-muted/30 px-6 py-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No posts found</p>
            <Button onClick={onNewPost} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      {post.viewCount !== undefined && (
                        <span>{post.viewCount} views</span>
                      )}
                      {post.readingTime && (
                        <span>{post.readingTime} min read</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {onViewPost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewPost(post.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {onEditPost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPost(post.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPosts > postsPerPage && (
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * postsPerPage + 1} to {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage * postsPerPage >= totalPosts}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

