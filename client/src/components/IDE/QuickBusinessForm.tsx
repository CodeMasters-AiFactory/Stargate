/**
 * QuickBusinessForm - Quick 4-5 question form for website personalization
 * Part of the new flow: Template Select → Quick Form → Auto-Build → Final Website
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, ArrowLeft, Sparkles, Building2, MapPin, Mail, Camera } from 'lucide-react';

export interface BusinessFormData {
  businessName: string;
  industry: string;
  location: string;
  email: string;
  hasOwnPhotos: boolean;
}

interface QuickBusinessFormProps {
  templateName?: string;
  templateIndustry?: string;
  onSubmit: (data: BusinessFormData) => void;
  onBack: () => void;
  initialData?: Partial<BusinessFormData>;
}

const INDUSTRIES = [
  'Restaurant & Cafe',
  'Rose Farm / Florist',
  'Real Estate',
  'Photography Studio',
  'Fitness & Gym',
  'Spa & Wellness',
  'Law Firm',
  'Medical Practice',
  'Dental Clinic',
  'Automotive',
  'Construction',
  'Interior Design',
  'E-commerce',
  'Technology',
  'Education',
  'Non-Profit',
  'Travel & Tourism',
  'Wedding & Events',
  'Pet Services',
  'Home Services',
  'Other',
];

export function QuickBusinessForm({
  templateName,
  templateIndustry,
  onSubmit,
  onBack,
  initialData,
}: QuickBusinessFormProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: initialData?.businessName || '',
    industry: initialData?.industry || templateIndustry || '',
    location: initialData?.location || '',
    email: initialData?.email || '',
    hasOwnPhotos: initialData?.hasOwnPhotos ?? false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BusinessFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate industry from template if available
  useEffect(() => {
    if (templateIndustry && !formData.industry) {
      setFormData(prev => ({ ...prev, industry: templateIndustry }));
    }
  }, [templateIndustry]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessFormData, string>> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required for local SEO';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    onSubmit(formData);
  };

  const updateField = <K extends keyof BusinessFormData>(
    field: K,
    value: BusinessFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>

            <div className="flex items-center gap-2 text-slate-400">
              <Wand2 className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Merlin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-xl bg-slate-800/50 border-slate-700 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Let's personalize your website!
            </CardTitle>
            {templateName && (
              <p className="text-slate-400 mt-2">
                Using template: <span className="text-purple-400">{templateName}</span>
              </p>
            )}
            <p className="text-slate-500 text-sm mt-2">
              Takes about 30 seconds to build
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Bella Rosa Farms"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 h-12 text-lg ${
                    errors.businessName ? 'border-red-500' : 'focus:border-purple-500'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-400 text-sm">{errors.businessName}</p>
                )}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Industry / Business Type
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateField('industry', value)}
                >
                  <SelectTrigger
                    className={`bg-slate-900/50 border-slate-600 text-white h-12 ${
                      errors.industry ? 'border-red-500' : 'focus:border-purple-500'
                    }`}
                  >
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {INDUSTRIES.map((industry) => (
                      <SelectItem
                        key={industry}
                        value={industry}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-red-400 text-sm">{errors.industry}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  City / Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Cape Town, South Africa"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 h-12 text-lg ${
                    errors.location ? 'border-red-500' : 'focus:border-purple-500'
                  }`}
                />
                {errors.location && (
                  <p className="text-red-400 text-sm">{errors.location}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Contact Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., info@bellarosa.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 h-12 text-lg ${
                    errors.email ? 'border-red-500' : 'focus:border-purple-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Own Photos Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label htmlFor="hasOwnPhotos" className="text-slate-200 cursor-pointer">
                      Do you have your own photos?
                    </Label>
                    <p className="text-slate-500 text-sm">
                      {formData.hasOwnPhotos
                        ? "You'll upload your own images later"
                        : "We'll generate AI images for you"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="hasOwnPhotos"
                  checked={formData.hasOwnPhotos}
                  onCheckedChange={(checked) => updateField('hasOwnPhotos', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Build My Website
                  </>
                )}
              </Button>

              <p className="text-center text-slate-500 text-sm">
                Merlin will transform the template based on your answers
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
