/**
 * Visual Scraper Builder Component
 * 
 * No-code visual scraper creation:
 * - Point-and-click interface
 * - Record user actions
 * - Generate scraper from recording
 * - Export as code
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecordedAction {
  id: string;
  type: 'click' | 'type' | 'select' | 'extract';
  selector: string;
  value?: string;
  timestamp: Date;
}

export function VisualScraperBuilder() {
  const [isRecording, setIsRecording] = useState(false);
  const [actions, setActions] = useState<RecordedAction[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const startRecording = () => {
    setIsRecording(true);
    setActions([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const addAction = (action: Omit<RecordedAction, 'id' | 'timestamp'>) => {
    if (!isRecording) return;

    const newAction: RecordedAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
    };

    setActions(prev => [...prev, newAction]);
  };

  const generateScraperCode = () => {
    const code = `// Generated Scraper Code
const scraper = {
  url: '${selectedElement || 'TARGET_URL'}',
  actions: [
${actions.map(action => `    { type: '${action.type}', selector: '${action.selector}', value: '${action.value || ''}' },`).join('\n')}
  ],
};

// Execute scraper
async function executeScraper() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(scraper.url);
  
  for (const action of scraper.actions) {
    switch (action.type) {
      case 'click':
        await page.click(action.selector);
        break;
      case 'type':
        await page.type(action.selector, action.value || '');
        break;
      case 'select':
        await page.select(action.selector, action.value || '');
        break;
      case 'extract':
        const data = await page.evaluate((sel) => {
          return document.querySelector(sel)?.textContent;
        }, action.selector);
        console.log('Extracted:', data);
        break;
    }
  }
  
  await browser.close();
}`;

    return code;
  };

  const exportCode = () => {
    const code = generateScraperCode();
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scraper.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visual Scraper Builder</CardTitle>
          <CardDescription>
            Record your actions to create a scraper automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {!isRecording ? (
              <Button onClick={startRecording} variant="default">
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                Stop Recording
              </Button>
            )}
            {actions.length > 0 && (
              <>
                <Button onClick={exportCode} variant="outline">
                  Export Code
                </Button>
                <Button
                  onClick={() => setActions([])}
                  variant="outline"
                >
                  Clear Actions
                </Button>
              </>
            )}
          </div>

          {isRecording && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <Badge variant="destructive">Recording...</Badge>
              <p className="text-sm text-gray-600 mt-2">
                Click elements, type text, or select options to record actions
              </p>
            </div>
          )}

          {actions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">
                Recorded Actions ({actions.length})
              </h3>
              <ScrollArea className="h-48 border rounded p-2">
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div
                      key={action.id}
                      className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded"
                    >
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-mono text-xs">{action.type}</span>
                      <span className="text-gray-600">{action.selector}</span>
                      {action.value && (
                        <span className="text-gray-500">= {action.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="border rounded p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              {isRecording
                ? 'Recording mode active. Interact with the page to record actions.'
                : 'Click "Start Recording" to begin creating your scraper.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

