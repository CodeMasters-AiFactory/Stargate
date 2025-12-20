import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  ShoppingCart,
  Palette,
  FileText,
  Settings,
  BarChart3,
  Image,
  MapPin,
  Target,
  ChevronDown,
  ChevronRight,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type {
  ChecklistState,
  ChecklistCategory,
  PackageId,
  PackageConstraints,
} from '@/types/websiteBuilder';
import {
  CLIENT_CHECKLIST_ITEMS,
  CHECKLIST_CATEGORY_LABELS,
  CHECKLIST_CATEGORY_ICONS,
} from '@/utils/checklistItems';
import {
  calculateChecklistProgress,
  validateChecklist,
} from '@/utils/checklistMapper';
import { cn } from '@/lib/utils';

interface ClientChecklistProps {
  checklist: ChecklistState;
  onChecklistChange: (checklist: ChecklistState) => void;
  selectedPackage?: PackageId;
  packageConstraints?: PackageConstraints;
  onContinue: () => void;
  onAutoFill?: () => void;
}

const categoryIcons = {
  Building2,
  ShoppingCart,
  Palette,
  FileText,
  Settings,
  BarChart3,
  Image,
  MapPin,
  Target,
};

export function ClientChecklist({
  checklist,
  onChecklistChange,
  selectedPackage,
  packageConstraints,
  onContinue,
  onAutoFill,
}: ClientChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(
    new Set(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[])
  );
  const [showHints, setShowHints] = useState<Set<string>>(new Set());

  // Calculate progress
  const progress = useMemo(
    () => calculateChecklistProgress(checklist, selectedPackage),
    [checklist, selectedPackage]
  );

  // Validate checklist
  const validation = useMemo(
    () => validateChecklist(checklist, selectedPackage),
    [checklist, selectedPackage]
  );

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<ChecklistCategory, typeof CLIENT_CHECKLIST_ITEMS> = {
      'business-essentials': [],
      'services-products': [],
      branding: [],
      content: [],
      features: [],
      'seo-marketing': [],
      'visual-assets': [],
      'location-social': [],
      'goals-preferences': [],
    };

    CLIENT_CHECKLIST_ITEMS.forEach(item => {
      // Filter by package if needed
      if (item.packageRequired && selectedPackage) {
        if (!item.packageRequired.includes(selectedPackage)) {
          return; // Skip items not available for this package
        }
      }

      grouped[item.category].push(item);
    });

    return grouped;
  }, [selectedPackage]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: ChecklistCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Toggle checklist item
  const toggleItem = useCallback(
    (category: ChecklistCategory, itemId: string) => {
      onChecklistChange({
        ...checklist,
        [category]: {
          ...checklist[category],
          [itemId]: !checklist[category]?.[itemId],
        },
      });
    },
    [checklist, onChecklistChange]
  );

  // Toggle all items in category
  const toggleCategoryAll = useCallback(
    (category: ChecklistCategory) => {
      const categoryItems = itemsByCategory[category];
      const allChecked = categoryItems.every(
        item => checklist[category]?.[item.id] === true
      );

      const updates: ChecklistState = { ...checklist };
      if (!updates[category]) {
        updates[category] = {};
      }

      categoryItems.forEach(item => {
        updates[category][item.id] = !allChecked;
      });

      onChecklistChange(updates);
    },
    [checklist, itemsByCategory, onChecklistChange]
  );

  // Get category completion
  const getCategoryProgress = useCallback(
    (category: ChecklistCategory) => {
      const categoryItems = itemsByCategory[category];
      if (categoryItems.length === 0) return { completed: 0, total: 0, percentage: 100 };

      const completed = categoryItems.filter(
        item => checklist[category]?.[item.id] === true
      ).length;

      return {
        completed,
        total: categoryItems.length,
        percentage: Math.round((completed / categoryItems.length) * 100),
      };
    },
    [checklist, itemsByCategory]
  );

  const handleContinue = () => {
    if (!validation.isValid) {
      return; // Don't proceed if validation fails
    }
    onContinue();
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Phase 2: Client Checklist - What Do You Need?
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Check off the items that apply to your project. We'll use this to understand what
              you need and auto-fill the remaining questions.
            </p>

            {/* Progress Indicator */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Overall Progress</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {progress.percentage}% ({progress.checked}/{progress.total})
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              {progress.required > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Required Items: {progress.requiredChecked}/{progress.required}</span>
                  <span className={progress.requiredPercentage === 100 ? 'text-green-600' : 'text-red-600'}>
                    {progress.requiredPercentage}% complete
                  </span>
                </div>
              )}
            </div>

            {/* Package Info */}
            {selectedPackage && packageConstraints && (
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">
                <strong>Package:</strong>{' '}
                {selectedPackage === 'basic'
                  ? 'Essential'
                  : selectedPackage === 'advanced'
                    ? 'Professional'
                    : selectedPackage === 'seo'
                      ? 'SEO Optimized'
                      : selectedPackage === 'deluxe'
                        ? 'Deluxe'
                        : selectedPackage === 'ultra'
                          ? 'Ultra'
                          : selectedPackage}
                {' • '}
                <strong>Limit:</strong> {packageConstraints.maxPages}{' '}
                {packageConstraints.maxPages === 1 ? 'page' : 'pages'},{' '}
                {packageConstraints.maxServices} services
              </div>
            )}

            {/* Validation Errors */}
            {!validation.isValid && validation.missingRequired.length > 0 && (
              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                <strong>Missing required items:</strong> Please check at least{' '}
                {validation.missingRequired.length} more required item
                {validation.missingRequired.length === 1 ? '' : 's'}.
              </div>
            )}
          </div>
          {onAutoFill && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoFill}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-md ml-4"
            >
              <Zap className="w-4 h-4" />
              Test Mode
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex gap-6">
          {/* Main Checklist Area */}
          <div className="flex-1 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(category => {
              const categoryItems = itemsByCategory[category];
              if (categoryItems.length === 0) return null;

              const isExpanded = expandedCategories.has(category);
              const categoryProgress = getCategoryProgress(category);
              const IconComponent =
                categoryIcons[
                  CHECKLIST_CATEGORY_ICONS[category] as keyof typeof categoryIcons
                ];

              return (
                <Card key={category} className="border-2">
                  <CardHeader className="pb-3">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between text-left hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {CHECKLIST_CATEGORY_LABELS[category]}
                            </h3>
                            {categoryProgress.percentage === 100 && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {categoryProgress.completed}/{categoryProgress.total}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <Progress
                              value={categoryProgress.percentage}
                              className="h-1.5 w-full max-w-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            toggleCategoryAll(category);
                          }}
                          className="text-xs"
                        >
                          {categoryProgress.completed === categoryProgress.total
                            ? 'Uncheck All'
                            : 'Check All'}
                        </Button>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {categoryItems.map(item => {
                          const isChecked = checklist[category]?.[item.id] === true;
                          const showHint = showHints.has(item.id);

                          return (
                            <div
                              key={item.id}
                              className={cn(
                                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                                isChecked
                                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/30'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleItem(category, item.id)}
                                className="mt-1"
                                id={`checklist-${item.id}`}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`checklist-${item.id}`}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="font-medium">{item.label}</span>
                                  {item.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  {item.hint && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle
                                            className="w-4 h-4 text-muted-foreground cursor-help"
                                            onClick={e => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setShowHints(prev => {
                                                const next = new Set(prev);
                                                if (next.has(item.id)) {
                                                  next.delete(item.id);
                                                } else {
                                                  next.add(item.id);
                                                }
                                                return next;
                                              });
                                            }}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{item.hint}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </label>
                                {showHint && item.hint && (
                                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm text-blue-700 dark:text-blue-300">
                                    {item.hint}
                                  </div>
                                )}
                              </div>
                              {isChecked && (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Sidebar Summary */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Overall Progress</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {progress.percentage}%
                    </div>
                    <Progress value={progress.percentage} className="h-2 mt-2" />
                  </div>
                  {progress.required > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Required Items</div>
                      <div
                        className={cn(
                          'text-lg font-semibold',
                          progress.requiredPercentage === 100
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {progress.requiredChecked}/{progress.required}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Category Progress</div>
                    {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(
                      category => {
                        const categoryProgress = getCategoryProgress(category);
                        if (categoryProgress.total === 0) return null;

                        return (
                          <div key={category} className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="truncate">{CHECKLIST_CATEGORY_LABELS[category]}</span>
                              <span className="font-semibold">
                                {categoryProgress.completed}/{categoryProgress.total}
                              </span>
                            </div>
                            <Progress
                              value={categoryProgress.percentage}
                              className="h-1"
                            />
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900">
          <Button
            variant="outline"
            onClick={() => {
              // Could add back button functionality
            }}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!validation.isValid}
            className="px-8"
            size="lg"
          >
            Continue to Investigation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

