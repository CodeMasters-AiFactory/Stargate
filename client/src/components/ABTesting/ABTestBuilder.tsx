/**
 * A/B Test Builder
 * Visual builder for creating A/B tests
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Plus, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ABTestVariation {
  id: string;
  name: string;
  html: string;
  css?: string;
  description: string;
  hypothesis: string;
}

export interface ABTestBuilderProps {
  websiteId?: string;
  elementSelector?: string;
  originalHtml?: string;
  onTestCreated?: (testId: string) => void;
}

export function ABTestBuilder({
  websiteId,
  elementSelector: initialSelector,
  originalHtml,
  onTestCreated,
}: ABTestBuilderProps) {
  const [testName, setTestName] = useState('');
  const [elementSelector, setElementSelector] = useState(initialSelector || '');
  const [variations, setVariations] = useState<ABTestVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGenerateVariations = async () => {
    if (!elementSelector || !originalHtml) {
      toast.error('Element selector and original HTML are required');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ab-testing/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalHtml,
          elementSelector,
          clientInfo: {
            businessName: 'Your Business',
            industry: 'technology',
          },
          variationCount: 3,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVariations(data.variations || []);
        toast.success(`Generated ${data.variations?.length || 0} variations`);
      } else {
        toast.error(data.error || 'Failed to generate variations');
      }
    } catch (error) {
      console.error('Failed to generate variations:', error);
      toast.error('Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartTest = async () => {
    if (!testName || !elementSelector || !originalHtml || variations.length === 0) {
      toast.error('Please fill in all fields and generate variations');
      return;
    }

    setIsStarting(true);
    try {
      const response = await fetch('/api/ab-testing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testName,
          elementSelector,
          originalHtml,
          variations,
          clientInfo: {
            businessName: 'Your Business',
            industry: 'technology',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('A/B test started successfully');
        setOpen(false);
        if (onTestCreated) {
          onTestCreated(data.test.id);
        }
        // Reset form
        setTestName('');
        setElementSelector(initialSelector || '');
        setVariations([]);
      } else {
        toast.error(data.error || 'Failed to start test');
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to start test');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Create A/B Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create A/B Test</DialogTitle>
          <DialogDescription>
            Generate variations and test different versions of your website elements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Test Name */}
          <div className="space-y-2">
            <Label htmlFor="test-name">Test Name</Label>
            <Input
              id="test-name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., Hero CTA Button Test"
            />
          </div>

          {/* Element Selector */}
          <div className="space-y-2">
            <Label htmlFor="element-selector">Element Selector</Label>
            <Input
              id="element-selector"
              value={elementSelector}
              onChange={(e) => setElementSelector(e.target.value)}
              placeholder="e.g., .hero-cta, #main-button, h1"
            />
            <p className="text-xs text-muted-foreground">
              CSS selector for the element you want to test
            </p>
          </div>

          {/* Generate Variations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Variations</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateVariations}
                disabled={isGenerating || !elementSelector || !originalHtml}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Variations'}
              </Button>
            </div>

            {variations.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No variations yet. Click "Generate Variations" to create test variants.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {variations.map((variation, index) => (
                  <Card key={variation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Variation {index + 1}: {variation.name}
                        </CardTitle>
                        <Badge variant="outline">AI Generated</Badge>
                      </div>
                      <CardDescription>{variation.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs">Hypothesis</Label>
                        <p className="text-sm text-muted-foreground">{variation.hypothesis}</p>
                      </div>
                      <div className="p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-32">
                        {variation.html.substring(0, 200)}...
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStartTest}
            disabled={!testName || !elementSelector || variations.length === 0 || isStarting}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            {isStarting ? 'Starting...' : 'Start Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

