/**
 * Client Info Collection - Phase 4
 * Consolidated form collecting all essential client information
 * 
 * Features:
 * - Business details (name, industry, type)
 * - Contact info (email, phone, address)
 * - Logo upload
 * - Social media links
 * - Domain preferences
 * - Real-time validation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ChevronLeft,
  ArrowRight,
  Image,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

// Industry options
const INDUSTRIES = [
  'Accounting',
  'Architecture',
  'Automotive',
  'Beauty & Spa',
  'Construction',
  'Consulting',
  'Dental',
  'Education',
  'E-commerce',
  'Entertainment',
  'Fashion',
  'Finance',
  'Fitness & Gym',
  'Food & Restaurant',
  'Healthcare',
  'Insurance',
  'Legal',
  'Manufacturing',
  'Marketing',
  'Non-profit',
  'Photography',
  'Real Estate',
  'Technology',
  'Travel',
  'Other',
];

// Business types
const BUSINESS_TYPES = [
  'Local Business',
  'E-commerce Store',
  'Service Provider',
  'Portfolio/Freelancer',
  'Agency',
  'Startup',
  'Enterprise',
  'Non-profit',
  'Blog/Content',
  'Other',
];

interface ClientInfoCollectionProps {
  requirements: WebsiteRequirements;
  onRequirementsChange: (requirements: WebsiteRequirements) => void;
  onContinue: () => void;
  onBack?: () => void;
}

interface FormData {
  businessName: string;
  industry: string;
  businessType: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  domainStatus: 'have_domain' | 'need_domain' | 'undecided';
  domainName: string;
  logoUrl: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
  projectOverview: string;
  targetAudience: string;
}

export function ClientInfoCollection({
  requirements,
  onRequirementsChange,
  onContinue,
  onBack,
}: ClientInfoCollectionProps) {
  const [formData, setFormData] = useState<FormData>({
    businessName: requirements.businessName || '',
    industry: requirements.industry || '',
    businessType: requirements.businessType || '',
    businessEmail: requirements.businessEmail || '',
    businessPhone: requirements.businessPhone || '',
    businessAddress: requirements.businessAddress || '',
    domainStatus: (requirements.domainStatus as FormData['domainStatus']) || 'undecided',
    domainName: requirements.domainName || '',
    logoUrl: requirements.logoUrl || '',
    socialMedia: {
      facebook: requirements.socialMedia?.facebook || '',
      instagram: requirements.socialMedia?.instagram || '',
      twitter: requirements.socialMedia?.twitter || '',
      linkedin: requirements.socialMedia?.linkedin || '',
      youtube: requirements.socialMedia?.youtube || '',
      tiktok: requirements.socialMedia?.tiktok || '',
    },
    projectOverview: requirements.projectOverview || '',
    targetAudience: requirements.targetAudience || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Update form field
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Update social media field
  const updateSocialMedia = (platform: keyof FormData['socialMedia'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Invalid email format';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (formData.domainStatus === 'have_domain' && !formData.domainName.trim()) {
      newErrors.domainName = 'Please enter your domain name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle continue
  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    // Update requirements with form data
    onRequirementsChange({
      ...requirements,
      businessName: formData.businessName,
      industry: formData.industry,
      businessType: formData.businessType,
      businessEmail: formData.businessEmail,
      businessPhone: formData.businessPhone,
      businessAddress: formData.businessAddress,
      domainStatus: formData.domainStatus,
      domainName: formData.domainName,
      logoUrl: formData.logoUrl,
      socialMedia: formData.socialMedia,
      projectOverview: formData.projectOverview,
      targetAudience: formData.targetAudience,
    });

    onContinue();
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to server and get URL
    // For now, use data URL
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(file);
    });
    updateField('logoUrl', dataUrl);
  };

  // Calculate completion percentage
  const completionPercentage = (() => {
    let filled = 0;
    let total = 4; // Required: name, email, industry, business type

    if (formData.businessName.trim()) filled++;
    if (formData.businessEmail.trim()) filled++;
    if (formData.industry) filled++;
    if (formData.businessType) filled++;

    // Bonus fields (optional)
    if (formData.businessPhone) { filled++; total++; }
    if (formData.businessAddress) { filled++; total++; }
    if (formData.logoUrl) { filled++; total++; }
    if (formData.projectOverview) { filled++; total++; }
    if (Object.values(formData.socialMedia).some(v => v.trim())) { filled++; total++; }

    return Math.round((filled / total) * 100);
  })();

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-400" />
              Tell Us About Your Business
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              We'll use this information to build your perfect website
            </p>
          </div>
          
          <Badge className={`px-4 py-2 ${completionPercentage === 100 ? 'bg-emerald-600' : 'bg-slate-700'}`}>
            {completionPercentage}% Complete
          </Badge>
        </div>
      </div>

      {/* Main Content - Scrollable Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Business Essentials */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Business Essentials
              </CardTitle>
              <CardDescription className="text-slate-400">
                Core information about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-slate-300">
                    Business Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className={`bg-slate-900/50 border-slate-600 text-white ${errors.businessName ? 'border-red-500' : ''}`}
                  />
                  {errors.businessName && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-slate-300">
                    Industry <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => updateField('industry', value)}
                  >
                    <SelectTrigger className={`bg-slate-900/50 border-slate-600 text-white ${errors.industry ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-slate-300">
                    Business Type <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => updateField('businessType', value)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience" className="text-slate-300">
                    Target Audience
                  </Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => updateField('targetAudience', e.target.value)}
                    placeholder="e.g., Young professionals, 25-45"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectOverview" className="text-slate-300">
                  Project Overview
                </Label>
                <Textarea
                  id="projectOverview"
                  value={formData.projectOverview}
                  onChange={(e) => updateField('projectOverview', e.target.value)}
                  placeholder="Describe your business and what you want to achieve with this website..."
                  rows={3}
                  className="bg-slate-900/50 border-slate-600 text-white resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Contact Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                How customers can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail" className="text-slate-300">
                    Business Email <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => updateField('businessEmail', e.target.value)}
                      placeholder="contact@yourbusiness.com"
                      className={`pl-10 bg-slate-900/50 border-slate-600 text-white ${errors.businessEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.businessEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone" className="text-slate-300">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => updateField('businessPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAddress" className="text-slate-300">
                  Business Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => updateField('businessAddress', e.target.value)}
                    placeholder="123 Main Street, Suite 100&#10;City, State 12345"
                    rows={2}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Domain & Logo */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Domain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Domain Status</Label>
                  <Select
                    value={formData.domainStatus}
                    onValueChange={(value) => updateField('domainStatus', value)}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="have_domain">I have a domain</SelectItem>
                      <SelectItem value="need_domain">I need a domain</SelectItem>
                      <SelectItem value="undecided">Undecided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.domainStatus === 'have_domain' && (
                  <div className="space-y-2">
                    <Label htmlFor="domainName" className="text-slate-300">Domain Name</Label>
                    <Input
                      id="domainName"
                      value={formData.domainName}
                      onChange={(e) => updateField('domainName', e.target.value)}
                      placeholder="www.yourbusiness.com"
                      className={`bg-slate-900/50 border-slate-600 text-white ${errors.domainName ? 'border-red-500' : ''}`}
                    />
                    {errors.domainName && (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.domainName}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-orange-400" />
                  Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {(logoPreview || formData.logoUrl) ? (
                    <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={logoPreview || formData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center">
                      <Image className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button variant="outline" className="border-slate-600 text-slate-300" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG (max 2MB)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-pink-400" />
                Social Media Links
              </CardTitle>
              <CardDescription className="text-slate-400">
                Optional - We'll add these to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    Facebook
                  </Label>
                  <Input
                    value={formData.socialMedia.facebook}
                    onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Instagram
                  </Label>
                  <Input
                    value={formData.socialMedia.instagram}
                    onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    Twitter/X
                  </Label>
                  <Input
                    value={formData.socialMedia.twitter}
                    onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                    placeholder="https://twitter.com/yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    LinkedIn
                  </Label>
                  <Input
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    YouTube
                  </Label>
                  <Input
                    value={formData.socialMedia.youtube}
                    onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                    placeholder="https://youtube.com/@yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    🎵 TikTok
                  </Label>
                  <Input
                    value={formData.socialMedia.tiktok}
                    onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@yourbusiness"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="text-red-400">*</span> Required fields
          </div>

          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="border-slate-600 text-slate-300">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6"
            >
              Continue to Generation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientInfoCollection;

