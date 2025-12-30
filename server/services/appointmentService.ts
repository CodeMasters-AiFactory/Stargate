/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENT SERVICE - Professional Design Consultation Bookings
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Handles:
 * - Appointment creation and storage
 * - Availability management
 * - Email notifications with Teams links
 * - .ics calendar invite generation
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Types
interface SelectedInspiration {
  id: string;
  name: string;
  thumbnail: string;
}

interface QuestionnaireData {
  businessName: string;
  industry: string;
  yearsInBusiness: string;
  targetAudience: string;
  competitors: string[];
  contactName: string;
  email: string;
  phone: string;
  primaryPurpose: string;
  keyActions: string;
  problemsToSolve: string;
  brandColors: string;
  hasLogo: boolean;
  stylePreference: string;
  websitesLoved: string[];
  websitesDisliked: string[];
  mustHaveFeatures: string;
  pageCount: string;
  hasContentReady: string;
  needsOngoingUpdates: boolean;
  needsBlog: boolean;
  needsEcommerce: boolean;
  productCount?: string;
  needsBooking: boolean;
  needsMultilingual: boolean;
  languages?: string;
  existingDomain: string;
  currentHosting: string;
  budgetRange: string;
  idealLaunchDate: string;
  isDateFlexible: boolean;
  additionalNotes: string;
}

interface ScheduleData {
  date: string;
  time: string;
  dateTime: string;
  meetingType: 'teams' | 'inperson';
  timezone: string;
}

interface AppointmentRequest {
  inspirations: SelectedInspiration[];
  questionnaire: QuestionnaireData;
  schedule: ScheduleData;
}

interface Appointment extends AppointmentRequest {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  teamsLink?: string;
  confirmationSent: boolean;
  reminderSent: boolean;
}

interface AvailabilitySettings {
  weeklySchedule: {
    [day: string]: { start: string; end: string; enabled: boolean };
  };
  blockedDates: string[];
  slotDuration: number; // minutes
}

// Data file paths
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const AVAILABILITY_FILE = path.join(DATA_DIR, 'availability.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Default availability settings
const DEFAULT_AVAILABILITY: AvailabilitySettings = {
  weeklySchedule: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false }
  },
  blockedDates: [],
  slotDuration: 60
};

// Load appointments from file
function loadAppointments(): Appointment[] {
  ensureDataDir();
  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[AppointmentService] Error loading appointments:', error);
    return [];
  }
}

// Save appointments to file
function saveAppointments(appointments: Appointment[]) {
  ensureDataDir();
  fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
}

// Load availability settings
function loadAvailability(): AvailabilitySettings {
  ensureDataDir();
  if (!fs.existsSync(AVAILABILITY_FILE)) {
    fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(DEFAULT_AVAILABILITY, null, 2));
    return DEFAULT_AVAILABILITY;
  }
  try {
    const data = fs.readFileSync(AVAILABILITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[AppointmentService] Error loading availability:', error);
    return DEFAULT_AVAILABILITY;
  }
}

// Save availability settings
function saveAvailability(settings: AvailabilitySettings) {
  ensureDataDir();
  fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(settings, null, 2));
}

// Generate .ics calendar invite content
function generateICSContent(appointment: Appointment): string {
  const { questionnaire, schedule } = appointment;
  const startDate = new Date(`${schedule.date}T${schedule.time}:00`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const description = `Professional Design Consultation with ${questionnaire.businessName}\\n\\nBusiness: ${questionnaire.businessName}\\nIndustry: ${questionnaire.industry}\\nBudget: ${questionnaire.budgetRange}\\n\\nContact: ${questionnaire.contactName}\\nEmail: ${questionnaire.email}\\nPhone: ${questionnaire.phone}`;

  const location = schedule.meetingType === 'teams'
    ? (appointment.teamsLink || 'Microsoft Teams - Link to be provided')
    : 'Boardroom - Address to be confirmed';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Stargate Portal//Professional Design Consultation//EN
BEGIN:VEVENT
UID:${appointment.id}@stargateportal.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Design Consultation - ${questionnaire.businessName}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

// Generate confirmation email HTML
function generateConfirmationEmail(appointment: Appointment): { html: string; text: string } {
  const { questionnaire, schedule, inspirations } = appointment;

  const inspirationsList = inspirations.length > 0
    ? inspirations.map(i => `<li>${i.name}</li>`).join('')
    : '<li>No templates selected</li>';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .meeting-box { background: white; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .meeting-box h3 { color: #f59e0b; margin-top: 0; }
    .prepare-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Consultation Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${questionnaire.contactName},</p>
      <p>Thank you for booking a Professional Design consultation with us! We're excited to discuss your project for <strong>${questionnaire.businessName}</strong>.</p>

      <div class="meeting-box">
        <h3>📅 Meeting Details</h3>
        <p><strong>Date & Time:</strong> ${schedule.dateTime}</p>
        <p><strong>Duration:</strong> 60 minutes</p>
        <p><strong>Meeting Type:</strong> ${schedule.meetingType === 'teams' ? 'Microsoft Teams (video call)' : 'In-Person (Boardroom)'}</p>
        ${schedule.meetingType === 'teams' && appointment.teamsLink ? `<p><strong>Join Link:</strong> <a href="${appointment.teamsLink}">${appointment.teamsLink}</a></p>` : ''}
      </div>

      <div class="prepare-box">
        <h4>📋 What to Prepare</h4>
        <ul>
          <li>Your company logo (if available)</li>
          <li>Brand guidelines or color preferences</li>
          <li>Examples of websites you admire</li>
          <li>Content drafts (text, images) if ready</li>
          <li>Questions about the design process</li>
        </ul>
      </div>

      <h4>Your Selected Inspirations:</h4>
      <ul>${inspirationsList}</ul>

      <h4>Your Project Summary:</h4>
      <ul>
        <li><strong>Industry:</strong> ${questionnaire.industry}</li>
        <li><strong>Purpose:</strong> ${questionnaire.primaryPurpose}</li>
        <li><strong>Style:</strong> ${questionnaire.stylePreference}</li>
        <li><strong>Budget:</strong> ${questionnaire.budgetRange}</li>
        <li><strong>Timeline:</strong> ${questionnaire.idealLaunchDate}</li>
      </ul>

      <p>A calendar invite (.ics) is attached to this email. Add it to your calendar so you don't miss the meeting!</p>

      <p>If you need to reschedule, please reply to this email at least 24 hours before your appointment.</p>

      <p>Looking forward to meeting you!</p>
      <p><strong>The Stargate Design Team</strong></p>
    </div>
    <div class="footer">
      <p>Stargate Portal - Professional Website Design</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
CONSULTATION CONFIRMED!

Hi ${questionnaire.contactName},

Thank you for booking a Professional Design consultation with us!

MEETING DETAILS
---------------
Date & Time: ${schedule.dateTime}
Duration: 60 minutes
Meeting Type: ${schedule.meetingType === 'teams' ? 'Microsoft Teams (video call)' : 'In-Person (Boardroom)'}
${schedule.meetingType === 'teams' && appointment.teamsLink ? `Join Link: ${appointment.teamsLink}` : ''}

WHAT TO PREPARE
---------------
- Your company logo (if available)
- Brand guidelines or color preferences
- Examples of websites you admire
- Content drafts (text, images) if ready
- Questions about the design process

YOUR PROJECT SUMMARY
-------------------
Business: ${questionnaire.businessName}
Industry: ${questionnaire.industry}
Purpose: ${questionnaire.primaryPurpose}
Style: ${questionnaire.stylePreference}
Budget: ${questionnaire.budgetRange}
Timeline: ${questionnaire.idealLaunchDate}

If you need to reschedule, please reply at least 24 hours before your appointment.

Looking forward to meeting you!
The Stargate Design Team
`;

  return { html, text };
}

// Generate admin notification email
function generateAdminNotificationEmail(appointment: Appointment): { html: string; text: string } {
  const { questionnaire, schedule, inspirations } = appointment;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #1e293b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: #f59e0b; margin: 0; }
    .content { background: #f1f5f9; padding: 20px; border-radius: 0 0 10px 10px; }
    .section { background: white; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .section h3 { color: #1e293b; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    td:first-child { font-weight: bold; width: 40%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆕 New Consultation Booking</h1>
    </div>
    <div class="content">
      <div class="section">
        <h3>📅 Meeting Details</h3>
        <table>
          <tr><td>Date & Time:</td><td>${schedule.dateTime}</td></tr>
          <tr><td>Meeting Type:</td><td>${schedule.meetingType === 'teams' ? 'Microsoft Teams' : 'In-Person'}</td></tr>
          <tr><td>Timezone:</td><td>${schedule.timezone}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>👤 Client Information</h3>
        <table>
          <tr><td>Name:</td><td>${questionnaire.contactName}</td></tr>
          <tr><td>Email:</td><td>${questionnaire.email}</td></tr>
          <tr><td>Phone:</td><td>${questionnaire.phone}</td></tr>
          <tr><td>Business:</td><td>${questionnaire.businessName}</td></tr>
          <tr><td>Industry:</td><td>${questionnaire.industry}</td></tr>
          <tr><td>Years in Business:</td><td>${questionnaire.yearsInBusiness || 'Not specified'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>🎯 Project Requirements</h3>
        <table>
          <tr><td>Primary Purpose:</td><td>${questionnaire.primaryPurpose}</td></tr>
          <tr><td>Key Actions:</td><td>${questionnaire.keyActions}</td></tr>
          <tr><td>Style Preference:</td><td>${questionnaire.stylePreference}</td></tr>
          <tr><td>Budget Range:</td><td>${questionnaire.budgetRange}</td></tr>
          <tr><td>Timeline:</td><td>${questionnaire.idealLaunchDate} ${questionnaire.isDateFlexible ? '(Flexible)' : '(Fixed)'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>⚙️ Technical Requirements</h3>
        <table>
          <tr><td>Page Count:</td><td>${questionnaire.pageCount}</td></tr>
          <tr><td>Content Ready:</td><td>${questionnaire.hasContentReady}</td></tr>
          <tr><td>E-commerce:</td><td>${questionnaire.needsEcommerce ? `Yes (${questionnaire.productCount || 'TBD'} products)` : 'No'}</td></tr>
          <tr><td>Booking System:</td><td>${questionnaire.needsBooking ? 'Yes' : 'No'}</td></tr>
          <tr><td>Blog:</td><td>${questionnaire.needsBlog ? 'Yes' : 'No'}</td></tr>
          <tr><td>Multilingual:</td><td>${questionnaire.needsMultilingual ? `Yes (${questionnaire.languages})` : 'No'}</td></tr>
          <tr><td>Domain:</td><td>${questionnaire.existingDomain || 'Needs new domain'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>🎨 Selected Inspirations</h3>
        <ul>
          ${inspirations.length > 0 ? inspirations.map(i => `<li>${i.name}</li>`).join('') : '<li>None selected</li>'}
        </ul>
      </div>

      ${questionnaire.additionalNotes ? `
      <div class="section">
        <h3>📝 Additional Notes</h3>
        <p>${questionnaire.additionalNotes}</p>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;

  const text = `NEW CONSULTATION BOOKING

Meeting: ${schedule.dateTime}
Type: ${schedule.meetingType === 'teams' ? 'Microsoft Teams' : 'In-Person'}

CLIENT
------
Name: ${questionnaire.contactName}
Email: ${questionnaire.email}
Phone: ${questionnaire.phone}
Business: ${questionnaire.businessName}
Industry: ${questionnaire.industry}

PROJECT
-------
Purpose: ${questionnaire.primaryPurpose}
Style: ${questionnaire.stylePreference}
Budget: ${questionnaire.budgetRange}
Timeline: ${questionnaire.idealLaunchDate}

TECHNICAL
---------
Pages: ${questionnaire.pageCount}
E-commerce: ${questionnaire.needsEcommerce ? 'Yes' : 'No'}
Blog: ${questionnaire.needsBlog ? 'Yes' : 'No'}
`;

  return { html, text };
}

// Service class
export class AppointmentService {

  // Create a new appointment
  async createAppointment(request: AppointmentRequest): Promise<Appointment> {
    const appointments = loadAppointments();

    const appointment: Appointment = {
      ...request,
      id: uuidv4(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmationSent: false,
      reminderSent: false
    };

    // TODO: Generate actual Teams meeting link via Microsoft Graph API
    if (request.schedule.meetingType === 'teams') {
      appointment.teamsLink = `https://teams.microsoft.com/l/meetup-join/placeholder-${appointment.id}`;
    }

    appointments.push(appointment);
    saveAppointments(appointments);

    console.log(`[AppointmentService] ✅ Created appointment ${appointment.id} for ${request.questionnaire.businessName}`);

    return appointment;
  }

  // Get all appointments
  async getAllAppointments(): Promise<Appointment[]> {
    return loadAppointments();
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const appointments = loadAppointments();
    return appointments.find(a => a.id === id) || null;
  }

  // Get appointments for a specific date
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const appointments = loadAppointments();
    return appointments.filter(a => a.schedule.date === date && a.status !== 'cancelled');
  }

  // Update appointment status
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment | null> {
    const appointments = loadAppointments();
    const index = appointments.findIndex(a => a.id === id);

    if (index === -1) return null;

    appointments[index].status = status;
    saveAppointments(appointments);

    return appointments[index];
  }

  // Cancel appointment
  async cancelAppointment(id: string): Promise<boolean> {
    const result = await this.updateAppointmentStatus(id, 'cancelled');
    return result !== null;
  }

  // Get availability settings
  async getAvailability(): Promise<AvailabilitySettings> {
    return loadAvailability();
  }

  // Update availability settings
  async updateAvailability(settings: Partial<AvailabilitySettings>): Promise<AvailabilitySettings> {
    const current = loadAvailability();
    const updated = { ...current, ...settings };
    saveAvailability(updated);
    return updated;
  }

  // Block a specific date
  async blockDate(date: string): Promise<void> {
    const settings = loadAvailability();
    if (!settings.blockedDates.includes(date)) {
      settings.blockedDates.push(date);
      saveAvailability(settings);
    }
  }

  // Unblock a specific date
  async unblockDate(date: string): Promise<void> {
    const settings = loadAvailability();
    settings.blockedDates = settings.blockedDates.filter(d => d !== date);
    saveAvailability(settings);
  }

  // Get available time slots for a date
  async getAvailableSlots(date: string): Promise<{ time: string; available: boolean }[]> {
    const settings = loadAvailability();
    const appointments = await this.getAppointmentsByDate(date);
    const bookedTimes = appointments.map(a => a.schedule.time);

    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = settings.weeklySchedule[dayName];

    if (!daySchedule?.enabled || settings.blockedDates.includes(date)) {
      return [];
    }

    const slots: { time: string; available: boolean }[] = [];
    const startHour = parseInt(daySchedule.start.split(':')[0]);
    const endHour = parseInt(daySchedule.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        time,
        available: !bookedTimes.includes(time)
      });
    }

    return slots;
  }

  // Generate calendar invite
  generateCalendarInvite(appointment: Appointment): string {
    return generateICSContent(appointment);
  }

  // Generate confirmation email content
  generateConfirmationEmailContent(appointment: Appointment): { html: string; text: string } {
    return generateConfirmationEmail(appointment);
  }

  // Generate admin notification email content
  generateAdminNotificationContent(appointment: Appointment): { html: string; text: string } {
    return generateAdminNotificationEmail(appointment);
  }
}

// Singleton instance
export const appointmentService = new AppointmentService();
