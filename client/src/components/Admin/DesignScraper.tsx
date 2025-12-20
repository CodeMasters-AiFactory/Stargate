/**
 * Design Scraper Component
 * Scrapes the world's most beautiful websites by design quality
 * 
 * UPDATED: Now matches Search Engine Scraper layout with:
 * - Section headers with icons
 * - Add Domain Names section
 * - Bulk Scrape All Categories
 * - File upload support
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Sparkles, Plus, Palette } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Design categories matching server-side
const DESIGN_CATEGORIES = [
  'Personal', 'Business', 'Corporate', 'E-commerce', 'Portfolio', 'Agency', 'Creative', 'Technology',
  'Fashion', 'Food & Beverage', 'Entertainment', 'Education', 'Healthcare', 'Real Estate', 'Travel',
  'Non-profit', 'Music', 'Sports', 'Art & Design', 'Luxury', 'Startup', 'Enterprise',
  'Top 100', 'Top 1000', 'Top 10000',
  'Top Sites 2025', 'Top Sites 2024', 'Top Sites 2023', 'Top Sites 2022', 'Top Sites 2021',
  'Top Sites 2020', 'Top Sites 2019', 'Top Sites 2018', 'Top Sites 2017',
] as const;

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

export function DesignScraper() {
  const { toast } = useToast();

  // Design quality scraping state
  const [designCategory, setDesignCategory] = useState<string | undefined>();
  const [designLimit, setDesignLimit] = useState(10);
  const [isDesignScraping, setIsDesignScraping] = useState(false);
  const [designScrapingProgress, setDesignScrapingProgress] = useState(0);
  const [designScrapingCurrentUrl, setDesignScrapingCurrentUrl] = useState<string>('');
  
  // Location state (matching Search Engine Scraper)
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState<string | undefined>();
  const [city, setCity] = useState('');
  
  // Search and selection state
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    url: string;
    description: string;
    category: string;
    awardSource: string;
    ranking: number;
  }>>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  
  // Domain management state
  const [domainInput, setDomainInput] = useState('');
  const [domainList, setDomainList] = useState<string[]>([]);
  const [designScrapingResults, setDesignScrapingResults] = useState<Array<{
    url: string;
    success: boolean;
    template?: any;
    error?: string;
  }>>([]);

  // Add domain manually (matching Search Engine Scraper)
  const handleAddDomain = () => {
    if (!domainInput.trim()) return;

    let url = domainInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
      setDomainList(prev => [...prev, url]);
      setDomainInput('');
      toast({
        title: 'Design URL Added',
        description: `Added ${url} to design quality scrape list`,
      });
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
    }
  };

  // Removed: File upload and domain scraping functions - not needed in simplified UI

  // Toggle URL selection
  const toggleUrlSelection = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    const allUrls = new Set(searchResults.map(r => r.url));
    setSelectedUrls(allUrls);
  };

  const handleDeselectAll = () => {
    setSelectedUrls(new Set());
  };

  // Search for design websites (without scraping)
  const handleSearchDesignWebsites = async () => {
    if (!designCategory) {
      toast({
        title: 'Category Required',
        description: 'Please select a design category',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedUrls(new Set());
    
    try {
      const response = await fetch('/api/admin/scraper/search-design-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          designCategory,
          limit: designLimit,
          country,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.websites || []);
        toast({
          title: 'Search Complete',
          description: `Found ${data.websites?.length || 0} design websites`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('[DesignScraper] Search error:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Failed to search for design websites',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Scrape selected URLs only
  const handleScrapeSelected = async () => {
    const urlsToScrape = Array.from(selectedUrls);
    if (urlsToScrape.length === 0 && domainList.length === 0) {
      toast({
        title: 'No URLs Selected',
        description: 'Please select URLs or add domains to scrape',
        variant: 'destructive',
      });
      return;
    }

    const allUrls = [...urlsToScrape, ...domainList];
    setIsDesignScraping(true);
    setDesignScrapingProgress(0);
    setDesignScrapingCurrentUrl('Starting...');
    setDesignScrapingResults([]);

    try {
      for (let i = 0; i < allUrls.length; i++) {
        const url = allUrls[i];
        const progress = Math.round(((i + 1) / allUrls.length) * 100);
        setDesignScrapingProgress(progress);
        setDesignScrapingCurrentUrl(`Scraping ${i + 1}/${allUrls.length}: ${url}`);

        try {
          const response = await fetch('/api/admin/scraper/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              urls: [url],
              industry: designCategory || 'General',
              country: country || 'United States',
              state: state || undefined,
              city: city || undefined,
              isDesignQuality: true,
              designCategory: designCategory || 'General',
            }),
          });

          const data = await response.json();
          if (data.success) {
            setDesignScrapingResults(prev => [...prev, {
              url,
              success: true,
              template: data.results?.[0]?.template,
            }]);
          } else {
            setDesignScrapingResults(prev => [...prev, {
              url,
              success: false,
              error: data.error || 'Unknown error',
            }]);
          }
        } catch (error) {
          setDesignScrapingResults(prev => [...prev, {
            url,
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          }]);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const successful = designScrapingResults.filter(r => r.success).length;
      const failed = designScrapingResults.filter(r => !r.success).length;

      toast({
        title: 'Scraping Complete! 🎉',
        description: `Scraped ${allUrls.length} website(s). ${successful} successful, ${failed} failed. Templates are now available!`,
      });

      // Clear selections after scraping
      setSelectedUrls(new Set());
      setSearchResults([]);
    } catch (error) {
      toast({
        title: 'Scraping Failed',
        description: error instanceof Error ? error.message : 'Failed to scrape websites',
        variant: 'destructive',
      });
    } finally {
      setIsDesignScraping(false);
      setDesignScrapingCurrentUrl('');
    }
  };

  // Removed: Bulk scrape function - not needed in simplified UI

  // Removed: Old design quality scrape function - replaced with search-and-select workflow

  return (
    <div className="w-full space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Palette className="w-5 h-5" />
            Design Scraper
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Scrape the world's most beautiful websites by design quality (not rankings). 
            These templates are organized by design categories like Personal, Business, Corporate, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          {/* Step 1: Search Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Step 1: Select Your Search Criteria
            </h3>
            
            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designCategory">Category</Label>
                <Select 
                  value={designCategory || ''} 
                  onValueChange={(val) => setDesignCategory(val || undefined)}
                >
                  <SelectTrigger id="designCategory" className="border-blue-400 bg-white dark:bg-blue-900/50">
                    <SelectValue placeholder="Select Design Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {DESIGN_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designLimit">Number of Sites</Label>
                <Input
                  id="designLimit"
                  type="number"
                  min="1"
                  value={designLimit}
                  onChange={(e) => setDesignLimit(parseInt(e.target.value) || 10)}
                  className="border-blue-400 bg-white dark:bg-blue-900/50"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country" className="border-blue-400 bg-white dark:bg-blue-900/50">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Russia">Russia</SelectItem>
                    <SelectItem value="All">All Countries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {country === 'United States' && (
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state || '__all__'} onValueChange={(val) => setState(val === '__all__' ? undefined : val)}>
                    <SelectTrigger id="state" className="border-blue-400 bg-white dark:bg-blue-900/50">
                      <SelectValue placeholder="Select State (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All States</SelectItem>
                      {US_STATES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="city">City (Optional)</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Atlanta"
                  className="border-blue-400 bg-white dark:bg-blue-900/50"
                />
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-400"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">OR</span>
              </div>
            </div>

            {/* Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="domainInput">Enter Domains to Scrape</Label>
              <div className="flex gap-2">
                <Input
                  id="domainInput"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
                  placeholder="example.com or https://example.com"
                  className="border-blue-400 bg-white dark:bg-blue-900/50"
                />
                <Button 
                  onClick={handleAddDomain} 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
                  disabled={isDesignScraping || isSearching}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              {domainList.length > 0 && (
                <div className="mt-2 space-y-1">
                  {domainList.map((domain, idx) => (
                    <div key={idx} className="text-xs text-blue-700 dark:text-blue-300 font-mono flex items-center justify-between bg-blue-100 dark:bg-blue-800/50 p-2 rounded border border-blue-300 dark:border-blue-600">
                      <span>{domain}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0 text-red-500 hover:text-red-600"
                        onClick={() => setDomainList(prev => prev.filter((_, i) => i !== idx))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearchDesignWebsites}
              disabled={isSearching || (!designCategory && domainList.length === 0)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg shadow-lg font-semibold"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Search Websites
                </>
              )}
            </Button>
          </div>

          {/* Step 2: Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4 border-t-2 border-blue-400 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Step 2: Select Sites to Scrape ({searchResults.length} found)
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={selectedUrls.size === searchResults.length}
                    className="border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={selectedUrls.size === 0}
                    className="border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {selectedUrls.size} of {searchResults.length} websites selected
              </p>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((result, idx) => {
                  const isSelected = selectedUrls.has(result.url);
                  return (
                    <Card
                      key={idx}
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/50 shadow-lg' 
                          : 'border border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-800/30 hover:border-blue-400 hover:shadow-md'
                      }`}
                      onClick={() => toggleUrlSelection(result.url)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">{result.name}</h4>
                              <Badge variant="outline" className="text-xs border-blue-400 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                #{result.ranking}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-mono mt-1">{result.url}</p>
                            {result.description && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">{result.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-blue-400 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                {result.category}
                              </Badge>
                              <Badge className="text-xs bg-cyan-500 text-white">
                                {result.awardSource}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleUrlSelection(result.url)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Scrape Selected Button */}
              <Button
                onClick={handleScrapeSelected}
                disabled={isDesignScraping || (selectedUrls.size === 0 && domainList.length === 0)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg shadow-lg font-semibold"
              >
                {isDesignScraping ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Scrape Selected ({selectedUrls.size + domainList.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Fixed Bottom Progress Bar */}
          {isDesignScraping && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 border-t-2 border-blue-400 shadow-2xl">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-white font-semibold">
                      {designScrapingCurrentUrl || 'Scraping...'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(designScrapingProgress)}%
                  </span>
                </div>
                <Progress 
                  value={designScrapingProgress} 
                  className="h-3 bg-blue-300/30"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
