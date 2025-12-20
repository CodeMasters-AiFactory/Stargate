import 'dotenv/config';
import { db } from '../server/db';
import { brandTemplates } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function approveTemplates() {
  console.log('Approving all downloaded templates...');
  
  const result = await db
    .update(brandTemplates)
    .set({ 
      isApproved: true, 
      isActive: true 
    })
    .where(eq(brandTemplates.brand, 'Downloaded Template'));
  
  console.log('✅ Approved all downloaded templates');
  
  // Check count
  const templates = await db
    .select()
    .from(brandTemplates)
    .where(eq(brandTemplates.brand, 'Downloaded Template'));
  
  console.log(`📊 Total downloaded templates: ${templates.length}`);
}

approveTemplates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

