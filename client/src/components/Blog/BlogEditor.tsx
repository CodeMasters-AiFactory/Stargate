/**
 * Blog Editor Component
 * Rich text editor for creating and editing blog posts
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, Image as ImageIcon, X } from 'lucide-react';
import type { BlogPost } from '@shared/schema';

export interface BlogEditorProps {
  websiteId: string;
  postId?: string;
  onSave?: (post: BlogPost) => void;
  onCancel?: () => void;
}

export function BlogEditor({ websiteId, postId, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled' | 'archived'>('draft');
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([]);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [availableAuthors, setAvailableAuthors] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadPost = useCallback(async (): Promise<void> => {
    if (!postId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog/posts/${websiteId}/${postId}`);
      const data = await response.json();
      
      if (data.success && data.post) {
        const post = data.post;
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setFeaturedImage(post.featuredImage || '');
        setStatus(post.status);
        setPublishedAt(post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '');
        setSelectedTags(post.tags || []);
        setSelectedCategories(post.categories || []);
        setAuthorId(post.authorId || '');
        setSeoTitle(post.seoMetadata?.title || '');
        setSeoDescription(post.seoMetadata?.description || '');
        setSeoKeywords(post.seoMetadata?.keywords || []);
      }
    } catch (_error: unknown) {
      console.error('Failed to load post:', _error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const loadMetadata = useCallback(async (): Promise<void> => {
    try {
      // Load tags
      const tagsResponse = await fetch(`/api/blog/tags/${websiteId}`);
      const tagsData = await tagsResponse.json();
      if (tagsData.success) {
        setAvailableTags(tagsData.tags);
      }

      // Load categories
      const categoriesResponse = await fetch(`/api/blog/categories/${websiteId}`);
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success) {
        setAvailableCategories(categoriesData.categories);
      }

      // Load authors
      const authorsResponse = await fetch(`/api/blog/authors/${websiteId}`);
      const authorsData = await authorsResponse.json();
      if (authorsData.success) {
        setAvailableAuthors(authorsData.authors);
      }
    } catch (_error: unknown) {
      console.error('Failed to load metadata:', _error);
    }
  }, [websiteId]);

  // Load post data if editing
  useEffect(() => {
    if (postId) {
      loadPost();
    }
    loadMetadata();
  }, [postId, websiteId, loadPost, loadMetadata]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!postId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, postId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const postData = {
        websiteId,
        title,
        content,
        authorId,
        slug,
        excerpt,
        featuredImage,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        tags: selectedTags,
        categories: selectedCategories,
        seoMetadata: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
        },
      };

      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = postId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (data.success) {
        if (onSave) {
          // Reload post to get full data
          const postResponse = await fetch(`/api/blog/posts/${websiteId}/${data.postId || postId}`);
          const postData = await postResponse.json();
          if (postData.success && onSave) {
            onSave(postData.post);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to save post');
      }
    } catch (_error: unknown) {
      console.error('Failed to save post:', _error);
      alert('Failed to save post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleAddCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{postId ? 'Edit Post' : 'New Post'}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="text-2xl font-bold"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
            />
          </div>

          {/* Content Editor */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="excerpt">Excerpt</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="min-h-[400px] font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Supports HTML and Markdown. Rich text editor coming soon.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="featuredImage"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button variant="outline" size="sm">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="excerpt" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary of the post..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  This will be displayed in blog listings and RSS feeds.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO optimized title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta description for search engines..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={seoKeywords.join(', ')}
                  onChange={(e) => setSeoKeywords(e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v: 'draft' | 'published' | 'scheduled' | 'archived') => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Select value={authorId} onValueChange={setAuthorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAuthors.map(author => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status === 'scheduled' && (
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Publish Date & Time</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCategories.map(catId => {
                    const category = availableCategories.find(c => c.id === catId);
                    return category ? (
                      <Badge key={catId} variant="secondary" className="gap-1">
                        {category.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveCategory(catId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select onValueChange={handleAddCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories
                      .filter(cat => !selectedCategories.includes(cat.id))
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge key={tagId} variant="outline" className="gap-1">
                        {tag.name}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tagId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select onValueChange={handleAddTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

