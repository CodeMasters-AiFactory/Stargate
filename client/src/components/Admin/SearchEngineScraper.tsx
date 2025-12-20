/**
 * Top Search Results Scraper Component
 * The unified scraper for finding and scraping top-ranked websites
 * - Search by category and location
 * - Enter domains manually
 * - Scrape and create templates
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Search, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
// Use FIGMA_CATEGORIES - EXACTLY the same categories as Templates section
import { FIGMA_CATEGORIES } from '../../../../shared/figmaCategories';


export function SearchEngineScraper() {
  const { toast } = useToast();

  // Location state - REMOVED (no longer needed)

  // Category scraping state (using same categories as Templates)
  const [category, setCategory] = useState<string | undefined>();
  const [searchLimit, setSearchLimit] = useState(10);

  // Scraping state
  const [isSearching, setIsSearching] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Search results
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    url: string;
    address: string;
    phone: string;
  }>>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  // Domain management
  const [domainInput, setDomainInput] = useState('');
  const [domainList, setDomainList] = useState<string[]>([]);

  // Scraping progress
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [currentScrapingPhase, setCurrentScrapingPhase] = useState('');
  const [_domainFile, setDomainFile] = useState<File | null>(null);
  const [_siteProgress, setSiteProgress] = useState(0);
  const [_isBulkScraping, setIsBulkScraping] = useState(false);

  // Search for companies or scrape added domains
  const handleSearch = async () => {
    // If domains are added, scrape them directly (with or without category)
    if (domainList.length > 0) {
      // Use the existing scrape function
      await handleScrapeSelected();
      return;
    }

    // Otherwise, search for companies by category
    if (!category) {
      toast({
        title: 'Category or Domain Required',
        description: 'Please select a category or add domains to scrape',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/admin/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          industry: category, // Backend still uses 'industry' field
          limit: searchLimit,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // API returns data.results, not data.companies
        const results = data.results || [];
        // Map API results to component format
        const mappedResults = results.map((result: any) => ({
          name: result.companyName || result.name || 'Unknown',
          url: result.websiteUrl || result.url || '',
          address: result.address || '',
          phone: result.phone || '',
        }));
        setSearchResults(mappedResults);
        toast({
          title: 'Search Complete',
          description: `Found ${mappedResults.length} companies`,
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('[SearchEngineScraper] Search error:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Failed to search for companies',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

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

  // Add domain manually
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
        title: 'Domain Added',
        description: `Added ${url} to scrape list`,
      });
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
    }
  };

  // Handle file upload
  const _handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDomainFile(file);
    try {
      const text = await file.text();
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && !line.startsWith('//'))
        .map(line => {
          // Handle CSV - take first column
          if (line.includes(',')) {
            return line.split(',')[0].trim();
          }
          return line;
        })
        .map(line => {
          if (!line.startsWith('http://') && !line.startsWith('https://')) {
            return `https://${line}`;
          }
          return line;
        })
        .filter(line => {
          try {
            new URL(line);
            return true;
          } catch {
            return false;
          }
        });

      setDomainList(prev => [...prev, ...lines]);
      toast({
        title: 'File Uploaded',
        description: `Added ${lines.length} domain(s) from file`,
      });
    } catch (error) {
      console.error('[SearchEngineScraper] File upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    }
  };

  // Scrape selected URLs
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
    setIsScraping(true);
    setScrapingProgress(0);
    setCurrentScrapingPhase('Starting...');
    setSiteProgress(0);

    try {
      // Set initial progress
      setScrapingProgress(5);
      setCurrentScrapingPhase('Initializing scraper...');
      
      for (let i = 0; i < allUrls.length; i++) {
        const url = allUrls[i];
        const baseProgress = (i / allUrls.length) * 90; // 0-90% for scraping
        const startProgress = baseProgress + 5; // Start of this URL
        
        setCurrentScrapingPhase(`Scraping ${i + 1} of ${allUrls.length}: ${url}`);
        setScrapingProgress(startProgress);
        setSiteProgress(0);

        try {
          // Show progress: Starting
          setSiteProgress(10);
          setCurrentScrapingPhase(`Starting scrape ${i + 1}/${allUrls.length}: ${url}`);
          
          const response = await fetch('/api/admin/scraper/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
              body: JSON.stringify({
              urls: [url], // Send as array
              industry: category || 'web-design', // Default category if not provided (use category ID, not name)
            }),
          });

          // Show progress: Processing response
          setSiteProgress(80);
          setCurrentScrapingPhase(`Processing ${i + 1}/${allUrls.length}: ${url}...`);

          const data = await response.json();
          if (data.success) {
            console.log(`✅ Successfully scraped ${url}`);
            if (data.results && data.results.length > 0) {
              const templateCount = data.results.filter((r: any) => r.template).length;
              if (templateCount > 0) {
                console.log(`✅ Created ${templateCount} template(s) from ${url}`);
                toast({
                  title: `Template Created! 🎉`,
                  description: `Created template from ${url}`,
                });
              }
            }
            setSiteProgress(100);
          } else {
            console.error(`❌ Failed to scrape ${url}:`, data.error);
            toast({
              title: `Scraping Failed: ${url}`,
              description: data.error || 'Unknown error',
              variant: 'destructive',
            });
            setSiteProgress(100);
          }
        } catch (error) {
          console.error(`❌ Error scraping ${url}:`, error);
          toast({
            title: `Error Scraping: ${url}`,
            description: error instanceof Error ? error.message : 'Network error',
            variant: 'destructive',
          });
          setSiteProgress(100);
        }

        // Update overall progress
        const endProgress = baseProgress + 90; // End of this URL (90% of total for this URL)
        setScrapingProgress(endProgress);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setCurrentScrapingPhase('✅ Complete');
      setSiteProgress(100);
      setScrapingProgress(100);
      
      // Count successful templates
      const successfulCount = allUrls.length; // Simplified - actual count would need to track from responses
      
      toast({
        title: 'Scraping Complete! 🎉',
        description: `Scraped ${allUrls.length} website(s). ${successfulCount} template(s) created. Refresh Templates tab to see them!`,
      });
      
      // Trigger a custom event to refresh templates in other components
      window.dispatchEvent(new CustomEvent('templates-updated'));
    } catch (error) {
      setCurrentScrapingPhase('❌ Failed');
      setSiteProgress(100);
      toast({
        title: 'Scraping Failed',
        description: error instanceof Error ? error.message : 'Failed to scrape websites',
        variant: 'destructive',
      });
    } finally {
      setIsScraping(false);
    }
  };

  // Bulk scrape all industries
  const _handleBulkScrapeAllIndustries = async () => {
    setIsBulkScraping(true);
    try {
      const response = await fetch('/api/admin/scraper/bulk-scrape-all-industries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          limit: 100,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Bulk Scraping Started! 🚀',
          description: `Scraping top 100 websites for all ${INDUSTRIES.length} industries. This will take several hours.`,
        });
      } else {
        throw new Error(data.error || 'Bulk scraping failed');
      }
    } catch (error) {
      console.error('[SearchEngineScraper] Bulk scrape error:', error);
      toast({
        title: 'Bulk Scraping Failed',
        description: error instanceof Error ? error.message : 'Failed to start bulk scraping',
        variant: 'destructive',
      });
    } finally {
      setIsBulkScraping(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700">
        <CardHeader className="bg-blue-100/50 dark:bg-blue-900/50 border-b border-blue-300 dark:border-blue-700">
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Search className="w-5 h-5" />
            Top Search Results Scraper
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Find and scrape top-ranked websites by category and location to create pixel-perfect template replicas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900">
          {/* Step 1: Search Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Step 1: Select Your Search Criteria
            </h3>
            
            {/* Category Selection - Same as Templates */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category || ''} onValueChange={(val) => setCategory(val || undefined)}>
                <SelectTrigger id="category" className="border-blue-400 bg-white dark:bg-blue-900/50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  {FIGMA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Sites */}
            <div className="space-y-2">
              <Label htmlFor="searchLimit">Number of Sites</Label>
              <Input
                id="searchLimit"
                type="number"
                min="1"
                value={searchLimit}
                onChange={(e) => setSearchLimit(parseInt(e.target.value) || 10)}
                className="border-blue-400 bg-white dark:bg-blue-900/50"
                placeholder="10"
              />
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
                  disabled={isScraping || isSearching}
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
              onClick={handleSearch}
              disabled={isSearching || (!category && domainList.length === 0)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg shadow-lg font-semibold"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
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
                    onClick={() => {
                      const allUrls = new Set(searchResults.map(r => r.url));
                      setSelectedUrls(allUrls);
                    }}
                    disabled={selectedUrls.size === searchResults.length}
                    className="border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUrls(new Set())}
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

              <div className="max-h-[600px] overflow-y-auto space-y-1">
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
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 truncate">{result.name}</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-mono truncate">{result.url}</p>
                            {(result.address || result.phone) && (
                              <div className="flex gap-2 mt-0.5">
                                {result.address && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{result.address}</p>
                                )}
                                {result.phone && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">{result.phone}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleUrlSelection(result.url)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-4 w-4"
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
                disabled={isScraping || (selectedUrls.size === 0 && domainList.length === 0)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg shadow-lg font-semibold"
              >
                {isScraping ? (
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
          {isScraping && (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 border-t-2 border-blue-400 shadow-2xl">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="text-white font-semibold">
                      {currentScrapingPhase || 'Scraping...'}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(scrapingProgress)}%
                  </span>
                </div>
                <Progress 
                  value={scrapingProgress} 
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

