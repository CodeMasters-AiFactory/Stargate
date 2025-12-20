/**
 * Lead Capture Form Builder Component
 * Phase 3.3: Marketing Automation - Visual form builder
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
// Removed unused import: Badge
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  FileText,
  Code,
  GripVertical,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FormField, ConditionalLogic, LeadCaptureForm } from '@/types/leadCapture';

interface LeadCaptureFormBuilderProps {
  websiteId: string;
}

export function LeadCaptureFormBuilder({ websiteId }: LeadCaptureFormBuilderProps) {
  const { toast } = useToast();
  const [forms, setForms] = useState<LeadCaptureForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<LeadCaptureForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, [websiteId]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lead-capture/${websiteId}/forms`);
      const data = await response.json();
      
      if (data.success) {
        setForms(data.forms || []);
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load forms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    const newForm: LeadCaptureForm = {
      id: `form-${Date.now()}`,
      name: 'New Lead Capture Form',
      websiteId,
      fields: [],
      conditionalLogic: [],
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        enableNotifications: false,
        enableAutoResponse: false,
      },
      multiStep: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      submissionsCount: 0,
    };
    
    setSelectedForm(newForm);
    setIsEditing(true);
  };

  const handleSaveForm = async () => {
    if (!selectedForm) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/lead-capture/${websiteId}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Form saved successfully',
        });
        await loadForms();
        setIsEditing(false);
      } else {
        throw new Error(data.error || 'Failed to save form');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save form',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/lead-capture/${websiteId}/forms/${formId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Form deleted successfully',
        });
        await loadForms();
        if (selectedForm?.id === formId) {
          setSelectedForm(null);
          setIsEditing(false);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete form',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFormHTML = async (formId: string) => {
    try {
      const response = await fetch(`/api/lead-capture/${websiteId}/forms/${formId}/html`);
      const html = await response.text();
      
      await navigator.clipboard.writeText(html);
      toast({
        title: 'Copied!',
        description: 'Form HTML copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy form HTML',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lead Capture Forms</h2>
        <p className="text-muted-foreground">
          Create and manage lead capture forms for your website
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button onClick={handleCreateForm}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {/* Forms List */}
      <div className="grid gap-4">
        {forms.map(form => (
          <Card key={form.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{form.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.fields.length} fields • {form.submissionsCount} submissions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedForm(form);
                      setPreviewMode(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyFormHTML(form.id)}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedForm(form);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteForm(form.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {forms.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No forms created yet</p>
              <Button onClick={handleCreateForm} className="mt-4">
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Form Editor Dialog */}
      {selectedForm && isEditing && (
        <FormEditor
          form={selectedForm}
          onChange={setSelectedForm}
          onSave={handleSaveForm}
          onCancel={() => {
            setIsEditing(false);
            setSelectedForm(null);
          }}
        />
      )}

      {/* Preview Dialog */}
      {selectedForm && previewMode && (
        <FormPreview
          form={selectedForm}
          websiteId={websiteId}
          onClose={() => {
            setPreviewMode(false);
            setSelectedForm(null);
          }}
        />
      )}
    </div>
  );
}

function FormEditor({
  form,
  onChange,
  onSave,
  onCancel,
}: {
  form: LeadCaptureForm;
  onChange: (form: LeadCaptureForm) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [activeTab, setActiveTab] = useState('fields');

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${form.fields.length + 1}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };
    
    onChange({
      ...form,
      fields: [...form.fields, newField],
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    onChange({
      ...form,
      fields: form.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
    });
  };

  const deleteField = (fieldId: string) => {
    onChange({
      ...form,
      fields: form.fields.filter(f => f.id !== fieldId),
    });
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Form: {form.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="logic">Conditional Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Form Fields</h3>
              <Button onClick={addField} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onDelete={() => deleteField(field.id)}
                />
              ))}
              
              {form.fields.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No fields added yet</p>
                    <Button onClick={addField}>Add First Field</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Form Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => onChange({ ...form, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Submit Button Text</Label>
                <Input
                  value={form.settings.submitButtonText}
                  onChange={(e) => onChange({
                    ...form,
                    settings: { ...form.settings, submitButtonText: e.target.value },
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Success Message</Label>
                <Textarea
                  value={form.settings.successMessage}
                  onChange={(e) => onChange({
                    ...form,
                    settings: { ...form.settings, successMessage: e.target.value },
                  })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Redirect URL (Optional)</Label>
                <Input
                  value={form.settings.redirectUrl || ''}
                  onChange={(e) => onChange({
                    ...form,
                    settings: { ...form.settings, redirectUrl: e.target.value || undefined },
                  })}
                  placeholder="https://example.com/thank-you"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email when form is submitted
                  </p>
                </div>
                <Switch
                  checked={form.settings.enableNotifications}
                  onCheckedChange={(checked) => onChange({
                    ...form,
                    settings: { ...form.settings, enableNotifications: checked },
                  })}
                />
              </div>
              
              {form.settings.enableNotifications && (
                <div className="space-y-2">
                  <Label>Notification Email</Label>
                  <Input
                    type="email"
                    value={form.settings.notificationEmail || ''}
                    onChange={(e) => onChange({
                      ...form,
                      settings: { ...form.settings, notificationEmail: e.target.value },
                    })}
                    placeholder="notify@example.com"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto-Response</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automatic email to submitter
                  </p>
                </div>
                <Switch
                  checked={form.settings.enableAutoResponse}
                  onCheckedChange={(checked) => onChange({
                    ...form,
                    settings: { ...form.settings, enableAutoResponse: checked },
                  })}
                />
              </div>
              
              {form.settings.enableAutoResponse && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Auto-Response Subject</Label>
                    <Input
                      value={form.settings.autoResponseEmail?.subject || ''}
                      onChange={(e) => onChange({
                        ...form,
                        settings: {
                          ...form.settings,
                          autoResponseEmail: {
                            subject: e.target.value,
                            body: form.settings.autoResponseEmail?.body || '',
                          },
                        },
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Auto-Response Body</Label>
                    <Textarea
                      value={form.settings.autoResponseEmail?.body || ''}
                      onChange={(e) => onChange({
                        ...form,
                        settings: {
                          ...form.settings,
                          autoResponseEmail: {
                            subject: form.settings.autoResponseEmail?.subject || '',
                            body: e.target.value,
                          },
                        },
                      })}
                      rows={5}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logic" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Conditional Logic</h3>
                <Button size="sm" onClick={() => {
                  // TODO: Add conditional logic editor
                  alert('Conditional logic editor coming soon!');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              
              {form.conditionalLogic.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No conditional logic rules yet
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldEditor({
  field,
  index,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  index: number; // Reserved for future drag-and-drop ordering
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
}) {
  // index is reserved for future drag-and-drop functionality
  void index;
  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
    { value: 'date', label: 'Date' },
    { value: 'url', label: 'URL' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <GripVertical className="w-5 h-5 mt-2 text-muted-foreground cursor-move" />
          
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Field Label"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value: FormField['type']) => onUpdate({ type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder="field_name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter text..."
                />
              </div>
            </div>
            
            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div className="space-y-2">
                <Label>Options (one per line)</Label>
                <Textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) => onUpdate({
                    options: e.target.value.split('\n').filter(o => o.trim()),
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
                <Label>Required Field</Label>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FormPreview({
  form,
  websiteId,
  onClose,
}: {
  form: LeadCaptureForm;
  websiteId: string;
  onClose: () => void;
}) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/lead-capture/${websiteId}/forms/${form.id}/html`);
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [form.id, websiteId]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {form.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading preview...</p>
          </div>
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="preview-container"
          />
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

