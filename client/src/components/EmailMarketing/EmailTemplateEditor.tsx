/**
 * Email Template Editor Component
 * Phase 2.3: Drag-and-drop email editor for creating email campaigns
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
}

export function EmailTemplateEditor({ content, onChange, onSave }: EmailTemplateEditorProps) {
  const [previewMode, setPreviewMode] = useState<'visual' | 'html'>('visual');
  const { toast } = useToast();

  const handleSave = () => {
    onSave?.();
    toast({
      title: 'Saved',
      description: 'Email template saved successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Email Editor</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={previewMode === 'visual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('visual')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visual
            </Button>
            <Button
              variant={previewMode === 'html' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('html')}
            >
              <Code className="w-4 h-4 mr-2" />
              HTML
            </Button>
            {onSave && (
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'visual' | 'html')}>
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="html">HTML Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-4">
            <div className="space-y-4">
              <Label>Email Content</Label>
              <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                rows={20}
                placeholder="Enter your email content here... HTML supported."
                className="font-mono text-sm"
              />
              <div className="p-4 border rounded-lg bg-muted/50">
                <Label className="mb-2 block">Preview</Label>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="html" className="mt-4">
            <div className="space-y-2">
              <Label>HTML Source</Label>
              <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                rows={25}
                placeholder="Enter HTML content..."
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

