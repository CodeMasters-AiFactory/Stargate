/**
 * ConsultationScheduler - Step 3 of Professional Design flow
 * Calendar picker for booking 60-minute consultation via Teams or In-person
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Video,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  MapPin
} from 'lucide-react';
import type { QuestionnaireData } from './ProjectQuestionnaire';

export interface ScheduleData {
  date: string;
  time: string;
  dateTime: string;
  meetingType: 'teams' | 'inperson';
  timezone: string;
}

interface ConsultationSchedulerProps {
  questionnaireData: QuestionnaireData;
  onComplete: (data: ScheduleData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
}

// Generate time slots for a day (9 AM - 5 PM, 60-minute slots)
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 17; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    slots.push({
      time,
      display: `${displayHour}:00 ${ampm}`,
      available: true // Will be updated based on actual availability
    });
  }
  return slots;
};

// Get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get first day of month (0 = Sunday)
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ConsultationScheduler({
  questionnaireData,
  onComplete,
  onBack,
  isSubmitting
}: ConsultationSchedulerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [meetingType, setMeetingType] = useState<'teams' | 'inperson'>('teams');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Get user's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true);
      // TODO: Fetch actual availability from API
      // For now, simulate some unavailable slots
      setTimeout(() => {
        const slots = generateTimeSlots().map(slot => ({
          ...slot,
          available: Math.random() > 0.3 // 70% chance of being available
        }));
        setTimeSlots(slots);
        setLoadingSlots(false);
        setSelectedTime(null);
      }, 500);
    }
  }, [selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isTooFar = date > new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()); // Max 3 months ahead

    return !isWeekend && !isPast && !isTooFar;
  };

  const handleDateSelect = (day: number) => {
    if (isDateSelectable(day)) {
      setSelectedDate(new Date(currentYear, currentMonth, day));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const dateTimeStr = `${formatDate(selectedDate)} at ${timeSlots.find(s => s.time === selectedTime)?.display}`;

    onComplete({
      date: dateStr,
      time: selectedTime,
      dateTime: dateTimeStr,
      meetingType,
      timezone
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="p-2" />;
            }

            const isSelectable = isDateSelectable(day);
            const isSelected = selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === currentMonth &&
              selectedDate?.getFullYear() === currentYear;
            const isToday = day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            return (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                disabled={!isSelectable}
                className={`
                  p-2 text-sm rounded-lg transition-all relative
                  ${isSelected
                    ? 'bg-amber-500 text-white font-bold'
                    : isSelectable
                    ? 'hover:bg-slate-800 text-white'
                    : 'text-slate-600 cursor-not-allowed'
                  }
                  ${isToday && !isSelected ? 'ring-1 ring-amber-500/50' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-700 rounded" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-slate-900 rounded border border-slate-700" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm mb-4">
          <Calendar className="w-4 h-4" />
          <span>Step 3: Schedule Your Consultation</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Book your{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            consultation
          </span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Choose a date and time for your 60-minute consultation with our design team.
        </p>
      </div>

      {/* Meeting Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-3">Meeting Type</label>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setMeetingType('teams')}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
              meetingType === 'teams'
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              meetingType === 'teams' ? 'bg-amber-500' : 'bg-slate-800'
            }`}>
              <Video className={`w-6 h-6 ${meetingType === 'teams' ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <div>
              <span className={`font-semibold ${meetingType === 'teams' ? 'text-amber-300' : 'text-white'}`}>
                Microsoft Teams
              </span>
              <p className="text-slate-400 text-sm mt-1">
                Video call - Join from anywhere. We'll send you a meeting link.
              </p>
            </div>
            {meetingType === 'teams' && (
              <Check className="w-5 h-5 text-amber-400 ml-auto" />
            )}
          </button>

          <button
            onClick={() => setMeetingType('inperson')}
            className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
              meetingType === 'inperson'
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              meetingType === 'inperson' ? 'bg-amber-500' : 'bg-slate-800'
            }`}>
              <Building2 className={`w-6 h-6 ${meetingType === 'inperson' ? 'text-white' : 'text-slate-400'}`} />
            </div>
            <div>
              <span className={`font-semibold ${meetingType === 'inperson' ? 'text-amber-300' : 'text-white'}`}>
                In-Person
              </span>
              <p className="text-slate-400 text-sm mt-1">
                Meet at our boardroom. Address will be shared upon confirmation.
              </p>
            </div>
            {meetingType === 'inperson' && (
              <Check className="w-5 h-5 text-amber-400 ml-auto" />
            )}
          </button>
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Calendar */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Select a Date</label>
          {renderCalendar()}
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select a Time {selectedDate && `- ${formatDate(selectedDate)}`}
          </label>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 h-[400px] overflow-y-auto">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Calendar className="w-12 h-12 mb-3 opacity-50" />
                <p>Select a date to see available times</p>
              </div>
            ) : loadingSlots ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p>Loading available times...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedTime === slot.time
                        ? 'border-amber-400 bg-amber-500/10'
                        : slot.available
                        ? 'border-slate-700 hover:border-slate-600'
                        : 'border-slate-800 bg-slate-900/50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`w-4 h-4 ${
                        selectedTime === slot.time
                          ? 'text-amber-400'
                          : slot.available
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`} />
                      <span className={`font-medium ${
                        selectedTime === slot.time
                          ? 'text-amber-300'
                          : slot.available
                          ? 'text-white'
                          : 'text-slate-600'
                      }`}>
                        {slot.display}
                      </span>
                      <span className="text-slate-500 text-sm">60 min</span>
                    </div>
                    {selectedTime === slot.time && (
                      <Check className="w-5 h-5 text-amber-400" />
                    )}
                    {!slot.available && (
                      <span className="text-slate-600 text-sm">Unavailable</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Consultation Summary
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Date:</span>
              <p className="text-white font-medium">{formatDate(selectedDate)}</p>
            </div>
            <div>
              <span className="text-slate-400">Time:</span>
              <p className="text-white font-medium">
                {timeSlots.find(s => s.time === selectedTime)?.display} ({timezone})
              </p>
            </div>
            <div>
              <span className="text-slate-400">Meeting Type:</span>
              <p className="text-white font-medium flex items-center gap-2">
                {meetingType === 'teams' ? (
                  <>
                    <Video className="w-4 h-4" />
                    Microsoft Teams
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    In-Person (Boardroom)
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          ← Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            selectedDate && selectedTime && !isSubmitting
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-[0_4px_20px_rgba(251,146,60,0.4)]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
