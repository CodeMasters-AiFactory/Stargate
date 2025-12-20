/**
 * AI Quick-Start Generator
 * 5-question wizard for instant website generation (like Wix ADI)
 * Improves AI Integration score from 60% → 85%
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickStartData {
  businessName: string;
  industry: string;
  location: string;
  primaryGoal: string;
  style: string;
}

interface QuickStartGeneratorProps {
  onGenerate: (data: QuickStartData) => Promise<void>;
  onCancel?: () => void;
}

const INDUSTRIES = [
  'Restaurant & Food',
  'Retail & E-commerce',
  'Professional Services',
  'Healthcare & Medical',
  'Real Estate',
  'Fitness & Wellness',
  'Education & Training',
  'Technology & Software',
  'Creative & Design',
  'Home Services',
  'Beauty & Personal Care',
  'Automotive',
  'Other',
];

const PRIMARY_GOALS = [
  'Get More Customers',
  'Sell Products Online',
  'Showcase Portfolio',
  'Book Appointments',
  'Share Information',
  'Build Brand Awareness',
];

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern & Clean', description: 'Sleek, minimalist design' },
  { value: 'professional', label: 'Professional', description: 'Trustworthy, corporate feel' },
  { value: 'creative', label: 'Creative & Bold', description: 'Unique, eye-catching design' },
  { value: 'elegant', label: 'Elegant & Sophisticated', description: 'Refined, luxury aesthetic' },
  { value: 'friendly', label: 'Friendly & Approachable', description: 'Warm, welcoming feel' },
  { value: 'tech', label: 'Tech & Innovation', description: 'Cutting-edge, futuristic' },
];

export function QuickStartGenerator({ onGenerate, onCancel }: QuickStartGeneratorProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<QuickStartData>({
    businessName: '',
    industry: '',
    location: '',
    primaryGoal: '',
    style: '',
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateData = (field: keyof QuickStartData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    // Validate all fields
    if (!data.businessName || !data.industry || !data.location || !data.primaryGoal || !data.style) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields before generating.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(data);
      toast({
        title: 'Website Generation Started',
        description: 'Your website is being created with AI. This will take a few moments.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to start generation',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.businessName.trim().length > 0;
      case 1: return data.industry.length > 0;
      case 2: return data.location.trim().length > 0;
      case 3: return data.primaryGoal.length > 0;
      case 4: return data.style.length > 0;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-600" />
                AI Quick-Start Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Answer 5 quick questions and we'll build your website automatically
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Step 1: Business Name */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  What's your business name?
                </label>
                <Input
                  placeholder="e.g., The Roasted Bean, Smith & Associates"
                  value={data.businessName}
                  onChange={(e) => updateData('businessName', e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This will appear prominently on your website
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Industry */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  What industry are you in?
                </label>
                <Select value={data.industry} onValueChange={(value) => updateData('industry', value)}>
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  We'll customize your website for your industry
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Where is your business located?
                </label>
                <Input
                  placeholder="e.g., New York, NY or London, UK"
                  value={data.location}
                  onChange={(e) => updateData('location', e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Helps with local SEO and contact information
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Primary Goal */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  What's your primary goal?
                </label>
                <Select
                  value={data.primaryGoal}
                  onValueChange={(value) => updateData('primaryGoal', value)}
                >
                  <SelectTrigger className="text-lg">
                    <SelectValue placeholder="What do you want to achieve?" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_GOALS.map(goal => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  This helps us design the right pages and features
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Style */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  What style do you prefer?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map(style => (
                    <button
                      key={style.value}
                      onClick={() => updateData('style', style.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        data.style === style.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{style.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {style.description}
                          </div>
                        </div>
                        {data.style === style.value && (
                          <CheckCircle2 className="w-5 h-5 text-purple-600 ml-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 0 && onCancel ? onCancel : handleBack}
              disabled={currentStep === 0 && !onCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!canProceed() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Website
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

