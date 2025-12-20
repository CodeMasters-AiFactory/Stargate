/**
 * Template Library Component
 * Browse and select from pre-built website templates
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Star, Eye, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string[];
  previewImage: string;
  thumbnail: string;
  pages: string[];
  features: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  price: 'free' | 'premium';
  popularity: number;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId?: string;
}

export function TemplateLibrary({ onSelectTemplate, selectedTemplateId }: TemplateLibraryProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
    fetchTemplates(1);
  }, [categoryFilter, industryFilter, searchQuery]);

  const fetchTemplates = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (industryFilter !== 'all') params.append('industry', industryFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('pageSize', '20');

      const response = await fetch(`/api/templates?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTemplates(result.templates);
        if (result.pagination) {
          setCurrentPage(result.pagination.page);
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.totalCount);
        }
      }
    } catch (error) {
      // Use mock data for development
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    toast({
      title: 'Template Selected',
      description: `${template.name} has been selected. You can customize it in the next step.`,
    });
  };

  const categories = [
    'all',
    'Food & Beverage',
    'E-Commerce',
    'Portfolio',
    'Business',
    'Healthcare',
    'Fitness',
    'Real Estate',
    'Education',
  ];
  const industries = [
    'all',
    'restaurant',
    'retail',
    'design',
    'business',
    'healthcare',
    'fitness',
    'real-estate',
    'education',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
        <p className="text-muted-foreground">
          Start with a professionally designed template and customize it to your needs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map(ind => (
              <SelectItem key={ind} value={ind}>
                {ind === 'all' ? 'All Industries' : ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No templates found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setIndustryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="relative">
                <div
                  className="w-full h-48 bg-gradient-to-br rounded-t-lg"
                  style={{
                    background: `linear-gradient(135deg, ${template.colorScheme.primary} 0%, ${template.colorScheme.secondary} 100%)`,
                  }}
                >
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {template.name}
                    </div>
                  )}
                </div>
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {template.price === 'premium' && (
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    Premium
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{template.category}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{template.popularity}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pages</p>
                    <div className="flex flex-wrap gap-1">
                      {template.pages.slice(0, 4).map((page, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {page}
                        </Badge>
                      ))}
                      {template.pages.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.pages.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant={selectedTemplateId === template.id ? 'default' : 'outline'}
                >
                  {selectedTemplateId === template.id ? 'Selected' : 'Select Template'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && templates.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              fetchTemplates(newPage);
            }}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} templates)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              fetchTemplates(newPage);
            }}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
