/**
 * Admin Routes
 * Protected routes for administrator functions
 */

import type { Express } from "express";
import { db } from "../db";
import { users, invoices, usageTracking } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, requirePermission, getUserRole, getUserId } from "../middleware/permissions";
import { getErrorMessage, logError } from '../utils/errorHandler';

export function registerAdminRoutes(app: Express) {
  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      res.json(allUsers);
    } catch (error: unknown) {
      logError(error, 'Admin - Get users');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || "Failed to get users" });
    }
  });

  // Update user role (admin only)
  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const validRoles = ['administrator', 'user', 'technical', 'designer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updatedUser = await db
        .update(users)
        .set({ role })
        .where(eq(users.id, id))
        .returning();

      if (updatedUser.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: updatedUser[0].id,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
      });
    } catch (error: unknown) {
      logError(error, 'Admin - Update user role');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || "Failed to update user role" });
    }
  });

  // Get all invoices (admin sees all, users see only their own)
  app.get("/api/admin/invoices", requirePermission('view_all_billing'), async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const userId = getUserId(req);
      const role = getUserRole(req);

      let allInvoices;
      if (role === 'administrator') {
        // Admin sees all invoices
        allInvoices = await db
          .select()
          .from(invoices)
          .orderBy(desc(invoices.createdAt));
      } else {
        // Others see only their own
        allInvoices = await db
          .select()
          .from(invoices)
          .where(eq(invoices.userId, userId!))
          .orderBy(desc(invoices.createdAt));
      }

      res.json(allInvoices);
    } catch (error: unknown) {
      logError(error, 'Admin - Get invoices');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || "Failed to get invoices" });
    }
  });

  // Get usage statistics (admin sees all, users see only their own)
  app.get("/api/admin/usage", requirePermission('view_all_usage'), async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const userId = getUserId(req);
      const role = getUserRole(req);

      let usage;
      if (role === 'administrator') {
        // Admin sees all usage
        usage = await db
          .select()
          .from(usageTracking)
          .orderBy(desc(usageTracking.trackedAt));
      } else {
        // Others see only their own
        usage = await db
          .select()
          .from(usageTracking)
          .where(eq(usageTracking.userId, userId!))
          .orderBy(desc(usageTracking.trackedAt));
      }

      res.json(usage);
    } catch (error: unknown) {
      logError(error, 'Admin - Get usage');
      const errorMessage = getErrorMessage(error);
      res.status(500).json({ error: errorMessage || "Failed to get usage" });
    }
  });
}

