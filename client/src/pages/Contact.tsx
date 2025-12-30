/**
 * Contact Page - Workflow 3: Masterpiece Service
 *
 * Premium service contact form for clients who want
 * a hands-off, professionally designed website
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Send,
  CheckCircle2,
  Building2,
  Palette,
  Target,
  Users,
  Globe,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  budget: string;
  timeline: string;
  projectType: string;
  description: string;
}

export default function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    budget: '',
    timeline: '',
    projectType: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    toast({
      title: 'Request Submitted!',
      description: 'Our team will contact you within 24 hours.',
    });

    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    setLocation('/');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-slate-800/80 border-purple-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
            <p className="text-purple-200 mb-6">
              Your masterpiece request has been received. Our team will contact you within 24 hours to discuss your project.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setLocation('/')} className="w-full">
                Return to Home
              </Button>
              <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-800/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-purple-200 hover:text-white hover:bg-purple-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="h-6 w-px bg-purple-700" />
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Masterpiece Service
              </h1>
              <p className="text-sm text-purple-300">
                Premium, hands-off website creation
              </p>
            </div>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Info */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Let Us Create Your Masterpiece
            </h2>
            <p className="text-purple-200 mb-8">
              Our expert team will design and develop a custom website tailored to your brand.
              No templates, no DIY - just a stunning, professional website delivered to you.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Palette, title: 'Custom Design', desc: '2-3 unique design concepts to choose from' },
                { icon: Target, title: 'SEO Optimized', desc: 'Built for search engines from day one' },
                { icon: Users, title: 'Dedicated Team', desc: 'Designer + Developer + Project Manager' },
                { icon: Globe, title: 'Full Launch Support', desc: 'Domain, hosting, SSL - all handled' },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-purple-300">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Preview */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Masterpiece Pricing
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Custom quotes based on your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  Starting at $2,999
                </div>
                <p className="text-purple-300 text-sm">
                  Includes design, development, content writing, and 30-day support.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card className="bg-slate-800/80 border-purple-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Request a Consultation
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Tell us about your project and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Smith"
                        className="bg-slate-700 border-purple-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Email *</label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@company.com"
                        className="bg-slate-700 border-purple-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Phone & Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-slate-700 border-purple-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Company</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Your Company"
                        className="bg-slate-700 border-purple-600 text-white"
                      />
                    </div>
                  </div>

                  {/* Current Website */}
                  <div>
                    <label className="text-sm text-purple-200 mb-1 block">Current Website (if any)</label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://..."
                      className="bg-slate-700 border-purple-600 text-white"
                    />
                  </div>

                  {/* Budget & Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Budget *</label>
                      <Select value={formData.budget} onValueChange={(v) => handleChange('budget', v)}>
                        <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3k-5k">$3,000 - $5,000</SelectItem>
                          <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                          <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                          <SelectItem value="25k+">$25,000+</SelectItem>
                          <SelectItem value="not-sure">Not sure yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-purple-200 mb-1 block">Timeline *</label>
                      <Select value={formData.timeline} onValueChange={(v) => handleChange('timeline', v)}>
                        <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">ASAP</SelectItem>
                          <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                          <SelectItem value="1-month">Within 1 month</SelectItem>
                          <SelectItem value="2-3-months">2-3 months</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="text-sm text-purple-200 mb-1 block">Project Type</label>
                    <Select value={formData.projectType} onValueChange={(v) => handleChange('projectType', v)}>
                      <SelectTrigger className="bg-slate-700 border-purple-600 text-white">
                        <SelectValue placeholder="What do you need?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-website">New Website</SelectItem>
                        <SelectItem value="redesign">Website Redesign</SelectItem>
                        <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                        <SelectItem value="landing-page">Landing Page</SelectItem>
                        <SelectItem value="web-app">Web Application</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm text-purple-200 mb-1 block">Tell us about your project *</label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe your business, goals, target audience, and any specific features you need..."
                      className="bg-slate-700 border-purple-600 text-white min-h-[120px]"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Request Consultation
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-purple-400 text-center">
                    By submitting, you agree to be contacted about your project.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
