/**
 * Voice Interface Component
 * Voice-to-website interface with command processing
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface VoiceCommand {
  text: string;
  intent?: {
    action: string;
    target?: string;
    value?: string;
  };
  timestamp: number;
}

export interface VoiceInterfaceProps {
  onCommandProcessed?: (command: VoiceCommand) => void;
  onWebsiteGenerated?: (data: any) => void;
}

export function VoiceInterface({
  onCommandProcessed,
  onWebsiteGenerated,
}: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize Web Speech API (browser-native, no external API needed)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscription(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        if (isListening) {
          // Restart if still listening
          try {
            recognitionInstance.start();
          } catch (e) {
            // Already started or error
          }
        }
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
      toast.success('Listening... Speak your command');
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleProcessCommand = async (text?: string) => {
    const commandText = text || transcription;
    if (!commandText.trim()) {
      toast.error('No command to process');
      return;
    }

    setIsProcessing(true);
    try {
      // Process command via API (local keyword-based processing)
      const response = await fetch('/api/voice/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commandText }),
      });

      const data = await response.json();
      if (data.success) {
        const command: VoiceCommand = {
          text: commandText,
          intent: data.intent,
          timestamp: Date.now(),
        };

        setCommands(prev => [command, ...prev.slice(0, 9)]); // Keep last 10
        setTranscription('');
        toast.success('Command processed successfully');

        if (onCommandProcessed) {
          onCommandProcessed(command);
        }

        if (data.websiteGenerated && onWebsiteGenerated) {
          onWebsiteGenerated(data.websiteData);
        }
      } else {
        toast.error(data.error || 'Failed to process command');
      }
    } catch (error) {
      console.error('Failed to process command:', error);
      toast.error('Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setTranscription('');
    setCommands([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Interface
        </CardTitle>
        <CardDescription>
          Speak commands to control your website builder (Local-only, no external APIs)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isListening ? 'destructive' : 'default'}
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={!recognition || isProcessing}
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
          <Button
            onClick={() => handleProcessCommand()}
            disabled={!transcription.trim() || isProcessing}
            variant="outline"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Process Command'
            )}
          </Button>
        </div>

        {/* Transcription Display */}
        {transcription && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Transcription:</p>
            <p className="text-sm">{transcription}</p>
          </div>
        )}

        {/* Command Examples */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Example Commands:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• "Create a website for a restaurant in New York"</p>
            <p>• "Change the hero title to Welcome"</p>
            <p>• "Add a contact form"</p>
            <p>• "Make the background blue"</p>
            <p>• "Save the website"</p>
          </div>
        </div>

        {/* Recent Commands */}
        {commands.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Recent Commands</p>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {commands.map((cmd, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted rounded text-xs flex items-center justify-between"
                >
                  <span className="flex-1">{cmd.text}</span>
                  {cmd.intent && (
                    <Badge variant="outline" className="ml-2">
                      {cmd.intent.action}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span>
            {isListening ? 'Listening...' : recognition ? 'Ready' : 'Not Available'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

