/**
 * Template Fine-Tuning Studio
 * Detailed editing of verified templates - rewrite sections, reimage specific images
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Search,
  CheckCircle2,
  Image,
  FileText,
  RefreshCw,
  Upload,
  Edit3,
  ChevronRight,
  Wand2,
  ImagePlus,
  Building2,
  Filter,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VerifiedTemplate {
  id: string;
  name: string;
  industry?: string;
  contentRewritten: boolean;
  imagesRegenerated: boolean;
  seoEvaluated: boolean;
  verified: boolean;
  manualEdits: number;
  customImages: number;
  lastUpdated?: string;
}

interface TemplateImage {
  id: string;
  src: string;
  alt: string;
  selector: string;
  isPlaceholder: boolean;
}

interface TemplateSection {
  id: string;
  tag: string;
  text: string;
  fullText: string;
  selector: string;
}

interface TemplateDetails {
  id: string;
  name: string;
  industry?: string;
  images: TemplateImage[];
  sections: TemplateSection[];
  totalImages: number;
  totalSections: number;
  htmlContent?: string;
}

export function TemplateFineTuning() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<VerifiedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  
  // Get unique industries from templates
  const industries = React.useMemo(() => {
    const industrySet = new Set(templates.map(t => t.industry || 'Unknown').filter(Boolean));
    return ['all', ...Array.from(industrySet).sort()];
  }, [templates]);
  
  // Editor state
  const [selectedTemplate, setSelectedTemplate] = useState<VerifiedTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<TemplateDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Edit dialogs
  const [editingSection, setEditingSection] = useState<TemplateSection | null>(null);
  const [editingSectionText, setEditingSectionText] = useState('');
  const [reimagingImage, setReimagingImage] = useState<TemplateImage | null>(null);
  const [reimagePrompt, setReimagePrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchVerifiedTemplates();
  }, []);

  const fetchVerifiedTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates/qa/verified-list', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('[FineTuning] Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch templates', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateDetails = async (template: VerifiedTemplate) => {
    try {
      setLoadingDetails(true);
      setSelectedTemplate(template);
      const response = await fetch(`/api/admin/templates/qa/details/${template.id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setTemplateDetails(data.template);
        setShowPreview(true); // Auto-show website preview when template loads
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to load template details', variant: 'destructive' });
      }
    } catch (error) {
      console.error('[FineTuning] Error loading details:', error);
      toast({ title: 'Error', description: 'Failed to load template details', variant: 'destructive' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRewriteSection = async () => {
    if (!editingSection || !selectedTemplate) return;
    
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/templates/qa/rewrite-section/${selectedTemplate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sectionId: editingSection.id,
          selector: editingSection.selector,
          newText: editingSectionText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Section Updated', description: 'Content has been saved' });
        setEditingSection(null);
        // Refresh details
        fetchTemplateDetails(selectedTemplate);
        fetchVerifiedTemplates();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update section', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleReimageImage = async () => {
    if (!reimagingImage || !selectedTemplate) return;
    
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/templates/qa/reimage-single/${selectedTemplate.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageId: reimagingImage.id,
          selector: reimagingImage.selector,
          prompt: reimagePrompt || reimagingImage.alt,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Image Regenerated', description: `Using ${data.method}` });
        setReimagingImage(null);
        setReimagePrompt('');
        // Refresh details
        fetchTemplateDetails(selectedTemplate);
        fetchVerifiedTemplates();
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to regenerate image', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadImage = async (image: TemplateImage, file: File) => {
    if (!selectedTemplate) return;

    try {
      setProcessing(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch(`/api/admin/templates/qa/upload-image/${selectedTemplate.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            selector: image.selector,
            imageBase64: base64,
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Image Uploaded', description: 'Custom image has been saved' });
          fetchTemplateDetails(selectedTemplate);
          fetchVerifiedTemplates();
        } else {
          toast({ title: 'Error', description: data.error, variant: 'destructive' });
        }
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
      setProcessing(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || (t.industry || 'Unknown') === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900 -m-6 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">🎨 Template Fine-Tuning Studio</h2>
          <p className="text-blue-600 dark:text-blue-400">
            Double-click a template to edit individual images and content sections
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVerifiedTemplates} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Verified Templates</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{templates.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-300 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Manual Edits</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {templates.reduce((sum, t) => sum + (t.manualEdits || 0), 0)}
                </p>
              </div>
              <Edit3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-300 dark:border-orange-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Custom Images</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {templates.reduce((sum, t) => sum + (t.customImages || 0), 0)}
                </p>
              </div>
              <ImagePlus className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Template List */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Verified Templates ({templates.length})
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Click to select, double-click to edit
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Industry Filter - Large & Prominent */}
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg border-2 border-orange-400/50 shadow-lg">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-orange-400" />
                  <span className="text-orange-300 font-bold text-lg">Filter by Industry:</span>
                </div>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[280px] h-12 bg-orange-950/50 border-2 border-orange-400/50 text-orange-200 text-base font-medium hover:bg-orange-900/50 transition-colors">
                    <Filter className="w-5 h-5 mr-2 text-orange-400" />
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-orange-950 border-orange-400/50">
                    {industries.map((industry) => {
                      const count = industry === 'all' 
                        ? templates.length 
                        : templates.filter(t => (t.industry || 'Unknown') === industry).length;
                      return (
                        <SelectItem 
                          key={industry} 
                          value={industry}
                          className="text-orange-200 text-base py-2 focus:bg-orange-500/30 focus:text-orange-100"
                        >
                          {industry === 'all' 
                            ? `📋 All Industries (${count} templates)` 
                            : `🏢 ${industry} (${count})`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="bg-orange-500/30 text-orange-200 border-orange-400/50 text-sm px-3 py-1">
                  Showing {filteredTemplates.length} of {templates.length} templates
                </Badge>
                <Badge variant="outline" className="bg-purple-500/30 text-purple-200 border-purple-400/50 text-sm px-3 py-1">
                  {industries.length - 1} Industries
                </Badge>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No verified templates found
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-100 dark:bg-blue-800/50 border-blue-400'
                        : 'bg-white dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                    onDoubleClick={() => fetchTemplateDetails(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-sm font-bold text-cyan-300">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                              {template.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                ✓ Rewritten
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                ✓ Reimaged
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                ✓ SEO
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                ✓ Verified
                              </Badge>
                            </div>
                            {(template.manualEdits > 0 || template.customImages > 0) && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                {template.manualEdits > 0 && <span>📝 {template.manualEdits} edits</span>}
                                {template.customImages > 0 && <span>🖼️ {template.customImages} custom</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      <ChevronRight className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Template Editor */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
          <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Edit3 className="w-5 h-5 text-purple-500" />
                  {templateDetails ? `Editing: ${templateDetails.name}` : 'Template Editor'}
                </CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-400 mt-1">
                  {templateDetails 
                    ? `${templateDetails.totalImages} images, ${templateDetails.totalSections} sections`
                    : 'Double-click a template to load its contents'}
                </CardDescription>
              </div>
              {templateDetails && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant={showPreview ? "default" : "outline"}
                    onClick={() => setShowPreview(!showPreview)}
                    className={showPreview ? "bg-cyan-600 hover:bg-cyan-700" : "border-cyan-500/50 text-cyan-600"}
                  >
                    <Eye className="w-4 h-4 mr-1" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingDetails ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <p>Loading template...</p>
              </div>
            ) : !templateDetails ? (
              <div className="text-center py-12 text-muted-foreground">
                <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a template and double-click to edit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Editing Sections */}
                <div className={showPreview ? "max-h-[200px] overflow-y-auto" : "max-h-[500px] overflow-y-auto"}>
                {/* Images Section */}
                <div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Images ({templateDetails.images.length})
                  </h3>
                  <div className="space-y-2">
                    {templateDetails.images.slice(0, 10).map((img) => (
                      <div key={img.id} className="flex items-center gap-3 p-2 bg-white dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{img.alt || 'No alt text'}</p>
                          <p className="text-xs text-muted-foreground truncate">{img.src.substring(0, 50)}...</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { setReimagingImage(img); setReimagePrompt(img.alt); }}
                          >
                            <Wand2 className="w-3 h-3" />
                          </Button>
                          <label>
                            <Button size="sm" variant="outline" asChild>
                              <span><Upload className="w-3 h-3" /></span>
                            </Button>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => e.target.files?.[0] && handleUploadImage(img, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                    {templateDetails.images.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{templateDetails.images.length - 10} more images
                      </p>
                    )}
                  </div>
                </div>

                {/* Content Sections */}
                <div>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content Sections ({templateDetails.sections.length})
                  </h3>
                  <div className="space-y-2">
                    {templateDetails.sections.slice(0, 15).map((section) => (
                      <div key={section.id} className="flex items-center gap-3 p-2 bg-white dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                        <Badge variant="outline" className="text-xs uppercase">
                          {section.tag}
                        </Badge>
                        <p className="flex-1 text-sm truncate">{section.text}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => { setEditingSection(section); setEditingSectionText(section.fullText); }}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {templateDetails.sections.length > 15 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{templateDetails.sections.length - 15} more sections
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Website Preview - At Bottom */}
                {templateDetails.htmlContent && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Website Preview
                    </h3>
                    <div className="border-2 border-cyan-500/50 rounded-lg overflow-hidden bg-white" style={{ height: '450px' }}>
                      <iframe
                        srcDoc={templateDetails.htmlContent}
                        className="w-full h-full border-0"
                        title="Website Preview"
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Content Section
            </DialogTitle>
            <DialogDescription>
              Modify the text content. Changes will be saved to the template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2 uppercase">{editingSection?.tag}</Badge>
            </div>
            <Textarea
              value={editingSectionText}
              onChange={(e) => setEditingSectionText(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button onClick={handleRewriteSection} disabled={processing}>
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reimage Dialog */}
      <Dialog open={!!reimagingImage} onOpenChange={() => setReimagingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Regenerate Image
            </DialogTitle>
            <DialogDescription>
              Enter a prompt to generate a new image, or leave blank to use the alt text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reimagingImage && (
              <img 
                src={reimagingImage.src} 
                alt={reimagingImage.alt}
                className="w-full h-40 object-cover rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x160'; }}
              />
            )}
            <Input
              placeholder="Image prompt (e.g., 'Modern office building at sunset')"
              value={reimagePrompt}
              onChange={(e) => setReimagePrompt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReimagingImage(null)}>Cancel</Button>
            <Button onClick={handleReimageImage} disabled={processing}>
              {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Generate New Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

