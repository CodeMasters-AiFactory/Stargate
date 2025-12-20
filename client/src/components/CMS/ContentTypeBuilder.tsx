/**
 * Content Type Builder
 * Create and edit content types with custom fields
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { toast } from 'sonner';

export interface ContentTypeField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'richtext' | 'image' | 'file' | 'relation' | 'repeater';
  required?: boolean;
  defaultValue?: any;
  options?: any;
  validation?: any;
}

export interface ContentTypeBuilderProps {
  websiteId: string;
  contentType?: {
    id: string;
    name: string;
    slug: string;
    fields: ContentTypeField[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ContentTypeBuilder({
  websiteId,
  contentType,
  open,
  onOpenChange,
  onSuccess,
}: ContentTypeBuilderProps) {
  const [name, setName] = useState(contentType?.name || '');
  const [fields, setFields] = useState<ContentTypeField[]>(contentType?.fields || []);
  const [isSaving, setIsSaving] = useState(false);

  const fieldTypes: ContentTypeField['type'][] = [
    'text',
    'number',
    'date',
    'boolean',
    'richtext',
    'image',
    'file',
    'relation',
    'repeater',
  ];

  const addField = () => {
    const newField: ContentTypeField = {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId: string, updates: Partial<ContentTypeField>) => {
    setFields(fields.map(f => (f.id === fieldId ? { ...f, ...updates } : f)));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Content type name is required');
      return;
    }

    if (fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }

    // Validate all fields have names
    const invalidFields = fields.filter(f => !f.name.trim());
    if (invalidFields.length > 0) {
      toast.error('All fields must have names');
      return;
    }

    setIsSaving(true);
    try {
      if (contentType) {
        // Update existing content type
        const response = await fetch(`/api/cms/content-types/${contentType.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            fields,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Content type updated successfully');
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(data.error || 'Failed to update content type');
        }
      } else {
        // Create new content type
        const response = await fetch('/api/cms/content-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId,
            name,
            fields,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success('Content type created successfully');
          onSuccess();
          onOpenChange(false);
          // Reset form
          setName('');
          setFields([]);
        } else {
          toast.error(data.error || 'Failed to create content type');
        }
      }
    } catch (error) {
      console.error('Failed to save content type:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contentType ? 'Edit Content Type' : 'Create Content Type'}
          </DialogTitle>
          <DialogDescription>
            Define the structure of your content type by adding fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Content Type Name */}
          <div className="space-y-2">
            <Label htmlFor="content-type-name">Content Type Name</Label>
            <Input
              id="content-type-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product, Blog Post, Team Member"
            />
            {name && (
              <p className="text-xs text-muted-foreground">
                Slug: {name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
              </p>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-sm text-muted-foreground mb-4">
                  No fields yet. Add your first field to get started.
                </p>
                <Button variant="outline" onClick={addField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Field
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="pt-2 cursor-move">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Field Name */}
                        <div className="space-y-1">
                          <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                          <Input
                            id={`field-name-${field.id}`}
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="e.g., Title, Price, Description"
                          />
                        </div>

                        {/* Field Type */}
                        <div className="space-y-1">
                          <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: ContentTypeField['type']) =>
                              updateField(field.id, { type: value })
                            }
                          >
                            <SelectTrigger id={`field-type-${field.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Field Options */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`field-required-${field.id}`}
                              checked={field.required || false}
                              onChange={(e) =>
                                updateField(field.id, { required: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor={`field-required-${field.id}`} className="cursor-pointer">
                              Required
                            </Label>
                          </div>
                        </div>

                        {/* Default Value (for some field types) */}
                        {['text', 'number'].includes(field.type) && (
                          <div className="space-y-1">
                            <Label htmlFor={`field-default-${field.id}`}>Default Value (optional)</Label>
                            <Input
                              id={`field-default-${field.id}`}
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={field.defaultValue || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  defaultValue: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value,
                                })
                              }
                              placeholder="Default value"
                            />
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim() || fields.length === 0}>
            {isSaving ? 'Saving...' : contentType ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

