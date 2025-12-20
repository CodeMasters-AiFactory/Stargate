/**
 * Template Management Component
 * Admin interface for managing brand templates
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Copy, Save, X, Sparkles, Search, ArrowRightLeft, LayoutGrid, List, Eye, CheckCircle2, Download, CheckCircle, XCircle, Check, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { BrandTemplate } from '@/types/templates';
import { FIGMA_CATEGORIES, type FigmaCategory } from '../../../../shared/figmaCategories';

interface Template extends BrandTemplate {
  source?: 'database' | 'library';
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastChecked?: string | null;
}

export function TemplateManagement() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [_selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [_deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'lastChecked'>('name');
  const [templateTypeFilter, setTemplateTypeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [isInjectingDependencies, setIsInjectingDependencies] = useState(false);
  const [dependencyCheckResults, setDependencyCheckResults] = useState<any>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteAllApproved, setDeleteAllApproved] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Template>>({
    id: '',
    name: '',
    brand: '',
    category: 'corporate',
    industry: '',
    thumbnail: '/templates/default.jpg',
    colors: {
      primary: '#000000',
      secondary: '#000000',
      accent: '#000000',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textMuted: '#666666',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: '600',
    },
    layout: {
      heroStyle: 'centered',
      maxWidth: '1200px',
      borderRadius: '8px',
      sections: ['hero', 'features', 'footer'],
    },
    css: '',
    darkMode: false,
    tags: [],
  });

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/templates', {
        credentials: 'include', // Include session cookies for authentication
      });
      const data = await response.json();
      if (data.success) {
        const fetchedTemplates = data.templates || [];
        console.log(`[TemplateManagement] ✅ Loaded ${fetchedTemplates.length} templates from API`);
        console.log(`[TemplateManagement] Templates by source:`, {
          database: fetchedTemplates.filter((t: any) => t.source === 'database').length,
          file: fetchedTemplates.filter((t: any) => t.source === 'file').length,
          library: fetchedTemplates.filter((t: any) => t.source === 'library').length,
        });
        setTemplates(fetchedTemplates);
        applyFilters(fetchedTemplates, categoryFilter, searchQuery, sortBy, templateTypeFilter);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch templates',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[TemplateManagement] Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen for template updates from scraper
  useEffect(() => {
    const handleTemplatesUpdated = () => {
      console.log('[TemplateManagement] Templates updated event received, refreshing...');
      fetchTemplates();
    };
    
    window.addEventListener('templates-updated', handleTemplatesUpdated);
    return () => {
      window.removeEventListener('templates-updated', handleTemplatesUpdated);
    };
  }, []);

  // Check if template was updated in last month
  const isUpdatedRecently = (template: Template): boolean => {
    if (!template.lastChecked) return false;
    const lastChecked = new Date(template.lastChecked);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return lastChecked >= oneMonthAgo;
  };

  // Apply filters and sorting to templates
  const applyFilters = (
    templatesToFilter: Template[], 
    category: string,
    search: string,
    sort: 'name' | 'category' | 'lastChecked',
    templateType: 'all' | 'free' | 'paid'
  ) => {
    let filtered = [...templatesToFilter];
    
    // Filter by template type (Free vs Paid)
    if (templateType === 'free') {
      filtered = filtered.filter(t => !(t as any).isPremium || (t as any).isPremium === false);
    } else if (templateType === 'paid') {
      filtered = filtered.filter(t => (t as any).isPremium === true);
    }
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(t => 
        t.category?.toLowerCase() === category.toLowerCase() ||
        t.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    
      // Search filter (name, brand, category)
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(searchLower) ||
        t.brand?.toLowerCase().includes(searchLower) ||
        t.category?.toLowerCase().includes(searchLower) ||
        t.id?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort templates
    filtered.sort((a, b) => {
      switch (sort) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'lastChecked':
          const aDate = a.lastChecked ? new Date(a.lastChecked).getTime() : 0;
          const bDate = b.lastChecked ? new Date(b.lastChecked).getTime() : 0;
          return bDate - aDate; // Most recent first
        default:
          return 0;
      }
    });
    
    setFilteredTemplates(filtered);
  };

  // Handle double-click to open template preview
  const handleDoubleClick = (template: Template) => {
    const previewUrl = `/api/template-preview/${template.id}`;
    window.open(previewUrl, '_blank', 'width=1400,height=900');
  };

  // Handle category filter change
  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
    applyFilters(templates, category, searchQuery, sortBy, templateTypeFilter);
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(templates, categoryFilter, query, sortBy, templateTypeFilter);
  };

  // Handle sort change
  const handleSortChange = (sort: 'name' | 'category' | 'lastChecked') => {
    setSortBy(sort);
    applyFilters(templates, categoryFilter, searchQuery, sort, templateTypeFilter);
  };

  // Handle template type filter change
  const handleTemplateTypeFilterChange = (type: 'all' | 'design' | 'search') => {
    setTemplateTypeFilter(type);
    applyFilters(templates, categoryFilter, searchQuery, sortBy, type);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    applyFilters(templates, categoryFilter, searchQuery, sortBy, templateTypeFilter);
  }, [templates, categoryFilter, searchQuery, sortBy, templateTypeFilter]);

  // Handle create/update
  const handleSave = async () => {
    try {
      if (!formData.id || !formData.name || !formData.brand || !formData.category) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (ID, Name, Brand, Category)',
          variant: 'destructive',
        });
        return;
      }

      const url = isEditMode
        ? `/api/admin/templates/${formData.id}`
        : '/api/admin/templates';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: isEditMode ? 'Template updated successfully' : 'Template created successfully',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save template',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string, hardDelete = false) => {
    if (isDeleting) {
      console.warn('[TemplateManagement] Delete already in progress, ignoring duplicate request');
      return;
    }

    setIsDeleting(id);
    console.log('[TemplateManagement] Attempting to delete template:', { id, hardDelete });
    
    try {
      const url = `/api/admin/templates/${id}${hardDelete ? '?hardDelete=true' : ''}`;
      console.log('[TemplateManagement] DELETE request URL:', url);
      
      const response = await fetch(url, { 
        method: 'DELETE',
        credentials: 'include', // Include session cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[TemplateManagement] Delete response status:', response.status, response.statusText);
      
      let data;
      try {
        data = await response.json();
        console.log('[TemplateManagement] Delete response data:', data);
      } catch (parseError) {
        console.error('[TemplateManagement] Failed to parse response as JSON:', parseError);
        const text = await response.text();
        console.error('[TemplateManagement] Response text:', text);
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[TemplateManagement] Delete failed:', errorMsg);
        
        // Provide user-friendly error messages
        let userMessage = errorMsg;
        if (response.status === 404) {
          userMessage = 'Template not found in database. It may have already been deleted or is a read-only template.';
        } else if (response.status === 403) {
          userMessage = 'You do not have permission to delete this template.';
        } else if (response.status === 500) {
          userMessage = 'Server error occurred. Please try again or contact support.';
        }
        
        throw new Error(userMessage);
      }

      if (!data.success) {
        const errorMsg = data.error || data.message || 'Delete operation failed';
        console.error('[TemplateManagement] Delete operation unsuccessful:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[TemplateManagement] Delete successful:', data.message);
      toast({
        title: 'Success',
        description: data.message || 'Template deleted successfully',
      });
      
      // Refresh templates list
      await fetchTemplates();
    } catch (error) {
      console.error('[TemplateManagement] Delete error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete template. Please check console for details.';
      
      toast({
        title: 'Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle delete all templates (with approve button requirement)
  const handleDeleteAll = async () => {
    if (!deleteAllApproved) {
      setShowDeleteAllConfirm(true);
      return;
    }

    try {
      setIsDeletingAll(true);
      
      // Get all database template IDs (exclude library templates)
      const databaseTemplates = templates.filter(t => t.source === 'database' || t.source === 'file');
      
      if (databaseTemplates.length === 0) {
        toast({
          title: 'No Templates',
          description: 'No templates to delete',
          variant: 'default',
        });
        setShowDeleteAllConfirm(false);
        setDeleteAllApproved(false);
        return;
      }

      // Delete all templates one by one
      let deleted = 0;
      let failed = 0;

      for (const template of databaseTemplates) {
        try {
          const response = await fetch(`/api/admin/templates/${template.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          const data = await response.json();
          if (data.success) {
            deleted++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`[TemplateManagement] Failed to delete ${template.id}:`, error);
          failed++;
        }
      }

      toast({
        title: 'Delete Complete',
        description: `Deleted ${deleted} templates. ${failed > 0 ? `${failed} failed.` : ''}`,
        variant: deleted > 0 ? 'default' : 'destructive',
      });

      // Reset approval state
      setDeleteAllApproved(false);
      setShowDeleteAllConfirm(false);
      
      // Refresh templates
      await fetchTemplates();
    } catch (error) {
      console.error('[TemplateManagement] Delete all error:', error);
      toast({
        title: 'Delete All Failed',
        description: 'Failed to delete all templates',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async (template: Template) => {
    console.log('[TemplateManagement] Attempting to duplicate template:', template.id);
    
    try {
      const newId = `${template.id}-copy-${Date.now()}`;
      const newName = `${template.name} (Copy)`;

      const response = await fetch(`/api/admin/templates/${template.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include session cookies for authentication
        body: JSON.stringify({ newId, newName }),
      });

      console.log('[TemplateManagement] Duplicate response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('[TemplateManagement] Duplicate response data:', data);
      } catch (parseError) {
        console.error('[TemplateManagement] Failed to parse duplicate response:', parseError);
        const text = await response.text();
        console.error('[TemplateManagement] Response text:', text);
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[TemplateManagement] Duplicate failed:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.success) {
        const errorMsg = data.error || data.message || 'Duplicate operation failed';
        console.error('[TemplateManagement] Duplicate operation unsuccessful:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[TemplateManagement] Duplicate successful');
      toast({
        title: 'Success',
        description: data.message || 'Template duplicated successfully',
      });
      await fetchTemplates();
    } catch (error) {
      console.error('[TemplateManagement] Duplicate error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to duplicate template. Please check console for details.';
      
      toast({
        title: 'Duplicate Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };


  // Open edit dialog
  const openEditDialog = (template: Template) => {
    if (template.source === 'library') {
      toast({
        title: 'Info',
        description: 'Library templates cannot be edited. Create a duplicate to edit.',
      });
      return;
    }

    setSelectedTemplate(template);
    setFormData(template);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsEditMode(false);
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  // Check dependencies for all templates
  const handleCheckDependencies = async () => {
    try {
      setIsCheckingDependencies(true);
      setDependencyCheckResults(null);

      const response = await fetch('/api/templates/check-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setDependencyCheckResults(data.inventory);
        toast({
          title: 'Dependency Check Complete',
          description: `Checked ${data.inventory.checkedTemplates}/${data.inventory.totalTemplates} templates`,
        });
      } else {
        throw new Error(data.error || 'Failed to check dependencies');
      }
    } catch (error) {
      console.error('[TemplateManagement] Dependency check error:', error);
      toast({
        title: 'Check Failed',
        description: error instanceof Error ? error.message : 'Failed to check dependencies',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingDependencies(false);
    }
  };

  // Inject dependencies into all templates
  const handleInjectDependencies = async () => {
    try {
      setIsInjectingDependencies(true);

      // Get all template IDs
      const templateIds = templates
        .filter(t => t.source !== 'library') // Only database templates
        .map(t => t.id);

      if (templateIds.length === 0) {
        toast({
          title: 'No Templates',
          description: 'No templates available to inject dependencies',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/templates/inject-dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ templateIds }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Dependencies Injected',
          description: `Successfully injected dependencies into ${data.injected}/${templateIds.length} templates`,
        });
        // Refresh templates
        await fetchTemplates();
      } else {
        throw new Error(data.error || 'Failed to inject dependencies');
      }
    } catch (error) {
      console.error('[TemplateManagement] Dependency injection error:', error);
      toast({
        title: 'Injection Failed',
        description: error instanceof Error ? error.message : 'Failed to inject dependencies',
        variant: 'destructive',
      });
    } finally {
      setIsInjectingDependencies(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      brand: '',
      category: 'corporate',
      industry: '',
      thumbnail: '/templates/default.jpg',
      colors: {
        primary: '#000000',
        secondary: '#000000',
        accent: '#000000',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        textMuted: '#666666',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        headingWeight: '600',
      },
      layout: {
        heroStyle: 'centered',
        maxWidth: '1200px',
        borderRadius: '8px',
        sections: ['hero', 'features', 'footer'],
      },
      css: '',
      darkMode: false,
      tags: [],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Manage brand templates. Library templates are read-only.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCheckDependencies} 
            disabled={isCheckingDependencies}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <CheckCircle2 className={`w-4 h-4 mr-2 ${isCheckingDependencies ? 'animate-spin' : ''}`} />
            {isCheckingDependencies ? 'Checking...' : 'Check Dependencies'}
          </Button>
          <Button 
            onClick={handleInjectDependencies} 
            disabled={isInjectingDependencies}
            variant="outline"
            className="border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950"
          >
            <Download className={`w-4 h-4 mr-2 ${isInjectingDependencies ? 'animate-spin' : ''}`} />
            {isInjectingDependencies ? 'Injecting...' : 'Inject Dependencies'}
          </Button>
          <Button onClick={openCreateDialog} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Template
          </Button>
          
          {/* DELETE ALL BUTTON - BIG AND PROMINENT */}
          <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-6 py-3 h-auto"
                disabled={isDeletingAll || templates.filter(t => t.source === 'database' || t.source === 'file').length === 0}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {isDeletingAll ? 'Deleting...' : 'DELETE ALL TEMPLATES'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl text-red-600">⚠️ DELETE ALL TEMPLATES</AlertDialogTitle>
                <AlertDialogDescription className="text-base pt-4">
                  This will permanently delete <strong className="text-red-600">{templates.filter(t => t.source === 'database' || t.source === 'file').length} templates</strong> from the database.
                  <br /><br />
                  <strong>This action cannot be undone!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                <AlertDialogCancel 
                  onClick={() => {
                    setShowDeleteAllConfirm(false);
                    setDeleteAllApproved(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </AlertDialogCancel>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {!deleteAllApproved ? (
                    <Button
                      onClick={() => setDeleteAllApproved(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold w-full sm:w-auto"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      APPROVE DELETE
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDeleteAll}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold w-full sm:w-auto"
                      disabled={isDeletingAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeletingAll ? 'DELETING...' : 'CONFIRM DELETE ALL'}
                    </Button>
                  )}
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Templates with Type Tabs */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-700 dark:text-blue-300">Templates ({filteredTemplates.length} of {templates.length})</CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Manage templates by type. Free templates are available to all users, Premium templates require payment.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
              
              {/* Category Filter - Figma Categories */}
              <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FIGMA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value) => handleSortChange(value as 'name' | 'category' | 'lastChecked')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                  <SelectItem value="lastChecked">Sort by Last Updated</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                  title="Grid View (Client View)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          <Tabs value={templateTypeFilter} onValueChange={(value) => handleTemplateTypeFilterChange(value as 'all' | 'free' | 'paid')} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-100 dark:bg-blue-900">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-700 data-[state=active]:text-white"
              >
                All Templates ({templates.length})
              </TabsTrigger>
              <TabsTrigger 
                value="free" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white"
              >
                <Check className="w-4 h-4" />
                Free Templates ({templates.filter(t => !(t as any).isPremium || (t as any).isPremium === false).length})
              </TabsTrigger>
              <TabsTrigger 
                value="paid" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white"
              >
                <Star className="w-4 h-4" />
                Premium Templates ({templates.filter(t => (t as any).isPremium === true).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={templateTypeFilter} className="mt-4">
          {/* Grid View (Client-like cards) */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {templates.length === 0 
                    ? 'No templates found' 
                    : `No templates found for the selected filters`}
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isDesignTemplate = (template as any).isDesignQuality === true;
                  const isActive = template.isActive !== false;
                  
                  return (
                    <Card 
                      key={template.id}
                      className={`group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                        isDesignTemplate 
                          ? "border-purple-500/30 hover:border-purple-500/60" 
                          : "border-blue-500/30 hover:border-blue-500/60"
                      }`}
                      onDoubleClick={() => handleDoubleClick(template)}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-t-lg">
                        {template.thumbnail ? (
                          <img 
                            src={template.thumbnail} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-template.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <LayoutGrid className="w-12 h-12 opacity-30" />
                          </div>
                        )}
                        
                        {/* Overlay with preview button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDoubleClick(template);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                        
                        {/* Status badge */}
                        {isActive && (
                          <div className="absolute top-2 left-2">
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                color: '#00ff88',
                                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                                border: '1px solid #00ff88',
                                boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                              }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full inline-block animate-pulse"
                                style={{ backgroundColor: '#00ff88' }}
                              />
                              ONLINE
                            </span>
                          </div>
                        )}
                        
                        {/* Type badge */}
                        <div className="absolute top-2 right-2">
                          {isDesignTemplate ? (
                            <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Design
                            </Badge>
                          ) : (
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs">
                              <Search className="w-3 h-3 mr-1" />
                              Top Search
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm truncate mb-1">{template.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">by {template.brand || 'Unknown'}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(template);
                              }}
                              title="Duplicate"
                              className="h-7 w-7 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            {template.source === 'database' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(template);
                                }}
                                title="Edit"
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* List View (Table) */}
          {viewMode === 'list' && (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {templates.length === 0 
                        ? 'No templates found' 
                        : `No templates found`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => {
                    const isActive = template.isActive !== false;
                    const isDeleted = template.isActive === false;
                    const isDesignTemplate = (template as any).isDesignQuality === true;
                    
                    const recentlyUpdated = isUpdatedRecently(template);
                    const lastCheckedDate = template.lastChecked 
                      ? new Date(template.lastChecked).toLocaleDateString() 
                      : 'Never';
                    
                    return (
                    <TableRow 
                      key={template.id}
                      onDoubleClick={() => handleDoubleClick(template)}
                      className={`cursor-pointer ${
                        isDesignTemplate 
                          ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border-l-4 border-purple-500/50 transition-colors" 
                          : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-l-4 border-blue-500/50 transition-colors"
                      }`}
                      title="Double-click to preview template"
                    >
                      <TableCell className="font-mono text-xs">{template.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{template.name}</span>
                          {isActive && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                color: '#00ff88',
                                textShadow: '0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88',
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid #00ff88',
                                boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                              }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full inline-block animate-pulse"
                                style={{
                                  backgroundColor: '#00ff88',
                                  boxShadow: '0 0 10px #00ff88, 0 0 20px #00ff88',
                                }}
                              />
                              ONLINE
                            </span>
                          )}
                          {isDeleted && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                color: '#ff00ff',
                                textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff',
                                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                                border: '1px solid #ff00ff',
                                boxShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
                              }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full inline-block"
                                style={{
                                  backgroundColor: '#ff00ff',
                                  boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
                                }}
                              />
                              DELETED
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{template.brand}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={template.source === 'database' ? 'default' : 'secondary'}>
                            {template.source || 'library'}
                          </Badge>
                          {(template as any).isDesignQuality ? (
                            <Badge 
                              variant="outline" 
                              className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-purple-300 border-purple-400/50 text-xs font-semibold shadow-lg shadow-purple-500/20"
                            >
                              <Sparkles className="w-3 h-3 mr-1 text-purple-300" />
                              Design
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/50 text-xs font-semibold shadow-lg shadow-blue-500/20"
                            >
                              <Search className="w-3 h-3 mr-1 text-blue-300" />
                              Top Search
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground">{lastCheckedDate}</span>
                          {recentlyUpdated ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              Updated Recently
                            </Badge>
                          ) : template.lastChecked ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                              Needs Update
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                              Never Checked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {(template as any).isApproved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending Approval
                            </Badge>
                          )}
                          {template.isActive !== false ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            Active
                          </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(template)}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {/* Approve/Disapprove Buttons */}
                          {template.source === 'database' && (
                            <>
                              {!(template as any).isApproved ? (
                            <Button
                              variant="outline"
                              size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/admin/templates/${template.id}/approve`, {
                                        method: 'POST',
                                        credentials: 'include',
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        toast({
                                          title: 'Success',
                                          description: 'Template approved',
                                        });
                                        await fetchTemplates();
                                      } else {
                                        toast({
                                          title: 'Error',
                                          description: data.error || 'Failed to approve template',
                                          variant: 'destructive',
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to approve template',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  title="Approve Template"
                            >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/admin/templates/${template.id}/disapprove`, {
                                        method: 'POST',
                                        credentials: 'include',
                                      });
                                      const data = await response.json();
                                      if (data.success) {
                                        toast({
                                          title: 'Success',
                                          description: 'Template disapproved',
                                        });
                                        await fetchTemplates();
                                      } else {
                                        toast({
                                          title: 'Error',
                                          description: data.error || 'Failed to disapprove template',
                                          variant: 'destructive',
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to disapprove template',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                  title="Disapprove Template"
                                >
                                  <XCircle className="w-4 h-4" />
                            </Button>
                              )}
                            </>
                          )}
                          {(template.source === 'database' || template.source === 'library') && (
                            <>
                              {template.source === 'database' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(template)}
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                      <span className="block mt-2 text-sm text-muted-foreground">
                                        Template ID: <code className="text-xs">{template.id}</code>
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isDeleting === template.id}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={async () => {
                                        await handleDelete(template.id, false);
                                      }}
                                      disabled={isDeleting === template.id}
                                      className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
                                    >
                                      {isDeleting === template.id ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update template details. Changes will be saved to the database.'
                : 'Create a new brand template. All fields are required.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Template ID *</label>
              <Input
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="unique-template-id"
                disabled={isEditMode}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brand *</label>
              <Input
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Brand Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category (Figma Style) *</label>
              <Select
                value={formData.category || 'web-design'}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FIGMA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} - {cat.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Premium/Free Toggle */}
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Template Type
                {(formData as any).isPremium ? (
                  <Badge className="bg-yellow-500 text-white">PREMIUM</Badge>
                ) : (
                  <Badge className="bg-green-500 text-white">FREE</Badge>
                )}
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData as any).isPremium || false}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isPremium: e.target.checked,
                      price: e.target.checked ? (formData as any).price || '9.99' : null
                    })}
                    className="w-4 h-4"
                  />
                  <span>Premium Template (Requires Payment)</span>
                </label>
              </div>
              {(formData as any).isPremium && (
              <Input
                  type="text"
                  value={(formData as any).price || '9.99'}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Price (e.g., 9.99)"
                  className="mt-2"
              />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Thumbnail URL</label>
              <Input
                value={formData.thumbnail || ''}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="/templates/default.jpg"
              />
            </div>

            {/* CSS */}
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">CSS *</label>
              <Textarea
                value={formData.css || ''}
                onChange={(e) => setFormData({ ...formData, css: e.target.value })}
                placeholder="/* Your CSS here */"
                rows={10}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

