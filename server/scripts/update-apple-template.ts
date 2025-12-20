/**
 * Update Apple template to have isDesignQuality = true
 */

import { db } from '../db';
import { brandTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function updateAppleTemplate() {
  if (!db) {
    console.error('❌ Database not connected');
    process.exit(1);
  }

  try {
    const result = await db
      .update(brandTemplates)
      .set({ isDesignQuality: true })
      .where(eq(brandTemplates.brand, 'Apple'));

    console.log('✅ Updated Apple template: isDesignQuality = true');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Error updating template:', error);
    process.exit(1);
  }
}

updateAppleTemplate();

