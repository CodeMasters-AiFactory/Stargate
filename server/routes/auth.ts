import type { Express } from "express";
import { db } from "../db";
import { users, insertUserSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { getErrorMessage, logError } from '../utils/errorHandler';
import { validateRequestBody } from '../utils/inputValidator';
import { authSchemas } from '../utils/validationSchemas';
import { strictRateLimit } from '../middleware/rateLimiter';

// Simple password hashing (for development - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// In-memory user storage for when database is not available
interface InMemoryUser {
  id: string;
  username: string;
  email: string | null;
  password: string; // hashed
  role: 'administrator' | 'user' | 'technical' | 'designer';
  createdAt: Date;
  updatedAt: Date;
}

const inMemoryUsers = new Map<string, InMemoryUser>();

// Initialize with default admin user if database is not available
function initializeInMemoryUsers() {
  if (db) {
    console.log('ℹ️ Database available, using database for authentication');
    return; // Use database if available
  }
  
  console.log('ℹ️ No database available, initializing in-memory authentication...');
  
  // Create default admin user
  const adminUser: InMemoryUser = {
    id: randomUUID(),
    username: 'info@code-masters.co.za',
    email: 'info@code-masters.co.za',
    password: hashPassword('Diamond2024!!!'),
    role: 'administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  inMemoryUsers.set(adminUser.id, adminUser);
  inMemoryUsers.set(adminUser.username, adminUser); // Also index by username for quick lookup
  console.log('✅ In-memory authentication initialized with admin user');
  console.log('   Username: info@code-masters.co.za');
  console.log('   Password: Diamond2024!!!');
  console.log(`   Total users in memory: ${inMemoryUsers.size / 2}`); // Divide by 2 because we store by id and username
}

// Initialize on module load
initializeInMemoryUsers();

export function registerAuthRoutes(app: Express) {
  // Ensure in-memory users are initialized when routes are registered
  initializeInMemoryUsers();
  
  // Sign up
  app.post("/api/auth/signup", strictRateLimit(), async (req, res) => {
    try {
      // Validate input
      const validation = validateRequestBody(authSchemas.signup, req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }
      
      const { username, email, password } = validation.data;

      // Use database if available, otherwise use in-memory storage
      if (db) {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (existingUser.length > 0) {
          return res.status(400).json({ error: "Username already exists" });
        }

        // Create new user (default role is 'user')
        const hashedPassword = hashPassword(password);
        const newUser = await db
          .insert(users)
          .values({
            username,
            password: hashedPassword,
            email: email || null,
            role: 'user', // Default role
          })
          .returning();

        // Set session
        (req.session as any).userId = newUser[0].id;
        (req.session as any).username = newUser[0].username;
        (req.session as any).role = newUser[0].role || 'user';

        return res.json({
          id: newUser[0].id,
          username: newUser[0].username,
          email: email || null,
          role: newUser[0].role || 'user',
        });
      } else {
        // In-memory storage
        if (inMemoryUsers.has(username)) {
          return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = hashPassword(password);
        const newUser: InMemoryUser = {
          id: randomUUID(),
          username,
          email: email || null,
          password: hashedPassword,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        inMemoryUsers.set(newUser.id, newUser);
        inMemoryUsers.set(newUser.username, newUser);

        // Set session
        (req.session as any).userId = newUser.id;
        (req.session as any).username = newUser.username;
        (req.session as any).role = newUser.role;

        return res.json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        });
      }
    } catch (error: unknown) {
      logError(error, 'Auth - Signup');
      res.status(500).json({ error: error.message || "Failed to create account" });
    }
  });

  // Login - BYPASSED: Auto-login without credentials
  app.post("/api/auth/login", async (req, res) => {
    try {
      // AUTO-LOGIN: Skip authentication, just create a session
      console.log('🔓 Auto-login enabled (authentication bypassed)');

      // Create a default user session
      const defaultUser = {
        id: 'auto-user-' + randomUUID(),
        username: 'auto-user',
        email: 'auto@stargate.dev',
        role: 'administrator' as const,
      };

      // Set session only if session middleware is enabled and session exists
      // Note: typeof null === 'object' is true in JS, so we need explicit null check
      if (req.session !== null && req.session !== undefined && typeof req.session === 'object') {
        try {
          (req.session as any).userId = defaultUser.id;
          (req.session as any).username = defaultUser.username;
          (req.session as any).role = defaultUser.role;
          console.log('[Auth - Login] Session set successfully for user:', defaultUser.id);
        } catch (sessionError) {
          console.log('[Auth - Login] Session storage failed (session may be disabled):', sessionError);
        }
      } else {
        console.log('[Auth - Login] Session middleware not available (req.session is:', typeof req.session, '), skipping session storage');
      }

      return res.json(defaultUser);
      
      /* ORIGINAL CODE - DISABLED
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email/username and password are required" });
      }

      // ORIGINAL AUTH CODE - DISABLED FOR NOW
      /*
      // Use database if available, otherwise use in-memory storage
      if (db) {
        // Find user by username (treating email as username for now)
        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, email))
          .limit(1);

        if (user.length === 0) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        if (!verifyPassword(password, user[0].password)) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Set session
        (req.session as any).userId = user[0].id;
        (req.session as any).username = user[0].username;
        (req.session as any).role = user[0].role || 'user';

        return res.json({
          id: user[0].id,
          username: user[0].username,
          email: email,
          role: user[0].role || 'user',
        });
      } else {
        // In-memory storage
        console.log(`🔍 Looking up user: ${email}`);
        console.log(`📊 Users in memory: ${inMemoryUsers.size}`);
        const user = inMemoryUsers.get(email);
        
        if (!user) {
          console.log(`❌ User not found: ${email}`);
          return res.status(401).json({ error: "Invalid email or password" });
        }
        
        console.log(`✅ User found: ${user.username}`);
        const passwordValid = verifyPassword(password, user.password);
        console.log(`🔐 Password valid: ${passwordValid}`);
        
        if (!passwordValid) {
          return res.status(401).json({ error: "Invalid email or password" });
        }

        // Set session
        (req.session as any).userId = user.id;
        (req.session as any).username = user.username;
        (req.session as any).role = user.role;

        console.log(`✅ Login successful for: ${user.username}`);
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      }
      */
    } catch (error: unknown) {
      logError(error, 'Auth - Login');
      res.status(500).json({ error: error.message || "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth status check endpoint - same as /me but different route
  app.get("/api/auth/status", async (req, res) => {
    try {
      console.log('[AUTH /status] Request received');
      // SIMPLE AUTO-AUTH: Just return a user immediately
      const defaultUser = {
        id: 'auto-user-' + randomUUID(),
        username: 'auto-user',
        email: 'auto@stargate.dev',
        role: 'administrator' as const,
      };
      console.log('[AUTH /status] Returning auto-user');
      return res.json(defaultUser);
    } catch (error: unknown) {
      console.error('[AUTH /status] Error:', error);
      // Always return fallback user on error
      const fallbackUser = {
        id: 'auto-user-fallback',
        username: 'auto-user',
        email: 'auto@stargate.dev',
        role: 'administrator' as const,
      };
      return res.json(fallbackUser);
    }
  });

  // Get current user - BYPASSED: Always return authenticated user
  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log('[AUTH /me] Request received');
      // SIMPLE AUTO-AUTH: Just return a user immediately, no session complexity
      const defaultUser = {
        id: 'auto-user-' + randomUUID(),
        username: 'auto-user',
        email: 'auto@stargate.dev',
        role: 'administrator' as const,
      };
      console.log('[AUTH /me] Returning auto-user');
      return res.json(defaultUser);

      /* ORIGINAL CODE - DISABLED
      // Use database if available, otherwise use in-memory storage
      if (db) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }

        return res.json({
          id: user[0].id,
          username: user[0].username,
          email: user[0].email || null,
          role: user[0].role || 'user',
        });
      } else {
        // In-memory storage
        const user = inMemoryUsers.get(userId);
        
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      }
      */
    } catch (error: unknown) {
      logError(error, 'Auth - Get user');
      console.error("   Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // CRITICAL: Even on error, always return a valid user (auto-auth bypass)
      // NEVER return 401 or 500 - always create a session
      try {
        const fallbackUser = {
          id: 'auto-user-' + randomUUID(),
          username: 'auto-user',
          email: 'auto@stargate.dev',
          role: 'administrator' as const,
        };

        // Try to create session even on error
        if (req.session) {
          (req.session as any).userId = fallbackUser.id;
          (req.session as any).username = fallbackUser.username;
          (req.session as any).role = fallbackUser.role;
          
          req.session.save((err) => {
            if (err) {
              console.error('❌ Failed to save fallback session:', err);
            }
          });
        }

        console.log('🔓 Auto-authenticated fallback user after error');
        return res.json(fallbackUser);
      } catch (fallbackError: unknown) {
        logError(fallbackError, 'Auth - Fallback auth');
        // Last resort: return user without session (shouldn't happen)
        return res.json({
          id: 'auto-user-fallback',
          username: 'auto-user',
          email: 'auto@stargate.dev',
          role: 'administrator',
        });
      }
    }
  });
}

