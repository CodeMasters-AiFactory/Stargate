import * as schema from "@shared/schema";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Make database optional for development
let pool: any = null;
let db: any = null;

// Run migrations on startup
async function runMigrations(poolInstance: any) {
  try {
    // Add new columns to projects table if they don't exist
    const migrations = [
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id VARCHAR`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_name TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_preview TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS html TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS css TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_info JSONB DEFAULT '{}'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP`,
    ];

    for (const sql of migrations) {
      try {
        await poolInstance.query(sql);
      } catch (err: any) {
        // Ignore "column already exists" errors
        if (!err.message?.includes('already exists')) {
          console.warn('[DB Migration] Warning:', err.message);
        }
      }
    }
    console.log('[DB] Migrations completed');
  } catch (error) {
    console.warn('[DB] Migration error:', error instanceof Error ? error.message : error);
  }
}

if (process.env.DATABASE_URL) {
  try {
    const dbUrl = process.env.DATABASE_URL;

    // Detect connection type:
    // - Local PostgreSQL (localhost or 127.0.0.1)
    // - Azure PostgreSQL (azure.com domain)
    // - Neon serverless (neon.tech domain)
    const isLocalOrAzure = dbUrl.includes('localhost') ||
                           dbUrl.includes('127.0.0.1') ||
                           dbUrl.includes('azure.com') ||
                           dbUrl.includes('database.azure.com') ||
                           (!dbUrl.includes('neon.tech'));

    if (isLocalOrAzure) {
      // Use standard PostgreSQL driver for local/Azure connections
      const { Pool } = require('pg');
      const { drizzle } = require('drizzle-orm/node-postgres');

      // Azure PostgreSQL requires SSL
      const isAzure = dbUrl.includes('azure.com') || dbUrl.includes('database.azure.com');
      const poolConfig: any = { connectionString: dbUrl };
      if (isAzure) {
        poolConfig.ssl = { rejectUnauthorized: false };
      }

      pool = new Pool(poolConfig);
      db = drizzle(pool, { schema });
      console.log(`✅ Database connected (${isAzure ? 'Azure PostgreSQL' : 'local PostgreSQL'})`);

      // Run migrations
      runMigrations(pool);
    } else {
      // Use Neon serverless driver for Neon connections
      const { Pool, neonConfig } = require('@neondatabase/serverless');
      const { drizzle } = require('drizzle-orm/neon-serverless');
      const ws = require("ws");

      neonConfig.webSocketConstructor = ws;
      pool = new Pool({ connectionString: dbUrl });
      db = drizzle(pool, { schema });
      console.log('✅ Database connected (Neon serverless)');

      // Run migrations
      runMigrations(pool);
    }
  } catch (error) {
    console.warn('⚠️ Database connection failed, continuing without database:', error instanceof Error ? error.message : error);
  }
} else {
  console.log('ℹ️ DATABASE_URL not set, running without database (using in-memory storage)');
}

export { pool, db };
