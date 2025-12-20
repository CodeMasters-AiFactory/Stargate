/**
 * Content Entry Editor
 * Create and edit content entries based on content types
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ContentTypeField } from './ContentTypeBuilder';

export interface ContentEntryEditorProps {
  websiteId: string;
  contentTypeId: string;
  contentType?: {
    id: string;
    name: string;
    slug: string;
    fields: ContentTypeField[];
  } | null;
  entry?: {
    id: string;
    data: Record<string, any>;
    status: 'draft' | 'published' | 'archived';
    slug?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ContentEntryEditor({
  websiteId,
  contentTypeId,
  contentType,
  entry,
  open,
  onOpenChange,
  onSuccess,
}: ContentEntryEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(entry?.data || {});
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(entry?.status || 'draft');
  const [slug, setSlug] = useState(entry?.slug || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load content type if not provided
  useEffect(() => {
    if (!contentType && contentTypeId && open) {
      setIsLoading(true);
      fetch(`/api/cms/content-types/${websiteId}/${contentTypeId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Content type will be passed via props, but we can use it here if needed
          }
        })
        .catch(err => {
          console.error('Failed to load content type:', err);
          toast.error('Failed to load content type');
        })
        .finally(() => setIsLoading(false));
    }
  }, [contentTypeId, websiteId, open, contentType]);

  // Load entry data if editing
  useEffect(() => {
    if (entry && open) {
      setFormData(entry.data || {});
      setStatus(entry.status || 'draft');
      setSlug(entry.slug || '');
    } else if (!entry && open) {
      // Reset form for new entry
      setFormData({});
      setStatus('draft');
      setSlug('');
    }
  }, [entry, open]);

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const renderFieldInput = (field: ContentTypeField) => {
    const value = formData[field.name] ?? field.defaultValue ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.name}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateField(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.name}
            required={field.required}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            required={field.required}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`field-${field.id}`}
              checked={value || false}
              onChange={(e) => updateField(field.name, e.target.checked)}
              className="rounded"
            />
            <Label htmlFor={`field-${field.id}`} className="cursor-pointer">
              {field.name}
            </Label>
          </div>
        );

      case 'richtext':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.name}
            rows={6}
            required={field.required}
          />
        );

      case 'image':
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="url"
              value={value}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={`Enter ${field.type} URL`}
              required={field.required}
            />
            {value && (
              <div className="text-xs text-muted-foreground">
                {field.type === 'image' ? (
                  <img src={value} alt={field.name} className="max-w-xs mt-2 rounded" />
                ) : (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View file
                  </a>
                )}
              </div>
            )}
          </div>
        );

      case 'relation':
        return (
          <Input
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder="Related entry ID"
            required={field.required}
          />
        );

      case 'repeater':
        return (
          <div className="space-y-2">
            <Textarea
              value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateField(field.name, parsed);
                } catch {
                  updateField(field.name, e.target.value);
                }
              }}
              placeholder="JSON array format"
              rows={4}
              required={field.required}
            />
            <p className="text-xs text-muted-foreground">
              Enter as JSON array: ["item1", "item2", ...]
            </p>
          </div>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.name}
            required={field.required}
          />
        );
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!contentType) {
      toast.error('Content type not loaded');
      return;
    }

    const missingFields = contentType.fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.name);

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      if (entry) {
        // Update existing entry
        const response = await fetch(`/api/cms/entries/${entry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: formData,
            status,
            slug: slug || undefined,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Content entry updated successfully');
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(data.error || 'Failed to update content entry');
        }
      } else {
        // Create new entry
        const response = await fetch('/api/cms/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentTypeId,
            websiteId,
            data: formData,
            status,
            publishedAt: status === 'published' ? new Date().toISOString() : undefined,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Content entry created successfully');
          onSuccess();
          onOpenChange(false);
          // Reset form
          setFormData({});
          setStatus('draft');
          setSlug('');
        } else {
          toast.error(data.error || 'Failed to create content entry');
        }
      }
    } catch (error) {
      console.error('Failed to save content entry:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <p className="text-center py-8">Loading content type...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!contentType) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <p className="text-center py-8 text-destructive">Content type not found</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit Content Entry' : 'Create Content Entry'}
          </DialogTitle>
          <DialogDescription>
            {contentType.name} - Fill in all required fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Slug (optional) */}
          <div className="space-y-2">
            <Label htmlFor="entry-slug">Slug (optional)</Label>
            <Input
              id="entry-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if not provided"
            />
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {contentType.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`entry-field-${field.id}`}>
                  {field.name}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderFieldInput(field)}
                {field.type === 'richtext' && (
                  <p className="text-xs text-muted-foreground">
                    Rich text editor - supports HTML formatting
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : entry ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

