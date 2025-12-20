/**
 * Final Approval - Phase 8
 * Final review and download/deploy options
 * 
 * Features:
 * - Summary of website
 * - SEO score display
 * - Download as ZIP
 * - Deploy options
 * - Share preview link
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Download,
  Rocket,
  Share2,
  ChevronLeft,
  Sparkles,
  Globe,
  FileText,
  BarChart3,
  Check,
  Loader2,
} from 'lucide-react';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

interface GeneratedWebsite {
  html: string;
  css: string;
  js?: string;
}

interface FinalApprovalProps {
  website: GeneratedWebsite;
  requirements: WebsiteRequirements;
  seoScore: number;
  onDownload: () => void;
  onDeploy: () => void;
  onBack?: () => void;
}

export function FinalApproval({
  website,
  requirements,
  seoScore,
  onDownload,
  onDeploy,
  onBack,
}: FinalApprovalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a zip-like download
    const blob = new Blob([
      website.html + '\n\n/* CSS */\n' + website.css
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${requirements.businessName?.replace(/\s+/g, '-').toLowerCase() || 'website'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsDownloading(false);
    onDownload();
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deploy
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    onDeploy();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://preview.stargate.io/${requirements.businessName?.replace(/\s+/g, '-').toLowerCase() || 'website'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Your Website is Ready!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Congratulations! Download or deploy your website.
            </p>
          </div>
          
          <Badge className="bg-green-600 text-lg px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Complete
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {requirements.businessName || 'Your Website'}
                  </h2>
                  <p className="text-slate-300 mb-4">
                    {requirements.projectOverview || `A beautiful ${requirements.industry || 'professional'} website.`}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300">SEO Score: </span>
                      <span className={`font-bold ${seoScore >= 90 ? 'text-green-400' : seoScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {seoScore}/100
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-300">{requirements.industry || 'Business'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span className="text-slate-300">Responsive Design</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Website Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] rounded-b-lg overflow-hidden bg-white">
                <iframe
                  srcDoc={website.html + (website.css ? `<style>${website.css}</style>` : '')}
                  className="w-full h-full border-0"
                  title="Final Website Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Download */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={handleDownload}>
              <CardContent className="p-6 text-center">
                {isDownloading ? (
                  <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                ) : (
                  <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">Download</h3>
                <p className="text-sm text-slate-400">Get your website files</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-500" disabled={isDownloading}>
                  {isDownloading ? 'Downloading...' : 'Download ZIP'}
                </Button>
              </CardContent>
            </Card>

            {/* Deploy */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                {isDeploying ? (
                  <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
                ) : (
                  <Rocket className="w-12 h-12 text-green-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">Deploy</h3>
                <p className="text-sm text-slate-400">Publish to the web</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-500" onClick={handleDeploy} disabled={isDeploying}>
                  {isDeploying ? 'Deploying...' : 'Deploy Now'}
                </Button>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                {copied ? (
                  <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                ) : (
                  <Share2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-semibold text-white mb-2">Share</h3>
                <p className="text-sm text-slate-400">Get preview link</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-500" onClick={handleCopyLink}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="text-green-400">🎉 Your website is complete and ready to use!</span>
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to SEO
              </Button>
            )}
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Another Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalApproval;

