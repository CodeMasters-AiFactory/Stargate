/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - QUICK INTAKE FORM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Multi-step intake form that collects business info to generate unique websites.
 * 
 * Steps:
 * 1. Business Name + Industry
 * 2. Description
 * 3. Services (3-5)
 * 4. Contact Info
 * 5. Review & Generate
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, ArrowRight, Building2, FileText, Briefcase, 
  Phone, CheckCircle, Sparkles, Loader2 
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
}

interface IntakeData {
  businessName: string;
  industryId: string;
  description: string;
  services: Array<{ name: string; description: string }>;
  location: string;
  phone: string;
  email: string;
}

const STEPS = [
  { id: 1, title: 'Business', icon: Building2 },
  { id: 2, title: 'Description', icon: FileText },
  { id: 3, title: 'Services', icon: Briefcase },
  { id: 4, title: 'Contact', icon: Phone },
  { id: 5, title: 'Review', icon: CheckCircle },
];

export default function QuickIntake() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<IntakeData>({
    businessName: '',
    industryId: '',
    description: '',
    services: [
      { name: '', description: '' },
      { name: '', description: '' },
      { name: '', description: '' },
    ],
    location: '',
    phone: '',
    email: '',
  });

  // Fetch industries on mount
  useEffect(() => {
    fetch('/api/merlin8/industries')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setIndustries(result.industries);
        }
      })
      .catch(err => console.error('Failed to load industries:', err));
  }, []);

  const updateData = (field: keyof IntakeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateService = (index: number, field: 'name' | 'description', value: string) => {
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setData(prev => ({ ...prev, services: newServices }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.businessName.length >= 2 && data.industryId;
      case 2: return data.description.length >= 20;
      case 3: return data.services.filter(s => s.name.length > 0).length >= 1;
      case 4: return true; // Contact is optional
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setLocation('/merlin8');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    
    // Filter out empty services
    const filteredServices = data.services.filter(s => s.name.length > 0);
    
    // Store data in sessionStorage for the generating page
    sessionStorage.setItem('merlin8-intake', JSON.stringify({
      ...data,
      services: filteredServices
    }));
    
    // Navigate to generating page
    setLocation('/merlin8/generating');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                        isActive 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : isComplete 
                            ? 'bg-green-500/20 text-green-300'
                            : 'text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 ${isComplete ? 'bg-green-500/50' : 'bg-slate-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="text-slate-400 text-sm">
              Step {currentStep} of 5
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Business Name & Industry */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Tell us about your business</h2>
              <p className="text-slate-400">We'll use this to create a design perfectly suited to your industry</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => updateData('businessName', e.target.value)}
                  placeholder="e.g., Phoenix Racing Team"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Industry *</label>
                <select
                  value={data.industryId}
                  onChange={(e) => updateData('industryId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select your industry...</option>
                  {industries.map(ind => (
                    <option key={ind.id} value={ind.id}>{ind.name}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-sm mt-2">
                  This determines your website's color scheme, fonts, and design style
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Describe your business</h2>
              <p className="text-slate-400">This will be used for your website copy and SEO</p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Business Description *</label>
              <textarea
                value={data.description}
                onChange={(e) => updateData('description', e.target.value)}
                placeholder="e.g., We are a professional F1 racing team competing in the championship circuit. Our team combines cutting-edge technology with world-class drivers to deliver podium finishes..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-slate-500 text-sm mt-2">
                {data.description.length}/500 characters (minimum 20)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">What services do you offer?</h2>
              <p className="text-slate-400">Add up to 3 main services (at least 1 required)</p>
            </div>

            <div className="space-y-6">
              {data.services.map((service, index) => (
                <div key={index} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <span className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-300">
                      {index + 1}
                    </span>
                    Service {index + 1} {index === 0 && '*'}
                  </div>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    placeholder="Service name (e.g., Racing Excellence)"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="Brief description (optional)"
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Contact Info */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Contact Information</h2>
              <p className="text-slate-400">Optional - will be displayed on your website</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => updateData('location', e.target.value)}
                  placeholder="e.g., Johannesburg, South Africa"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  placeholder="e.g., +27 11 123 4567"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData('email', e.target.value)}
                  placeholder="e.g., info@yourbusiness.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Ready to Generate!</h2>
              <p className="text-slate-400">Review your information before we create your website</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
              <div>
                <span className="text-slate-400 text-sm">Business Name</span>
                <p className="text-white font-medium">{data.businessName}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Industry</span>
                <p className="text-white font-medium">
                  {industries.find(i => i.id === data.industryId)?.name || '-'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Description</span>
                <p className="text-white">{data.description}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Services</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.services.filter(s => s.name).map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
              {(data.location || data.phone || data.email) && (
                <div>
                  <span className="text-slate-400 text-sm">Contact</span>
                  <p className="text-white text-sm">
                    {[data.location, data.phone, data.email].filter(Boolean).join(' • ')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">What happens next?</p>
                  <p className="text-slate-400 text-sm">
                    Merlin will generate 4 unique AI images and build a complete, 
                    professional website in about 30 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate My Website</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
