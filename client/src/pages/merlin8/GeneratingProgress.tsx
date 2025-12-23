/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - GENERATING PROGRESS SCREEN
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Shows real-time progress while Merlin generates the website.
 * Uses Server-Sent Events (SSE) for live updates.
 * 
 * ENHANCED: Full task-by-task checklist with detailed status
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Sparkles, Image, Code, CheckCircle, Loader2, 
  ExternalLink, AlertCircle, RefreshCw, FileCode,
  Palette, Download, Wand2, Layout, Save, Check
} from 'lucide-react';

interface ProgressUpdate {
  phase: number;
  totalPhases: number;
  phaseName: string;
  message: string;
  progress: number;
}

interface GenerationResult {
  success: boolean;
  projectSlug: string;
  previewUrl: string;
  industry: { id: string; name: string };
  imagesGenerated: number;
  duration: number;
  errors: string[];
}

// All generation tasks for the checklist
const GENERATION_TASKS = [
  { id: 1, name: 'Analyzing your business details', icon: Sparkles, phase: 1 },
  { id: 2, name: 'Loading industry design profile', icon: Palette, phase: 2 },
  { id: 3, name: 'Preparing content and copy', icon: FileCode, phase: 3 },
  { id: 4, name: 'Generating hero image (Leonardo AI)', icon: Image, phase: 4, isImage: true },
  { id: 5, name: 'Generating services image', icon: Image, phase: 4, isImage: true },
  { id: 6, name: 'Generating about image', icon: Image, phase: 4, isImage: true },
  { id: 7, name: 'Generating team image', icon: Image, phase: 4, isImage: true },
  { id: 8, name: 'Downloading AI images', icon: Download, phase: 5 },
  { id: 9, name: 'Building HTML structure', icon: Layout, phase: 6 },
  { id: 10, name: 'Applying professional styling', icon: Code, phase: 6 },
  { id: 11, name: 'Optimizing for mobile', icon: Wand2, phase: 6 },
  { id: 12, name: 'Saving files to server', icon: Save, phase: 7 },
  { id: 13, name: 'Final quality check', icon: CheckCircle, phase: 8 },
];

export default function GeneratingProgress() {
  const [location, setLocation] = useLocation();
  const [intakeData, setIntakeData] = useState<any>(null);
  
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  // Timer for elapsed time
  useEffect(() => {
    if (startTime && !result && !error) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, result, error]);

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('merlin8-intake');
    if (storedData) {
      setIntakeData(JSON.parse(storedData));
    } else {
      setLocation('/merlin8');
    }
  }, [setLocation]);

  // Start generation when data is loaded
  useEffect(() => {
    if (!intakeData || isGenerating) return;
    
    setIsGenerating(true);
    setStartTime(Date.now());
    startGeneration();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [intakeData]);

  const startGeneration = async () => {
    try {
      const response = await fetch('/api/merlin8/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeData),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                setProgress(data);
              } else if (data.type === 'complete') {
                setResult(data);
                setProgress(null);
              } else if (data.type === 'error') {
                setError(data.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleRetry = () => {
    setError(null);
    setResult(null);
    setProgress(null);
    setIsGenerating(false);
    setStartTime(null);
    setElapsedTime(0);
    setTimeout(() => setIsGenerating(true), 100);
  };

  const handleViewWebsite = () => {
    if (result?.previewUrl) {
      window.open(result.previewUrl, '_blank');
    }
  };

  const handleEditWebsite = () => {
    if (result?.projectSlug) {
      setLocation(`/editor/${result.projectSlug}`);
    }
  };

  // Get task status based on current phase
  const getTaskStatus = (task: typeof GENERATION_TASKS[0]) => {
    const currentPhase = progress?.phase || (result ? 9 : 0);
    if (task.phase < currentPhase) return 'complete';
    if (task.phase === currentPhase) return 'active';
    return 'pending';
  };

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className={`absolute inset-0 bg-purple-500/20 rounded-full blur-3xl ${!result && !error ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      <div className="relative z-10 max-w-3xl w-full">
        {/* Error State */}
        {error && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setLocation('/merlin8')}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {result && !error && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Website Created!</h2>
            <p className="text-slate-400 mb-2">
              Your {result.industry?.name} website is ready
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Generated {result.imagesGenerated} AI images in {(result.duration / 1000).toFixed(1)}s
            </p>

            {/* Preview Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4">
                <iframe
                  src={result.previewUrl}
                  className="w-full h-full border-0"
                  title="Website Preview"
                />
              </div>
              <p className="text-slate-400 text-sm">
                {result.previewUrl}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleViewWebsite}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View Full Screen</span>
              </button>
              <button
                onClick={handleEditWebsite}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                <span>Edit Website</span>
              </button>
            </div>

            {/* Create Another */}
            <button
              onClick={() => setLocation('/merlin8')}
              className="mt-6 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Create Another Website
            </button>
          </div>
        )}

        {/* Generating State - ENHANCED with task checklist */}
        {!result && !error && (
          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-4">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Building {intakeData?.businessName || 'your website'}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {progress?.phaseName || 'Initializing...'}
              </h2>
              <p className="text-slate-400">
                {progress?.message || 'Preparing to generate your website'}
              </p>
            </div>

            {/* Progress Bar with Time */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progress</span>
                <span className="text-purple-400 font-medium">
                  {formatTime(elapsedTime)} elapsed
                </span>
              </div>
              <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-500 bg-[length:200%_100%] animate-shimmer"
                  style={{ width: `${progress?.progress || 5}%` }}
                />
              </div>
              <div className="text-right text-sm text-slate-500 mt-1">
                {progress?.progress || 0}% complete
              </div>
            </div>

            {/* Task Checklist - The main enhancement! */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                Generation Tasks
              </h3>
              
              <div className="space-y-3">
                {GENERATION_TASKS.map((task) => {
                  const status = getTaskStatus(task);
                  const Icon = task.icon;
                  
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        status === 'active' ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      {/* Status Icon */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        status === 'complete' 
                          ? 'bg-green-500/20' 
                          : status === 'active'
                            ? 'bg-purple-500/20'
                            : 'bg-slate-700/50'
                      }`}>
                        {status === 'complete' ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : status === 'active' ? (
                          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        ) : (
                          <div className="w-2 h-2 bg-slate-600 rounded-full" />
                        )}
                      </div>
                      
                      {/* Task Icon & Name */}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        status === 'complete' 
                          ? 'text-green-400' 
                          : status === 'active'
                            ? 'text-purple-400'
                            : 'text-slate-600'
                      }`} />
                      
                      <span className={`text-sm ${
                        status === 'complete' 
                          ? 'text-slate-300' 
                          : status === 'active'
                            ? 'text-white font-medium'
                            : 'text-slate-500'
                      }`}>
                        {task.name}
                        {status === 'active' && task.isImage && (
                          <span className="text-purple-400 ml-2">~8-12s</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fun Fact */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-slate-400 text-sm text-center">
                💡 <span className="text-purple-300">Fun fact:</span> Merlin uses Leonardo AI to generate 
                unique, royalty-free images specifically designed for your industry. 
                No generic stock photos!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom animation for progress bar shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
