import type { Express, Request, Response } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { randomUUID } from "crypto";
import { logError } from '../utils/errorHandler';
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
  app.post("/api/auth/signup", strictRateLimit(), async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate input
      const validation = validateRequestBody(authSchemas.signup, req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error });
        return;
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
          res.status(400).json({ error: "Username already exists" });
          return;
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

        res.json({
          id: newUser[0].id,
          username: newUser[0].username,
          email: email || null,
          role: newUser[0].role || 'user',
        });
        return;
      } else {
        // In-memory storage
        if (inMemoryUsers.has(username)) {
          res.status(400).json({ error: "Username already exists" });
          return;
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

        res.json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        });
        return;
      }
    } catch (error: unknown) {
      logError(error, 'Auth - Signup');
      res.status(500).json({ error: (error as Error).message || "Failed to create account" });
    }
  });

  // Login - SECURITY FIX: Proper authentication required
  app.post("/api/auth/login", async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email/username and password are required" });
        return;
      }

      // Use database if available, otherwise use in-memory storage
      if (db) {
        // Find user by username (treating email as username for now)
        const user = await db
          .select()
          .from(users)
          .where(eq(users.username, email))
          .limit(1);

        if (user.length === 0) {
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Verify password
        if (!verifyPassword(password, user[0].password)) {
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Set session
        (req.session as any).userId = user[0].id;
        (req.session as any).username = user[0].username;
        (req.session as any).role = user[0].role || 'user';

        console.log(`✅ Login successful for: ${user[0].username}`);
        res.json({
          id: user[0].id,
          username: user[0].username,
          email: email,
          role: user[0].role || 'user',
        });
        return;
      } else {
        // In-memory storage
        console.log(`🔍 Looking up user: ${email}`);
        const user = inMemoryUsers.get(email);

        if (!user) {
          console.log(`❌ User not found: ${email}`);
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        const passwordValid = verifyPassword(password, user.password);

        if (!passwordValid) {
          res.status(401).json({ error: "Invalid email or password" });
          return;
        }

        // Set session
        (req.session as any).userId = user.id;
        (req.session as any).username = user.username;
        (req.session as any).role = user.role;

        console.log(`✅ Login successful for: ${user.username}`);
        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        return;
      }
    } catch (error: unknown) {
      logError(error, 'Auth - Login');
      res.status(500).json({ error: (error as Error).message || "Failed to login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req: Request, res: Response): Promise<void> => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Failed to logout" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth status check endpoint - SECURITY FIX: Check session properly
  app.get("/api/auth/status", async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.session as any)?.userId;

      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      // Use database if available, otherwise use in-memory storage
      if (db) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          res.status(401).json({ error: "User not found" });
          return;
        }

        res.json({
          id: user[0].id,
          username: user[0].username,
          email: user[0].email || null,
          role: user[0].role || 'user',
        });
        return;
      } else {
        // In-memory storage
        const user = inMemoryUsers.get(userId);

        if (!user) {
          res.status(401).json({ error: "User not found" });
          return;
        }

        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        return;
      }
    } catch (error: unknown) {
      console.error('[AUTH /status] Error:', error);
      res.status(500).json({ error: "Failed to check auth status" });
    }
  });

  // Get current user - SECURITY FIX: Check session properly
  app.get("/api/auth/me", async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req.session as any)?.userId;

      if (!userId) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      // Use database if available, otherwise use in-memory storage
      if (db) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          res.status(401).json({ error: "User not found" });
          return;
        }

        res.json({
          id: user[0].id,
          username: user[0].username,
          email: user[0].email || null,
          role: user[0].role || 'user',
        });
        return;
      } else {
        // In-memory storage
        const user = inMemoryUsers.get(userId);

        if (!user) {
          res.status(401).json({ error: "User not found" });
          return;
        }

        res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
        return;
      }
    } catch (error: unknown) {
      logError(error, 'Auth - Get user');
      res.status(500).json({ error: "Failed to get user" });
    }
  });
}

