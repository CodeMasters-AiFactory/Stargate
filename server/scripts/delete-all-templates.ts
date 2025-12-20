/**
 * Emergency script to delete ALL templates from database
 */

import { db } from '../db/index.js';
import { brandTemplates } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function deleteAllTemplates() {
  try {
    console.log('[DELETE ALL TEMPLATES] Starting...');
    
    if (!db) {
      console.error('[DELETE ALL TEMPLATES] Database not available');
      process.exit(1);
    }

    // Delete ALL templates (hard delete)
    const result = await db.delete(brandTemplates);
    
    console.log('[DELETE ALL TEMPLATES] ✅ All templates deleted from database');
    console.log('[DELETE ALL TEMPLATES] Result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('[DELETE ALL TEMPLATES] ❌ Error:', error);
    process.exit(1);
  }
}

deleteAllTemplates();

