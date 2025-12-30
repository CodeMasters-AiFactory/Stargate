/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MERLIN 8.0 - PROFESSIONAL DESIGN SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 3-Step wizard for booking a consultation with our design team:
 * 1. Browse Inspirations - Pick templates you like (optional)
 * 2. Project Questionnaire - Tell us about your project
 * 3. Schedule Consultation - Book a 60-minute Teams/In-person meeting
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  Sparkles,
  Palette,
  Calendar,
  Trophy,
  Users,
  Building2
} from 'lucide-react';
import { InspirationPicker } from '@/components/ProfessionalDesign/InspirationPicker';
import { ProjectQuestionnaire, type QuestionnaireData } from '@/components/ProfessionalDesign/ProjectQuestionnaire';
import { ConsultationScheduler, type ScheduleData } from '@/components/ProfessionalDesign/ConsultationScheduler';

type Step = 1 | 2 | 3;

interface SelectedInspiration {
  id: string;
  name: string;
  thumbnail: string;
}

export default function ProfessionalDesign() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedInspirations, setSelectedInspirations] = useState<SelectedInspiration[]>([]);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { number: 1, title: 'Inspirations', icon: Palette, description: 'Pick designs you love' },
    { number: 2, title: 'Questionnaire', icon: Building2, description: 'Tell us about your project' },
    { number: 3, title: 'Schedule', icon: Calendar, description: 'Book your consultation' }
  ];

  const handleBack = () => {
    if (currentStep === 1) {
      setLocation('/merlin8');
    } else {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleSkipInspirations = () => {
    setCurrentStep(2);
  };

  const handleInspirationSelect = (inspirations: SelectedInspiration[]) => {
    setSelectedInspirations(inspirations);
  };

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setCurrentStep(3);
  };

  const handleScheduleComplete = async (data: ScheduleData) => {
    setScheduleData(data);
    setIsSubmitting(true);

    try {
      // Submit the consultation request
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspirations: selectedInspirations,
          questionnaire: questionnaireData,
          schedule: data
        })
      });

      if (!response.ok) {
        throw new Error('Failed to book consultation');
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert('Failed to book consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Success Animation */}
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.4)]">
            <Check className="w-12 h-12 text-emerald-400" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Consultation Booked!
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            We've sent a confirmation email to <span className="text-emerald-400">{questionnaireData?.email}</span> with
            all the details and a calendar invite.
          </p>

          {/* Meeting Details Card */}
          <div className="bg-gradient-to-b from-slate-800/90 to-[#0a0a0f] border border-slate-700 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Your Consultation Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-white font-medium">{scheduleData?.dateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-medium">60 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Meeting Type:</span>
                <span className="text-white font-medium">{scheduleData?.meetingType === 'teams' ? 'Microsoft Teams' : 'In-Person'}</span>
              </div>
            </div>
          </div>

          {/* What to Prepare */}
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              What to Prepare
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Your company logo (if available)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Brand guidelines or colors (if established)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Examples of websites you admire</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Content drafts (text, images) if ready</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Questions about the design process</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setLocation('/')}
            className="px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white rounded-xl font-semibold transition-all shadow-[0_4px_20px_rgba(236,72,153,0.4)]"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-600/10 via-orange-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-amber-900/30 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Back to Choices' : 'Previous Step'}
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Professional Design Service</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border border-amber-400/50'
                      : isCompleted
                      ? 'bg-emerald-500/10 border border-emerald-400/30'
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-amber-500 text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <div className="hidden md:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-amber-300' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-700'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto">
        {currentStep === 1 && (
          <InspirationPicker
            selectedInspirations={selectedInspirations}
            onSelect={handleInspirationSelect}
            onNext={handleNext}
            onSkip={handleSkipInspirations}
          />
        )}

        {currentStep === 2 && (
          <ProjectQuestionnaire
            initialData={questionnaireData}
            onComplete={handleQuestionnaireComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <ConsultationScheduler
            questionnaireData={questionnaireData!}
            onComplete={handleScheduleComplete}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
    </div>
  );
}
