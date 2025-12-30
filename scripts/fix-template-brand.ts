/**
 * Fix Template Brand Field
 * Updates the NexusFlow template brand from "Downloaded Template" to "NexusFlow"
 */

import 'dotenv/config';
import { db } from '../server/db';
import { brandTemplates } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function fixTemplateBrand() {
  const templateId = 'downloaded-MlNoL-xH-nexusflow-the-future-of-team-collaboration';

  console.log('🔍 Looking up template:', templateId);

  // First, let's see what the current brand is
  const templates = await db.select({
    id: brandTemplates.id,
    name: brandTemplates.name,
    brand: brandTemplates.brand,
  }).from(brandTemplates).where(eq(brandTemplates.id, templateId)).limit(1);

  if (templates.length === 0) {
    console.log('❌ Template not found');
    process.exit(1);
  }

  const template = templates[0];
  console.log('📋 Current brand:', template.brand);
  console.log('📋 Template name:', template.name);

  // Update the brand to NexusFlow
  await db.update(brandTemplates)
    .set({ brand: 'NexusFlow' })
    .where(eq(brandTemplates.id, templateId));

  console.log('✅ Updated brand to: NexusFlow');

  // Verify
  const updated = await db.select({
    brand: brandTemplates.brand,
  }).from(brandTemplates).where(eq(brandTemplates.id, templateId)).limit(1);

  console.log('✅ Verified new brand:', updated[0]?.brand);
}

fixTemplateBrand()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
