/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * APPOINTMENTS API - Professional Design Consultation Booking
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Endpoints:
 * POST   /api/appointments         - Create new appointment
 * GET    /api/appointments         - Get all appointments (admin)
 * GET    /api/appointments/:id     - Get appointment by ID
 * PATCH  /api/appointments/:id     - Update appointment status
 * DELETE /api/appointments/:id     - Cancel appointment
 * GET    /api/appointments/slots/:date - Get available slots for date
 * GET    /api/availability         - Get availability settings
 * PATCH  /api/availability         - Update availability settings
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import { appointmentService } from '../services/appointmentService';

const router = Router();

// Create new appointment
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { inspirations, questionnaire, schedule } = req.body;

    // Validate required fields
    if (!questionnaire || !schedule) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: questionnaire and schedule'
      });
      return;
    }

    if (!questionnaire.email || !questionnaire.contactName || !questionnaire.businessName) {
      res.status(400).json({
        success: false,
        error: 'Missing required questionnaire fields'
      });
      return;
    }

    if (!schedule.date || !schedule.time || !schedule.meetingType) {
      res.status(400).json({
        success: false,
        error: 'Missing required schedule fields'
      });
      return;
    }

    // Check if slot is still available
    const slots = await appointmentService.getAvailableSlots(schedule.date);
    const requestedSlot = slots.find(s => s.time === schedule.time);

    if (!requestedSlot?.available) {
      res.status(409).json({
        success: false,
        error: 'The selected time slot is no longer available. Please choose another time.'
      });
      return;
    }

    // Create appointment
    const appointment = await appointmentService.createAppointment({
      inspirations: inspirations || [],
      questionnaire,
      schedule
    });

    // Generate email content
    const confirmationEmail = appointmentService.generateConfirmationEmailContent(appointment);
    const adminEmail = appointmentService.generateAdminNotificationContent(appointment);
    const calendarInvite = appointmentService.generateCalendarInvite(appointment);

    // TODO: Send emails using email service
    // For now, log that we would send emails
    console.log(`[Appointments API] 📧 Would send confirmation email to: ${questionnaire.email}`);
    console.log(`[Appointments API] 📧 Would send admin notification`);

    res.status(201).json({
      success: true,
      data: {
        appointment,
        calendarInvite // Client can use this to download .ics
      }
    });

  } catch (_error: unknown) {
    console.error('[Appointments API] Error creating appointment:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment'
    });
  }
});

// Get all appointments (admin)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add authentication check for admin
    const appointments = await appointmentService.getAllAppointments();

    res.json({
      success: true,
      data: appointments
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error fetching appointments:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error fetching appointment:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
});

// Update appointment status
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      });
      return;
    }

    const appointment = await appointmentService.updateAppointmentStatus(id, status);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error updating appointment:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment'
    });
  }
});

// Cancel appointment
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await appointmentService.cancelAppointment(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Appointment cancelled'
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error cancelling appointment:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
});

// Get available slots for a specific date
router.get('/slots/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    const slots = await appointmentService.getAvailableSlots(date);

    res.json({
      success: true,
      data: {
        date,
        slots
      }
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error fetching slots:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots'
    });
  }
});

// Get availability settings
router.get('/availability', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await appointmentService.getAvailability();

    res.json({
      success: true,
      data: settings
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error fetching availability:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability settings'
    });
  }
});

// Update availability settings (admin)
router.patch('/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add authentication check for admin
    const settings = await appointmentService.updateAvailability(req.body);

    res.json({
      success: true,
      data: settings
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error updating availability:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to update availability settings'
    });
  }
});

// Block a date (admin)
router.post('/availability/block/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    await appointmentService.blockDate(date);

    res.json({
      success: true,
      message: `Date ${date} has been blocked`
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error blocking date:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to block date'
    });
  }
});

// Unblock a date (admin)
router.delete('/availability/block/:date', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    await appointmentService.unblockDate(date);

    res.json({
      success: true,
      message: `Date ${date} has been unblocked`
    });
  } catch (_error: unknown) {
    console.error('[Appointments API] Error unblocking date:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to unblock date'
    });
  }
});

// Download calendar invite for an appointment
router.get('/:id/calendar', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    const icsContent = appointmentService.generateCalendarInvite(appointment);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="consultation-${id}.ics"`);
    res.send(icsContent);
  } catch (_error: unknown) {
    console.error('[Appointments API] Error generating calendar:', _error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate calendar invite'
    });
  }
});

export default router;
