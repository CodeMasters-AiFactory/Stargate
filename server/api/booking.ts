/**
 * Booking API - For Airbnb/vacation rental websites
 * Handles booking submissions and sends confirmation emails
 */

import type { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { sendEmail } from '../services/marketing';

interface BookingRequest {
  projectSlug?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guests?: number;
  totalPrice?: number;
  specialRequests?: string;
  propertyName?: string;
  propertyEmail?: string;
}

export function registerBookingRoutes(app: Express) {

  /**
   * Submit a new booking
   */
  app.post('/api/booking/submit', async (req, res) => {
    try {
      const {
        projectSlug,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        roomType,
        guests = 2,
        totalPrice,
        specialRequests,
        propertyName = 'Centurion Golf Estate',
        propertyEmail
      }: BookingRequest = req.body;

      // Validate required fields
      if (!guestName || !guestEmail || !checkIn || !checkOut || !roomType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required booking fields (guestName, guestEmail, checkIn, checkOut, roomType)'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      if (checkInDate >= checkOutDate) {
        return res.status(400).json({
          success: false,
          error: 'Check-out date must be after check-in date'
        });
      }

      // Generate booking reference
      const bookingRef = `BK${Date.now().toString(36).toUpperCase()}`;
      const bookingDate = new Date().toISOString();

      // Log booking
      console.log(`[Booking] New booking received:`, {
        bookingRef,
        projectSlug,
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        roomType,
        totalPrice
      });

      // Save booking to a JSON file
      const slug = projectSlug || 'default-property';
      const bookingsDir = path.join(process.cwd(), 'website_projects', slug, 'bookings');
      if (!fs.existsSync(bookingsDir)) {
        fs.mkdirSync(bookingsDir, { recursive: true });
      }

      const bookingData = {
        bookingRef,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        roomType,
        guests,
        totalPrice,
        specialRequests,
        propertyName,
        status: 'pending',
        createdAt: bookingDate
      };

      const bookingFile = path.join(bookingsDir, `${bookingRef}.json`);
      fs.writeFileSync(bookingFile, JSON.stringify(bookingData, null, 2));
      console.log(`[Booking] Saved booking to: ${bookingFile}`);

      // Format dates for email
      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-ZA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Calculate nights
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Send confirmation email to guest
      const guestEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">${propertyName}</h1>
      <p style="margin: 10px 0 0 0; color: #C9A962; font-size: 16px;">Booking Confirmation</p>
    </div>

    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
      <p style="font-size: 18px;">Dear ${guestName},</p>
      <p>Thank you for choosing ${propertyName}! Your booking request has been received and is pending confirmation.</p>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C9A962;">
        <h3 style="color: #1A1A2E; margin-top: 0; margin-bottom: 15px;">📋 Booking Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Booking Reference:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #1A1A2E;">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Room Type:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${roomType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-in:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatDate(checkIn)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Check-out:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatDate(checkOut)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Duration:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${nights} night${nights > 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Guests:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${guests}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size: 18px; font-weight: bold;">Total:</td>
            <td style="padding: 10px 0; text-align: right; font-size: 20px; font-weight: bold; color: #C9A962;">R ${totalPrice?.toLocaleString() || '0'}</td>
          </tr>
        </table>
      </div>

      ${specialRequests ? `
      <div style="background: #fff8e1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>📝 Special Requests:</strong>
        <p style="margin: 10px 0 0 0;">${specialRequests}</p>
      </div>
      ` : ''}

      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #2e7d32; margin: 0 0 10px 0;">✅ What's Next?</h3>
        <p style="margin: 0;">We will review your booking and contact you within 24 hours to confirm availability and arrange payment details.</p>
      </div>

      <p>If you have any questions, please don't hesitate to contact us.</p>

      <p style="margin-top: 30px;">
        Warm regards,<br>
        <strong>${propertyName} Team</strong>
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
      <p>This is an automated booking confirmation. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} ${propertyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

      const guestTextEmail = `
Booking Confirmation - ${propertyName}

Dear ${guestName},

Thank you for choosing ${propertyName}! Your booking request has been received.

BOOKING DETAILS
---------------
Booking Reference: ${bookingRef}
Room Type: ${roomType}
Check-in: ${formatDate(checkIn)}
Check-out: ${formatDate(checkOut)}
Duration: ${nights} night${nights > 1 ? 's' : ''}
Guests: ${guests}
Total: R ${totalPrice?.toLocaleString() || '0'}
${specialRequests ? `\nSpecial Requests: ${specialRequests}` : ''}

WHAT'S NEXT
-----------
We will review your booking and contact you within 24 hours to confirm availability and arrange payment details.

If you have any questions, please don't hesitate to contact us.

Warm regards,
${propertyName} Team
      `;

      // Send email to guest
      const guestEmailResult = await sendEmail(
        guestEmail,
        `✅ Booking Confirmation - ${bookingRef} | ${propertyName}`,
        guestEmailHtml,
        guestTextEmail
      );

      console.log(`[Booking] Guest email result:`, guestEmailResult);

      // Send notification to property owner
      const ownerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #C9A962 0%, #d4b96e 100%); color: #1A1A2E; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">🏠 New Booking Request!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Reference: ${bookingRef}</p>
    </div>

    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
      <p>You have received a new booking request for ${propertyName}:</p>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1A1A2E; margin-top: 0;">👤 Guest Information</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${guestName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${guestEmail}">${guestEmail}</a></p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${guestPhone || 'Not provided'}</p>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1A1A2E; margin-top: 0;">📅 Booking Details</h3>
        <p style="margin: 5px 0;"><strong>Room:</strong> ${roomType}</p>
        <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
        <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${nights} nights</p>
        <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
        <p style="margin: 10px 0 0 0; font-size: 20px;"><strong>Total: R ${totalPrice?.toLocaleString() || '0'}</strong></p>
      </div>

      ${specialRequests ? `
      <div style="background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1A1A2E; margin-top: 0;">📝 Special Requests</h3>
        <p style="margin: 0;">${specialRequests}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:${guestEmail}?subject=Re: Booking ${bookingRef} - Confirmation"
           style="display: inline-block; background: #1A1A2E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          📧 Contact Guest
        </a>
      </div>

      <p style="color: #666; text-align: center;">Please review and confirm this booking as soon as possible.</p>
    </div>
  </div>
</body>
</html>`;

      // Send to property owner if email configured
      if (propertyEmail) {
        const ownerEmailResult = await sendEmail(
          propertyEmail,
          `🏠 NEW BOOKING: ${bookingRef} - ${guestName} (${checkIn} to ${checkOut})`,
          ownerEmailHtml
        );
        console.log(`[Booking] Owner notification result:`, ownerEmailResult);
      }

      res.json({
        success: true,
        bookingRef,
        message: 'Booking received successfully! Check your email for confirmation.',
        emailSent: guestEmailResult.success,
        nights
      });

    } catch (error) {
      console.error('[Booking] Error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process booking'
      });
    }
  });

  /**
   * Get all bookings for a project
   */
  app.get('/api/booking/list/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const bookingsDir = path.join(process.cwd(), 'website_projects', projectSlug, 'bookings');

      if (!fs.existsSync(bookingsDir)) {
        return res.json({ success: true, bookings: [] });
      }

      const bookingFiles = fs.readdirSync(bookingsDir).filter(f => f.endsWith('.json'));
      const bookings = bookingFiles.map(f => {
        const content = fs.readFileSync(path.join(bookingsDir, f), 'utf-8');
        return JSON.parse(content);
      });

      // Sort by date (newest first)
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ success: true, bookings, count: bookings.length });

    } catch (error) {
      console.error('[Booking] Get bookings error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bookings'
      });
    }
  });

  /**
   * Get booked dates for calendar display
   */
  app.get('/api/booking/dates/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const bookingsDir = path.join(process.cwd(), 'website_projects', projectSlug, 'bookings');

      if (!fs.existsSync(bookingsDir)) {
        return res.json({ success: true, bookedDates: [] });
      }

      const bookingFiles = fs.readdirSync(bookingsDir).filter(f => f.endsWith('.json'));
      const bookedDates: string[] = [];

      for (const file of bookingFiles) {
        const content = fs.readFileSync(path.join(bookingsDir, file), 'utf-8');
        const booking = JSON.parse(content);

        // Only include confirmed or pending bookings
        if (booking.status !== 'cancelled') {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);

          // Add all dates in the range
          const current = new Date(checkIn);
          while (current < checkOut) {
            bookedDates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        }
      }

      // Remove duplicates and sort
      const uniqueDates = [...new Set(bookedDates)].sort();

      res.json({ success: true, bookedDates: uniqueDates });

    } catch (error) {
      console.error('[Booking] Get booked dates error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get booked dates'
      });
    }
  });

  /**
   * Update booking status
   */
  app.patch('/api/booking/:projectSlug/:bookingRef', async (req, res) => {
    try {
      const { projectSlug, bookingRef } = req.params;
      const { status } = req.body;

      const bookingFile = path.join(
        process.cwd(),
        'website_projects',
        projectSlug,
        'bookings',
        `${bookingRef}.json`
      );

      if (!fs.existsSync(bookingFile)) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      const booking = JSON.parse(fs.readFileSync(bookingFile, 'utf-8'));
      booking.status = status;
      booking.updatedAt = new Date().toISOString();

      fs.writeFileSync(bookingFile, JSON.stringify(booking, null, 2));

      console.log(`[Booking] Updated ${bookingRef} status to: ${status}`);

      res.json({ success: true, booking });

    } catch (error) {
      console.error('[Booking] Update error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking'
      });
    }
  });

  console.log('[Booking API] ✅ Routes registered');
}
